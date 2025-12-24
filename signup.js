// Email notification function for new signups
async function sendSignupNotification(userData) {
    const notificationEmail = 'tax-mind@outlook.com';
    
    // Check if EmailJS is configured and enabled
    if (window.EmailConfig && window.EmailConfig.enabled && 
        window.EmailConfig.publicKey && 
        window.EmailConfig.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY_HERE') {
        
        // Try EmailJS first (if configured)
        if (typeof emailjs !== 'undefined') {
            try {
                // Get additional info for security monitoring
                const additionalInfo = {
                    userAgent: navigator.userAgent,
                    ip: 'Unknown',
                    timestamp: new Date().toISOString(),
                    referrer: document.referrer || 'Direct'
                };
                
                // Get template parameters
                const templateParams = window.EmailConfig.getTemplateParams(userData, additionalInfo);
                
                // Send email using EmailJS
                const response = await emailjs.send(
                    window.EmailConfig.serviceId,
                    window.EmailConfig.templateId,
                    templateParams
                );
                
                console.log('✅ Signup notification email sent successfully via EmailJS', response);
                return { success: true, message: 'Notification sent successfully', method: 'EmailJS' };
                
            } catch (error) {
                console.error('⚠️ EmailJS failed, using fallback method:', error);
                // Fall through to fallback method
            }
        }
    }
    
    // Fallback: Create mailto link and show notification details
    try {
        const signupDetails = formatSignupDetailsForEmail(userData);
        showEmailFallbackNotification(signupDetails, notificationEmail);
        
        // Also log to console for manual review
        console.log('📧 SIGNUP NOTIFICATION (Manual Review Required)');
        console.log('═══════════════════════════════════════');
        console.log(`To: ${notificationEmail}`);
        console.log(`Subject: New TaxMind AI Signup - ${userData.email}`);
        console.log('Body:', signupDetails);
        console.log('═══════════════════════════════════════');
        console.log('💡 Tip: Set up EmailJS to receive automatic email notifications');
        console.log('   See: EMAIL_SETUP_INSTRUCTIONS.md or email-config.js for setup');
        
        return { 
            success: true, 
            message: 'Signup details logged (EmailJS not configured - see console)', 
            method: 'fallback',
            details: signupDetails
        };
        
    } catch (error) {
        console.error('Failed to create email notification:', error);
        return { success: false, message: 'Failed to send notification' };
    }
}

// Format signup details for email
function formatSignupDetailsForEmail(userData) {
    const timestamp = new Date(userData.signupDate).toLocaleString();
    
    return `🚨 NEW SIGNUP DETECTED 🚨

A new user has signed up for TaxMind AI. Please review this signup to ensure it's legitimate and not a bot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email Address: ${userData.email}
Full Name: ${userData.firstName} ${userData.lastName}
Account Type: ${userData.accountType}
Signup Date: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Browser: ${navigator.userAgent}
Referrer: ${document.referrer || 'Direct'}
Timestamp: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ACTION REQUIRED: Review this signup for potential bot activity or suspicious behavior.

TaxMind AI Security System`;
}

// Show fallback notification with email details
function showEmailFallbackNotification(emailBody, recipientEmail) {
    // Create a notification banner
    const notification = document.createElement('div');
    notification.id = 'emailFallbackNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
            <div style="font-size: 2rem;">📧</div>
            <div style="flex: 1;">
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">Email Notification</h3>
                <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
                    EmailJS not configured. Signup details logged to console. 
                    <a href="mailto:${recipientEmail}?subject=New TaxMind AI Signup - ${document.querySelector('#email')?.value || 'User'}&body=${encodeURIComponent(emailBody)}" 
                       style="color: white; text-decoration: underline; font-weight: 600;">
                        Click to send manually
                    </a>
                </p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; 
                           width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
                           font-size: 1.2rem; line-height: 1; padding: 0;">
                ×
            </button>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 8px; 
                    font-size: 0.85rem; margin-top: 0.5rem;">
            <strong>💡 Setup EmailJS:</strong> See <code style="background: rgba(0,0,0,0.2); 
            padding: 2px 6px; border-radius: 4px;">EMAIL_SETUP_INSTRUCTIONS.md</code> 
            for automatic email notifications.
        </div>
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 10000);
}

