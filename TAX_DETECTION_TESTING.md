# Tax Type Detection Testing & Improvements

## Enhanced Detection Accuracy

I've significantly improved the tax type detection system to better identify different types of tax documents. Here are the improvements:

### Property Tax Detection Enhancements

**Added Keywords:**
- property tax bill, real estate tax bill
- property statement, tax notice, property notice
- assessment notice, assessment statement
- real estate assessment, property valuation
- county tax, city tax, municipal tax, local tax
- property levy, tax invoice, tax receipt
- property tax receipt, tax payment

**Enhanced Patterns:**
- `/property\s+tax\s+bill/i` - Catches "property tax bill" specifically
- `/property\s+(assessment|valuation|statement|notice)/i` - Catches various property-related documents
- `/county.*tax|city.*tax|municipal.*tax/i` - Catches local tax documents
- `/real\s+estate\s+(assessment|statement)/i` - Catches real estate assessments

### Income Tax Detection Enhancements

**Added Keywords:**
- form w-2, form w2, w 2 (with spaces)
- form 1099, 1099- variants
- form 1040, tax return, income tax return
- schedule a, b, c, d variants
- wage statement, earnings statement, income statement
- adjusted gross income, AGI, gross income, net income
- withholding, withholdings, taxable income

**Enhanced Patterns:**
- `/w[- ]?2/i` - Catches w-2, w2, w 2 variants
- `/1099[\-\w]*/i` - Catches all 1099 variants (1099-NEC, 1099-INT, etc.)
- `/form\s+(w[- ]?2|1040|1099)/i` - Catches "Form W-2", "Form 1040", etc.
- `/tax\s+return/i` - Catches tax return documents

### Business Tax Detection Enhancements

**Added Keywords:**
- schedule k-1, form 1120s, form 1065
- employer identification number (full phrase)
- business expenses, business deductions
- cost of goods sold, COGS
- business return, business tax return
- sole proprietorship
- profit and loss, P&L
- business statement, business income statement

**Enhanced Patterns:**
- `/schedule\s+[cek]/i` - Catches schedules C, E, K
- `/form\s+(1120|1120s|1065|1040[\s-]?schedule[\s-]?c)/i` - Catches all business forms
- `/profit\s+and\s+loss|p\s*&\s*l/i` - Catches P&L statements
- `/business\s+(income|expense|statement|return)/i` - Catches business documents

## How Detection Works

1. **File Upload**: When a file is uploaded, its name is analyzed
2. **Keyword Matching**: Each keyword match adds 2 points
3. **Pattern Matching**: Each regex pattern match adds 5 points
4. **Account Type Boost**: Account-type-specific tax types get +3 bonus points
5. **Scoring**: Tax type with highest score wins
6. **Confidence**: Confidence score is calculated based on total score

## Example Detection Scenarios

### Scenario 1: Property Tax Bill
**File Name**: "property_tax_bill_2024.pdf"
- Matches: "property tax" keyword (+2), "tax bill" keyword (+2), `/property\s+tax/i` pattern (+5), `/tax\s+bill/i` pattern (+5)
- **Total Score**: 14 points
- **Detected**: Property Tax (High Confidence)

### Scenario 2: W-2 Form
**File Name**: "Form W-2 John Smith 2024.pdf"
- Matches: "w-2" keyword (+2), "form w-2" keyword (+2), `/w[- ]?2/i` pattern (+5), `/form\s+(w[- ]?2|1040|1099)/i` pattern (+5)
- **Total Score**: 14 points
- **Detected**: Income Tax (High Confidence)

### Scenario 3: Business Tax Document
**File Name**: "Schedule C 2024.pdf"
**Account Type**: Business
- Matches: "schedule c" keyword (+2), `/schedule\s+[cek]/i` pattern (+5), account type boost (+3)
- **Total Score**: 10 points
- **Detected**: Business Tax (High Confidence)

### Scenario 4: Ambiguous Document
**File Name**: "tax_document.pdf"
- No specific matches
- **Default**: Income Tax for individuals, Business Tax for business accounts
- **Confidence**: 30% (Low - default fallback)

## Testing Recommendations

To test the detection accuracy, try uploading documents with these names:

### Property Tax Documents:
- "property_tax_bill_2024.pdf"
- "real_estate_tax_statement.pdf"
- "county_property_assessment.pdf"
- "tax_bill_2024.pdf"
- "parcel_12345_tax.pdf"

### Income Tax Documents:
- "W-2_2024.pdf"
- "Form_1099-NEC.pdf"
- "tax_return_2024.pdf"
- "pay_stub_december.pdf"
- "Form_1040.pdf"

### Business Tax Documents:
- "Schedule_C_2024.pdf"
- "Form_1120.pdf"
- "business_tax_return.pdf"
- "P&L_Statement_2024.pdf"
- "EIN_document.pdf"

## Account Type Impact

The detection system considers the user's account type:
- **Individual Account**: Defaults to Income Tax if uncertain, excludes Business-only tax types
- **Business Account**: Defaults to Business Tax if uncertain, can access all tax types

## Next Steps for Real AI Integration

If you want to add actual AI/ML detection in the future:
1. Use OCR to extract text from PDFs/images
2. Analyze document structure and layout
3. Use NLP to identify document type from content
4. Train a classification model on real tax documents
5. Combine file name patterns with content analysis for higher accuracy

For now, the enhanced keyword and pattern matching should significantly improve detection accuracy for properly named files.

