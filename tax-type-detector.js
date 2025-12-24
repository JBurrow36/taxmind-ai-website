// Tax Type Detection and Classification Module
// Categorizes tax documents based on file characteristics and user account type
const TaxTypeDetector = {
    // Define tax types and their characteristics
    TAX_TYPES: {
        INCOME: {
            id: 'income',
            name: 'Income Tax',
            keywords: [
                'w-2', 'w2', 'w 2', 'form w-2', 'form w2',
                '1099', '1099-', 'form 1099', 
                '1040', 'form 1040', 'tax return', 'income tax return',
                'schedule', 'schedule a', 'schedule b', 'schedule c', 'schedule d',
                'wages', 'salary', 'income', 'earnings', 'pay stub', 'paystub',
                'payroll', 'withholding', 'withholdings', 'taxable income',
                'adjusted gross income', 'agi', 'gross income', 'net income',
                'wage statement', 'earnings statement', 'income statement'
            ],
            documentPatterns: [
                /w[- ]?2/i,
                /1099[\-\w]*/i,
                /1040/i,
                /schedule\s+[a-z]/i,
                /income\s+tax/i,
                /pay\s+stub|paystub/i,
                /wage\s+statement/i,
                /form\s+(w[- ]?2|1040|1099)/i,
                /tax\s+return/i
            ],
            accountTypes: ['individual', 'business'], // Available for both
            analysisSteps: {
                individual: [
                    'Processing individual income tax documents...',
                    'Extracting income information (W-2, 1099 forms)...',
                    'Identifying income sources (wages, interest, dividends)...',
                    'Analyzing deduction categories (standard vs itemized)...',
                    'Calculating adjusted gross income (AGI)...',
                    'Determining tax liability using tax brackets...',
                    'Identifying tax credits and benefits...',
                    'Optimizing individual income tax strategy...',
                    'Generating comprehensive income tax report...'
                ],
                business: [
                    'Processing business income tax documents...',
                    'Extracting business income information...',
                    'Identifying business income sources...',
                    'Analyzing business deduction categories...',
                    'Calculating business taxable income...',
                    'Determining business tax liability...',
                    'Optimizing business income tax strategy...',
                    'Generating comprehensive business income tax report...'
                ]
            }
        },
        PROPERTY: {
            id: 'property',
            name: 'Property Tax',
            keywords: [
                'property tax', 'real estate tax', 'property tax bill', 'real estate tax bill',
                'assessment', 'property assessment', 'tax bill', 'tax statement', 
                'parcel', 'parcel number', 'parcel id', 'ad valorem', 'mill levy', 
                'homestead', 'real property', 'property statement', 'tax notice',
                'property notice', 'assessment notice', 'assessment statement',
                'real estate assessment', 'property valuation', 'tax assessment',
                'county tax', 'city tax', 'municipal tax', 'local tax', 'property levy',
                'tax invoice', 'tax receipt', 'property tax receipt', 'tax payment'
            ],
            documentPatterns: [
                /property\s+tax/i,
                /real\s+estate\s+tax/i,
                /assessment\s+(notice|statement|bill)/i,
                /tax\s+bill/i,
                /property\s+tax\s+bill/i,
                /parcel\s+(number|id|#)/i,
                /ad\s+valorem/i,
                /homestead/i,
                /property\s+(assessment|valuation|statement|notice)/i,
                /county.*tax|city.*tax|municipal.*tax/i,
                /real\s+estate\s+(assessment|statement)/i
            ],
            accountTypes: ['individual', 'business'], // Both can own property
            analysisSteps: {
                individual: [
                    'Processing property tax documents...',
                    'Extracting property information (address, parcel number)...',
                    'Identifying assessed value and tax rate...',
                    'Analyzing property tax deductions (SALT deduction)...',
                    'Calculating property tax liability...',
                    'Checking for property tax exemptions (homestead, senior)...',
                    'Optimizing property tax strategy...',
                    'Generating comprehensive property tax report...'
                ],
                business: [
                    'Processing business property tax documents...',
                    'Extracting business property information...',
                    'Identifying assessed value and tax rates...',
                    'Analyzing business property tax deductions...',
                    'Calculating business property tax liability...',
                    'Checking for business property exemptions...',
                    'Optimizing business property tax strategy...',
                    'Generating comprehensive business property tax report...'
                ]
            }
        },
        SALES: {
            id: 'sales',
            name: 'Sales Tax',
            keywords: ['sales tax', 'use tax', 'receipt', 'invoice', 'purchase', 'transaction', 'sales receipt'],
            documentPatterns: [
                /sales\s+tax/i,
                /use\s+tax/i,
                /sales\s+receipt/i
            ],
            accountTypes: ['individual', 'business'], // Both deal with sales tax
            analysisSteps: {
                individual: [
                    'Processing sales tax documents...',
                    'Extracting transaction information...',
                    'Calculating sales tax paid...',
                    'Analyzing deductible sales tax (SALT option)...',
                    'Generating sales tax report...'
                ],
                business: [
                    'Processing business sales tax documents...',
                    'Extracting business transaction information...',
                    'Calculating sales tax collected and paid...',
                    'Analyzing business sales tax obligations...',
                    'Generating business sales tax report...'
                ]
            }
        },
        ESTATE: {
            id: 'estate',
            name: 'Estate Tax',
            keywords: ['estate tax', 'inheritance', 'death tax', 'estate return', 'form 706', 'probate'],
            documentPatterns: [
                /estate\s+tax/i,
                /form\s+706/i,
                /inheritance/i,
                /probate/i
            ],
            accountTypes: ['individual'], // Primarily for individuals
            analysisSteps: {
                individual: [
                    'Processing estate tax documents...',
                    'Extracting estate information...',
                    'Calculating estate value and exemptions...',
                    'Determining estate tax liability...',
                    'Identifying estate tax deductions...',
                    'Optimizing estate tax strategy...',
                    'Generating comprehensive estate tax report...'
                ]
            }
        },
        BUSINESS: {
            id: 'business',
            name: 'Business Tax',
            keywords: [
                'business tax', 'schedule c', 'schedule e', 'schedule k-1',
                'ein', 'employer identification number', 'business income',
                'self-employment', 'self employment', 'partnership', 
                'llc', 'corporation', 's-corp', 'c-corp', 's corporation', 'c corporation',
                'business expenses', 'business deductions', 'cost of goods sold', 'cogs',
                'business return', 'business tax return', 'sole proprietorship',
                'form 1120', 'form 1120s', 'form 1065', 'form 1040 schedule c',
                'profit and loss', 'p&l', 'business statement', 'business income statement'
            ],
            documentPatterns: [
                /schedule\s+[cek]/i,
                /business\s+tax/i,
                /ein|employer\s+identification/i,
                /self[\s-]?employment/i,
                /partnership/i,
                /(llc|corporation|s[\s-]?corp|c[\s-]?corp)/i,
                /form\s+(1120|1120s|1065|1040[\s-]?schedule[\s-]?c)/i,
                /profit\s+and\s+loss|p\s*&\s*l/i,
                /business\s+(income|expense|statement|return)/i
            ],
            accountTypes: ['business'], // Primarily for business accounts
            analysisSteps: {
                business: [
                    'Processing business tax documents...',
                    'Extracting business information (EIN, address, tax year)...',
                    'Analyzing income sources (sales, services, interest)...',
                    'Processing expense categories (COGS, rent, salaries)...',
                    'Calculating taxable business income...',
                    'Determining business tax liability and rates...',
                    'Identifying business tax deductions and credits...',
                    'Optimizing business tax strategy...',
                    'Generating comprehensive business tax report...'
                ]
            }
        }
    },

    // Get user's account type from localStorage
    getUserAccountType: function() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
            return currentUser.accountType || 'individual'; // Default to individual
        } catch (error) {
            console.error('Error getting user account type:', error);
            return 'individual';
        }
    },

    // Content-based detection patterns (what to look for in document content)
    CONTENT_PATTERNS: {
        income: [
            // W-2 indicators
            /wage\s+and\s+tax\s+statement/i,
            /employee.*identification\s+number/i,
            /social\s+security\s+wages/i,
            /federal\s+income\s+tax\s+withheld/i,
            /state\s+income\s+tax\s+withheld/i,
            /medicare\s+wages/i,
            /social\s+security\s+tax\s+withheld/i,
            // 1099 indicators
            /nonemployee\s+compensation|nec/i,
            /interest\s+income/i,
            /dividend\s+income/i,
            /miscellaneous\s+income/i,
            /payer.*tin|recipient.*tin/i,
            // 1040 indicators
            /form\s+1040/i,
            /u\.s\.\s+individual\s+income\s+tax\s+return/i,
            /adjusted\s+gross\s+income|agi/i,
            /standard\s+deduction/i,
            /itemized\s+deductions/i,
            /taxable\s+income/i,
            /tax\s+liability/i,
            /refund\s+amount/i
        ],
        property: [
            // Property tax bill indicators
            /property\s+tax\s+statement/i,
            /real\s+estate\s+tax/i,
            /assessed\s+value/i,
            /taxable\s+value/i,
            /mill\s+rate|millage\s+rate/i,
            /tax\s+rate/i,
            /parcel\s+(id|number|#)/i,
            /property\s+identification/i,
            /homestead\s+exemption/i,
            /senior\s+exemption/i,
            /tax\s+due\s+date/i,
            /payment\s+due\s+date/i,
            /prior\s+year\s+taxes/i,
            /current\s+year\s+taxes/i,
            /penalties\s+and\s+interest/i,
            /total\s+amount\s+due/i,
            /real\s+property/i,
            /improvements/i,
            /land\s+value/i,
            /building\s+value/i
        ],
        business: [
            // Business tax indicators
            /employer\s+identification\s+number|ein/i,
            /business\s+name/i,
            /schedule\s+c|schedule\s+e/i,
            /gross\s+receipts/i,
            /cost\s+of\s+goods\s+sold|cogs/i,
            /gross\s+profit/i,
            /business\s+expenses/i,
            /net\s+profit/i,
            /net\s+loss/i,
            /self.*employment\s+tax/i,
            /partnership/i,
            /llc|limited\s+liability/i,
            /corporation/i,
            /qualified\s+business\s+income|qbi/i,
            /form\s+1120|form\s+1065|form\s+1120s/i,
            /business\s+income/i,
            /business\s+deductions/i
        ],
        sales: [
            // Sales tax indicators
            /sales\s+tax/i,
            /use\s+tax/i,
            /taxable\s+sales/i,
            /taxable\s+purchases/i,
            /sales\s+tax\s+collected/i,
            /sales\s+tax\s+paid/i,
            /tax\s+rate/i,
            /taxable\s+amount/i,
            /exempt\s+sales/i
        ],
        estate: [
            // Estate tax indicators
            /estate\s+tax\s+return/i,
            /form\s+706/i,
            /gross\s+estate/i,
            /taxable\s+estate/i,
            /estate\s+tax\s+exemption/i,
            /unified\s+credit/i,
            /marital\s+deduction/i,
            /charitable\s+deduction/i,
            /probate/i,
            /executor/i,
            /decedent/i,
            /date\s+of\s+death/i
        ]
    },

    // Detect tax type from file with account type awareness
    detectTaxType: function(fileName, fileContent = '') {
        const fileNameLower = fileName.toLowerCase();
        const contentLower = (fileContent || '').toLowerCase();
        const combinedText = fileNameLower + ' ' + contentLower;
        const accountType = this.getUserAccountType();

        let scores = {};
        
        // Score each tax type based on matches
        Object.keys(this.TAX_TYPES).forEach(typeKey => {
            const taxType = this.TAX_TYPES[typeKey];
            
            // Skip tax types not available for this account type
            if (!taxType.accountTypes.includes(accountType)) {
                scores[taxType.id] = 0;
                return;
            }
            
            let score = 0;
            
            // Check filename keyword matches (lower weight, but more restrictive)
            taxType.keywords.forEach(keyword => {
                // Use word boundaries to avoid false matches (e.g., "property" in "property tax" but not in "income property")
                const keywordRegex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
                if (keywordRegex.test(fileNameLower)) {
                    score += 2;
                }
            });
            
            // Check filename pattern matches (medium weight) - these are already regex so should be more precise
            taxType.documentPatterns.forEach(pattern => {
                if (pattern.test(fileNameLower)) {
                    score += 5;
                }
            });
            
            // Check content-based patterns (higher weight - more reliable)
            if (fileContent && this.CONTENT_PATTERNS[taxType.id]) {
                this.CONTENT_PATTERNS[taxType.id].forEach(pattern => {
                    if (pattern.test(contentLower)) {
                        score += 10; // Content matches are weighted higher (increased from 8)
                    }
                });
            }
            
            // Check combined text for keywords (if content is available)
            if (fileContent) {
                taxType.keywords.forEach(keyword => {
                    const keywordRegex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
                    if (keywordRegex.test(contentLower)) {
                        score += 4; // Content keyword matches get higher weight (increased from 3)
                    }
                });
            }
            
            // Remove account type boost - it was causing false positives
            // Let the actual content and filename patterns determine the type
            
            scores[taxType.id] = score;
        });

        // Find the tax type with highest score
        let maxScore = 0;
        let secondMaxScore = 0;
        let detectedType = accountType === 'business' ? 'business' : 'income'; // Default based on account type
        let secondDetectedType = null;
        
        Object.keys(scores).forEach(typeId => {
            if (scores[typeId] > maxScore) {
                secondMaxScore = maxScore;
                secondDetectedType = detectedType;
                maxScore = scores[typeId];
                detectedType = typeId;
            } else if (scores[typeId] > secondMaxScore) {
                secondMaxScore = scores[typeId];
                secondDetectedType = typeId;
            }
        });

        // Require minimum score threshold to avoid false positives
        // If maxScore is too low, default to income (most common) instead of property
        const MIN_CONFIDENCE_SCORE = 5; // Require at least 5 points (e.g., one pattern match)
        
        if (maxScore < MIN_CONFIDENCE_SCORE) {
            // Not enough evidence - default to income tax for individuals, business for businesses
            detectedType = accountType === 'business' ? 'business' : 'income';
            maxScore = 0; // Mark as low confidence
        }

        // Calculate confidence based on score difference and absolute score
        let confidence = 30; // Default low confidence
        if (maxScore > 0) {
            // Base confidence on absolute score
            confidence = Math.min(95, 30 + (maxScore * 3)); // Max 95% even with perfect match
            
            // Reduce confidence if there's a close second (ambiguous detection)
            if (secondMaxScore > 0 && (maxScore - secondMaxScore) < 5) {
                confidence = Math.max(40, confidence - 20); // Reduce by 20% but keep minimum 40%
            }
        }

        return {
            typeId: detectedType,
            typeName: this.TAX_TYPES[this.getTaxTypeKeyById(detectedType)].name,
            confidence: confidence,
            scores: scores,
            accountType: accountType,
            hasContent: !!fileContent,
            isLowConfidence: confidence < 50 || maxScore < MIN_CONFIDENCE_SCORE
        };
    },
    
    // Extract text content from file (supports PDF and text files)
    extractFileContent: function(file, callback) {
        if (file.type === 'application/pdf') {
            // For PDF files, we'll need to use PDF.js or similar
            // For now, return empty and let filename-based detection work
            // In production, integrate PDF.js: https://mozilla.github.io/pdf.js/
            console.log('PDF content extraction not yet implemented - using filename detection');
            callback('');
            return;
        } else if (file.type.startsWith('text/') || file.type === 'application/json') {
            // For text files, read directly
            const reader = new FileReader();
            reader.onload = function(e) {
                callback(e.target.result);
            };
            reader.onerror = function() {
                console.error('Error reading file content');
                callback('');
            };
            reader.readAsText(file);
        } else if (file.type.startsWith('image/')) {
            // For images, OCR would be needed
            // For now, return empty
            console.log('Image OCR not yet implemented - using filename detection');
            callback('');
            return;
        } else {
            // For other file types, try to read as text anyway
            const reader = new FileReader();
            reader.onload = function(e) {
                // Check if content looks like text
                const content = e.target.result;
                if (typeof content === 'string' && content.length > 0) {
                    callback(content);
                } else {
                    callback('');
                }
            };
            reader.onerror = function() {
                callback('');
            };
            reader.readAsText(file);
        }
    },

    getTaxTypeKeyById: function(id) {
        return Object.keys(this.TAX_TYPES).find(key => 
            this.TAX_TYPES[key].id === id
        );
    },

    getTaxTypeById: function(id) {
        const key = this.getTaxTypeKeyById(id);
        return key ? this.TAX_TYPES[key] : this.TAX_TYPES.INCOME;
    },

    // Get analysis steps for a tax type based on account type
    getAnalysisSteps: function(taxTypeId, accountType = null) {
        const taxType = this.getTaxTypeById(taxTypeId);
        accountType = accountType || this.getUserAccountType();
        
        if (taxType.analysisSteps && taxType.analysisSteps[accountType]) {
            return taxType.analysisSteps[accountType];
        }
        
        // Fallback to individual if account type not found
        if (taxType.analysisSteps && taxType.analysisSteps.individual) {
            return taxType.analysisSteps.individual;
        }
        
        // Final fallback
        return this.TAX_TYPES.INCOME.analysisSteps.individual;
    },

    // Get tax-specific deductions and benefits based on account type
    getTaxBenefits: function(taxTypeId, accountType = null) {
        accountType = accountType || this.getUserAccountType();
        
        const benefits = {
            income: {
                individual: [
                    { name: 'Standard Deduction', description: '2025: $15,750 single, $31,500 married filing jointly, $23,625 head of household' },
                    { name: 'Mortgage Interest Deduction', description: 'Interest on mortgage up to $750k loan amount (Schedule A)' },
                    { name: 'State and Local Tax (SALT)', description: 'Deduction capped at $10,000 (includes property tax)' },
                    { name: 'Charitable Contributions', description: 'Itemized deduction for qualified donations' },
                    { name: 'Medical Expenses', description: 'Deductible if exceeding 7.5% of AGI' },
                    { name: 'Earned Income Tax Credit (EITC)', description: 'Refundable credit up to $8,046 for qualifying families' },
                    { name: 'Child Tax Credit', description: 'Up to $2,000 per qualifying child under 17' },
                    { name: 'Student Loan Interest', description: 'Up to $2,500 deduction' },
                    { name: 'IRA Contributions', description: 'Traditional IRA contributions may be deductible' }
                ],
                business: [
                    { name: 'Business Expense Deductions', description: 'Ordinary and necessary business expenses' },
                    { name: 'Qualified Business Income (QBI) Deduction', description: 'Up to 20% deduction for pass-through entities' },
                    { name: 'Section 179 Deduction', description: 'Immediate expensing of equipment purchases' },
                    { name: 'Business Meals', description: '50% deductible (some restrictions)' },
                    { name: 'Vehicle Expenses', description: 'Standard mileage or actual expenses' },
                    { name: 'Home Office Deduction', description: 'Deduction for business use of home' },
                    { name: 'Retirement Contributions', description: 'SEP-IRA, Solo 401(k) contributions' }
                ]
            },
            property: {
                individual: [
                    { name: 'SALT Deduction', description: 'Property taxes deductible up to $10,000 combined with state income taxes (Schedule A)' },
                    { name: 'Homestead Exemption', description: 'Reduces assessed value for primary residence (varies by state)' },
                    { name: 'Senior/Disabled Exemption', description: 'Additional exemptions available in many states' },
                    { name: 'Property Tax Appeal', description: 'Opportunity to contest assessment if overvalued' },
                    { name: 'Mortgage Interest', description: 'Interest on mortgage secured by property (Schedule A)' },
                    { name: 'Home Office Deduction', description: 'If property used for business (for self-employed)' }
                ],
                business: [
                    { name: 'Business Property Tax Deduction', description: 'Property taxes on business property are fully deductible' },
                    { name: 'Depreciation', description: 'Depreciation deductions for business property' },
                    { name: 'Section 179 Expensing', description: 'Immediate expensing of property improvements' },
                    { name: 'Business Property Tax Appeal', description: 'Appeal commercial property assessments' }
                ]
            },
            sales: {
                individual: [
                    { name: 'SALT Deduction Option', description: 'Can deduct sales tax instead of income tax if itemizing (Schedule A)' },
                    { name: 'Large Purchase Sales Tax', description: 'Sales tax on major purchases may be deductible' }
                ],
                business: [
                    { name: 'Business Purchases', description: 'Sales tax on business purchases is deductible as part of cost' },
                    { name: 'Resale Exemption', description: 'No sales tax on items purchased for resale' },
                    { name: 'Sales Tax Collected', description: 'Must remit sales tax collected to state' }
                ]
            },
            estate: {
                individual: [
                    { name: 'Estate Tax Exemption', description: '2025 exemption: $13.61 million per person' },
                    { name: 'Marital Deduction', description: 'Unlimited deduction for transfers to spouse' },
                    { name: 'Charitable Deduction', description: 'Deduction for charitable bequests' },
                    { name: 'Step-Up in Basis', description: 'Property basis stepped up to fair market value at death' }
                ]
            },
            business: {
                business: [
                    { name: 'Business Expense Deductions', description: 'Ordinary and necessary business expenses' },
                    { name: 'Home Office Deduction', description: 'Deduction for business use of home' },
                    { name: 'Vehicle Expenses', description: 'Standard mileage or actual expenses' },
                    { name: 'Business Meals', description: '50% deductible (some restrictions)' },
                    { name: 'Section 179 Deduction', description: 'Immediate expensing of equipment purchases' },
                    { name: 'Qualified Business Income Deduction', description: 'Up to 20% QBI deduction for pass-through entities' },
                    { name: 'Self-Employment Tax Deduction', description: '50% of self-employment tax is deductible' },
                    { name: 'Retirement Contributions', description: 'SEP-IRA, Solo 401(k), SIMPLE IRA contributions' }
                ]
            }
        };

        // Return benefits for the specific tax type and account type
        if (benefits[taxTypeId] && benefits[taxTypeId][accountType]) {
            return benefits[taxTypeId][accountType];
        }
        
        // Fallback
        return benefits.income[accountType] || benefits.income.individual;
    },

    // Get document types expected for each tax type
    getExpectedDocuments: function(taxTypeId, accountType = null) {
        accountType = accountType || this.getUserAccountType();
        
        const documents = {
            income: {
                individual: [
                    'W-2 Forms (wage statements)',
                    '1099 Forms (various income types)',
                    'Form 1040 (tax return)',
                    'Schedule A (itemized deductions)',
                    'Schedule B (interest and dividends)',
                    'Schedule C (business income if self-employed)',
                    'Schedule D (capital gains)',
                    'Form 1098 (mortgage interest)'
                ],
                business: [
                    'Form 1120 (corporation)',
                    'Form 1065 (partnership)',
                    'Form 1120S (S-corporation)',
                    'Schedule K-1 (partner/shareholder income)',
                    '1099 Forms (various income)',
                    'Business income statements',
                    'EIN documentation'
                ]
            },
            property: {
                individual: [
                    'Property Tax Bill/Statement',
                    'Property Assessment Notice',
                    'Tax Payment Receipts',
                    'Form 1098 (property taxes paid if in escrow)',
                    'Homestead Exemption Forms',
                    'Property Tax Appeal Documents'
                ],
                business: [
                    'Business Property Tax Bill',
                    'Commercial Property Assessment',
                    'Property Tax Payment Receipts',
                    'Lease documents (if applicable)',
                    'Property improvement receipts'
                ]
            },
            sales: {
                individual: [
                    'Sales Receipts',
                    'Purchase Invoices',
                    'Large Purchase Documentation'
                ],
                business: [
                    'Sales Receipts',
                    'Purchase Invoices',
                    'Sales Tax Returns',
                    'Transaction Records',
                    'Resale Certificates'
                ]
            },
            estate: {
                individual: [
                    'Form 706 (Estate Tax Return)',
                    'Estate Valuation Documents',
                    'Inheritance Documents',
                    'Probate Documents'
                ]
            },
            business: {
                business: [
                    'Schedule C (sole proprietorship)',
                    'Schedule E (rental/passive income)',
                    'Form 1120 (corporation)',
                    'Form 1065 (partnership)',
                    'Business Expense Receipts',
                    'EIN Documents',
                    'Business Bank Statements'
                ]
            }
        };

        // Return documents for the specific tax type and account type
        if (documents[taxTypeId] && documents[taxTypeId][accountType]) {
            return documents[taxTypeId][accountType];
        }
        
        // Fallback
        return documents.income[accountType] || documents.income.individual;
    },

    // Get available tax types for current account type
    getAvailableTaxTypes: function(accountType = null) {
        accountType = accountType || this.getUserAccountType();
        const availableTypes = [];
        
        Object.keys(this.TAX_TYPES).forEach(typeKey => {
            const taxType = this.TAX_TYPES[typeKey];
            if (taxType.accountTypes.includes(accountType)) {
                availableTypes.push({
                    id: taxType.id,
                    name: taxType.name
                });
            }
        });
        
        return availableTypes;
    }
};

