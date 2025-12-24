// Venmo Payment Processor for TaxMind AI
class VenmoPaymentProcessor {
    constructor() {
        this.venmoAccounts = {
            partner1: 'jacksonburrow36',
            partner2: 'Sidney-Allison'
        };
        this.apiEndpoint = 'https://api.venmo.com/v1/payments';
        this.webhookEndpoint = '/api/venmo-webhook';
    }

    /**
     * Process payment request for subscription (50/50 split between partners)
     * @param {Object} subscriptionData - User subscription information
     * @returns {Promise<Object>} Payment processing result
     */
    async processPayment(subscriptionData) {
        try {
            const totalAmount = parseFloat(subscriptionData.price);
            const splitAmount = totalAmount / 2; // 50/50 split
            
            const subscriptionId = this.generateSubscriptionId();
            
            // Create payment requests for both partners
            const paymentRequests = [
                {
                    amount: splitAmount,
                    note: `TaxMind AI ${subscriptionData.planName} - Split Payment (Part 1 of 2)`,
                    audience: 'private',
                    recipient: this.venmoAccounts.partner1,
                    metadata: {
                        subscriptionId: subscriptionId,
                        planType: subscriptionData.plan,
                        trialEndDate: subscriptionData.trialEndDate,
                        userId: this.getCurrentUserId(),
                        splitPayment: true,
                        part: '1 of 2'
                    }
                },
                {
                    amount: splitAmount,
                    note: `TaxMind AI ${subscriptionData.planName} - Split Payment (Part 2 of 2)`,
                    audience: 'private',
                    recipient: this.venmoAccounts.partner2,
                    metadata: {
                        subscriptionId: subscriptionId,
                        planType: subscriptionData.plan,
                        trialEndDate: subscriptionData.trialEndDate,
                        userId: this.getCurrentUserId(),
                        splitPayment: true,
                        part: '2 of 2'
                    }
                }
            ];

            // In a real implementation, this would integrate with Venmo's API
            // For now, we'll simulate the payment requests
            return await this.simulateSplitPaymentRequest(paymentRequests, totalAmount);
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: 'Payment processing failed. Please try again.',
                errorCode: 'PAYMENT_FAILED'
            };
        }
    }

    /**
     * Simulate split Venmo payment request (50/50 between partners)
     * @param {Array} paymentRequests - Array of payment requests
     * @param {number} totalAmount - Total amount being split
     * @returns {Promise<Object>} Simulated payment result
     */
    simulateSplitPaymentRequest(paymentRequests, totalAmount) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const timestamp = Date.now();
                // Simulate successful payment requests for both partners
                resolve({
                    success: true,
                    paymentId: 'venmo_' + timestamp,
                    transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
                    amount: totalAmount,
                    splitPayments: [
                        {
                            recipient: this.venmoAccounts.partner1,
                            amount: paymentRequests[0].amount,
                            status: 'pending',
                            venmoLink: `https://venmo.com/u/${this.venmoAccounts.partner1}`,
                            part: '1 of 2'
                        },
                        {
                            recipient: this.venmoAccounts.partner2,
                            amount: paymentRequests[1].amount,
                            status: 'pending',
                            venmoLink: `https://venmo.com/u/${this.venmoAccounts.partner2}`,
                            part: '2 of 2'
                        }
                    ],
                    message: `Split payment requests sent to @${this.venmoAccounts.partner1} and @${this.venmoAccounts.partner2}`,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
                });
            }, 1500);
        });
    }

    /**
     * Simulate Venmo payment request (for demo purposes)
     * @param {Object} paymentRequest - Payment request data
     * @returns {Promise<Object>} Simulated payment result
     */
    simulatePaymentRequest(paymentRequest) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate successful payment request
                resolve({
                    success: true,
                    paymentId: 'venmo_' + Date.now(),
                    transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
                    amount: paymentRequest.amount,
                    status: 'pending',
                    message: `Payment request sent to @${paymentRequest.recipient}`,
                    venmoLink: `https://venmo.com/u/${paymentRequest.recipient}`,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
                });
            }, 1500);
        });
    }

    /**
     * Check payment status
     * @param {string} paymentId - Payment ID to check
     * @returns {Promise<Object>} Payment status
     */
    async checkPaymentStatus(paymentId) {
        try {
            // Simulate API call to check payment status
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        paymentId: paymentId,
                        status: 'completed',
                        completedAt: new Date().toISOString()
                    });
                }, 1000);
            });
        } catch (error) {
            return {
                success: false,
                error: 'Failed to check payment status'
            };
        }
    }

    /**
     * Send payment reminder
     * @param {Object} subscriptionData - Subscription data
     * @returns {Promise<Object>} Reminder result
     */
    async sendPaymentReminder(subscriptionData) {
        try {
            const totalAmount = parseFloat(subscriptionData.price);
            const splitAmount = totalAmount / 2;
            
            const reminderRequests = [
                {
                    amount: splitAmount,
                    note: `TaxMind AI Payment Reminder - ${subscriptionData.planName} (Part 1 of 2)`,
                    recipient: this.venmoAccounts.partner1,
                    metadata: {
                        type: 'payment_reminder',
                        subscriptionId: subscriptionData.subscriptionId,
                        daysRemaining: this.calculateDaysRemaining(subscriptionData.trialEndDate)
                    }
                },
                {
                    amount: splitAmount,
                    note: `TaxMind AI Payment Reminder - ${subscriptionData.planName} (Part 2 of 2)`,
                    recipient: this.venmoAccounts.partner2,
                    metadata: {
                        type: 'payment_reminder',
                        subscriptionId: subscriptionData.subscriptionId,
                        daysRemaining: this.calculateDaysRemaining(subscriptionData.trialEndDate)
                    }
                }
            ];

            return await this.simulateSplitPaymentRequest(reminderRequests, totalAmount);
        } catch (error) {
            return {
                success: false,
                error: 'Failed to send payment reminder'
            };
        }
    }

    /**
     * Handle payment webhook (for real implementation)
     * @param {Object} webhookData - Webhook payload
     * @returns {Object} Processing result
     */
    handlePaymentWebhook(webhookData) {
        try {
            // Verify webhook signature (in real implementation)
            // Process payment confirmation
            // Update subscription status
            
            return {
                success: true,
                processed: true,
                subscriptionId: webhookData.metadata?.subscriptionId,
                paymentId: webhookData.paymentId
            };
        } catch (error) {
            return {
                success: false,
                error: 'Webhook processing failed'
            };
        }
    }

    /**
     * Generate unique subscription ID
     * @returns {string} Subscription ID
     */
    generateSubscriptionId() {
        return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get current user ID from localStorage
     * @returns {string} User ID
     */
    getCurrentUserId() {
        const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
        return currentUser.email || 'unknown';
    }

    /**
     * Calculate days remaining in trial
     * @param {string} trialEndDate - Trial end date
     * @returns {number} Days remaining
     */
    calculateDaysRemaining(trialEndDate) {
        const endDate = new Date(trialEndDate);
        const now = new Date();
        const diffTime = endDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Format payment amount for display
     * @param {number} amount - Payment amount
     * @returns {string} Formatted amount
     */
    formatAmount(amount) {
        return `$${amount.toFixed(2)}`;
    }

    /**
     * Create payment notification
     * @param {Object} paymentData - Payment data
     * @returns {Object} Notification data
     */
    createPaymentNotification(paymentData) {
        if (paymentData.splitPayments) {
            // Split payment notification
            return {
                title: 'Split Payment Requests Sent',
                message: `Split payment requests for ${this.formatAmount(paymentData.amount)} have been sent to @${this.venmoAccounts.partner1} and @${this.venmoAccounts.partner2}. Please complete both payments (50/50 split).`,
                type: 'info',
                splitPayments: paymentData.splitPayments,
                actions: [
                    {
                        text: `Pay @${this.venmoAccounts.partner1}`,
                        url: paymentData.splitPayments[0].venmoLink,
                        amount: this.formatAmount(paymentData.splitPayments[0].amount)
                    },
                    {
                        text: `Pay @${this.venmoAccounts.partner2}`,
                        url: paymentData.splitPayments[1].venmoLink,
                        amount: this.formatAmount(paymentData.splitPayments[1].amount)
                    }
                ]
            };
        } else {
            // Single payment notification (fallback)
            return {
                title: 'Payment Request Sent',
                message: `A payment request for ${this.formatAmount(paymentData.amount)} has been sent.`,
                type: 'info',
                action: {
                    text: 'View on Venmo',
                    url: paymentData.venmoLink
                }
            };
        }
    }
}

// Subscription Manager for handling trial periods and payments
class SubscriptionManager {
    constructor() {
        this.paymentProcessor = new VenmoPaymentProcessor();
        this.checkInterval = null;
    }

    /**
     * Initialize subscription management
     */
    initialize() {
        this.checkTrialStatus();
        this.startPeriodicCheck();
    }

    /**
     * Check current trial status
     */
    checkTrialStatus() {
        const subscriptionData = JSON.parse(localStorage.getItem('subscriptionData') || 'null');
        
        if (!subscriptionData) return;
        if (subscriptionData.promoApplied) return;

        const now = new Date();
        const trialEndDate = new Date(subscriptionData.trialEndDate);
        const daysRemaining = this.paymentProcessor.calculateDaysRemaining(subscriptionData.trialEndDate);

        if (now >= trialEndDate) {
            this.handleTrialExpired(subscriptionData);
        } else if (daysRemaining <= 3) {
            this.sendTrialExpirationWarning(subscriptionData, daysRemaining);
        }
    }

    /**
     * Handle trial expiration
     * @param {Object} subscriptionData - Subscription data
     */
    async handleTrialExpired(subscriptionData) {
        try {
            // Send payment request
            const paymentResult = await this.paymentProcessor.processPayment(subscriptionData);
            
            if (paymentResult.success) {
                this.updateSubscriptionStatus('payment_pending');
                this.showPaymentNotification(paymentResult);
            } else {
                this.updateSubscriptionStatus('payment_failed');
                this.showPaymentError(paymentResult.error);
            }
        } catch (error) {
            console.error('Trial expiration handling error:', error);
            this.updateSubscriptionStatus('error');
        }
    }

    /**
     * Send trial expiration warning
     * @param {Object} subscriptionData - Subscription data
     * @param {number} daysRemaining - Days remaining in trial
     */
    sendTrialExpirationWarning(subscriptionData, daysRemaining) {
        const warningMessage = `Your free trial expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Payment will be split via Venmo (@${this.paymentProcessor.venmoAccounts.partner1} and @${this.paymentProcessor.venmoAccounts.partner2}).`;
        
        this.showNotification({
            title: 'Trial Expiring Soon',
            message: warningMessage,
            type: 'warning',
            duration: 10000
        });
    }

    /**
     * Update subscription status
     * @param {string} status - New status
     */
    updateSubscriptionStatus(status) {
        const subscriptionData = JSON.parse(localStorage.getItem('subscriptionData') || '{}');
        subscriptionData.status = status;
        subscriptionData.lastUpdated = new Date().toISOString();
        
        localStorage.setItem('subscriptionData', JSON.stringify(subscriptionData));
        localStorage.setItem('subscriptionStatus', status);
    }

    /**
     * Show payment notification
     * @param {Object} paymentResult - Payment result
     */
    showPaymentNotification(paymentResult) {
        const notification = this.paymentProcessor.createPaymentNotification(paymentResult);
        this.showNotification(notification);
    }

    /**
     * Show payment error
     * @param {string} error - Error message
     */
    showPaymentError(error) {
        this.showNotification({
            title: 'Payment Error',
            message: error,
            type: 'error',
            duration: 15000
        });
    }

    /**
     * Show notification
     * @param {Object} notification - Notification data
     */
    showNotification(notification) {
        // Create notification element
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
            max-width: 500px;
            border-left: 4px solid ${this.getNotificationColor(notification.type)};
        `;

        let actionsHTML = '';
        
        // Handle multiple actions for split payments
        if (notification.actions && notification.actions.length > 0) {
            actionsHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem;">
                    ${notification.actions.map(action => `
                        <a href="${action.url}" target="_blank" style="
                            display: inline-block;
                            padding: 0.5rem 0.75rem;
                            background: #2563eb;
                            color: white;
                            text-decoration: none;
                            font-weight: 600;
                            border-radius: 6px;
                            text-align: center;
                            font-size: 0.85rem;
                            transition: background 0.3s;
                        " onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
                            ${action.text} (${action.amount})
                        </a>
                    `).join('')}
                </div>
            `;
        } else if (notification.action) {
            // Single action
            actionsHTML = `
                <a href="${notification.action.url}" target="_blank" style="
                    display: inline-block;
                    margin-top: 0.5rem;
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 600;
                ">${notification.action.text}</a>
            `;
        }

        notificationEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <i class="fas fa-${this.getNotificationIcon(notification.type)}" style="color: ${this.getNotificationColor(notification.type)};"></i>
                <strong>${notification.title}</strong>
            </div>
            <p style="margin: 0 0 0.75rem 0; color: #64748b; font-size: 0.9rem;">${notification.message}</p>
            ${actionsHTML}
        `;

        document.body.appendChild(notificationEl);

        // Auto-remove notification
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.parentNode.removeChild(notificationEl);
            }
        }, notification.duration || 5000);
    }

    /**
     * Get notification color based on type
     * @param {string} type - Notification type
     * @returns {string} Color
     */
    getNotificationColor(type) {
        const colors = {
            'info': '#2563eb',
            'warning': '#f59e0b',
            'error': '#ef4444',
            'success': '#10b981'
        };
        return colors[type] || colors['info'];
    }

    /**
     * Get notification icon based on type
     * @param {string} type - Notification type
     * @returns {string} Icon class
     */
    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'warning': 'exclamation-triangle',
            'error': 'times-circle',
            'success': 'check-circle'
        };
        return icons[type] || icons['info'];
    }

    /**
     * Start periodic check for subscription status
     */
    startPeriodicCheck() {
        // Check every hour
        this.checkInterval = setInterval(() => {
            this.checkTrialStatus();
        }, 60 * 60 * 1000);
    }

    /**
     * Stop periodic check
     */
    stopPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

// Initialize subscription manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const subscriptionManager = new SubscriptionManager();
    subscriptionManager.initialize();
    
    // Make it globally available
    window.subscriptionManager = subscriptionManager;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VenmoPaymentProcessor, SubscriptionManager };
}