// Signup form validation and handling
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkExistingAccount();
    
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const emailInput = document.getElementById('email');
    const signupButton = document.getElementById('signupButton');
    const successMessage = document.getElementById('successMessage');

    // Password strength checker
    function checkPasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrength');
        const strengthFill = strengthBar.querySelector('.strength-fill');
        
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        strengthBar.className = 'password-strength';
        strengthFill.style.width = '0%';

        if (score < 2) {
            strengthBar.classList.add('strength-weak');
        } else if (score < 4) {
            strengthBar.classList.add('strength-medium');
        } else {
            strengthBar.classList.add('strength-strong');
        }
    }

    // Real-time password strength checking
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });

    // Form validation
    function validateForm() {
        let isValid = true;
        const formData = new FormData(signupForm);
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        document.querySelectorAll('input, select').forEach(input => {
            input.classList.remove('error');
        });

        // Validate first name
        const firstName = formData.get('firstName');
        if (!firstName || firstName.trim().length < 2) {
            showError('firstName', 'First name must be at least 2 characters');
            isValid = false;
        }

        // Validate last name
        const lastName = formData.get('lastName');
        if (!lastName || lastName.trim().length < 2) {
            showError('lastName', 'Last name must be at least 2 characters');
            isValid = false;
        }

        // Validate email
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        // Email security check removed - duplicate emails are now allowed

        // Validate password
        const password = formData.get('password');
        if (!password || password.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            showError('password', 'Password must contain uppercase, lowercase, and number');
            isValid = false;
        }

        // Validate confirm password
        const confirmPassword = formData.get('confirmPassword');
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        // Validate account type
        const accountType = formData.get('accountType');
        if (!accountType) {
            showError('accountType', 'Please select an account type');
            isValid = false;
        } else if (accountType === 'business' || accountType === 'enterprise') {
            // Redirect to plan qualification form for business/enterprise accounts
            // Store partial signup data for after qualification
            const partialSignup = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                newsletter: formData.get('newsletter'),
                accountType: accountType
            };
            localStorage.setItem('taxmind_partial_signup', JSON.stringify(partialSignup));
            window.location.href = `plan-qualification.html?plan=${accountType}`;
            return false; // Prevent form submission
        }

        // Validate terms agreement
        const terms = formData.get('terms');
        if (!terms) {
            showError('terms', 'You must agree to the terms and conditions');
            isValid = false;
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

    // Form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const validationResult = validateForm();
        if (validationResult === false) {
            // Validation failed (including duplicate email), stop here
            return;
        }
        
        if (validationResult === true) {
            // Show loading state
            signupButton.disabled = true;
            signupButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            
            // Simulate API call
            setTimeout(() => {
                const formData = new FormData(signupForm);
                
                // Check if this is an OAuth signup
                const oauthData = sessionStorage.getItem('oauth_user_data');
                let oauthProvider = null;
                let oauthProviderId = null;
                let oauthPicture = null;
                
                if (oauthData) {
                    try {
                        const oauth = JSON.parse(oauthData);
                        oauthProvider = oauth.provider;
                        oauthProviderId = oauth.providerId;
                        oauthPicture = oauth.picture;
                        // Clear OAuth data from session
                        sessionStorage.removeItem('oauth_user_data');
                    } catch (error) {
                        console.error('Error parsing OAuth data:', error);
                    }
                }
                
                const userData = {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    accountType: formData.get('accountType'),
                    newsletter: formData.get('newsletter') === 'on',
                    signupDate: new Date().toISOString(),
                    oauthProvider: oauthProvider,
                    providerId: oauthProviderId,
                    picture: oauthPicture
                };
                
                // Store user in localStorage (simulate database)
                const users = JSON.parse(localStorage.getItem('taxmind_users') || '{}');
                users[userData.email] = userData;
                localStorage.setItem('taxmind_users', JSON.stringify(users));
                
                // Auto-login the user
                localStorage.setItem('taxmind_current_user', JSON.stringify(userData));
                localStorage.setItem('taxmind_logged_in', 'true');
                
                // Send email notification to tax-mind@outlook.com
                sendSignupNotification(userData).then(result => {
                    if (result.success) {
                        if (result.method === 'EmailJS') {
                            console.log('✅ Signup notification email sent to tax-mind@outlook.com via EmailJS');
                        } else {
                            console.log('📧 Signup notification details logged. EmailJS not configured - see console for details.');
                        }
                    } else {
                        console.warn('⚠️ Failed to send signup notification:', result.message);
                        // Signup still succeeds even if email fails
                    }
                });
                
                // Show success message
                successMessage.style.display = 'block';
                signupForm.style.display = 'none';
                
                // Redirect to subscription page
                setTimeout(() => {
                    window.location.href = 'subscription.html';
                }, 2000);
            }, 2000);
        }
    });

    // Real-time validation
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
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

    // Email validation on blur
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            showError('email', 'Please enter a valid email address');
        }
        // Email security check removed - duplicate emails are now allowed
    });

    // Password confirmation validation
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        if (this.value && password !== this.value) {
            showError('confirmPassword', 'Passwords do not match');
        } else if (this.value && password === this.value) {
            this.classList.remove('error');
            document.getElementById('confirmPasswordError').style.display = 'none';
        }
    });

    // Mobile menu toggle (reuse from main script)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Social buttons are now handled by oauth-handler.js
    // OAuth authentication for Google and Microsoft is implemented there

    // Add focus effects to form elements
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        element.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Email security check functions removed - duplicate emails are now allowed
    // (checkEmailExists and showEmailExistsMessage functions removed)

    // Check if user already has an account
    function checkExistingAccount() {
        const isLoggedIn = localStorage.getItem('taxmind_logged_in');
        const currentUser = localStorage.getItem('taxmind_current_user');
        
        if (isLoggedIn === 'true' && currentUser) {
            // User is already logged in, show message and redirect option
            showExistingAccountMessage();
        }
    }

    function showExistingAccountMessage() {
        // Hide the signup form
        const signupForm = document.getElementById('signupForm');
        const successMessage = document.getElementById('successMessage');
        
        if (signupForm) {
            signupForm.style.display = 'none';
        }
        
        if (successMessage) {
            successMessage.style.display = 'none';
        }
        
        // Create existing account message
        const existingAccountMessage = document.createElement('div');
        existingAccountMessage.className = 'existing-account-message';
        existingAccountMessage.style.cssText = `
            background: #f0f9ff;
            border: 2px solid #2563eb;
            border-radius: 12px;
            padding: 3rem;
            text-align: center;
            margin: 2rem 0;
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
        `;
        
        existingAccountMessage.innerHTML = `
            <div style="color: #2563eb; font-size: 4rem; margin-bottom: 1rem;">
                <i class="fas fa-user-check"></i>
            </div>
            <h2 style="color: #1e293b; margin-bottom: 1rem; font-size: 1.8rem;">Account Already Exists</h2>
            <p style="color: #64748b; margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6;">
                You already have a TaxMind AI account. Please log in to access your dashboard and continue using our services.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="login.html" style="
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(37, 99, 235, 0.3)'" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <i class="fas fa-sign-in-alt"></i>
                    Go to Login
                </a>
                <a href="dashboard.html" style="
                    background: transparent;
                    color: #2563eb;
                    padding: 1rem 2rem;
                    border: 2px solid #2563eb;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#2563eb'; this.style.color='white'" 
                   onmouseout="this.style.background='transparent'; this.style.color='#2563eb'">
                    <i class="fas fa-tachometer-alt"></i>
                    Go to Dashboard
                </a>
            </div>
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(37, 99, 235, 0.1); border-radius: 8px;">
                <p style="margin: 0; color: #1e40af; font-size: 0.9rem;">
                    <i class="fas fa-info-circle"></i>
                    If you're having trouble accessing your account, please contact our support team.
                </p>
            </div>
        `;
        
        // Insert the message after the signup header
        const signupHeader = document.querySelector('.signup-header');
        if (signupHeader) {
            signupHeader.parentNode.insertBefore(existingAccountMessage, signupHeader.nextSibling);
        } else {
            // Fallback: insert at the beginning of the signup card
            const signupCard = document.querySelector('.signup-card');
            if (signupCard) {
                signupCard.insertBefore(existingAccountMessage, signupCard.firstChild);
            }
        }
    }
});
