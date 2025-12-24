// Red Flag Detector - Detects problems, errors, and compliance issues in tax documents

const RedFlagDetector = {
    // Detect red flags in document content
    detectRedFlags: function(content, file, taxType) {
        const redFlags = [];
        const lowerContent = content.toLowerCase();
        const fileName = file ? file.name.toLowerCase() : '';
        
        // Financial Issues
        redFlags.push(...this.detectFinancialIssues(lowerContent, fileName));
        
        // Compliance Issues
        redFlags.push(...this.detectComplianceIssues(lowerContent, file, taxType));
        
        // Documentation Issues
        redFlags.push(...this.detectDocumentationIssues(lowerContent, file, taxType));
        
        // Data Consistency Issues
        redFlags.push(...this.detectConsistencyIssues(lowerContent, file));
        
        return redFlags;
    },
    
    // Detect financial issues (overdue payments, debt, etc.)
    detectFinancialIssues: function(content, fileName) {
        const flags = [];
        
        // Overdue payments
        const overduePatterns = [
            /overdue|past due|delinquent|late payment|payment overdue/i,
            /penalty|late fee|interest penalty/i,
            /notice of intent to levy|tax lien|federal tax lien/i
        ];
        
        overduePatterns.forEach((pattern, index) => {
            if (pattern.test(content)) {
                flags.push({
                    id: 'redflag-financial-' + Date.now() + '-' + index,
                    type: 'redflag',
                    message: 'RED FLAG: Overdue payment or penalty detected. This needs immediate attention. Contact the IRS or a tax professional.',
                    page: 1,
                    bbox: { x: 0, y: index * 30, width: 100, height: 25 },
                    severity: 'high',
                    category: 'financial'
                });
            }
        });
        
        // Debt indicators
        const debtPatterns = [
            /tax debt|outstanding balance|amount owed|balance due/i,
            /installment agreement|payment plan|offer in compromise/i,
            /levy|lien|seizure/i,
            /collection|debt collection/i
        ];
        
        debtPatterns.forEach((pattern, index) => {
            if (pattern.test(content)) {
                flags.push({
                    id: 'redflag-debt-' + Date.now() + '-' + index,
                    type: 'redflag',
                    message: 'RED FLAG: Tax debt or collection activity detected. Review your payment options and consider consulting a tax professional.',
                    page: 1,
                    bbox: { x: 0, y: (overduePatterns.length + index) * 30, width: 100, height: 25 },
                    severity: 'high',
                    category: 'debt'
                });
            }
        });
        
        // Unusual income patterns
        if (this.detectUnusualIncome(content)) {
            flags.push({
                id: 'redflag-income-' + Date.now(),
                type: 'redflag',
                message: 'RED FLAG: Unusual income pattern detected. Ensure all income is properly reported. Large discrepancies may trigger an audit.',
                page: 1,
                bbox: { x: 0, y: (overduePatterns.length + debtPatterns.length) * 30, width: 100, height: 25 },
                severity: 'medium',
                category: 'income'
            });
        }
        
        // Large deductions without documentation
        if (this.detectLargeDeductions(content)) {
            flags.push({
                id: 'redflag-deduction-' + Date.now(),
                type: 'redflag',
                message: 'RED FLAG: Large deductions detected. Ensure you have proper documentation for all deductions. The IRS may request proof.',
                page: 1,
                bbox: { x: 0, y: (overduePatterns.length + debtPatterns.length + 1) * 30, width: 100, height: 25 },
                severity: 'medium',
                category: 'deduction'
            });
        }
        
        return flags;
    },
    
    // Detect compliance issues
    detectComplianceIssues: function(content, file, taxType) {
        const flags = [];
        
        // Missing required forms
        const requiredForms = this.getRequiredForms(taxType);
        const missingForms = requiredForms.filter(form => {
            const formPattern = new RegExp(form.toLowerCase().replace(/\s+/g, '[\\s-]*'), 'i');
            return !formPattern.test(content);
        });
        
        if (missingForms.length > 0) {
            flags.push({
                id: 'redflag-missing-' + Date.now(),
                type: 'redflag',
                message: `RED FLAG: Missing required form(s): ${missingForms.join(', ')}. Your tax return may be incomplete.`,
                page: 1,
                bbox: { x: 0, y: 0, width: 100, height: 25 },
                severity: 'high',
                category: 'compliance'
            });
        }
        
        // Invalid SSN/EIN formats
        const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
        const einPattern = /\b\d{2}-\d{7}\b/;
        
        // Check for SSN format issues (individual taxes)
        if (taxType === 'income' && content.match(/\d{9}/) && !ssnPattern.test(content)) {
            flags.push({
                id: 'redflag-ssn-' + Date.now(),
                type: 'redflag',
                message: 'RED FLAG: SSN format appears incorrect. Should be XXX-XX-XXXX format.',
                page: 1,
                bbox: { x: 0, y: 30, width: 100, height: 25 },
                severity: 'high',
                category: 'compliance'
            });
        }
        
        // Check for EIN format issues (business taxes)
        if ((taxType === 'business' || file.accountType === 'business') && content.match(/\d{9}/) && !einPattern.test(content)) {
            flags.push({
                id: 'redflag-ein-' + Date.now(),
                type: 'redflag',
                message: 'RED FLAG: EIN format appears incorrect. Should be XX-XXXXXXX format.',
                page: 1,
                bbox: { x: 0, y: 60, width: 100, height: 25 },
                severity: 'high',
                category: 'compliance'
            });
        }
        
        // Filing deadline issues
        const currentDate = new Date();
        const taxYear = this.extractTaxYear(content);
        if (taxYear && taxYear < currentDate.getFullYear() - 1) {
            flags.push({
                id: 'redflag-deadline-' + Date.now(),
                type: 'redflag',
                message: `RED FLAG: Document appears to be from tax year ${taxYear}. Late filing may result in penalties.`,
                page: 1,
                bbox: { x: 0, y: 90, width: 100, height: 25 },
                severity: 'medium',
                category: 'compliance'
            });
        }
        
        return flags;
    },
    
    // Detect documentation issues
    detectDocumentationIssues: function(content, file, taxType) {
        const flags = [];
        
        // Missing W-2s for reported wages
        if (taxType === 'income' && content.match(/wage|salary|income/i) && !content.match(/w-2|w2|form w-2/i)) {
            flags.push({
                id: 'redflag-w2-' + Date.now(),
                type: 'redflag',
                message: 'RED FLAG: Wages reported but W-2 form not found. W-2 is required to verify income.',
                page: 1,
                bbox: { x: 0, y: 0, width: 100, height: 25 },
                severity: 'high',
                category: 'documentation'
            });
        }
        
        // Missing 1099s for reported income
        if (taxType === 'income' && content.match(/1099|contractor|freelance|self.employ/i) && !content.match(/form 1099|1099-|1099_/i)) {
            flags.push({
                id: 'redflag-1099-' + Date.now(),
                type: 'redflag',
                message: 'RED FLAG: 1099 income mentioned but 1099 form not found. 1099 forms are required for non-employee income.',
                page: 1,
                bbox: { x: 0, y: 30, width: 100, height: 25 },
                severity: 'high',
                category: 'documentation'
            });
        }
        
        // Missing signatures
        if (!content.match(/signature|signed|sign here/i)) {
            flags.push({
                id: 'redflag-signature-' + Date.now(),
                type: 'redflag',
                message: 'RED FLAG: Signature not found. Tax forms require signatures to be valid.',
                page: 1,
                bbox: { x: 0, y: 60, width: 100, height: 25 },
                severity: 'high',
                category: 'documentation'
            });
        }
        
        // Missing dates
        const datePattern = /\b(19|20)\d{2}\b/;
        if (!datePattern.test(content)) {
            flags.push({
                id: 'redflag-date-' + Date.now(),
                type: 'redflag',
                message: 'RED FLAG: Tax year or date not clearly indicated. Tax year is required.',
                page: 1,
                bbox: { x: 0, y: 90, width: 100, height: 25 },
                severity: 'medium',
                category: 'documentation'
            });
        }
        
        return flags;
    },
    
    // Detect consistency issues
    detectConsistencyIssues: function(content, file) {
        const flags = [];
        
        // This would check for inconsistencies across multiple documents
        // For example, income on one form not matching another
        
        // In a real implementation, this would compare data across all uploaded files
        const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
        const files = Object.values(uploadedFiles);
        
        if (files.length > 1) {
            // Check for duplicate SSNs with different names
            const ssns = files.map(f => this.extractSSN(f.name + ' ' + (f.content || ''))).filter(Boolean);
            const uniqueSSNs = new Set(ssns);
            if (ssns.length > uniqueSSNs.size && ssns.length > 0) {
                flags.push({
                    id: 'redflag-consistency-ssn-' + Date.now(),
                    type: 'redflag',
                    message: 'RED FLAG: Multiple documents with same SSN but potentially different information. Verify all information matches.',
                    page: 1,
                    bbox: { x: 0, y: 0, width: 100, height: 25 },
                    severity: 'high',
                    category: 'consistency'
                });
            }
        }
        
        return flags;
    },
    
    // Helper: Get required forms based on tax type
    getRequiredForms: function(taxType) {
        const formMap = {
            'income': ['Form 1040', 'W-2'],
            'business': ['Schedule C', 'EIN'],
            'property': ['Property Tax Statement']
        };
        return formMap[taxType] || [];
    },
    
    // Helper: Detect unusual income patterns
    detectUnusualIncome: function(content) {
        // Look for large dollar amounts that might indicate errors
        const amounts = content.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g) || [];
        const numericAmounts = amounts.map(a => parseFloat(a.replace(/[$,]/g, '')));
        
        // Flag if any amount exceeds $1,000,000 (unusual for most individuals)
        return numericAmounts.some(amt => amt > 1000000);
    },
    
    // Helper: Detect large deductions
    detectLargeDeductions: function(content) {
        // Look for deduction-related keywords with large amounts
        const deductionKeywords = /deduction|expense|write.off/i;
        const hasDeductions = deductionKeywords.test(content);
        
        if (hasDeductions) {
            const amounts = content.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g) || [];
            const numericAmounts = amounts.map(a => parseFloat(a.replace(/[$,]/g, '')));
            // Flag if deduction exceeds $50,000 (may need extra documentation)
            return numericAmounts.some(amt => amt > 50000);
        }
        
        return false;
    },
    
    // Helper: Extract tax year from content
    extractTaxYear: function(content) {
        const yearPattern = /(?:tax year|year|filing year).*?(\d{4})/i;
        const match = content.match(yearPattern);
        if (match) {
            return parseInt(match[1]);
        }
        
        // Try to find any 4-digit year between 2010 and current year + 1
        const currentYear = new Date().getFullYear();
        const yearMatches = content.match(/\b(20[12]\d)\b/g);
        if (yearMatches) {
            const years = yearMatches.map(y => parseInt(y)).filter(y => y >= 2010 && y <= currentYear + 1);
            return years.length > 0 ? Math.max(...years) : null;
        }
        
        return null;
    },
    
    // Helper: Extract SSN from content
    extractSSN: function(content) {
        const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
        const match = content.match(ssnPattern);
        return match ? match[0] : null;
    }
};

