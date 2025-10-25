// Dashboard functionality and user authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('taxmind_logged_in') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
    
    if (!isLoggedIn || !currentUser.email) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Update user information in dashboard
    updateUserInfo(currentUser);
    
    // Initialize dashboard features
    initializeDashboard();
    
    // Initialize subscription status
    initializeSubscriptionStatus();
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });
    
    // Quick action handlers
    setupQuickActions();
    
    // Simulate real-time updates
    startRealTimeUpdates();
});

function updateUserInfo(user) {
    // Update user name and email
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userEmail').textContent = user.email;
    
    // Update welcome message
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.firstName}!`;
    
    // Update user avatar with initials
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    document.getElementById('userAvatar').textContent = initials;
}

function initializeDashboard() {
    // Animate process steps
    animateProcessSteps();
    
    // Update stats with animation
    animateStats();
    
    // Simulate AI insights updates
    updateAIInsights();
}

function animateProcessSteps() {
    const steps = document.querySelectorAll('.process-step');
    let currentStep = 2; // Start at step 3 (Tax Calculation)
    
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed', 'pending');
        
        if (index < currentStep) {
            step.classList.add('completed');
        } else if (index === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.add('pending');
        }
    });
    
    // Simulate progress
    setInterval(() => {
        if (currentStep < steps.length - 1) {
            steps[currentStep].classList.remove('active');
            steps[currentStep].classList.add('completed');
            currentStep++;
            steps[currentStep].classList.remove('pending');
            steps[currentStep].classList.add('active');
        }
    }, 10000); // Update every 10 seconds
}

function animateStats() {
    const stats = {
        documentsProcessed: 12,
        deductionsFound: 8,
        timeSaved: 2.5,
        accuracyRate: 99.8
    };
    
    Object.keys(stats).forEach(statKey => {
        const element = document.getElementById(statKey);
        if (element) {
            const targetValue = stats[statKey];
            animateCounter(element, targetValue, statKey);
        }
    });
}

function animateCounter(element, targetValue, statKey) {
    let currentValue = 0;
    const increment = targetValue / 50;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        if (statKey === 'timeSaved') {
            element.textContent = currentValue.toFixed(1) + 'h';
        } else if (statKey === 'accuracyRate') {
            element.textContent = currentValue.toFixed(1) + '%';
        } else {
            element.textContent = Math.round(currentValue);
        }
    }, 50);
}

function updateAIInsights() {
    const insights = [
        {
            icon: 'fas fa-lightbulb',
            title: 'Additional Deductions Found',
            desc: 'AI identified 3 potential deductions worth $2,340'
        },
        {
            icon: 'fas fa-shield-check',
            title: 'Compliance Check',
            desc: 'All calculations verified against latest IRS regulations'
        },
        {
            icon: 'fas fa-chart-line',
            title: 'Tax Optimization',
            desc: 'Estimated savings of $1,200 compared to standard filing'
        }
    ];
    
    // Update insights every 30 seconds with slight variations
    setInterval(() => {
        const insightItems = document.querySelectorAll('.insight-item');
        insightItems.forEach((item, index) => {
            const insight = insights[index];
            const icon = item.querySelector('.insight-icon i');
            const title = item.querySelector('.insight-title');
            const desc = item.querySelector('.insight-desc');
            
            if (icon && title && desc) {
                icon.className = insight.icon;
                title.textContent = insight.title;
                desc.textContent = insight.desc;
            }
        });
    }, 30000);
}

function setupQuickActions() {
    // Quick actions are now handled by direct links to respective pages
    // No need for click handlers since they navigate to actual pages
}

// Simple navigation function for tabs
function navigateToPage(page) {
    console.log('Navigating to:', page);
    try {
        window.location.href = page;
    } catch (error) {
        console.error('Navigation error:', error);
        alert('Error navigating to ' + page + '. Please check if the file exists.');
    }
}

function showActionModal(title, message) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #1e293b;">${title}</h3>
        <p style="color: #64748b; margin-bottom: 2rem;">${message}</p>
        <button onclick="this.closest('.modal').remove()" style="
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        ">Close</button>
    `;
    
    modal.className = 'modal';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function simulateAIAnalysis() {
    // Show loading state
    const analysisBtn = document.getElementById('runAnalysis');
    const originalText = analysisBtn.innerHTML;
    analysisBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    analysisBtn.style.pointerEvents = 'none';
    
    // Simulate analysis
    setTimeout(() => {
        analysisBtn.innerHTML = originalText;
        analysisBtn.style.pointerEvents = 'auto';
        
        // Update insights
        updateAIInsights();
        
        // Show completion message
        showActionModal('Analysis Complete', 'AI analysis completed! Found 3 additional deductions worth $2,340.');
    }, 3000);
}

