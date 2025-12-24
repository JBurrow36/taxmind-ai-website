// AI Training System - Collects and processes training data for the AI model
// This system works behind the scenes to improve AI accuracy over time

const AITrainingSystem = {
    // Configuration
    config: {
        enabled: true,
        collectionMode: 'passive', // 'passive' (only user uploads) or 'active' (includes web scraping)
        webScrapingEnabled: false, // Enable with caution - legal considerations
        minConfidenceForTraining: 70, // Only use documents with high confidence detection
        saveUserFeedback: true,
        anonymizeData: true,
        maxTrainingSamples: 10000,
        apiUrl: 'http://localhost:3001' // Backend API URL - change if deployed elsewhere
    },

    // Training data storage (in production, this would be on a server)
    trainingData: {
        documents: [], // Collected document samples
        patterns: {}, // Learned patterns
        corrections: [], // User corrections
        feedback: [] // User feedback on analysis accuracy
    },

    // Initialize the training system
    init: function() {
        // Load existing training data
        this.loadTrainingData();
        
        // Set up automatic collection
        if (this.config.enabled) {
            this.setupAutomaticCollection();
        }
        
        console.log('AI Training System initialized');
    },

    // Load training data from localStorage (in production, fetch from server)
    loadTrainingData: function() {
        try {
            const stored = localStorage.getItem('taxmind_training_data');
            if (stored) {
                this.trainingData = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading training data:', error);
        }
    },

    // Save training data to localStorage (in production, send to server)
    saveTrainingData: function() {
        try {
            localStorage.setItem('taxmind_training_data', JSON.stringify(this.trainingData));
        } catch (error) {
            console.error('Error saving training data:', error);
        }
    },

    // Set up automatic collection from user uploads
    setupAutomaticCollection: function() {
        // Listen for file uploads
        const originalStoreFile = window.storeFileOriginal || function() {};
        
        // Override or hook into file storage to collect training data
        // This will be called when files are analyzed
        window.taxmindCollectTrainingData = (fileData, detectionResult, analysisResult) => {
            this.collectTrainingSample(fileData, detectionResult, analysisResult);
        };
    },

    // Collect a training sample from user upload
    collectTrainingSample: function(fileData, detectionResult, analysisResult) {
        if (!this.config.enabled) return;
        if (detectionResult.confidence < this.config.minConfidenceForTraining) return;
        
        // Create training sample
        const sample = {
            id: this.generateSampleId(),
            timestamp: new Date().toISOString(),
            fileName: this.config.anonymizeData ? this.anonymizeFileName(fileData.name) : fileData.name,
            fileType: fileData.type,
            fileSize: fileData.size,
            detectedTaxType: detectionResult.typeId,
            detectedTaxTypeName: detectionResult.typeName,
            confidence: detectionResult.confidence,
            accountType: detectionResult.accountType,
            contentSnippet: this.extractContentSnippet(fileData.content), // If available
            keywords: this.extractKeywords(fileData.content || fileData.name),
            patterns: this.extractPatterns(fileData.content || fileData.name),
            analysisResult: analysisResult,
            source: 'user_upload'
        };

        // Add to training data
        this.trainingData.documents.push(sample);
        
        // Limit collection size
        if (this.trainingData.documents.length > this.config.maxTrainingSamples) {
            this.trainingData.documents.shift(); // Remove oldest
        }

        // Learn from this sample
        this.learnFromSample(sample);
        
        // Save training data
        this.saveTrainingData();
        
        // In production, send to server for model training
        this.sendToTrainingServer(sample);
    },

    // Extract content snippet for training (first 500 chars)
    extractContentSnippet: function(content) {
        if (!content) return '';
        return content.substring(0, 500).replace(/\s+/g, ' ').trim();
    },

    // Extract keywords from content
    extractKeywords: function(text) {
        if (!text) return [];
        const lowerText = text.toLowerCase();
        const keywords = [];
        
        // Common tax keywords
        const taxKeywords = [
            'w-2', '1099', '1040', 'tax', 'income', 'property', 'business',
            'deduction', 'refund', 'withheld', 'wages', 'assessed', 'parcel',
            'ein', 'schedule', 'federal', 'state', 'local'
        ];
        
        taxKeywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                keywords.push(keyword);
            }
        });
        
        return [...new Set(keywords)]; // Remove duplicates
    },

    // Extract patterns from content
    extractPatterns: function(text) {
        if (!text) return [];
        const patterns = [];
        
        // Look for common patterns
        const patternRegexes = [
            /form\s+\d{4}/gi,
            /box\s+\d+/gi,
            /\$\s*[\d,]+\.?\d*/g,
            /\d{2}\/\d{2}\/\d{4}/g, // Dates
            /ssn[:\s-]?\d{3}-?\d{2}-?\d{4}/gi,
            /ein[:\s-]?\d{2}-?\d{7}/gi
        ];
        
        patternRegexes.forEach(regex => {
            const matches = text.match(regex);
            if (matches) {
                patterns.push(...matches.slice(0, 5)); // Limit to 5 matches per pattern
            }
        });
        
        return patterns;
    },

    // Learn from a training sample (update pattern knowledge)
    learnFromSample: function(sample) {
        const taxType = sample.detectedTaxType;
        
        if (!this.trainingData.patterns[taxType]) {
            this.trainingData.patterns[taxType] = {
                keywords: {},
                patterns: {},
                examples: 0
            };
        }
        
        const typePatterns = this.trainingData.patterns[taxType];
        typePatterns.examples++;
        
        // Learn keywords
        sample.keywords.forEach(keyword => {
            if (!typePatterns.keywords[keyword]) {
                typePatterns.keywords[keyword] = 0;
            }
            typePatterns.keywords[keyword]++;
        });
        
        // Learn patterns
        sample.patterns.forEach(pattern => {
            const patternType = this.categorizePattern(pattern);
            if (!typePatterns.patterns[patternType]) {
                typePatterns.patterns[patternType] = 0;
            }
            typePatterns.patterns[patternType]++;
        });
    },

    // Categorize a pattern
    categorizePattern: function(pattern) {
        if (/form\s+\d+/.test(pattern)) return 'form_number';
        if (/box\s+\d+/.test(pattern)) return 'box_number';
        if (/\$\s*[\d,]+/.test(pattern)) return 'monetary_amount';
        if (/\d{2}\/\d{2}\/\d{4}/.test(pattern)) return 'date';
        if (/ssn|ein/i.test(pattern)) return 'identification';
        return 'other';
    },

    // Collect user feedback/corrections
    collectFeedback: function(detectionResult, userCorrection, feedbackType) {
        if (!this.config.saveUserFeedback) return;
        
        const feedback = {
            id: this.generateSampleId(),
            timestamp: new Date().toISOString(),
            originalDetection: detectionResult.typeId,
            userCorrection: userCorrection,
            feedbackType: feedbackType, // 'correction', 'confirmation', 'accuracy_rating'
            accountType: detectionResult.accountType,
            confidence: detectionResult.confidence
        };
        
        this.trainingData.feedback.push(feedback);
        
        // If user corrected, learn from the correction
        if (feedbackType === 'correction' && userCorrection) {
            this.learnFromCorrection(detectionResult, userCorrection);
        }
        
        this.saveTrainingData();
        this.sendFeedbackToServer(feedback);
    },

    // Learn from user correction
    learnFromCorrection: function(originalDetection, correction) {
        const correctionRecord = {
            id: this.generateSampleId(),
            timestamp: new Date().toISOString(),
            originalType: originalDetection.typeId,
            correctType: correction,
            keywords: originalDetection.keywords || [],
            patterns: originalDetection.patterns || []
        };
        
        this.trainingData.corrections.push(correctionRecord);
        
        // Update pattern weights to avoid similar mistakes
        // This would feed into the model training process
        console.log('Learning from correction:', correctionRecord);
    },

    // Generate synthetic training documents (safe, legal approach)
    generateSyntheticDocuments: function(count = 100) {
        if (!this.config.enabled) return;
        
        const taxTypes = ['income', 'property', 'business', 'sales', 'estate'];
        const syntheticDocs = [];
        
        for (let i = 0; i < count; i++) {
            const taxType = taxTypes[Math.floor(Math.random() * taxTypes.length)];
            const doc = this.createSyntheticDocument(taxType);
            syntheticDocs.push(doc);
        }
        
        return syntheticDocs;
    },

    // Create a synthetic document of a specific tax type
    createSyntheticDocument: function(taxType) {
        const templates = {
            income: {
                content: `FORM W-2
Wage and Tax Statement
Employee: [NAME]
SSN: XXX-XX-XXXX
Employer: [COMPANY]
EIN: XX-XXXXXXX
Box 1: Wages, tips, other compensation: $XX,XXX
Box 2: Federal income tax withheld: $X,XXX
Box 3: Social Security wages: $XX,XXX
Box 4: Social Security tax withheld: $X,XXX
Box 5: Medicare wages: $XX,XXX
Box 6: Medicare tax withheld: $XXX`,
                keywords: ['w-2', 'wage', 'tax', 'withheld', 'ssn', 'ein'],
                fileName: 'w2_form_2024.pdf'
            },
            property: {
                content: `PROPERTY TAX STATEMENT
Property Address: [ADDRESS]
Parcel Number: XXXXX-XXXXX-XXXXX
Tax Year: 2024
Assessed Value: $XXX,XXX
Taxable Value: $XXX,XXX
Tax Rate: X.XX%
Total Tax Due: $X,XXX
Due Date: XX/XX/2024
Homestead Exemption: Yes/No`,
                keywords: ['property tax', 'parcel', 'assessed value', 'tax rate'],
                fileName: 'property_tax_statement_2024.pdf'
            },
            business: {
                content: `SCHEDULE C (Form 1040)
Profit or Loss From Business
Business Name: [NAME]
EIN: XX-XXXXXXX
Part I: Income
Gross receipts or sales: $XXX,XXX
Cost of goods sold: $XX,XXX
Gross profit: $XX,XXX
Part II: Expenses
Advertising: $X,XXX
Vehicle expense: $X,XXX
Office expense: $X,XXX
Net profit or loss: $XX,XXX`,
                keywords: ['schedule c', 'business', 'ein', 'gross receipts', 'expenses'],
                fileName: 'schedule_c_2024.pdf'
            }
        };
        
        const template = templates[taxType] || templates.income;
        
        return {
            id: this.generateSampleId(),
            timestamp: new Date().toISOString(),
            fileName: template.fileName,
            fileType: 'application/pdf',
            detectedTaxType: taxType,
            detectedTaxTypeName: taxType.charAt(0).toUpperCase() + taxType.slice(1) + ' Tax',
            confidence: 95,
            contentSnippet: template.content,
            keywords: template.keywords,
            patterns: this.extractPatterns(template.content),
            source: 'synthetic'
        };
    },

    // Web scraping for public tax document examples (use with caution)
    // NOTE: This should only scrape publicly available, legal documents
    // and must respect robots.txt and terms of service
    collectWebDocuments: async function() {
        if (!this.config.webScrapingEnabled) {
            console.log('Web scraping disabled - enable in config with caution');
            return;
        }
        
        // List of legal, public sources for tax document examples
        const publicSources = [
            // IRS forms repository (public domain)
            'https://www.irs.gov/forms-instructions',
            // State tax department examples (varies by state)
            // Only use if explicitly allowed
        ];
        
        // In production, implement careful web scraping:
        // 1. Check robots.txt
        // 2. Respect rate limits
        // 3. Only use publicly available documents
        // 4. Anonymize any personal information
        // 5. Get proper permissions
        
        console.log('Web scraping not implemented - requires backend for safety');
    },

    // Send training data to server
    sendToTrainingServer: async function(sample) {
        try {
            // Try to send to backend API
            const apiUrl = this.config.apiUrl || 'http://localhost:3001';
            
            const response = await fetch(`${apiUrl}/api/training/samples`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sample: sample,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Training sample sent to server:', result.sampleId);
            } else {
                console.warn('Failed to send training sample to server, storing locally');
            }
        } catch (error) {
            // If backend is not available, just log
            console.log('Backend not available, training sample stored locally:', sample.id);
        }
    },

    // Send feedback to server
    sendFeedbackToServer: async function(feedback) {
        try {
            const apiUrl = this.config.apiUrl || 'http://localhost:3001';
            
            const response = await fetch(`${apiUrl}/api/training/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    feedback: feedback,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log('Feedback sent to server:', feedback.id);
            }
        } catch (error) {
            console.log('Backend not available, feedback stored locally:', feedback.id);
        }
    },

    // Trigger model training (calls backend)
    triggerTraining: async function() {
        try {
            const apiUrl = this.config.apiUrl || 'http://localhost:3001';
            
            const response = await fetch(`${apiUrl}/api/training/train`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Training job started:', result.jobId);
                return result;
            } else {
                throw new Error('Failed to start training');
            }
        } catch (error) {
            console.error('Error triggering training:', error);
            throw error;
        }
    },

    // Get learned patterns (for improving detection)
    getLearnedPatterns: function(taxType) {
        return this.trainingData.patterns[taxType] || null;
    },

    // Apply learned patterns to improve detection
    enhanceDetectionWithLearning: function(detectionResult, fileName, content) {
        const taxType = detectionResult.typeId;
        const learned = this.getLearnedPatterns(taxType);
        
        if (!learned || learned.examples < 10) {
            return detectionResult; // Not enough data yet
        }
        
        // Boost confidence based on learned patterns
        let confidenceBoost = 0;
        const keywords = this.extractKeywords(content || fileName);
        
        keywords.forEach(keyword => {
            if (learned.keywords[keyword]) {
                // More examples = higher boost
                const frequency = learned.keywords[keyword];
                confidenceBoost += Math.min(5, frequency / 10);
            }
        });
        
        // Apply boost (cap at 95%)
        const newConfidence = Math.min(95, detectionResult.confidence + confidenceBoost);
        
        return {
            ...detectionResult,
            confidence: newConfidence,
            learnedBoost: confidenceBoost
        };
    },

    // Generate sample ID
    generateSampleId: function() {
        return 'sample_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Anonymize file name
    anonymizeFileName: function(fileName) {
        // Remove personal information from filenames
        return fileName
            .replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+/g, '[NAME]') // Names
            .replace(/\d{3}-\d{2}-\d{4}/g, 'XXX-XX-XXXX') // SSN
            .replace(/\d{2}-\d{7}/g, 'XX-XXXXXXX'); // EIN
    },

    // Get training statistics
    getStats: function() {
        return {
            totalSamples: this.trainingData.documents.length,
            samplesByType: this.getSamplesByType(),
            totalFeedback: this.trainingData.feedback.length,
            totalCorrections: this.trainingData.corrections.length,
            learnedPatterns: Object.keys(this.trainingData.patterns).length
        };
    },

    // Get samples by tax type
    getSamplesByType: function() {
        const byType = {};
        this.trainingData.documents.forEach(doc => {
            if (!byType[doc.detectedTaxType]) {
                byType[doc.detectedTaxType] = 0;
            }
            byType[doc.detectedTaxType]++;
        });
        return byType;
    },

    // Export training data (for model training)
    exportTrainingData: function() {
        return {
            documents: this.trainingData.documents,
            patterns: this.trainingData.patterns,
            corrections: this.trainingData.corrections,
            feedback: this.trainingData.feedback,
            stats: this.getStats(),
            exportDate: new Date().toISOString()
        };
    }
};

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        AITrainingSystem.init();
    });
}

// Also initialize immediately if DOM already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AITrainingSystem.init);
} else {
    AITrainingSystem.init();
}

