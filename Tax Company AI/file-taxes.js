// File Taxes functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the filing process
    initializeFiling();
    
    // Set up form validation
    setupFormValidation();
    
    // Check if already filed
    checkFilingStatus();
});

function initializeFiling() {
    // Check if analysis is completed
    const analysisCompleted = localStorage.getItem('taxmind_analysis_completed') === 'true';
    
    if (!analysisCompleted) {
        showNotification('Please complete AI analysis first.', 'warning');
        // Redirect to analysis page
        setTimeout(() => {
            window.location.href = 'ai-analysis.html';
        }, 2000);
        return;
    }
    
    // Load user data
    const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
    
    // Pre-fill form with user data
    if (currentUser.firstName && currentUser.lastName) {
        // Update page title
        document.title = `File Taxes - ${currentUser.firstName} ${currentUser.lastName} - TaxMind AI`;
    }
}

function setupFormValidation() {
    const form = document.getElementById('filingForm');
    const filingButton = document.getElementById('filingButton');
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            startFilingProcess();
        }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // SSN formatting
    const ssnInput = document.getElementById('ssn');
    ssnInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length >= 9) {
            value = value.substring(0, 9);
        }
        if (value.length >= 6) {
            value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5);
        } else if (value.length >= 3) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        }
        this.value = value;
    });
    
    // Bank account formatting
    const bankAccountInput = document.getElementById('bankAccount');
    bankAccountInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });
    
    // Routing number formatting
    const routingInput = document.getElementById('routingNumber');
    routingInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
        if (this.value.length > 9) {
            this.value = this.value.substring(0, 9);
        }
    });
}