function startRealTimeUpdates() {
    // Update activity feed every 2 minutes
    setInterval(() => {
        updateActivityFeed();
    }, 120000);
    
    // Update AI status every 5 seconds
    setInterval(() => {
        updateAIStatus();
    }, 5000);
}

function updateActivityFeed() {
    const activities = [
        {
            icon: 'fas fa-file-upload',
            title: 'New Document Uploaded',
            time: 'Just now'
        },
        {
            icon: 'fas fa-search',
            title: 'AI Analysis Completed',
            time: '1 minute ago'
        },
        {
            icon: 'fas fa-lightbulb',
            title: 'New Deductions Found',
            time: '2 minutes ago'
        },
        {
            icon: 'fas fa-calculator',
            title: 'Tax Calculation Updated',
            time: '3 minutes ago'
        }
    ];
    
    const activityContainer = document.querySelector('.recent-activity');
    if (activityContainer) {
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
}

function updateAIStatus() {
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
        // Simulate occasional status changes
        if (Math.random() < 0.1) { // 10% chance
            statusDot.style.background = '#f59e0b';
            setTimeout(() => {
                statusDot.style.background = '#10b981';
            }, 2000);
        }
    }
}

function logout() {
    // Clear user session
    localStorage.removeItem('taxmind_current_user');
    localStorage.removeItem('taxmind_logged_in');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + L for logout
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        logout();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    }
});

