// Document Analysis Guide - What to look for in each tax document type
// This guide helps the AI know what information to extract and analyze for each tax type

const DocumentAnalysisGuide = {
    // Analysis guidelines for each tax type
    ANALYSIS_GUIDELINES: {
        income: {
            whatToLookFor: [
                'Total wages/salary (Box 1 on W-2)',
                'Federal tax withheld (Box 2 on W-2)',
                'State tax withheld (Box 17 on W-2)',
                'Social Security wages (Box 3 on W-2)',
                'Medicare wages (Box 5 on W-2)',
                '1099 income amounts (various 1099 forms)',
                'Interest income',
                'Dividend income',
                'Capital gains/losses',
                'Adjusted Gross Income (AGI)',
                'Standard deduction amount',
                'Itemized deductions (if applicable)',
                'Taxable income',
                'Tax liability',
                'Credits (EITC, Child Tax Credit, etc.)',
                'Refund amount or amount owed'
            ],
            keyFields: [
                'Employer name and EIN',
                'Employee SSN',
                'Tax year',
                'Filing status',
                'Dependent information',
                'Income sources',
                'Deduction categories',
                'Tax credits'
            ],
            analysisFocus: [
                'Verify all income sources are reported',
                'Check for eligible deductions',
                'Identify potential tax credits',
                'Ensure accurate tax calculations',
                'Optimize deduction strategy (standard vs itemized)',
                'Verify withholding accuracy'
            ]
        },
        property: {
            whatToLookFor: [
                'Property address',
                'Parcel number or ID',
                'Assessed value of property',
                'Taxable value',
                'Tax rate (mill rate or percentage)',
                'Total property tax amount',
                'Homestead exemption amount (if applicable)',
                'Senior/disabled exemption (if applicable)',
                'Payment due date',
                'Prior year taxes (if any)',
                'Penalties and interest (if applicable)',
                'Total amount due',
                'Land value',
                'Improvements value (buildings)',
                'Property classification'
            ],
            keyFields: [
                'Property owner name',
                'Property address',
                'Parcel identification',
                'Tax year',
                'Assessment date',
                'Exemption status',
                'Payment information'
            ],
            analysisFocus: [
                'Verify assessed value accuracy',
                'Check for applicable exemptions',
                'Calculate SALT deduction eligibility',
                'Review tax rate accuracy',
                'Identify potential assessment appeals',
                'Verify payment status',
                'Check for overpayments or refunds'
            ]
        },
        business: {
            whatToLookFor: [
                'Business name and EIN',
                'Gross receipts or sales',
                'Cost of Goods Sold (COGS)',
                'Gross profit',
                'Business expenses (detailed breakdown)',
                'Net profit or loss',
                'Self-employment tax',
                'Qualified Business Income (QBI)',
                'Business tax liability',
                'Depreciation amounts',
                'Business vehicle expenses',
                'Home office deduction',
                'Business meals and entertainment',
                'Business interest paid',
                'Retirement contributions (SEP-IRA, Solo 401k)'
            ],
            keyFields: [
                'Business entity type (LLC, Corporation, Partnership, Sole Proprietor)',
                'EIN or SSN',
                'Tax year',
                'Business address',
                'NAICS code',
                'Income sources',
                'Expense categories',
                'Asset information'
            ],
            analysisFocus: [
                'Verify all business income is reported',
                'Ensure all eligible expenses are claimed',
                'Check depreciation schedules',
                'Optimize QBI deduction',
                'Verify business use percentages',
                'Check for missed deductions',
                'Ensure proper expense categorization',
                'Review self-employment tax calculations'
            ]
        },
        sales: {
            whatToLookFor: [
                'Total taxable sales',
                'Sales tax rate(s)',
                'Sales tax collected',
                'Sales tax paid on purchases',
                'Exempt sales amount',
                'Use tax (if applicable)',
                'Tax period',
                'Filing frequency',
                'Tax due amount',
                'Penalties (if applicable)',
                'Refund amount (if applicable)'
            ],
            keyFields: [
                'Business/individual name',
                'Tax ID number',
                'Tax period (monthly, quarterly, annual)',
                'Sales by category',
                'Exemption certificates',
                'Purchase records'
            ],
            analysisFocus: [
                'Verify sales tax collected accuracy',
                'Check for exempt sales eligibility',
                'Verify tax rate application',
                'Review purchase tax deductions',
                'Ensure timely filing',
                'Check for overpayments'
            ]
        },
        estate: {
            whatToLookFor: [
                'Decedent name and SSN',
                'Date of death',
                'Gross estate value',
                'Debts and expenses',
                'Marital deduction',
                'Charitable deduction',
                'Taxable estate',
                'Unified credit amount',
                'Estate tax due',
                'Prior transfers',
                'Alternate valuation date (if used)',
                'Executor information'
            ],
            keyFields: [
                'Decedent information',
                'Estate executor',
                'Date of death',
                'Valuation date',
                'Asset inventory',
                'Deduction categories',
                'Beneficiary information'
            ],
            analysisFocus: [
                'Verify estate valuation accuracy',
                'Ensure all deductions are claimed',
                'Check unified credit application',
                'Verify marital deduction',
                'Review charitable deductions',
                'Ensure proper filing deadlines',
                'Check for state estate tax implications'
            ]
        }
    },

    // Get analysis guidelines for a specific tax type
    getAnalysisGuidelines: function(taxTypeId) {
        return this.ANALYSIS_GUIDELINES[taxTypeId] || this.ANALYSIS_GUIDELINES.income;
    },

    // Get what to look for in a specific tax type
    getWhatToLookFor: function(taxTypeId) {
        const guidelines = this.getAnalysisGuidelines(taxTypeId);
        return guidelines.whatToLookFor || [];
    },

    // Get key fields for a specific tax type
    getKeyFields: function(taxTypeId) {
        const guidelines = this.getAnalysisGuidelines(taxTypeId);
        return guidelines.keyFields || [];
    },

    // Get analysis focus points for a specific tax type
    getAnalysisFocus: function(taxTypeId) {
        const guidelines = this.getAnalysisGuidelines(taxTypeId);
        return guidelines.analysisFocus || [];
    }
};

