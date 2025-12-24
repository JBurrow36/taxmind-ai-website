# Tax Type Detection Implementation

## Overview
This implementation adds intelligent tax type detection to TaxMind AI, categorizing uploaded documents based on file characteristics AND the user's account type (individual or business).

## Key Features

### 1. Account-Type-Aware Tax Classification
- Tax types are detected considering the user's account type selected during signup
- Individual accounts: Primarily income, property, sales, and estate taxes
- Business accounts: Primarily business, income, property, and sales taxes

### 2. Supported Tax Types
- **Income Tax**: W-2s, 1099s, Form 1040, schedules
- **Property Tax**: Property tax bills, assessment notices, real estate tax documents
- **Sales Tax**: Sales receipts, purchase invoices
- **Estate Tax**: Estate returns, inheritance documents, Form 706
- **Business Tax**: Schedule C/E, EIN documents, business income statements

### 3. Intelligent Detection
- Analyzes file names and content patterns
- Uses keyword matching and regex patterns
- Provides confidence scores for detections
- Defaults to appropriate tax type based on account type if uncertain

## Implementation Details

### Files Modified

1. **tax-type-detector.js** (NEW)
   - Core tax type detection logic
   - Account-type-aware categorization
   - Tax-specific benefits and deductions database
   - Analysis steps for each tax type and account type combination

2. **upload-documents.js**
   - Updated `storeFile()` to detect tax type on upload
   - Stores tax type metadata with each file
   - Updates tax type summary for analysis

3. **ai-analysis.js**
   - Updated `startAnalysis()` to use tax-type-specific steps
   - Updated `updateInsights()` to show tax-type-specific benefits
   - Updated `completeAnalysis()` to store tax type for reports
   - Updated `displayUploadedFiles()` to show tax type badges

4. **upload-documents.html**
   - Added script tag for tax-type-detector.js

5. **ai-analysis.html**
   - Added script tag for tax-type-detector.js

## How It Works

### 1. Document Upload
When a user uploads a document:
1. File name is analyzed using keyword and pattern matching
2. User's account type is retrieved from localStorage
3. Tax type is detected considering account type constraints
4. Tax type metadata is stored with the file

### 2. Analysis Process
When analysis starts:
1. System identifies primary tax type from uploaded files
2. Gets user's account type
3. Retrieves tax-type-specific analysis steps
4. Shows appropriate progress messages
5. Displays relevant tax benefits and deductions

### 3. Account Type Impact
- **Individual Account**: Focuses on personal tax documents (income, property, sales, estate)
- **Business Account**: Focuses on business tax documents (business, income, property, sales)

## Example Scenarios

### Scenario 1: Individual Account with Property Tax Document
- User uploads: "property_tax_bill_2024.pdf"
- Account Type: "individual"
- Detected: Property Tax (high confidence)
- Analysis: Uses property tax steps for individuals
- Benefits Shown: SALT deduction, homestead exemption, property tax appeal

### Scenario 2: Business Account with Property Tax Document
- User uploads: "commercial_property_tax.pdf"
- Account Type: "business"
- Detected: Property Tax (high confidence)
- Analysis: Uses property tax steps for businesses
- Benefits Shown: Business property tax deduction, depreciation, Section 179

### Scenario 3: Individual Account with W-2
- User uploads: "w2_2024.pdf"
- Account Type: "individual"
- Detected: Income Tax (very high confidence)
- Analysis: Uses individual income tax steps
- Benefits Shown: Standard deduction, EITC, Child Tax Credit, etc.

## Tax Benefits Database

Each tax type has specific benefits and deductions based on account type:

### Income Tax (Individual)
- Standard Deduction
- Mortgage Interest Deduction
- SALT Deduction
- Charitable Contributions
- Medical Expenses
- EITC
- Child Tax Credit
- Student Loan Interest
- IRA Contributions

### Income Tax (Business)
- Business Expense Deductions
- QBI Deduction
- Section 179 Deduction
- Business Meals
- Vehicle Expenses
- Home Office Deduction
- Retirement Contributions

### Property Tax (Individual)
- SALT Deduction
- Homestead Exemption
- Senior/Disabled Exemption
- Property Tax Appeal
- Mortgage Interest
- Home Office Deduction

### Property Tax (Business)
- Business Property Tax Deduction
- Depreciation
- Section 179 Expensing
- Property Tax Appeal

## Testing

To test the implementation:

1. **Sign up with Individual Account**
   - Upload a property tax document
   - Verify it's detected as "Property Tax"
   - Verify analysis shows individual property tax steps

2. **Sign up with Business Account**
   - Upload the same property tax document
   - Verify it's detected as "Property Tax"
   - Verify analysis shows business property tax steps

3. **Upload Mixed Documents**
   - Upload both W-2 and property tax documents
   - Verify system identifies primary tax type (most common)
   - Verify appropriate analysis steps are used

## Future Enhancements

Potential improvements:
1. OCR-based content analysis for better detection
2. Multi-tax-type analysis (analyze all types separately)
3. Tax type confirmation dialog for user verification
4. Machine learning model for improved detection accuracy
5. Support for additional tax types (payroll, excise, etc.)

## Notes

- Default tax type: Income tax for individuals, Business tax for businesses
- Confidence scores help identify uncertain detections
- Tax type badges appear in file lists for visual identification
- All tax type data is stored in localStorage with files

