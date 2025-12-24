// Highlight Engine - Analyzes documents and generates highlights/suggestions
// Works with document-viewer.js to display interactive highlights

const HighlightEngine = {
    // Analyze document and generate highlights
    analyzeDocument: async function(fileId, documentContent, taxType, accountType) {
        const highlights = [];
        
        // Get uploaded file info
        const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
        const file = uploadedFiles[fileId];
        
        if (!file) {
            return highlights;
        }
        
        // Analyze content for suggestions and warnings
        const suggestions = this.findSuggestions(documentContent, taxType, accountType);
        const warnings = this.findWarnings(documentContent, taxType, accountType);
        
        // Get red flags from red flag detector
        const redFlags = RedFlagDetector ? RedFlagDetector.detectRedFlags(documentContent, file, taxType) : [];
        
        // Combine all highlights
        highlights.push(...suggestions);
        highlights.push(...warnings);
        highlights.push(...redFlags.map(flag => ({
            ...flag,
            type: 'redflag'
        })));
        
        return highlights;
    },
    
    // Find optimization suggestions
    findSuggestions: function(content, taxType, accountType) {
        const suggestions = [];
        const lowerContent = content.toLowerCase();
        
        // Income Tax Suggestions
        if (taxType === 'income' && accountType === 'individual') {
            // Check for itemized deductions that might exceed standard deduction
            if (lowerContent.includes('mortgage interest') || lowerContent.includes('charitable')) {
                suggestions.push({
                    id: 'suggestion-' + Date.now() + '-1',
                    type: 'suggestion',
                    message: 'Consider comparing itemized deductions vs standard deduction ($14,600 for single, $29,200 for married). You may save more by itemizing.',
                    page: 1,
                    bbox: { x: 0, y: 0, width: 100, height: 20 }
                });
            }
            
            // Check for potential credits
            if (lowerContent.includes('child') || lowerContent.includes('dependent')) {
                suggestions.push({
                    id: 'suggestion-' + Date.now() + '-2',
                    type: 'suggestion',
                    message: 'You may qualify for Child Tax Credit (up to $2,000 per child) or Earned Income Tax Credit. Make sure to claim these credits.',
                    page: 1,
                    bbox: { x: 0, y: 20, width: 100, height: 20 }
                });
            }
            
            // Check for retirement contributions
            if (!lowerContent.includes('ira') && !lowerContent.includes('401k')) {
                suggestions.push({
                    id: 'suggestion-' + Date.now() + '-3',
                    type: 'suggestion',
                    message: 'Consider contributing to an IRA or 401(k) to reduce taxable income. Contributions are often tax-deductible.',
                    page: 1,
                    bbox: { x: 0, y: 40, width: 100, height: 20 }
                });
            }
        }
        
        // Business Tax Suggestions
        if (taxType === 'business' || accountType === 'business') {
            // Check for business expenses
            if (lowerContent.includes('schedule c') || lowerContent.includes('business')) {
                suggestions.push({
                    id: 'suggestion-' + Date.now() + '-4',
                    type: 'suggestion',
                    message: 'Make sure to claim all eligible business deductions: office supplies, vehicle expenses, home office (if applicable), professional services.',
                    page: 1,
                    bbox: { x: 0, y: 0, width: 100, height: 20 }
                });
            }
            
            // Check for QBI deduction
            if (lowerContent.includes('qualified business income') || lowerContent.includes('qbi')) {
                suggestions.push({
                    id: 'suggestion-' + Date.now() + '-5',
                    type: 'suggestion',
                    message: 'You may qualify for the Qualified Business Income (QBI) deduction, which can reduce your taxable income by up to 20%.',
                    page: 1,
                    bbox: { x: 0, y: 20, width: 100, height: 20 }
                });
            }
        }
        
        // Property Tax Suggestions
        if (taxType === 'property') {
            suggestions.push({
                id: 'suggestion-' + Date.now() + '-6',
                type: 'suggestion',
                message: 'Property taxes are deductible on Schedule A (up to $10,000 SALT cap). Make sure to include this in your itemized deductions.',
                page: 1,
                bbox: { x: 0, y: 0, width: 100, height: 20 }
            });
        }
        
        return suggestions;
    },
    
    // Find warnings
    findWarnings: function(content, taxType, accountType) {
        const warnings = [];
        const lowerContent = content.toLowerCase();
        
        // Check for missing information
        if (taxType === 'income') {
            // Check for missing SSN
            const ssnPattern = /\d{3}-\d{2}-\d{4}/;
            if (!ssnPattern.test(content)) {
                warnings.push({
                    id: 'warning-' + Date.now() + '-1',
                    type: 'warning',
                    message: 'Social Security Number (SSN) not found. Required for tax filing.',
                    page: 1,
                    bbox: { x: 0, y: 0, width: 100, height: 20 }
                });
            }
            
            // Check for W-2 without income amount
            if (lowerContent.includes('w-2') || lowerContent.includes('wage')) {
                const incomePattern = /\$\d+|\d+\.\d{2}/;
                if (!incomePattern.test(content)) {
                    warnings.push({
                        id: 'warning-' + Date.now() + '-2',
                        type: 'warning',
                        message: 'W-2 form detected but income amount not clearly visible. Please verify all wages are reported.',
                        page: 1,
                        bbox: { x: 0, y: 20, width: 100, height: 20 }
                    });
                }
            }
        }
        
        // Business warnings
        if (taxType === 'business' || accountType === 'business') {
            // Check for EIN
            if (!lowerContent.includes('ein') && !lowerContent.includes('employer identification')) {
                warnings.push({
                    id: 'warning-' + Date.now() + '-3',
                    type: 'warning',
                    message: 'Employer Identification Number (EIN) not found. Required for business tax filings.',
                    page: 1,
                    bbox: { x: 0, y: 0, width: 100, height: 20 }
                });
            }
            
            // Check for business expenses documentation
            if (lowerContent.includes('deduction') || lowerContent.includes('expense')) {
                warnings.push({
                    id: 'warning-' + Date.now() + '-4',
                    type: 'warning',
                    message: 'Ensure all business expenses are properly documented with receipts. The IRS may request documentation.',
                    page: 1,
                    bbox: { x: 0, y: 20, width: 100, height: 20 }
                });
            }
        }
        
        // Check for signature
        if (!lowerContent.includes('signature') && !lowerContent.includes('signed')) {
            warnings.push({
                id: 'warning-' + Date.now() + '-5',
                type: 'warning',
                message: 'Document signature not found. Tax forms require signatures to be valid.',
                page: 1,
                bbox: { x: 0, y: 40, width: 100, height: 20 }
            });
        }
        
        // Check for date
        const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/;
        if (!datePattern.test(content)) {
            warnings.push({
                id: 'warning-' + Date.now() + '-6',
                type: 'warning',
                message: 'Date not found on document. Please ensure the tax year is clearly indicated.',
                page: 1,
                bbox: { x: 0, y: 60, width: 100, height: 20 }
            });
        }
        
        return warnings;
    },
    
    // Extract text from document (helper function)
    extractText: async function(file) {
        // This would extract text from PDF or image
        // For now, return empty string - actual implementation would use PDF.js or OCR
        return '';
    },
    
    // Generate highlights from analysis results
    generateHighlightsFromAnalysis: function(analysisResults, fileId) {
        const highlights = [];
        
        // Convert analysis insights to highlights
        if (analysisResults.missingDocuments && analysisResults.missingDocuments.length > 0) {
            analysisResults.missingDocuments.forEach(doc => {
                highlights.push({
                    id: 'highlight-' + Date.now() + '-' + Math.random(),
                    type: 'warning',
                    message: `Missing document: ${doc}. This may be required for your tax filing.`,
                    page: 1,
                    bbox: { x: 0, y: 0, width: 100, height: 20 }
                });
            });
        }
        
        if (analysisResults.potentialDeductions && analysisResults.potentialDeductions.length > 0) {
            analysisResults.potentialDeductions.forEach(deduction => {
                highlights.push({
                    id: 'highlight-' + Date.now() + '-' + Math.random(),
                    type: 'suggestion',
                    message: `Potential deduction: ${deduction.name}. ${deduction.description}`,
                    page: 1,
                    bbox: { x: 0, y: 20, width: 100, height: 20 }
                });
            });
        }
        
        return highlights;
    }
};

