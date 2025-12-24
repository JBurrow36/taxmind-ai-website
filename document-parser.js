// Document Parser - Extracts text and financial data from uploaded documents
// Supports PDFs (via PDF.js) and images (via Tesseract.js OCR)

const DocumentParser = {
    // Extract text content from a file
    async extractText(file, fileId) {
        try {
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                return await this.extractTextFromPDF(file, fileId);
            } else if (file.type.startsWith('image/')) {
                return await this.extractTextFromImage(file, fileId);
            } else {
                // Try to read as text
                return await this.extractTextFromTextFile(file);
            }
        } catch (error) {
            console.error('Error extracting text from document:', error);
            return '';
        }
    },
    
    // Extract text from PDF using PDF.js
    async extractTextFromPDF(file, fileId) {
        try {
            // Get stored file data
            const fileDataKey = `taxmind_file_data_${fileId}`;
            const base64Data = localStorage.getItem(fileDataKey);
            
            if (!base64Data) {
                console.warn('No file data found for PDF extraction');
                return '';
            }
            
            // Convert base64 to Uint8Array
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Load PDF document
            if (typeof pdfjsLib === 'undefined') {
                console.error('PDF.js not loaded');
                return '';
            }
            
            const loadingTask = pdfjsLib.getDocument({ data: bytes });
            const pdfDoc = await loadingTask.promise;
            
            let fullText = '';
            
            // Extract text from all pages
            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // Combine all text items from the page
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ');
                
                fullText += pageText + '\n\n';
            }
            
            console.log(`Extracted ${fullText.length} characters from PDF`);
            return fullText;
            
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            return '';
        }
    },
    
    // Extract text from image using Tesseract.js OCR with enhanced preprocessing
    async extractTextFromImage(file, fileId) {
        try {
            // Check if Tesseract.js is loaded
            if (typeof Tesseract === 'undefined') {
                console.warn('Tesseract.js not loaded - OCR not available');
                return '';
            }
            
            // Get stored file data
            const fileDataKey = `taxmind_file_data_${fileId}`;
            const base64Data = localStorage.getItem(fileDataKey);
            
            if (!base64Data) {
                console.warn('No file data found for image OCR');
                return '';
            }
            
            // Convert base64 to image
            const imageUrl = `data:${file.type};base64,${base64Data}`;
            
            // Run OCR with enhanced settings for better accuracy
            console.log('Starting OCR for image with enhanced preprocessing...');
            
            const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
                    }
                },
                // Enhanced OCR settings for better accuracy
                tessedit_pageseg_mode: Tesseract.PSM.AUTO, // Auto page segmentation
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$.,()/-: ', // Common tax form characters
                preserve_interword_spaces: '1' // Preserve spacing for better field detection
            });
            
            console.log(`Extracted ${text.length} characters from image via OCR`);
            
            // Clean up OCR text - fix common OCR errors
            const cleanedText = this.cleanOCRText(text);
            
            return cleanedText;
            
        } catch (error) {
            console.error('Error extracting text from image:', error);
            return '';
        }
    },
    
    // Clean OCR text to fix common recognition errors
    cleanOCRText(text) {
        if (!text) return '';
        
        let cleaned = text;
        
        // Fix common OCR mistakes in tax documents
        const corrections = [
            // Common character confusions
            { pattern: /[|1]/g, replace: 'I' }, // | and 1 often confused with I
            { pattern: /[0O]/g, replace: 'O' }, // 0 and O confusion (context-dependent, but helps)
            // Fix spacing issues
            { pattern: /\s+/g, replace: ' ' }, // Multiple spaces to single space
            // Fix dollar signs
            { pattern: /S(\d)/g, replace: '$$1' }, // S confused with $
            { pattern: /\$(\s+)(\d)/g, replace: '$$2' }, // Space after dollar sign
            // Fix common tax form abbreviations
            { pattern: /W[- ]?2/gi, replace: 'W-2' },
            { pattern: /1099[- ]?/gi, replace: '1099-' },
            { pattern: /1040/gi, replace: '1040' },
        ];
        
        corrections.forEach(({ pattern, replace }) => {
            cleaned = cleaned.replace(pattern, replace);
        });
        
        return cleaned;
    },
    
    // Extract text from text files
    async extractTextFromTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },
    
    // Parse extracted text to find financial data with enhanced detection
    parseFinancialData(text, documentType = 'auto') {
        const data = {
            income: null,
            wages: null,
            deductions: null,
            taxWithheld: null,
            adjustedGrossIncome: null,
            taxableIncome: null,
            taxOwed: null,
            refund: null,
            detectedForm: null,
            rawText: text,
            confidence: 'low'
        };
        
        if (!text || text.length === 0) {
            return data;
        }
        
        // Pre-process text for better parsing
        const processedText = this.preprocessText(text);
        
        // Detect form type
        const formType = this.detectFormType(processedText);
        data.detectedForm = formType;
        
        // Parse based on form type
        let parsedData;
        switch (formType) {
            case 'w2':
                parsedData = this.parseW2(processedText, data);
                parsedData.confidence = parsedData.wages ? 'high' : 'medium';
                break;
            case '1099':
                parsedData = this.parse1099(processedText, data);
                parsedData.confidence = parsedData.income ? 'high' : 'medium';
                break;
            case '1040':
            case 'schedule-c':
            case 'schedule-e':
                parsedData = this.parse1040(processedText, data);
                parsedData.confidence = parsedData.adjustedGrossIncome || parsedData.income ? 'high' : 'medium';
                break;
            default:
                parsedData = this.parseGeneric(processedText, data);
                parsedData.confidence = parsedData.income ? 'medium' : 'low';
        }
        
        // Post-process: validate and clean data
        return this.validateParsedData(parsedData);
    },
    
    // Preprocess text for better parsing
    preprocessText(text) {
        if (!text) return '';
        
        let processed = text;
        
        // Normalize whitespace
        processed = processed.replace(/\s+/g, ' ');
        
        // Fix common OCR issues
        processed = processed.replace(/\|\s*([0-9])/g, '$1'); // Remove stray | before numbers
        processed = processed.replace(/([0-9])\s*\|\s*([0-9])/g, '$1$2'); // Fix | between numbers
        
        // Normalize box references
        processed = processed.replace(/\bBOX\s*#?\s*([0-9]+[A-Z]?)\b/gi, 'BOX $1');
        
        // Normalize dollar signs
        processed = processed.replace(/\$\s+/g, '$');
        processed = processed.replace(/S([0-9])/g, '$$1'); // S confused with $
        
        return processed;
    },
    
    // Validate and clean parsed data
    validateParsedData(data) {
        // Remove negative values (likely parsing errors)
        if (data.income && data.income < 0) data.income = null;
        if (data.wages && data.wages < 0) data.wages = null;
        if (data.deductions && data.deductions < 0) data.deductions = null;
        if (data.taxWithheld && data.taxWithheld < 0) data.taxWithheld = null;
        if (data.taxOwed && data.taxOwed < 0) data.taxOwed = null;
        if (data.refund && data.refund < 0) data.refund = null;
        
        // Validate reasonable ranges for common tax scenarios
        const MAX_INCOME = 50000000; // $50M - very high but possible for high earners
        const MAX_DEDUCTION = 1000000; // $1M - very high but possible for businesses
        const MAX_TAX = 20000000; // $20M - very high tax but possible
        
        // Sanity checks - remove obviously wrong values
        if (data.income && (data.income > MAX_INCOME || data.income < 100)) {
            console.warn(`Invalid income value detected: $${data.income}. Setting to null.`);
            data.income = null;
        }
        
        if (data.wages && (data.wages > MAX_INCOME || data.wages < 100)) {
            console.warn(`Invalid wages value detected: $${data.wages}. Setting to null.`);
            data.wages = null;
        }
        
        if (data.deductions && data.deductions > MAX_DEDUCTION) {
            console.warn(`Unusually high deduction value detected: $${data.deductions}. May need verification.`);
            // Don't null it, but flag it for review
            data.deductionsFlagged = true;
        }
        
        if (data.deductions && data.deductions > data.income && data.income && data.deductions > 10000) {
            // Deductions shouldn't exceed income significantly (allow some tolerance for business losses)
            console.warn(`Deductions (${data.deductions}) exceed income (${data.income}). This may indicate a business loss.`);
            data.deductionsFlagged = true;
        }
        
        if (data.taxOwed && data.taxOwed > MAX_TAX) {
            console.warn(`Invalid tax owed value detected: $${data.taxOwed}. Setting to null.`);
            data.taxOwed = null;
        }
        
        // Validate tax withheld is reasonable (typically 10-40% of income)
        if (data.taxWithheld && data.income && data.income > 0) {
            const withholdingRate = (data.taxWithheld / data.income) * 100;
            if (withholdingRate > 50 || withholdingRate < 0) {
                console.warn(`Unusual withholding rate detected: ${withholdingRate.toFixed(1)}%. Value: $${data.taxWithheld} on income: $${data.income}`);
                data.taxWithheldFlagged = true;
            }
        }
        
        // Calculate missing values if possible
        if (data.income && !data.wages) {
            data.wages = data.income; // Assume income is wages if not specified
        }
        
        if (data.taxWithheld && data.taxOwed && !data.refund) {
            data.refund = Math.max(0, data.taxWithheld - data.taxOwed);
        }
        
        return data;
    },
    
    // Detect what type of tax form this is with enhanced pattern matching
    detectFormType(text) {
        if (!text || text.length === 0) return 'generic';
        
        const upperText = text.toUpperCase();
        const normalizedText = upperText.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' '); // Normalize for better matching
        
        // W-2 Form Detection (multiple patterns)
        const w2Patterns = [
            /FORM\s*W[\s\-]?2/i,
            /WAGE\s+AND\s+TAX\s+STATEMENT/i,
            /W[\s\-]?2/i,
            /BOX\s*1[:\s]*WAGES/i,
            /COPY\s+[ABC]\s+FOR/i, // W-2 typically has Copy A, B, C
            /EMPLOYER.*IDENTIFICATION.*NUMBER/i,
            /SOCIAL\s+SECURITY\s+WAGES/i
        ];
        
        if (w2Patterns.some(pattern => pattern.test(text))) {
            return 'w2';
        }
        
        // 1099 Form Detection (all variations)
        const form1099Patterns = [
            /FORM\s*1099[\s\-]?[A-Z]*/i,
            /1099[\s\-]?(NEC|MISC|INT|DIV|K|R|SA|SB|SC|W2G|G|Q|PATR)/i,
            /NONEMPLOYEE\s+COMPENSATION/i,
            /MISCELANEOUS\s+INCOME/i,
            /INTEREST\s+INCOME/i,
            /DIVIDENDS/i,
            /PAYER.*TIN/i,
            /RECIPIENT.*TIN/i
        ];
        
        if (form1099Patterns.some(pattern => pattern.test(text))) {
            return '1099';
        }
        
        // Form 1040 Detection
        const form1040Patterns = [
            /FORM\s*1040/i,
            /U\.S\.\s+INDIVIDUAL\s+INCOME\s+TAX\s+RETURN/i,
            /SCHEDULE\s+[A-Z]\s+FORM\s*1040/i,
            /ADJUSTED\s+GROSS\s+INCOME/i,
            /STANDARD\s+DEDUCTION/i,
            /ITEMIZED\s+DEDUCTIONS/i,
            /TAXABLE\s+INCOME/i,
            /TAX\s+LIABILITY/i
        ];
        
        if (form1040Patterns.some(pattern => pattern.test(text))) {
            return '1040';
        }
        
        // Schedule C (Business Income)
        if (/SCHEDULE\s*C/i.test(text) || /BUSINESS\s+INCOME/i.test(text) || /PROFIT\s+OR\s+LOSS\s+FROM\s+BUSINESS/i.test(text)) {
            return 'schedule-c';
        }
        
        // Schedule E (Rental/Passive Income)
        if (/SCHEDULE\s*E/i.test(text) || /SUPPLEMENTAL\s+INCOME/i.test(text) || /RENTAL\s+REAL\s+ESTATE/i.test(text)) {
            return 'schedule-e';
        }
        
        // Property Tax Detection
        if (/PROPERTY\s+TAX/i.test(text) || /REAL\s+ESTATE\s+TAX/i.test(text) || /ASSESSED\s+VALUE/i.test(text) || /PARCEL\s+(ID|NUMBER)/i.test(text)) {
            return 'property-tax';
        }
        
        return 'generic';
    },
    
    // Parse W-2 form with enhanced pattern matching
    parseW2(text, data) {
        // Normalize text for better matching (remove extra spaces, normalize case)
        const normalizedText = text.replace(/\s+/g, ' ').toUpperCase();
        
        // W-2 Box 1: Wages, tips, other compensation (multiple patterns)
        const box1Patterns = [
            /BOX\s*1[:\s]*WAGES[\s,]*TIPS[\s,]*OTHER[\s,]*COMPENSATION[:\s]*\$?([\d,]+\.?\d*)/i,
            /BOX\s*1[:\s]*\$?([\d,]+\.?\d*)/i,
            /WAGES[\s,]*TIPS[\s,]*OTHER[\s,]*COMPENSATION[:\s]*\$?([\d,]+\.?\d*)/i,
            /WAGES[:\s]*\$?([\d,]+\.?\d*)/i,
            /(?:^|\n)\s*1\s+([\d,]+\.?\d*)/, // Pattern: line starting with "1" followed by amount
        ];
        
        for (const pattern of box1Patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const amount = this.parseAmount(match[1]);
                if (amount > 0) {
                    data.wages = amount;
                    data.income = amount;
                    break;
                }
            }
        }
        
        // W-2 Box 2: Federal income tax withheld
        const box2Patterns = [
            /BOX\s*2[:\s]*FEDERAL[\s,]*INCOME[\s,]*TAX[\s,]*WITHHELD[:\s]*\$?([\d,]+\.?\d*)/i,
            /BOX\s*2[:\s]*\$?([\d,]+\.?\d*)/i,
            /FEDERAL[\s,]*INCOME[\s,]*TAX[\s,]*WITHHELD[:\s]*\$?([\d,]+\.?\d*)/i,
            /FEDERAL[\s,]*TAX[\s,]*WITHHELD[:\s]*\$?([\d,]+\.?\d*)/i,
            /(?:^|\n)\s*2\s+([\d,]+\.?\d*)/,
        ];
        
        for (const pattern of box2Patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const amount = this.parseAmount(match[1]);
                if (amount > 0) {
                    data.taxWithheld = amount;
                    break;
                }
            }
        }
        
        // Social Security wages (Box 3) - fallback if Box 1 not found
        if (!data.wages) {
            const box3Patterns = [
                /BOX\s*3[:\s]*SOCIAL[\s,]*SECURITY[\s,]*WAGES[:\s]*\$?([\d,]+\.?\d*)/i,
                /BOX\s*3[:\s]*\$?([\d,]+\.?\d*)/i,
                /SOCIAL[\s,]*SECURITY[\s,]*WAGES[:\s]*\$?([\d,]+\.?\d*)/i,
                /(?:^|\n)\s*3\s+([\d,]+\.?\d*)/,
            ];
            
            for (const pattern of box3Patterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const amount = this.parseAmount(match[1]);
                    if (amount > 0) {
                        data.wages = amount;
                        data.income = amount;
                        break;
                    }
                }
            }
        }
        
        // Box 17: State income tax (optional)
        const box17Match = text.match(/BOX\s*17[:\s]*\$?([\d,]+\.?\d*)/i) ||
                          text.match(/STATE[\s,]*INCOME[\s,]*TAX[:\s]*\$?([\d,]+\.?\d*)/i);
        if (box17Match) {
            data.stateTaxWithheld = this.parseAmount(box17Match[1]);
        }
        
        return data;
    },
    
    // Parse 1099 form with enhanced pattern matching
    parse1099(text, data) {
        // Detect 1099 type for more specific parsing
        const textUpper = text.toUpperCase();
        const is1099NEC = /1099[\s\-]?NEC/i.test(text) || /NONEMPLOYEE[\s,]*COMPENSATION/i.test(text);
        const is1099INT = /1099[\s\-]?INT/i.test(text) || /INTEREST[\s,]*INCOME/i.test(text);
        const is1099DIV = /1099[\s\-]?DIV/i.test(text) || /DIVIDENDS/i.test(text);
        const is1099MISC = /1099[\s\-]?MISC/i.test(text) || /MISCELANEOUS[\s,]*INCOME/i.test(text);
        
        // 1099-NEC: Nonemployee Compensation (Box 1)
        if (is1099NEC) {
            const necPatterns = [
                /BOX\s*1[:\s]*NONEMPLOYEE[\s,]*COMPENSATION[:\s]*\$?([\d,]+\.?\d*)/i,
                /BOX\s*1[:\s]*\$?([\d,]+\.?\d*)/i,
                /NONEMPLOYEE[\s,]*COMPENSATION[:\s]*\$?([\d,]+\.?\d*)/i,
                /(?:^|\n)\s*1\s+([\d,]+\.?\d*)/,
            ];
            
            for (const pattern of necPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const amount = this.parseAmount(match[1]);
                    if (amount > 0) {
                        data.income = (data.income || 0) + amount;
                        data.nonemployeeCompensation = amount;
                        break;
                    }
                }
            }
        }
        
        // 1099-INT: Interest Income (Box 1)
        if (is1099INT) {
            const intPatterns = [
                /BOX\s*1[:\s]*INTEREST[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
                /BOX\s*1[:\s]*\$?([\d,]+\.?\d*)/i,
                /INTEREST[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
                /(?:^|\n)\s*1\s+([\d,]+\.?\d*)/,
            ];
            
            for (const pattern of intPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const amount = this.parseAmount(match[1]);
                    if (amount > 0) {
                        data.income = (data.income || 0) + amount;
                        data.interestIncome = amount;
                        break;
                    }
                }
            }
        }
        
        // 1099-DIV: Dividends (Box 1a)
        if (is1099DIV) {
            const divPatterns = [
                /BOX\s*1[A]?[:\s]*ORDINARY[\s,]*DIVIDENDS[:\s]*\$?([\d,]+\.?\d*)/i,
                /BOX\s*1[A]?[:\s]*\$?([\d,]+\.?\d*)/i,
                /ORDINARY[\s,]*DIVIDENDS[:\s]*\$?([\d,]+\.?\d*)/i,
                /DIVIDENDS[:\s]*\$?([\d,]+\.?\d*)/i,
            ];
            
            for (const pattern of divPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const amount = this.parseAmount(match[1]);
                    if (amount > 0) {
                        data.income = (data.income || 0) + amount;
                        data.dividendIncome = amount;
                        break;
                    }
                }
            }
        }
        
        // 1099-MISC: Miscellaneous Income
        if (is1099MISC) {
            const miscPatterns = [
                /BOX\s*3[:\s]*OTHER[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
                /BOX\s*7[:\s]*NONEMPLOYEE[\s,]*COMPENSATION[:\s]*\$?([\d,]+\.?\d*)/i,
                /MISCELANEOUS[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
            ];
            
            for (const pattern of miscPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const amount = this.parseAmount(match[1]);
                    if (amount > 0) {
                        data.income = (data.income || 0) + amount;
                        break;
                    }
                }
            }
        }
        
        // Generic 1099 pattern matching (fallback)
        if (!data.income) {
            const genericPatterns = [
                /GROSS\s+INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
                /TOTAL\s+INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
                /AMOUNT[:\s]*\$?([\d,]+\.?\d*)/i,
            ];
            
            for (const pattern of genericPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const amount = this.parseAmount(match[1]);
                    if (amount > 100) { // Only accept reasonable amounts
                        data.income = (data.income || 0) + amount;
                        break;
                    }
                }
            }
        }
        
        return data;
    },
    
    // Parse Form 1040 with enhanced pattern matching
    parse1040(text, data) {
        // Adjusted Gross Income (Line 11) - multiple patterns
        const agiPatterns = [
            /LINE\s*11[:\s]*ADJUSTED[\s,]*GROSS[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
            /LINE\s*11[:\s]*\$?([\d,]+\.?\d*)/i,
            /ADJUSTED[\s,]*GROSS[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
            /AGI[:\s]*\$?([\d,]+\.?\d*)/i,
        ];
        
        for (const pattern of agiPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const amount = this.parseAmount(match[1]);
                if (amount > 0) {
                    data.adjustedGrossIncome = amount;
                    data.income = amount; // Use AGI as income if no other income found
                    break;
                }
            }
        }
        
        // Total Income (Line 9) - alternative income source
        if (!data.income) {
            const totalIncomePatterns = [
                /LINE\s*9[:\s]*TOTAL[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
                /LINE\s*9[:\s]*\$?([\d,]+\.?\d*)/i,
                /TOTAL[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
            ];
            
            for (const pattern of totalIncomePatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const amount = this.parseAmount(match[1]);
                    if (amount > 0) {
                        data.income = amount;
                        break;
                    }
                }
            }
        }
        
        // Standard Deduction or Itemized Deductions
        const deductionPatterns = [
            /LINE\s*12[:\s]*STANDARD[\s,]*DEDUCTION[:\s]*\$?([\d,]+\.?\d*)/i,
            /LINE\s*12[:\s]*\$?([\d,]+\.?\d*)/i,
            /STANDARD[\s,]*DEDUCTION[:\s]*\$?([\d,]+\.?\d*)/i,
            /TOTAL[\s,]*ITEMIZED[\s,]*DEDUCTIONS[:\s]*\$?([\d,]+\.?\d*)/i,
            /SCHEDULE[\s,]*A[\s,]*TOTAL[:\s]*\$?([\d,]+\.?\d*)/i,
        ];
        
        for (const pattern of deductionPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const amount = this.parseAmount(match[1]);
                if (amount > 0) {
                    data.deductions = amount;
                    break;
                }
            }
        }
        
        // Taxable Income (Line 15)
        const taxablePatterns = [
            /LINE\s*15[:\s]*TAXABLE[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
            /LINE\s*15[:\s]*\$?([\d,]+\.?\d*)/i,
            /TAXABLE[\s,]*INCOME[:\s]*\$?([\d,]+\.?\d*)/i,
        ];
        
        for (const pattern of taxablePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const amount = this.parseAmount(match[1]);
                if (amount > 0) {
                    data.taxableIncome = amount;
                    break;
                }
            }
        }
        
        // Total tax (Line 24)
        const taxPatterns = [
            /LINE\s*24[:\s]*TOTAL[\s,]*TAX[:\s]*\$?([\d,]+\.?\d*)/i,
            /LINE\s*24[:\s]*\$?([\d,]+\.?\d*)/i,
            /TOTAL[\s,]*TAX[:\s]*\$?([\d,]+\.?\d*)/i,
            /TAX[\s,]*LIABILITY[:\s]*\$?([\d,]+\.?\d*)/i,
        ];
        
        for (const pattern of taxPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const amount = this.parseAmount(match[1]);
                if (amount > 0) {
                    data.taxOwed = amount;
                    break;
                }
            }
        }
        
        // Federal income tax withheld (Line 25a)
        const withheldPatterns = [
            /LINE\s*25[A]?[:\s]*FEDERAL[\s,]*INCOME[\s,]*TAX[\s,]*WITHHELD[:\s]*\$?([\d,]+\.?\d*)/i,
            /LINE\s*25[A]?[:\s]*\$?([\d,]+\.?\d*)/i,
            /FEDERAL[\s,]*INCOME[\s,]*TAX[\s,]*WITHHELD[:\s]*\$?([\d,]+\.?\d*)/i,
        ];
        
        for (const pattern of withheldPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const amount = this.parseAmount(match[1]);
                if (amount > 0) {
                    data.taxWithheld = amount;
                    break;
                }
            }
        }
        
        // Refund (Line 34) or Overpayment
        const refundPatterns = [
            /LINE\s*34[:\s]*REFUND[:\s]*\$?([\d,]+\.?\d*)/i,
            /LINE\s*34[:\s]*\$?([\d,]+\.?\d*)/i,
            /REFUND[:\s]*\$?([\d,]+\.?\d*)/i,
            /OVERPAYMENT[:\s]*\$?([\d,]+\.?\d*)/i,
        ];
        
        for (const pattern of refundPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const amount = this.parseAmount(match[1]);
                if (amount > 0) {
                    data.refund = amount;
                    break;
                }
            }
        }
        
        // Calculate refund if we have tax withheld and tax owed
        if (!data.refund && data.taxWithheld && data.taxOwed) {
            data.refund = Math.max(0, data.taxWithheld - data.taxOwed);
        }
        
        return data;
    },
    
    // Parse generic document for any financial numbers with intelligent extraction
    parseGeneric(text, data) {
        // Enhanced dollar amount extraction with context
        const dollarAmountPatterns = [
            /\$\s*[\d,]+\.?\d*/g,  // Standard: $1,234.56
            /USD\s*[\d,]+\.?\d*/gi, // USD 1,234.56
            /[\d,]+\.[\d]{2}/g,     // 1234.56 (with decimal)
        ];
        
        let allAmounts = [];
        dollarAmountPatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            allAmounts = allAmounts.concat(matches);
        });
        
        // Parse and filter amounts
        const amounts = allAmounts
            .map(amt => this.parseAmount(amt))
            .filter(amt => amt > 0 && amt < 100000000) // Reasonable range: $0 to $100M
            .sort((a, b) => b - a); // Sort descending
        
        if (amounts.length === 0) return data;
        
        // Context-aware extraction - look for keywords near amounts
        const contextWindow = 100; // Characters before/after amount
        
        // Find income indicators
        const incomeKeywords = ['income', 'wages', 'salary', 'earnings', 'revenue', 'gross', 'total income'];
        const incomeAmounts = [];
        
        amounts.forEach(amount => {
            const amountStr = '$' + amount.toLocaleString();
            const amountIndex = text.indexOf(amountStr);
            if (amountIndex >= 0) {
                const context = text.substring(
                    Math.max(0, amountIndex - contextWindow),
                    Math.min(text.length, amountIndex + amountStr.length + contextWindow)
                ).toLowerCase();
                
                if (incomeKeywords.some(keyword => context.includes(keyword))) {
                    incomeAmounts.push(amount);
                }
            }
        });
        
        // Use largest income-related amount, or largest overall if no context found
        if (incomeAmounts.length > 0) {
            data.income = incomeAmounts[0];
        } else if (amounts.length > 0) {
            data.income = amounts[0]; // Largest amount as fallback
        }
        
        // Find deduction indicators
        const deductionKeywords = ['deduction', 'expense', 'deduct', 'write-off', 'business expense'];
        const deductionAmounts = [];
        
        amounts.forEach(amount => {
            const amountStr = '$' + amount.toLocaleString();
            const amountIndex = text.indexOf(amountStr);
            if (amountIndex >= 0) {
                const context = text.substring(
                    Math.max(0, amountIndex - contextWindow),
                    Math.min(text.length, amountIndex + amountStr.length + contextWindow)
                ).toLowerCase();
                
                if (deductionKeywords.some(keyword => context.includes(keyword))) {
                    deductionAmounts.push(amount);
                }
            }
        });
        
        if (deductionAmounts.length > 0) {
            data.deductions = deductionAmounts.reduce((sum, amt) => sum + amt, 0);
        }
        
        // Find tax indicators
        const taxKeywords = ['tax', 'withheld', 'liability', 'owed', 'due'];
        const taxAmounts = [];
        
        amounts.forEach(amount => {
            const amountStr = '$' + amount.toLocaleString();
            const amountIndex = text.indexOf(amountStr);
            if (amountIndex >= 0) {
                const context = text.substring(
                    Math.max(0, amountIndex - contextWindow),
                    Math.min(text.length, amountIndex + amountStr.length + contextWindow)
                ).toLowerCase();
                
                if (taxKeywords.some(keyword => context.includes(keyword))) {
                    taxAmounts.push(amount);
                }
            }
        });
        
        if (taxAmounts.length > 0) {
            // Largest tax amount is likely total tax
            data.taxOwed = taxAmounts[0];
        }
        
        return data;
    },
    
    // Parse amount string to number
    parseAmount(amountStr) {
        if (!amountStr) return 0;
        // Remove currency symbols, commas, and whitespace
        const cleaned = amountStr.toString().replace(/[$,?\s]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    },
    
    // Extract all financial data from a file
    async extractFinancialData(file, fileId) {
        try {
            if (!file || !fileId) {
                throw new Error('File and fileId are required for extraction');
            }
            
            // Extract text first
            const text = await this.extractText(file, fileId);
            
            if (!text || text.length === 0) {
                const warningMsg = `No text extracted from document "${file.name}". This may be an image-only PDF or scanned document. OCR processing may be needed.`;
                console.warn(warningMsg);
                
                // Store error indicator
                const extractionKey = `taxmind_extracted_data_${fileId}`;
                try {
                    localStorage.setItem(extractionKey, JSON.stringify({
                        error: true,
                        errorMessage: 'No text content found in document',
                        fileName: file.name,
                        extractedAt: new Date().toISOString(),
                        requiresOCR: true
                    }));
                } catch (storageError) {
                    console.error('Cannot store error indicator:', storageError);
                }
                
                return null;
            }
            
            // Parse the text for financial data
            const financialData = this.parseFinancialData(text);
            
            // Store extracted data with error handling
            const extractionKey = `taxmind_extracted_data_${fileId}`;
            try {
                localStorage.setItem(extractionKey, JSON.stringify({
                    ...financialData,
                    extractedAt: new Date().toISOString(),
                    fileName: file.name
                }));
                
                console.log('Extracted financial data:', financialData);
                return financialData;
            } catch (storageError) {
                if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
                    console.error('Cannot store extracted data - localStorage quota exceeded');
                    throw new Error('Storage limit exceeded. Please clear some data and try again.');
                }
                throw storageError;
            }
            
        } catch (error) {
            console.error('Error extracting financial data:', error);
            
            // Store error indicator for user feedback
            try {
                const extractionKey = `taxmind_extracted_data_${fileId}`;
                localStorage.setItem(extractionKey, JSON.stringify({
                    error: true,
                    errorMessage: error.message || 'Failed to extract data from document',
                    fileName: file ? file.name : 'unknown',
                    extractedAt: new Date().toISOString()
                }));
            } catch (storageError) {
                console.error('Cannot even store error indicator:', storageError);
            }
            
            return null;
        }
    }
};

