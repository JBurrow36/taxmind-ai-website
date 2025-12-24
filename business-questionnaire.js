// Business Questionnaire Logic and Validation

document.addEventListener('DOMContentLoaded', function() {
    initializeBusinessQuestionnaire();
});

function initializeBusinessQuestionnaire() {
    const form = document.getElementById('businessQuestionnaireForm');
    
    // Format EIN input
    const einInput = document.getElementById('ein');
    einInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length >= 9) {
            value = value.substring(0, 9);
        }
        if (value.length >= 2) {
            value = value.substring(0, 2) + '-' + value.substring(2);
        }
        this.value = value;
    });
    
    // Format currency inputs
    const currencyInputs = ['grossReceipts', 'costOfGoodsSold', 'totalExpenses', 'totalPayrollExpenses'];
    currencyInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                formatCurrencyInput(this);
            });
            input.addEventListener('blur', function() {
                calculateNetProfit();
            });
        }
    });
    
    // Calculate net profit when revenue/expenses change
    document.getElementById('grossReceipts').addEventListener('blur', calculateNetProfit);
    document.getElementById('costOfGoodsSold').addEventListener('blur', calculateNetProfit);
    document.getElementById('totalExpenses').addEventListener('blur', calculateNetProfit);
    
    // Set current tax year as default
    const currentYear = new Date().getFullYear();
    document.getElementById('taxYear').value = currentYear;
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateBusinessForm()) {
            submitBusinessQuestionnaire();
        }
    });
    
    // Initial form field update
    updateFormFields();
}

// Update form fields based on business type
function updateFormFields() {
    const businessType = document.getElementById('businessType').value;
    const partnershipSection = document.getElementById('partnershipSection');
    const corporationSection = document.getElementById('corporationSection');
    
    // Hide all conditional sections
    partnershipSection.classList.remove('active');
    corporationSection.classList.remove('active');
    
    // Show relevant sections
    if (businessType === 'partnership' || businessType === 'llc') {
        partnershipSection.classList.add('active');
        const numPartners = document.getElementById('numberOfPartners');
        if (numPartners) {
            numPartners.addEventListener('change', function() {
                generatePartnersList(parseInt(this.value));
            });
        }
    } else if (businessType === 's_corp' || businessType === 'c_corp') {
        corporationSection.classList.add('active');
        const numShareholders = document.getElementById('numberOfShareholders');
        if (numShareholders) {
            numShareholders.addEventListener('change', function() {
                generateShareholdersList(parseInt(this.value));
            });
        }
    }
}

// Generate partners list
function generatePartnersList(count) {
    const partnersList = document.getElementById('partnersList');
    partnersList.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const partnerDiv = document.createElement('div');
        partnerDiv.className = 'form-section';
        partnerDiv.style.cssText = 'background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #e2e8f0;';
        partnerDiv.innerHTML = `
            <h4 style="margin: 0 0 1rem; color: #1e293b;">Partner/Member ${i + 1}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" name="partnerFirstName${i}" required>
                </div>
                <div class="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="partnerLastName${i}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>SSN/EIN *</label>
                    <input type="text" name="partnerSSN${i}" required placeholder="XXX-XX-XXXX or XX-XXXXXXX">
                </div>
                <div class="form-group">
                    <label>Ownership Percentage (%) *</label>
                    <input type="number" name="partnerOwnership${i}" required min="0" max="100" step="0.01" placeholder="0.00">
                </div>
            </div>
        `;
        partnersList.appendChild(partnerDiv);
    }
}

// Generate shareholders list
function generateShareholdersList(count) {
    const shareholdersList = document.getElementById('shareholdersList');
    shareholdersList.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const shareholderDiv = document.createElement('div');
        shareholderDiv.className = 'form-section';
        shareholderDiv.style.cssText = 'background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #e2e8f0;';
        shareholderDiv.innerHTML = `
            <h4 style="margin: 0 0 1rem; color: #1e293b;">Shareholder ${i + 1}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" name="shareholderFirstName${i}" required>
                </div>
                <div class="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="shareholderLastName${i}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>SSN/EIN *</label>
                    <input type="text" name="shareholderSSN${i}" required placeholder="XXX-XX-XXXX or XX-XXXXXXX">
                </div>
                <div class="form-group">
                    <label>Number of Shares *</label>
                    <input type="number" name="shareholderShares${i}" required min="0" placeholder="0">
                </div>
            </div>
        `;
        shareholdersList.appendChild(shareholderDiv);
    }
}

// Format currency input
function formatCurrencyInput(input) {
    let value = input.value.replace(/[^0-9.]/g, '');
    if (value) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            input.value = '$' + numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }
}

