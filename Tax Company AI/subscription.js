// Subscription form validation and payment processing
document.addEventListener('DOMContentLoaded', function() {
    const subscriptionForm = document.getElementById('subscriptionForm');
    const selectedPlanElement = document.getElementById('selectedPlan');
    const planPriceElement = document.getElementById('planPrice');
    const planDescriptionElement = document.getElementById('planDescription');
    const businessInfoSection = document.getElementById('businessInfo');
    const completeButton = document.getElementById('completeSubscription');
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryDateInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');

    // Get selected plan from localStorage
    const selectedPlan = localStorage.getItem('selectedPlan') || 'individual';
    const planDetails = getPlanDetails(selectedPlan);

    // Update page with selected plan
    selectedPlanElement.textContent = planDetails.name;
    planPriceElement.textContent = planDetails.price;
    planDescriptionElement.textContent = planDetails.description;

    // Show business info section for business plans
    if (selectedPlan !== 'individual') {
        businessInfoSection.style.display = 'block';
    }

    // Card number formatting
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue.length > 19) {
            formattedValue = formattedValue.substring(0, 19);
        }
        e.target.value = formattedValue;
    });

    // Expiry date formatting
    expiryDateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // CVV formatting
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        if (e.target.value.length > 4) {
            e.target.value = e.target.value.substring(0, 4);
        }
    });

    // Form validation functions
    function validateCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        return /^\d{13,19}$/.test(cleaned) && luhnCheck(cleaned);
    }

    function luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    function validateExpiryDate(expiryDate) {
        const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!regex.test(expiryDate)) return false;
        
        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expYear = parseInt(year);
        const expMonth = parseInt(month);
        
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        
        return true;
    }

    function validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    function validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        document.querySelectorAll('input, select').forEach(input => {
            input.classList.remove('error');
        });

        // Validate card number
        const cardNumber = cardNumberInput.value;
        if (!cardNumber) {
            showError('cardNumber', 'Card number is required');
            isValid = false;
        } else if (!validateCardNumber(cardNumber)) {
            showError('cardNumber', 'Please enter a valid card number');
            isValid = false;
        }

        // Validate expiry date
        const expiryDate = expiryDateInput.value;
        if (!expiryDate) {
            showError('expiryDate', 'Expiry date is required');
            isValid = false;
        } else if (!validateExpiryDate(expiryDate)) {
            showError('expiryDate', 'Please enter a valid expiry date');
            isValid = false;
        }

        // Validate CVV
        const cvv = cvvInput.value;
        if (!cvv) {
            showError('cvv', 'CVV is required');
            isValid = false;
        } else if (!validateCVV(cvv)) {
            showError('cvv', 'Please enter a valid CVV');
            isValid = false;
        }

        // Validate billing address
        const billingAddress = document.getElementById('billingAddress').value;
        if (!billingAddress.trim()) {
            showError('billingAddress', 'Billing address is required');
            isValid = false;
        }

        // Validate business information for business plans
        if (selectedPlan !== 'individual') {
            const businessName = document.getElementById('businessName').value;
            const employeeCount = document.getElementById('employeeCount').value;
            const businessType = document.getElementById('businessType').value;

            if (!businessName.trim()) {
                showError('businessName', 'Business name is required');
                isValid = false;
            }

            if (!employeeCount) {
                showError('employeeCount', 'Please select employee count');
                isValid = false;
            }

            if (!businessType) {
                showError('businessType', 'Please select business type');
                isValid = false;
            }
        }

        return isValid;
    }

    function showError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function getPlanDetails(plan) {
        const plans = {
            'individual': {
                name: 'Individual Plan',
                price: '29',
                description: 'For Individuals and Households'
            },
            'small-business': {
                name: 'Small Business Plan',
                price: '79',
                description: 'For 100 employees or less'
            },
            'enterprise': {
                name: 'Enterprise Plan',
                price: '199',
                description: 'For more than 100 employees'
            }
        };
        return plans[plan] || plans['individual'];
    }

    // Form submission
    subscriptionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            completeButton.disabled = true;
            completeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Subscription...';
            
            // Simulate payment processing
            setTimeout(() => {
                const formData = new FormData(subscriptionForm);
                const trialStartDate = new Date();
                const trialEndDate = new Date(trialStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                
                const subscriptionData = {
                    plan: selectedPlan,
                    planName: planDetails.name,
                    price: planDetails.price,
                    description: planDetails.description,
                    trialStartDate: trialStartDate.toISOString(),
                    trialEndDate: trialEndDate.toISOString(),
                    paymentMethod: {
                        cardNumber: formData.get('cardNumber').replace(/\s/g, ''),
                        expiryDate: formData.get('expiryDate'),
                        cvv: formData.get('cvv'),
                        billingAddress: formData.get('billingAddress')
                    },
                    businessInfo: selectedPlan !== 'individual' ? {
                        businessName: formData.get('businessName'),
                        employeeCount: formData.get('employeeCount'),
                        businessType: formData.get('businessType')
                    } : null,
                    status: 'trial',
                    venmoAccount: 'jacksonburrow36'
                };
                
                // Store subscription data
                localStorage.setItem('subscriptionData', JSON.stringify(subscriptionData));
                localStorage.setItem('subscriptionStatus', 'trial');
                
                // Update user data with subscription info
                const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
                currentUser.subscription = subscriptionData;
                localStorage.setItem('taxmind_current_user', JSON.stringify(currentUser));
                
                // Show success message
                showSuccessMessage();
                
                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 3000);
            }, 2000);
        }
    });

    function showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 2px solid #10b981;
        `;
        
        successMessage.innerHTML = `
            <div style="color: #10b981; font-size: 4rem; margin-bottom: 1rem;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="color: #1e293b; margin-bottom: 1rem; font-size: 1.5rem;">Subscription Activated!</h3>
            <p style="color: #64748b; margin-bottom: 1.5rem; line-height: 1.6;">
                Your 30-day free trial has started. You'll be redirected to your dashboard where you can begin using TaxMind AI.
            </p>
            <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <p style="margin: 0; color: #1e40af; font-weight: 600;">
                    <i class="fas fa-calendar-alt"></i> 
                    Trial ends: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
            </div>
            <p style="color: #64748b; font-size: 0.9rem;">
                Payment will be processed via Venmo (@jacksonburrow36) after your trial period.
            </p>
        `;
        
        document.body.appendChild(successMessage);
        
        // Remove success message after redirect
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
        }, 3000);
    }

    // Real-time validation
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '' && this.hasAttribute('required')) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });

        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('error');
                const errorElement = document.getElementById(this.name + 'Error');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
        });
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Check if user is logged in
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('taxmind_logged_in');
        const currentUser = localStorage.getItem('taxmind_current_user');
        
        if (isLoggedIn !== 'true' || !currentUser) {
            // User not logged in, redirect to login
            window.location.href = 'login.html';
        }
    }

    // Initialize login check
    checkLoginStatus();
});