// Add responsive navigation for mobile
function setupMobileNavigation() {
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.style.cssText = `
        display: none;
        flex-direction: column;
        cursor: pointer;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
    `;
    
    // Add hamburger styles
    const style = document.createElement('style');
    style.textContent = `
        .hamburger span {
            width: 25px;
            height: 3px;
            background: #333;
            margin: 3px 0;
            transition: 0.3s;
        }
        @media (max-width: 768px) {
            .hamburger {
                display: flex !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Show/hide on mobile
    if (window.innerWidth <= 768) {
        document.body.appendChild(hamburger);
    }
}

// Initialize mobile navigation
setupMobileNavigation();

// Subscription status management
function initializeSubscriptionStatus() {
    const subscriptionData = JSON.parse(localStorage.getItem('subscriptionData') || 'null');
    
    if (!subscriptionData) {
        // No subscription data, hide subscription card
        const subscriptionCard = document.getElementById('subscriptionStatusCard');
        if (subscriptionCard) {
            subscriptionCard.style.display = 'none';
        }
        return;
    }
    
    // Show subscription card
    const subscriptionCard = document.getElementById('subscriptionStatusCard');
    if (subscriptionCard) {
        subscriptionCard.style.display = 'block';
    }
    
    // Update subscription information
    updateSubscriptionInfo(subscriptionData);
    
    // Check subscription status
    checkSubscriptionStatus(subscriptionData);
}

function updateSubscriptionInfo(subscriptionData) {
    // Update plan information
    const currentPlanElement = document.getElementById('currentPlan');
    const planDescriptionElement = document.getElementById('planDescription');
    
    if (currentPlanElement) {
        currentPlanElement.textContent = subscriptionData.planName;
    }
    
    if (planDescriptionElement) {
        planDescriptionElement.textContent = subscriptionData.description;
    }
    
    // Update trial information
    updateTrialInfo(subscriptionData);
}

function updateTrialInfo(subscriptionData) {
    const now = new Date();
    const trialEndDate = new Date(subscriptionData.trialEndDate);
    const daysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
    
    const trialStatusElement = document.getElementById('trialStatus');
    const trialTextElement = document.getElementById('trialText');
    const daysRemainingElement = document.getElementById('daysRemaining');
    const paymentInfoElement = document.getElementById('paymentInfo');
    
    if (now >= trialEndDate) {
        // Trial expired
        if (trialStatusElement) {
            trialStatusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Trial Expired</span>';
            trialStatusElement.style.color = '#ef4444';
        }
        
        if (paymentInfoElement) {
            paymentInfoElement.style.display = 'block';
        }
        
        // Hide trial countdown
        const trialCountdownElement = document.getElementById('trialCountdown');
        if (trialCountdownElement) {
            trialCountdownElement.style.display = 'none';
        }
    } else {
        // Trial active
        if (trialStatusElement) {
            trialStatusElement.innerHTML = '<i class="fas fa-clock"></i><span>Trial Active</span>';
            trialStatusElement.style.color = '#10b981';
        }
        
        if (daysRemainingElement) {
            daysRemainingElement.textContent = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
        }
        
        if (paymentInfoElement) {
            paymentInfoElement.style.display = 'none';
        }
        
        // Show warning if trial expires soon
        if (daysRemaining <= 3) {
            showTrialExpirationWarning(daysRemaining);
        }
    }
}

function checkSubscriptionStatus(subscriptionData) {
    const status = subscriptionData.status || 'trial';
    
    switch (status) {
        case 'trial':
            // Trial is active, no action needed
            break;
        case 'payment_pending':
            showPaymentPendingNotification();
            break;
        case 'payment_failed':
            showPaymentFailedNotification();
            break;
        case 'active':
            showActiveSubscriptionStatus();
            break;
        default:
            console.log('Unknown subscription status:', status);
    }
}

function showTrialExpirationWarning(daysRemaining) {
    const warningMessage = `Your free trial expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Payment will be processed via Venmo (@jacksonburrow36).`;
    
    showNotification({
        title: 'Trial Expiring Soon',
        message: warningMessage,
        type: 'warning',
        duration: 10000
    });
}

function showPaymentPendingNotification() {
    showNotification({
        title: 'Payment Pending',
        message: 'Your payment request has been sent to Venmo. Please complete the payment to continue using TaxMind AI.',
        type: 'info',
        duration: 15000
    });
}

function showPaymentFailedNotification() {
    showNotification({
        title: 'Payment Failed',
        message: 'Payment processing failed. Please try again or contact support.',
        type: 'error',
        duration: 20000
    });
}

function showActiveSubscriptionStatus() {
    // Hide payment info and show active status
    const paymentInfoElement = document.getElementById('paymentInfo');
    if (paymentInfoElement) {
        paymentInfoElement.style.display = 'none';
    }
    
    const trialStatusElement = document.getElementById('trialStatus');
    if (trialStatusElement) {
        trialStatusElement.innerHTML = '<i class="fas fa-check-circle"></i><span>Active Subscription</span>';
        trialStatusElement.style.color = '#10b981';
    }
}

function showNotification(notification) {
    const notificationEl = document.createElement('div');
    notificationEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        border-left: 4px solid ${getNotificationColor(notification.type)};
    `;

    notificationEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fas fa-${getNotificationIcon(notification.type)}" style="color: ${getNotificationColor(notification.type)};"></i>
            <strong>${notification.title}</strong>
        </div>
        <p style="margin: 0; color: #64748b; font-size: 0.9rem;">${notification.message}</p>
    `;

    document.body.appendChild(notificationEl);

    // Auto-remove notification
    setTimeout(() => {
        if (notificationEl.parentNode) {
            notificationEl.parentNode.removeChild(notificationEl);
        }
    }, notification.duration || 5000);
}

function getNotificationColor(type) {
    const colors = {
        'info': '#2563eb',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'success': '#10b981'
    };
    return colors[type] || colors['info'];
}

function getNotificationIcon(type) {
    const icons = {
        'info': 'info-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle',
        'success': 'check-circle'
    };
    return icons[type] || icons['info'];
}

