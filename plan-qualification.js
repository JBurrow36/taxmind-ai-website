// Plan Qualification Logic

document.addEventListener('DOMContentLoaded', function() {
    initializePlanQualification();
});

function initializePlanQualification() {
    const form = document.getElementById('qualificationForm');
    
    // Format revenue input
    const revenueInput = document.getElementById('companyRevenue');
    revenueInput.addEventListener('input', function() {
        formatCurrencyInput(this);
    });
    
    // Format EIN input
    const einInput = document.getElementById('ein');
    if (einInput) {
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
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateQualificationForm()) {
            determinePlan();
        }
    });
    
    // Get selected plan from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPlan = urlParams.get('plan');
    if (selectedPlan) {
        // Pre-select and show qualification
        document.getElementById('businessStructure').value = 'llc'; // Default
        determinePlan();
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

// Validate qualification form
function validateQualificationForm() {
    const form = document.getElementById('qualificationForm');
    const formData = new FormData(form);
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Validate company name
    const companyName = formData.get('companyName');
    if (!companyName || companyName.trim().length < 2) {
        showFieldError('companyName', 'Company name is required');
        isValid = false;
    }
    
    // Validate revenue
    const revenue = formData.get('companyRevenue');
    const revenueValue = parseFloat(revenue.replace(/[^0-9.]/g, ''));
    if (!revenue || isNaN(revenueValue) || revenueValue < 0) {
        showFieldError('companyRevenue', 'Please enter a valid revenue amount');
        isValid = false;
    }
    
    // Validate number of employees
    const numEmployees = parseInt(formData.get('numberOfEmployees') || '0');
    if (numEmployees < 0) {
        showFieldError('numberOfEmployees', 'Number of employees must be 0 or greater');
        isValid = false;
    }
    
    // Validate business structure
    const businessStructure = formData.get('businessStructure');
    if (!businessStructure) {
        showFieldError('businessStructure', 'Please select a business structure');
        isValid = false;
    }
    
    // Validate email
    const email = formData.get('contactEmail');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
        showFieldError('contactEmail', 'Please enter a valid email address');
        isValid = false;
    }
    
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

// Determine recommended plan based on qualification
function determinePlan() {
    const form = document.getElementById('qualificationForm');
    const formData = new FormData(form);
    
    const revenue = parseFloat(formData.get('companyRevenue').replace(/[^0-9.]/g, ''));
    const numEmployees = parseInt(formData.get('numberOfEmployees') || '0');
    
    // Plan qualification logic
    // Small Business: < $1M revenue AND < 10 employees
    // Enterprise: >= $1M revenue OR >= 10 employees
    
    let recommendedPlan;
    let planDescription;
    
    if (revenue >= 1000000 || numEmployees >= 10) {
        recommendedPlan = 'Enterprise';
        planDescription = 'Based on your revenue and employee count, the Enterprise plan is recommended. This plan includes advanced features, priority support, and unlimited document processing.';
    } else {
        recommendedPlan = 'Small Business';
        planDescription = 'Based on your revenue and employee count, the Small Business plan is recommended. This plan includes all essential features for small businesses.';
    }
    
    // Display result
    const resultDiv = document.getElementById('qualificationResult');
    const planDiv = document.getElementById('recommendedPlan');
    const descriptionDiv = document.getElementById('planDescription');
    const continueButton = document.getElementById('continueButton');
    
    planDiv.textContent = recommendedPlan;
    descriptionDiv.textContent = planDescription;
    
    // Store qualification data
    const qualificationData = {
        companyName: formData.get('companyName'),
        revenue: revenue,
        numEmployees: numEmployees,
        businessStructure: formData.get('businessStructure'),
        industryType: formData.get('industryType'),
        contactEmail: formData.get('contactEmail'),
        recommendedPlan: recommendedPlan,
        qualifiedAt: new Date().toISOString()
    };
    
    localStorage.setItem('taxmind_plan_qualification', JSON.stringify(qualificationData));
    
    // Set continue button URL
    const planParam = recommendedPlan.toLowerCase().replace(' ', '_');
    
    // Check if there's a partial signup to complete
    const partialSignup = localStorage.getItem('taxmind_partial_signup');
    if (partialSignup) {
        // Complete the signup after qualification
        continueButton.href = '#';
        continueButton.onclick = function(e) {
            e.preventDefault();
            completeSignupAfterQualification(qualificationData);
        };
    } else {
        continueButton.href = `subscription.html?plan=${planParam}&qualified=true`;
        continueButton.onclick = null;
    }
    
    // Show result
    resultDiv.classList.add('active');
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Complete signup after qualification (if user came from signup page)
function completeSignupAfterQualification(qualificationData) {
    const partialSignup = JSON.parse(localStorage.getItem('taxmind_partial_signup') || '{}');
    
    if (!partialSignup.email) {
        // No partial signup, just redirect to subscription
        window.location.href = `subscription.html?plan=${qualificationData.recommendedPlan.toLowerCase().replace(' ', '_')}&qualified=true`;
        return;
    }
    
    // Complete the signup process
    // Note: This would normally call the actual signup function
    // For now, we'll store the qualification and redirect to signup completion
    localStorage.setItem('taxmind_complete_signup_after_qualification', 'true');
    
    // Redirect back to signup to complete the process
    // In a real implementation, you'd complete the signup here
    alert('Plan qualification complete! Please complete your account creation.');
    window.location.href = `signup.html?qualified=true&plan=${qualificationData.recommendedPlan.toLowerCase().replace(' ', '_')}`;
}

