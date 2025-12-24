// TaxMind AI Chatbot - Knowledge Base and Answer Rules
// Rule-based tax question answering system

const TaxChatbotRules = {
    // Knowledge base organized by category
    knowledgeBase: {
        general: {
            name: 'General Tax Questions',
            questions: {
                'what is taxmind': {
                    keywords: ['what is taxmind', 'what does taxmind do', 'taxmind features'],
                    answer: 'TaxMind AI is an intelligent tax preparation and analysis platform that helps you file your taxes accurately. It analyzes your tax documents, identifies deductions and credits, provides suggestions for optimization, and helps you file your taxes with the IRS. You can upload documents, get AI-powered analysis, and file your taxes securely.',
                    relatedQuestions: ['how do I upload documents', 'how does analysis work', 'how do I file my taxes']
                },
                'when are taxes due': {
                    keywords: ['when are taxes due', 'tax deadline', 'filing deadline', 'tax due date'],
                    answer: 'The federal income tax filing deadline is typically April 15th each year. For 2024 tax returns, the deadline is April 15, 2025. However, if April 15 falls on a weekend or holiday, the deadline is extended to the next business day. You can also request an extension to file until October 15th, but you still need to pay any taxes owed by April 15th.',
                    relatedQuestions: ['what happens if I miss the deadline', 'how do I get an extension']
                },
                'what happens if I miss the deadline': {
                    keywords: ['miss deadline', 'late filing', 'penalties', 'late fees'],
                    answer: 'If you miss the tax filing deadline, you may face penalties: (1) Failure-to-file penalty: 5% of unpaid taxes per month, up to 25% (2) Failure-to-pay penalty: 0.5% of unpaid taxes per month. Interest also accrues on unpaid taxes. However, if you\'re due a refund, there\'s no penalty for filing late, but you must file within 3 years to claim it.',
                    relatedQuestions: ['how do I get an extension', 'when are taxes due']
                },
                'how do I get an extension': {
                    keywords: ['extension', 'file extension', 'tax extension', 'form 4868'],
                    answer: 'To get an extension to file your taxes, you can file Form 4868 (Application for Automatic Extension of Time to File) by April 15th. This gives you until October 15th to file. You can file electronically through TaxMind AI or the IRS website. Note: An extension gives you more time to FILE, but you still need to pay any taxes owed by April 15th to avoid penalties.',
                    relatedQuestions: ['when are taxes due', 'what happens if I miss the deadline']
                }
            }
        },
        filing: {
            name: 'Filing Your Taxes',
            questions: {
                'how do I file my taxes': {
                    keywords: ['how to file', 'file taxes', 'submit taxes', 'tax filing process'],
                    answer: 'To file your taxes with TaxMind AI: (1) Upload your tax documents (W-2s, 1099s, receipts, etc.) (2) Let our AI analyze your documents and identify deductions (3) Complete the filing questionnaire with your personal information (SSN, filing status, bank info) (4) Review your tax return summary (5) Submit to the IRS electronically. You\'ll receive a confirmation number when filed successfully.',
                    relatedQuestions: ['what documents do I need', 'what information do I need to file', 'how long does filing take']
                },
                'what documents do I need': {
                    keywords: ['documents needed', 'required documents', 'what forms do I need', 'tax documents'],
                    answer: 'Common documents needed: W-2 forms (from employers), 1099 forms (freelance, interest, dividends), receipts for deductions (charitable donations, medical expenses, business expenses), mortgage interest statements (Form 1098), property tax statements, previous year\'s tax return (for reference), Social Security Number (SSN), bank account information (for refunds). For businesses: EIN, business income/expense records, payroll forms.',
                    relatedQuestions: ['how do I upload documents', 'what is a w-2', 'what is a 1099']
                },
                'what information do I need to file': {
                    keywords: ['information needed', 'personal information', 'filing requirements', 'required info'],
                    answer: 'Required information: Social Security Number (SSN), Filing status (Single, Married Filing Jointly, etc.), Date of birth, Bank account details (for direct deposit refund), Prior year AGI (if e-filing), Identity Protection PIN (if you have one), Dependent information (names, SSNs, relationship), Spouse information (if married filing jointly). For businesses: EIN, business type, revenue, expenses, employee information.',
                    relatedQuestions: ['how do I file my taxes', 'what is filing status']
                },
                'what is filing status': {
                    keywords: ['filing status', 'single', 'married', 'head of household', 'qualifying widow'],
                    answer: 'Filing status determines your tax rates and standard deduction. Options: (1) Single - unmarried or legally separated (2) Married Filing Jointly - both spouses report income together (3) Married Filing Separately - each spouse files separately (4) Head of Household - unmarried with qualifying dependents (5) Qualifying Widow(er) - widowed within 2 years with dependent child. Your status affects tax brackets and eligibility for credits.',
                    relatedQuestions: ['what information do I need to file', 'what is a dependent']
                },
                'how long does filing take': {
                    keywords: ['how long', 'filing time', 'processing time', 'how fast'],
                    answer: 'With TaxMind AI, the filing process typically takes 15-30 minutes: (1) Document upload: 2-5 minutes (2) AI Analysis: 3-5 minutes (3) Questionnaire completion: 5-10 minutes (4) Review and submit: 2-5 minutes. After submission, the IRS typically processes e-filed returns within 21 days. You can track your refund status at irs.gov/refunds using your SSN and expected refund amount.',
                    relatedQuestions: ['how do I file my taxes', 'when will I get my refund']
                },
                'when will I get my refund': {
                    keywords: ['refund', 'refund time', 'when refund', 'refund processing'],
                    answer: 'The IRS typically processes e-filed returns and issues refunds within 21 days. If you choose direct deposit, your refund usually arrives faster (within 21 days). Paper checks take longer (6-8 weeks). You can check your refund status at irs.gov/refunds using your SSN, filing status, and expected refund amount. Note: Returns with errors or requiring review may take longer.',
                    relatedQuestions: ['how long does filing take', 'how do I track my refund']
                }
            }
        },
        documents: {
            name: 'Tax Documents',
            questions: {
                'what is a w-2': {
                    keywords: ['w-2', 'w2', 'wage statement', 'employer form'],
                    answer: 'A W-2 (Wage and Tax Statement) is a form your employer sends you by January 31st showing your annual wages and taxes withheld. It includes: wages/tips, federal income tax withheld, Social Security wages and tax, Medicare wages and tax, state wages and tax. You need W-2s from all employers you worked for during the tax year. Report this information on your Form 1040.',
                    relatedQuestions: ['what documents do I need', 'what is a 1099', 'how do I upload documents']
                },
                'what is a 1099': {
                    keywords: ['1099', '1099 form', 'freelance income', 'contractor income', '1099-nec', '1099-misc'],
                    answer: 'Form 1099 reports income from sources other than employers. Common types: 1099-NEC (non-employee compensation/freelance work), 1099-INT (interest income), 1099-DIV (dividends), 1099-MISC (miscellaneous income), 1099-K (payment processor/payment apps). You receive these from clients, banks, or payment processors. Report this income on your tax return - it\'s taxable even if no tax was withheld.',
                    relatedQuestions: ['what is a w-2', 'do I need to report freelance income', 'self employment tax']
                },
                'how do I upload documents': {
                    keywords: ['upload', 'upload documents', 'add documents', 'upload files'],
                    answer: 'To upload documents in TaxMind AI: (1) Go to the Upload Documents page (2) Click "Choose Files" or drag and drop files (3) Supported formats: PDF, JPG, PNG, or text files (4) Our AI will automatically detect the document type (W-2, 1099, etc.) (5) Review the uploaded documents list. You can upload multiple documents at once. After uploading, proceed to AI Analysis to have your documents analyzed.',
                    relatedQuestions: ['what documents do I need', 'what file types are supported']
                },
                'what file types are supported': {
                    keywords: ['file types', 'supported formats', 'pdf', 'jpg', 'image files'],
                    answer: 'TaxMind AI supports the following file formats: PDF files (.pdf) - most common for tax forms, Image files (.jpg, .jpeg, .png) - for scanned documents, Text files (.txt) - for plain text documents. We recommend PDF format for best results. Maximum file size is typically 10MB per file. You can upload multiple files at once.',
                    relatedQuestions: ['how do I upload documents', 'what if my document is scanned']
                }
            }
        },
        analysis: {
            name: 'AI Analysis',
            questions: {
                'how does analysis work': {
                    keywords: ['how analysis works', 'ai analysis', 'document analysis', 'how does it analyze'],
                    answer: 'TaxMind AI analyzes your documents using advanced pattern recognition: (1) Upload your documents (2) AI extracts text and data from your forms (3) Identifies document types (W-2, 1099, receipts, etc.) (4) Detects tax categories (income, deductions, credits) (5) Analyzes for missing information or errors (6) Identifies optimization opportunities (7) Generates comprehensive report with suggestions. The analysis takes 3-5 minutes and provides actionable insights.',
                    relatedQuestions: ['what does analysis show', 'what are red flags', 'what are suggestions']
                },
                'what does analysis show': {
                    keywords: ['analysis results', 'what does it show', 'analysis report', 'insights'],
                    answer: 'The AI analysis shows: (1) Detected tax type and categories (2) Identified income sources (3) Potential deductions and credits (4) Red flags (errors, missing info, potential issues) (5) Optimization suggestions (ways to reduce taxes) (6) Document completeness check (7) Estimated refund or amount owed (8) Recommendations for next steps. You can view interactive highlights on your documents showing specific suggestions.',
                    relatedQuestions: ['how does analysis work', 'what are red flags', 'what are suggestions']
                },
                'what are red flags': {
                    keywords: ['red flags', 'problems', 'errors', 'issues', 'warnings'],
                    answer: 'Red flags are potential problems detected in your tax documents: Missing required forms (e.g., W-2 for reported wages), Overdue payments or penalties mentioned, Debt indicators (liens, levies), Inconsistencies between forms, Missing required fields, Unusual deductions needing documentation, Potential audit triggers, Invalid SSN/EIN formats. TaxMind highlights these in red so you can address them before filing.',
                    relatedQuestions: ['what does analysis show', 'how do I fix red flags']
                },
                'what are suggestions': {
                    keywords: ['suggestions', 'recommendations', 'optimization', 'tips'],
                    answer: 'Suggestions are AI-recommended ways to optimize your taxes: Potential deductions you may have missed, Credits you might qualify for, Itemized vs standard deduction comparison, Tax-saving strategies, Documentation recommendations, Filing optimization tips. Suggestions are shown in blue highlights on your documents and in the analysis report. Review them to potentially increase your refund or reduce what you owe.',
                    relatedQuestions: ['what does analysis show', 'how do I use suggestions']
                },
                'how do I view highlights on documents': {
                    keywords: ['highlights', 'document highlights', 'view highlights', 'interactive highlights'],
                    answer: 'To view highlights on your documents: (1) After analysis completes, click "View Document with TaxMind" on any uploaded document (2) The document opens in our interactive viewer (3) Highlights appear as colored overlays: Blue = Suggestions, Yellow = Warnings, Red = Red flags (4) Click any highlight to see detailed information (5) Use the side panel to see all issues and suggestions at once. This works like Grammarly for your tax forms!',
                    relatedQuestions: ['what are red flags', 'what are suggestions', 'how does analysis work']
                }
            }
        },
        deductions: {
            name: 'Deductions & Credits',
            questions: {
                'what are deductions': {
                    keywords: ['deductions', 'what are deductions', 'tax deductions', 'deductible'],
                    answer: 'Deductions reduce your taxable income. There are two types: (1) Standard deduction - a fixed amount ($14,600 for single, $29,200 for married filing jointly in 2024) (2) Itemized deductions - specific expenses you can deduct (mortgage interest, state/local taxes, charitable contributions, medical expenses above 7.5% of AGI, etc.). You choose whichever is higher. TaxMind AI helps determine which is better for you.',
                    relatedQuestions: ['standard vs itemized', 'what expenses can I deduct', 'what is a credit']
                },
                'standard vs itemized': {
                    keywords: ['standard deduction', 'itemized deduction', 'which is better', 'itemize'],
                    answer: 'Standard deduction is a fixed amount - easier but may be lower. Itemized deductions add up specific expenses and may be higher if you have significant: mortgage interest, state/local taxes (up to $10,000), charitable contributions, medical expenses (above 7.5% of AGI). TaxMind AI automatically calculates both and recommends the higher option. Most people take the standard deduction, but if your itemized deductions exceed it, itemizing saves money.',
                    relatedQuestions: ['what are deductions', 'what expenses can I deduct']
                },
                'what expenses can I deduct': {
                    keywords: ['what can I deduct', 'deductible expenses', 'business expenses', 'itemized deductions'],
                    answer: 'Common deductible expenses: Mortgage interest, State and local taxes (SALT - capped at $10,000), Charitable contributions, Medical expenses (above 7.5% of AGI), Business expenses (for self-employed), Home office deduction (if eligible), Student loan interest, IRA contributions (traditional), Health savings account contributions, Educator expenses. TaxMind AI identifies potential deductions from your documents.',
                    relatedQuestions: ['what are deductions', 'business deductions', 'charitable deductions']
                },
                'what is a credit': {
                    keywords: ['tax credit', 'credit', 'credits', 'what are credits'],
                    answer: 'Tax credits are better than deductions - they reduce your tax dollar-for-dollar. Common credits: Earned Income Tax Credit (EITC) - for low to moderate income workers, Child Tax Credit - up to $2,000 per qualifying child, Child and Dependent Care Credit - for childcare expenses, Education credits (American Opportunity, Lifetime Learning), Energy credits - for energy-efficient home improvements, Adoption credit. Credits can reduce your tax below zero (resulting in a refund).',
                    relatedQuestions: ['what are deductions', 'earned income credit', 'child tax credit']
                },
                'earned income credit': {
                    keywords: ['earned income credit', 'eitc', 'earned income tax credit'],
                    answer: 'The Earned Income Tax Credit (EITC) is a refundable credit for low to moderate income workers. To qualify: You must have earned income (wages, self-employment), Meet income limits (varies by filing status and number of children), Be between 25-64 (or have qualifying children), Have a valid SSN, Not be a dependent. Maximum credit ranges from $600 (no children) to $7,430 (3+ children). TaxMind AI checks if you qualify and calculates the credit.',
                    relatedQuestions: ['what is a credit', 'do I qualify for eitc']
                },
                'child tax credit': {
                    keywords: ['child tax credit', 'ctc', 'child credit'],
                    answer: 'The Child Tax Credit provides up to $2,000 per qualifying child under age 17. Requirements: Child must be your dependent, Under age 17 at end of tax year, Related to you (son, daughter, stepchild, foster child, sibling, etc.), Lived with you more than half the year, Has valid SSN. Up to $1,600 is refundable. TaxMind AI helps identify qualifying children and calculates your credit.',
                    relatedQuestions: ['what is a credit', 'what is a dependent']
                }
            }
        },
        business: {
            name: 'Business Taxes',
            questions: {
                'business tax forms': {
                    keywords: ['business forms', 'business tax', 'schedule c', 'form 1065', 'form 1120'],
                    answer: 'Business tax forms depend on business type: Sole Proprietorship - Form 1040 + Schedule C, Partnership - Form 1065 + Schedule K-1 for partners, S-Corporation - Form 1120-S + K-1 for shareholders, C-Corporation - Form 1120. LLCs file based on tax election (Schedule C, 1065, or 1120-S). TaxMind AI helps determine which forms you need and ensures all required information is collected.',
                    relatedQuestions: ['what business forms do I need', 'sole proprietorship', 'llc taxes']
                },
                'sole proprietorship': {
                    keywords: ['sole proprietorship', 'schedule c', 'self employed'],
                    answer: 'A sole proprietorship is the simplest business structure. You report business income and expenses on Schedule C, attached to your personal Form 1040. You need: Business income (1099-NEC, receipts), Business expenses (supplies, equipment, vehicle, home office, etc.), EIN (optional but recommended). You pay both income tax and self-employment tax (Social Security + Medicare) on net profit. TaxMind AI helps track and categorize all business expenses.',
                    relatedQuestions: ['business tax forms', 'business deductions', 'self employment tax']
                },
                'business deductions': {
                    keywords: ['business expenses', 'business deductions', 'deductible business expenses'],
                    answer: 'Common business deductions: Office supplies and equipment, Vehicle expenses (actual costs or mileage), Home office (if exclusive business use), Business travel and meals (50% deductible), Professional services (accountant, lawyer), Software and subscriptions, Marketing and advertising, Insurance (business liability, health), Rent or mortgage interest (business portion), Utilities (business portion), Depreciation on business assets. Keep receipts and records. TaxMind AI helps identify and categorize expenses.',
                    relatedQuestions: ['what expenses can I deduct', 'business tax forms']
                },
                'self employment tax': {
                    keywords: ['self employment tax', 'self employment', 'schedule se'],
                    answer: 'Self-employment tax covers Social Security and Medicare taxes for self-employed individuals. Rate: 15.3% on net earnings (12.4% Social Security on first $168,600 in 2024, 2.9% Medicare on all earnings). You pay this in addition to income tax. You file Schedule SE with your Form 1040. However, you can deduct half of self-employment tax as an adjustment to income. TaxMind AI automatically calculates self-employment tax.',
                    relatedQuestions: ['sole proprietorship', 'business tax forms']
                }
            }
        }
    },

    // Get answer for a question
    getAnswer: function(question, context = {}) {
        const lowerQuestion = question.toLowerCase().trim();
        
        // Search through all categories
        for (const categoryKey in this.knowledgeBase) {
            const category = this.knowledgeBase[categoryKey];
            for (const questionKey in category.questions) {
                const q = category.questions[questionKey];
                
                // Check if any keyword matches
                for (const keyword of q.keywords) {
                    if (lowerQuestion.includes(keyword)) {
                        let answer = q.answer;
                        
                        // Add context-specific information if available
                        if (context.accountType) {
                            if (context.accountType === 'business' && q.relatedQuestions) {
                                answer += '\n\nFor business-specific questions, TaxMind AI can help with business tax forms and deductions.';
                            }
                        }
                        
                        return {
                            answer: answer,
                            category: category.name,
                            relatedQuestions: q.relatedQuestions || [],
                            confidence: 0.9
                        };
                    }
                }
            }
        }
        
        // If no exact match, try fuzzy matching on common phrases
        const fuzzyMatches = this.fuzzyMatch(lowerQuestion);
        if (fuzzyMatches.length > 0) {
            const bestMatch = fuzzyMatches[0];
            return {
                answer: bestMatch.answer,
                category: bestMatch.category,
                relatedQuestions: bestMatch.relatedQuestions || [],
                confidence: 0.7,
                suggestion: 'Is this what you\'re looking for? You can also try rephrasing your question.'
            };
        }
        
        // Default response
        return {
            answer: 'I\'m here to help with your tax questions! I can assist with: filing your taxes, understanding tax documents (W-2s, 1099s), deductions and credits, business taxes, and analysis questions. Try asking something like "How do I file my taxes?" or "What documents do I need?"',
            category: 'General',
            relatedQuestions: ['how do I file my taxes', 'what documents do I need', 'how does analysis work'],
            confidence: 0.3
        };
    },

    // Fuzzy matching for similar questions
    fuzzyMatch: function(question) {
        const matches = [];
        const words = question.split(/\s+/);
        
        for (const categoryKey in this.knowledgeBase) {
            const category = this.knowledgeBase[categoryKey];
            for (const questionKey in category.questions) {
                const q = category.questions[questionKey];
                let matchScore = 0;
                
                for (const keyword of q.keywords) {
                    for (const word of words) {
                        if (keyword.includes(word) || word.includes(keyword)) {
                            matchScore++;
                        }
                    }
                }
                
                if (matchScore > 0) {
                    matches.push({
                        ...q,
                        category: category.name,
                        score: matchScore
                    });
                }
            }
        }
        
        // Sort by score and return top matches
        return matches.sort((a, b) => b.score - a.score).slice(0, 3);
    },

    // Get questions by category
    getQuestionsByCategory: function(categoryKey) {
        const category = this.knowledgeBase[categoryKey];
        if (!category) return [];
        
        return Object.keys(category.questions).map(key => ({
            id: key,
            question: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            keywords: category.questions[key].keywords
        }));
    },

    // Get all categories
    getAllCategories: function() {
        return Object.keys(this.knowledgeBase).map(key => ({
            key: key,
            name: this.knowledgeBase[key].name
        }));
    }
};