function validateForm() {
    const form = document.getElementById('filingForm');
    const formData = new FormData(form);
    
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(error => {
        error.remove();
    });
    document.querySelectorAll('input, select').forEach(input => {
        input.classList.remove('error');
    });
    
    // Validate SSN
    const ssn = formData.get('ssn');
    if (!ssn || ssn.length !== 11) {
        showFieldError('ssn', 'Please enter a valid Social Security Number');
        isValid = false;
    }
    
    // Validate birth date
    const birthDate = formData.get('birthDate');
    if (!birthDate) {
        showFieldError('birthDate', 'Please enter your date of birth');
        isValid = false;
    }
    
    // Validate filing status
    const filingStatus = formData.get('filingStatus');
    if (!filingStatus) {
        showFieldError('filingStatus', 'Please select your filing status');
        isValid = false;
    }
    
    // Validate refund method
    const refundMethod = formData.get('refundMethod');
    if (!refundMethod) {
        showFieldError('refundMethod', 'Please select your refund method');
        isValid = false;
    }
    
    // Validate bank account if direct deposit selected
    if (refundMethod === 'direct') {
        const bankAccount = formData.get('bankAccount');
        const routingNumber = formData.get('routingNumber');
        
        if (!bankAccount || bankAccount.length < 4) {
            showFieldError('bankAccount', 'Please enter a valid bank account number');
            isValid = false;
        }
        
        if (!routingNumber || routingNumber.length !== 9) {
            showFieldError('routingNumber', 'Please enter a valid 9-digit routing number');
            isValid = false;
        }
    }
    
    // Validate checkboxes
    const agreeTerms = formData.get('agreeTerms');
    const electronicSignature = formData.get('electronicSignature');
    
    if (!agreeTerms) {
        showFieldError('agreeTerms', 'You must agree to the terms of service');
        isValid = false;
    }
    
    if (!electronicSignature) {
        showFieldError('electronicSignature', 'You must authorize electronic filing');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    
    // Clear previous error
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');
    
    // Validate based on field type
    switch (field.name) {
        case 'ssn':
            if (value && value.length !== 11) {
                showFieldError(field.name, 'Please enter a valid Social Security Number');
            }
            break;
        case 'birthDate':
            if (value) {
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age < 16 || age > 120) {
                    showFieldError(field.name, 'Please enter a valid date of birth');
                }
            }
            break;
        case 'bankAccount':
            if (value && value.length < 4) {
                showFieldError(field.name, 'Bank account number must be at least 4 digits');
            }
            break;
        case 'routingNumber':
            if (value && value.length !== 9) {
                showFieldError(field.name, 'Routing number must be exactly 9 digits');
            }
            break;
    }
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (field) {
        field.classList.add('error');
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.cssText = `
            color: #ef4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        errorMessage.textContent = message;
        
        field.parentNode.appendChild(errorMessage);
    }
}

function startFilingProcess() {
    const filingButton = document.getElementById('filingButton');
    
    // Disable button and show loading
    filingButton.disabled = true;
    filingButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Filing Taxes...';
    
    // Simulate filing process
    simulateFilingProcess();
}

function simulateFilingProcess() {
    const steps = document.querySelectorAll('.filing-step');
    let currentStep = 1;
    
    const processSteps = [
        { step: 2, text: 'Verifying identity...' },
        { step: 3, text: 'Performing security check...' },
        { step: 4, text: 'Submitting to IRS...' }
    ];
    
    const interval = setInterval(() => {
        if (currentStep < processSteps.length) {
            const stepData = processSteps[currentStep];
            updateFilingStep(stepData.step, stepData.text);
            currentStep++;
        } else {
            clearInterval(interval);
            completeFiling();
        }
    }, 2000);
}

function updateFilingStep(stepNumber, text) {
    // Update progress text
    const filingButton = document.getElementById('filingButton');
    filingButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    
    // Update step status
    const step = document.getElementById(`step${stepNumber}`);
    const status = step.querySelector('.step-status');
    
    step.classList.remove('pending');
    step.classList.add('active');
    status.className = 'step-status status-active';
    status.textContent = 'In Progress';
    
    // Mark previous step as completed
    if (stepNumber > 1) {
        const prevStep = document.getElementById(`step${stepNumber - 1}`);
        const prevStatus = prevStep.querySelector('.step-status');
        
        prevStep.classList.remove('active');
        prevStep.classList.add('completed');
        prevStatus.className = 'step-status status-completed';
        prevStatus.textContent = 'Completed';
    }
}

function completeFiling() {
    // Hide form and show success message
    document.getElementById('filingForm').style.display = 'none';
    document.getElementById('filingSuccess').style.display = 'block';
    
    // Generate confirmation number
    const confirmationNumber = 'TM-' + new Date().getFullYear() + '-' + Math.random().toString().substr(2, 9);
    document.getElementById('confirmationNumber').textContent = confirmationNumber;
    
    // Mark filing as completed
    localStorage.setItem('taxmind_taxes_filed', 'true');
    localStorage.setItem('taxmind_filing_date', new Date().toISOString());
    localStorage.setItem('taxmind_confirmation_number', confirmationNumber);
    
    // Update final step
    const finalStep = document.getElementById('step4');
    const finalStatus = finalStep.querySelector('.step-status');
    
    finalStep.classList.remove('active');
    finalStep.classList.add('completed');
    finalStatus.className = 'step-status status-completed';
    finalStatus.textContent = 'Completed';
    
    // Show success notification
    showNotification('Taxes filed successfully!', 'success');
    
    // Scroll to success message
    document.getElementById('filingSuccess').scrollIntoView({ behavior: 'smooth' });
}

function checkFilingStatus() {
    const taxesFiled = localStorage.getItem('taxmind_taxes_filed') === 'true';
    
    if (taxesFiled) {
        // Show already filed message
        showAlreadyFiledMessage();
    }
}

function showAlreadyFiledMessage() {
    const filingForm = document.getElementById('filingForm');
    const filingSuccess = document.getElementById('filingSuccess');
    
    filingForm.style.display = 'none';
    filingSuccess.style.display = 'block';
    
    // Update confirmation number
    const confirmationNumber = localStorage.getItem('taxmind_confirmation_number');
    if (confirmationNumber) {
        document.getElementById('confirmationNumber').textContent = confirmationNumber;
    }
    
    // Update success message
    document.querySelector('.success-title').textContent = 'Taxes Already Filed!';
    document.querySelector('.success-description').textContent = 'Your tax return has already been submitted to the IRS.';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
`;
document.head.appendChild(style);

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S for submit
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const form = document.getElementById('filingForm');
        if (form && !document.getElementById('filingButton').disabled) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});


