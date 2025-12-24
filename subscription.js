// Subscription form - Access Code Only (Payment functionality removed - can be restored later)
document.addEventListener('DOMContentLoaded', function() {
    const subscriptionForm = document.getElementById('subscriptionForm');
    const accessCodeInput = document.getElementById('accessCode');
    const applyAccessCodeButton = document.getElementById('applyAccessCode');
    const accessCodeFeedback = document.getElementById('accessCodeFeedback');
    const completeButton = document.getElementById('completeSubscription');
    
    let accessCodeUnlocked = false;
    let appliedAccessCode = null;

    // Access code handling
    if (applyAccessCodeButton && accessCodeInput) {
        applyAccessCodeButton.addEventListener('click', handleAccessCode);
        accessCodeInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAccessCode();
            } else if (accessCodeUnlocked && !this.value.trim()) {
                resetAccessCodeState();
            }
        });
    }

    function handleAccessCode() {
        if (!accessCodeInput) return;

        const enteredCode = (accessCodeInput.value || '').trim().toUpperCase();

        if (!enteredCode) {
            resetAccessCodeState(true);
            return;
        }

        // Valid access codes: SAAS and CONRAD
        const validAccessCodes = ['SAAS', 'CONRAD'];
        
        if (validAccessCodes.includes(enteredCode)) {
            appliedAccessCode = enteredCode;
            activateAccessCodeState();
        } else {
            showAccessCodeError('Invalid access code. Please check and try again.');
        }
    }

    function activateAccessCodeState() {
        accessCodeUnlocked = true;

        if (accessCodeFeedback) {
            accessCodeFeedback.className = 'promo-feedback success';
            accessCodeFeedback.innerHTML = '<i class="fas fa-check-circle"></i> Access code accepted. Click "Activate Access" to continue.';
        }

        if (applyAccessCodeButton) {
            applyAccessCodeButton.disabled = true;
            applyAccessCodeButton.innerHTML = '<i class="fas fa-key"></i> Applied';
        }

        if (accessCodeInput) {
            accessCodeInput.disabled = true;
        }

        if (completeButton) {
            completeButton.style.display = 'flex';
        }
    }

    function resetAccessCodeState(fromEmptyInput = false) {
        if (!accessCodeUnlocked && !fromEmptyInput) return;

        accessCodeUnlocked = false;
        appliedAccessCode = null;

        if (accessCodeFeedback) {
            if (fromEmptyInput) {
                accessCodeFeedback.className = 'promo-feedback';
                accessCodeFeedback.textContent = '';
            } else {
                accessCodeFeedback.className = 'promo-feedback error';
                accessCodeFeedback.innerHTML = '<i class="fas fa-info-circle"></i> Access code removed.';
            }
        }

        if (applyAccessCodeButton) {
            applyAccessCodeButton.disabled = false;
            applyAccessCodeButton.innerHTML = '<i class="fas fa-key"></i> Activate';
        }

        if (accessCodeInput) {
            accessCodeInput.disabled = false;
        }

        if (completeButton) {
            completeButton.style.display = 'none';
        }
    }

    function showAccessCodeError(message) {
        accessCodeUnlocked = false;
        if (accessCodeFeedback) {
            accessCodeFeedback.className = 'promo-feedback error';
            accessCodeFeedback.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        }
    }

    // Form submission
    subscriptionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!accessCodeUnlocked) {
            showAccessCodeError('Please enter a valid access code to continue.');
            return;
        }
        
        completeButton.disabled = true;
        completeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Activating Access...';
        
        // Simulate activation processing
        setTimeout(() => {
            const subscriptionData = {
                plan: 'access-code',
                planName: 'Access Code Plan',
                price: '0',
                description: 'Full access via access code',
                startDate: new Date().toISOString(),
                paymentMethod: null,
                businessInfo: null,
                status: 'active',
                venmoAccounts: [],
                accessCodeApplied: true,
                accessCode: appliedAccessCode
            };
            
            // Store subscription data
            localStorage.setItem('subscriptionData', JSON.stringify(subscriptionData));
            localStorage.setItem('subscriptionStatus', 'active');
            
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
        }, 1500);
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
            <h3 style="color: #1e293b; margin-bottom: 1rem; font-size: 1.5rem;">Access Activated!</h3>
            <p style="color: #64748b; margin-bottom: 1.5rem; line-height: 1.6;">
                Your access has been activated. You'll be redirected to your dashboard where you can begin using TaxMind AI immediately.
            </p>
            <div style="background: #ecfdf5; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <p style="margin: 0; color: #047857; font-weight: 600;">
                    <i class="fas fa-key"></i> Access code ${appliedAccessCode || 'APPLIED'} activated. Full access granted.
                </p>
            </div>
        `;
        
        document.body.appendChild(successMessage);
        
        // Remove success message after redirect
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
        }, 3000);
    }

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