// Calculate net profit
function calculateNetProfit() {
    const grossReceipts = parseFloat(document.getElementById('grossReceipts').value.replace(/[^0-9.]/g, '')) || 0;
    const cogs = parseFloat(document.getElementById('costOfGoodsSold').value.replace(/[^0-9.]/g, '')) || 0;
    const expenses = parseFloat(document.getElementById('totalExpenses').value.replace(/[^0-9.]/g, '')) || 0;
    
    const netProfit = grossReceipts - cogs - expenses;
    const netProfitInput = document.getElementById('netProfit');
    
    if (!isNaN(netProfit)) {
        netProfitInput.value = '$' + netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        // Color code based on profit/loss
        if (netProfit < 0) {
            netProfitInput.style.color = '#ef4444';
        } else {
            netProfitInput.style.color = '#059669';
        }
    }
}

// Validate business form
function validateBusinessForm() {
    const form = document.getElementById('businessQuestionnaireForm');
    const formData = new FormData(form);
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Validate EIN format
    const ein = formData.get('ein');
    const einDigits = ein.replace(/\D/g, '');
    if (einDigits.length !== 9) {
        showFieldError('ein', 'EIN must be 9 digits in XX-XXXXXXX format');
        isValid = false;
    }
    
    // Validate business type specific fields
    const businessType = formData.get('businessType');
    if (businessType === 'partnership' || businessType === 'llc') {
        const numPartners = parseInt(formData.get('numberOfPartners') || '0');
        if (numPartners < 2) {
            showFieldError('numberOfPartners', 'Partnership/LLC must have at least 2 partners/members');
            isValid = false;
        }
        
        // Validate partner information
        for (let i = 0; i < numPartners; i++) {
            const partnerFirstName = formData.get(`partnerFirstName${i}`);
            const partnerSSN = formData.get(`partnerSSN${i}`);
            const partnerOwnership = parseFloat(formData.get(`partnerOwnership${i}`) || '0');
            
            if (!partnerFirstName) {
                showFieldError(`partnerFirstName${i}`, `Partner ${i + 1} first name is required`);
                isValid = false;
            }
            
            if (!partnerSSN || partnerSSN.replace(/\D/g, '').length < 9) {
                showFieldError(`partnerSSN${i}`, `Partner ${i + 1} SSN/EIN is required`);
                isValid = false;
            }
            
            if (partnerOwnership <= 0 || partnerOwnership > 100) {
                showFieldError(`partnerOwnership${i}`, `Partner ${i + 1} ownership must be between 0 and 100%`);
                isValid = false;
            }
        }
    } else if (businessType === 's_corp' || businessType === 'c_corp') {
        const numShareholders = parseInt(formData.get('numberOfShareholders') || '0');
        if (numShareholders < 1) {
            showFieldError('numberOfShareholders', 'Corporation must have at least 1 shareholder');
            isValid = false;
        }
        
        // Validate shareholder information
        for (let i = 0; i < numShareholders; i++) {
            const shareholderFirstName = formData.get(`shareholderFirstName${i}`);
            const shareholderSSN = formData.get(`shareholderSSN${i}`);
            const shareholderShares = parseInt(formData.get(`shareholderShares${i}`) || '0');
            
            if (!shareholderFirstName) {
                showFieldError(`shareholderFirstName${i}`, `Shareholder ${i + 1} first name is required`);
                isValid = false;
            }
            
            if (!shareholderSSN || shareholderSSN.replace(/\D/g, '').length < 9) {
                showFieldError(`shareholderSSN${i}`, `Shareholder ${i + 1} SSN/EIN is required`);
                isValid = false;
            }
            
            if (shareholderShares <= 0) {
                showFieldError(`shareholderShares${i}`, `Shareholder ${i + 1} shares must be greater than 0`);
                isValid = false;
            }
        }
    }
    
    // Validate required numeric fields
    const requiredNumericFields = ['grossReceipts', 'totalExpenses', 'numberOfEmployees'];
    requiredNumericFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const value = formData.get(fieldId);
        if (!value || parseFloat(value.replace(/[^0-9.]/g, '')) < 0) {
            showFieldError(fieldId, 'This field is required and must be a valid number');
            isValid = false;
        }
    });
    
    return isValid;
}

// Show field error
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
}

// Submit business questionnaire
function submitBusinessQuestionnaire() {
    const form = document.getElementById('businessQuestionnaireForm');
    const formData = new FormData(form);
    const businessData = {};
    
    // Collect all form data
    for (const [key, value] of formData.entries()) {
        if (key === 'payrollForms') {
            if (!businessData.payrollForms) {
                businessData.payrollForms = [];
            }
            businessData.payrollForms.push(value);
        } else {
            businessData[key] = value;
        }
    }
    
    // Store in localStorage
    localStorage.setItem('taxmind_business_questionnaire', JSON.stringify(businessData));
    
    // Show success message
    alert('Business information submitted successfully! You can now proceed with filing your taxes.');
    
    // Redirect to file taxes page
    window.location.href = 'file-taxes.html';
}

