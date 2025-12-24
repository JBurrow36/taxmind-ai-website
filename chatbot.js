// TaxMind AI Chatbot - Main Logic and UI Controller
// Integrates with chatbot-rules.js for answers

const Chatbot = {
    isOpen: false,
    currentContext: {},
    
    // Initialize chatbot
    init: function(containerId = 'chatbot-container') {
        let container = document.getElementById(containerId);
        
        // If container doesn't exist, create it
        if (!container) {
            container = this.createChatbotStructure();
            document.body.appendChild(container);
        }
        
        this.container = container;
        
        // Get user context
        this.loadContext();
        
        // Bind events
        this.bindEvents();
        
        // Show welcome message
        this.showWelcomeMessage();
    },
    
    // Create chatbot DOM structure
    createChatbotStructure: function() {
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.className = 'chatbot-container';
        container.innerHTML = `
            <button class="chatbot-toggle" id="chatbot-toggle-btn" aria-label="Open TaxMind Assistant">
                <i class="fas fa-comments"></i>
                <span class="chatbot-toggle-badge" id="chatbot-badge" style="display: none;">1</span>
            </button>
            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-header-icon">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="chatbot-header-text">
                            <h3>TaxMind AI Assistant</h3>
                            <p>I'm here to help with your taxes</p>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbot-close-btn" aria-label="Close chatbot">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages"></div>
                <div class="chatbot-input-container">
                    <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Ask me anything about taxes..." aria-label="Type your question" />
                    <button class="chatbot-send" id="chatbot-send-btn" aria-label="Send message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="chatbot-quick-questions">
                    <strong>Quick questions:</strong>
                    <div class="chatbot-quick-questions-list">
                        <button class="chatbot-quick-btn" onclick="Chatbot.askQuestion('How do I file my taxes?')">How to file?</button>
                        <button class="chatbot-quick-btn" onclick="Chatbot.askQuestion('What documents do I need?')">What documents?</button>
                        <button class="chatbot-quick-btn" onclick="Chatbot.askQuestion('What are red flags?')">What are red flags?</button>
                        <button class="chatbot-quick-btn" onclick="Chatbot.askQuestion('When are taxes due?')">When are taxes due?</button>
                    </div>
                </div>
            </div>
        `;
        
        // Inject styles if not already present
        if (!document.getElementById('chatbot-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'chatbot-styles';
            styleSheet.textContent = this.getChatbotStyles();
            document.head.appendChild(styleSheet);
        }
        
        return container;
    },
    
    // Get chatbot CSS styles
    getChatbotStyles: function() {
        return `
            .chatbot-container { position: fixed; bottom: 20px; right: 20px; z-index: 1000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .chatbot-toggle { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4); display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 0.3s ease; position: relative; }
            .chatbot-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 30px rgba(37, 99, 235, 0.5); }
            .chatbot-toggle-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; border: 2px solid white; }
            .chatbot-window { position: absolute; bottom: 80px; right: 0; width: 400px; max-width: calc(100vw - 40px); height: 600px; max-height: calc(100vh - 120px); background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; opacity: 0; visibility: hidden; transform: translateY(20px) scale(0.95); transition: all 0.3s ease; }
            .chatbot-window.chatbot-open { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }
            .chatbot-header { padding: 1.5rem; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; border-radius: 16px 16px 0 0; display: flex; justify-content: space-between; align-items: center; }
            .chatbot-header-info { display: flex; align-items: center; gap: 1rem; }
            .chatbot-header-icon { width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
            .chatbot-header-text h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
            .chatbot-header-text p { margin: 0; font-size: 0.85rem; opacity: 0.9; }
            .chatbot-close { background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
            .chatbot-close:hover { background: rgba(255, 255, 255, 0.3); }
            .chatbot-messages { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; }
            .chatbot-messages::-webkit-scrollbar { width: 6px; }
            .chatbot-messages::-webkit-scrollbar-track { background: transparent; }
            .chatbot-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
            .chatbot-messages::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            .chatbot-message { display: flex; gap: 0.75rem; align-items: flex-start; animation: messageSlideIn 0.3s ease; }
            @keyframes messageSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .chatbot-message-user { flex-direction: row-reverse; }
            .chatbot-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; }
            .chatbot-message-user .chatbot-avatar { background: #64748b; }
            .chatbot-message-content { flex: 1; min-width: 0; }
            .chatbot-message-text { background: white; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.9rem; line-height: 1.5; color: #1e293b; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
            .chatbot-message-user .chatbot-message-text { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; }
            .chatbot-message-text p { margin: 0.5rem 0; }
            .chatbot-message-text p:first-child { margin-top: 0; }
            .chatbot-message-text p:last-child { margin-bottom: 0; }
            .chatbot-message-text strong { font-weight: 600; }
            .chatbot-message-text em { font-style: italic; opacity: 0.8; }
            .chatbot-related-questions { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; }
            .chatbot-related-questions strong { font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.5rem; }
            .chatbot-quick-question { display: block; width: 100%; text-align: left; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem 0.75rem; margin-bottom: 0.5rem; font-size: 0.85rem; color: #2563eb; cursor: pointer; transition: all 0.2s ease; }
            .chatbot-quick-question:hover { background: #e2e8f0; border-color: #2563eb; }
            .chatbot-typing .chatbot-message-content { padding: 0.75rem 1rem; }
            .chatbot-typing-dots { display: flex; gap: 4px; align-items: center; }
            .chatbot-typing-dots span { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; animation: typingDot 1.4s infinite; }
            .chatbot-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .chatbot-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.7; } 30% { transform: translateY(-10px); opacity: 1; } }
            .chatbot-input-container { padding: 1rem 1.5rem; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 0.75rem; align-items: center; }
            .chatbot-input { flex: 1; padding: 0.75rem 1rem; border: 2px solid #e2e8f0; border-radius: 24px; font-size: 0.9rem; outline: none; transition: all 0.2s ease; }
            .chatbot-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
            .chatbot-send { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
            .chatbot-send:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
            .chatbot-send:active { transform: scale(0.95); }
            .chatbot-quick-questions { padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
            .chatbot-quick-questions strong { display: block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; }
            .chatbot-quick-questions-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
            .chatbot-quick-btn { padding: 0.5rem 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 16px; font-size: 0.8rem; color: #2563eb; cursor: pointer; transition: all 0.2s ease; }
            .chatbot-quick-btn:hover { background: #f1f5f9; border-color: #2563eb; }
            @media (max-width: 768px) {
                .chatbot-container { bottom: 10px; right: 10px; }
                .chatbot-window { width: calc(100vw - 20px); height: calc(100vh - 80px); bottom: 70px; right: 0; left: 0; margin: 0 auto; }
                .chatbot-toggle { width: 50px; height: 50px; font-size: 20px; }
            }
        `;
    },
    
    // Load user context from localStorage
    loadContext: function() {
        try {
            const user = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
            const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
            const analysisCompleted = localStorage.getItem('taxmind_analysis_completed') === 'true';
            
            this.currentContext = {
                accountType: user.accountType || 'individual',
                hasUploadedFiles: Object.keys(uploadedFiles).length > 0,
                analysisCompleted: analysisCompleted,
                userName: user.name || user.email || 'there'
            };
        } catch (e) {
            console.error('Error loading context:', e);
            this.currentContext = {};
        }
    },
    
    // Bind event handlers
    bindEvents: function() {
        const input = this.container.querySelector('#chatbot-input');
        const sendBtn = this.container.querySelector('#chatbot-send-btn');
        const toggleBtn = this.container.querySelector('#chatbot-toggle-btn');
        const closeBtn = this.container.querySelector('#chatbot-close-btn');
        
        if (input && sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    },
    
    // Show welcome message
    showWelcomeMessage: function() {
        const messagesContainer = this.container.querySelector('.chatbot-messages');
        if (!messagesContainer) return;
        
        const welcomeText = `Hi ${this.currentContext.userName}! I'm TaxMind AI Assistant. I can help you with:
• Filing your taxes
• Understanding tax documents
• Deductions and credits
• Business taxes
• Analysis questions

What would you like to know?`;
        
        this.addMessage(welcomeText, 'bot');
    },
    
    // Send a message
    sendMessage: function() {
        const input = this.container.querySelector('.chatbot-input');
        if (!input || !input.value.trim()) return;
        
        const question = input.value.trim();
        input.value = '';
        
        // Add user message to chat
        this.addMessage(question, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Get answer (simulate slight delay for natural feel)
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = TaxChatbotRules.getAnswer(question, this.currentContext);
            this.addMessage(response.answer, 'bot', response);
        }, 500 + Math.random() * 500);
    },
    
    // Add message to chat
    addMessage: function(text, sender, metadata = {}) {
        const messagesContainer = this.container.querySelector('.chatbot-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message chatbot-message-${sender}`;
        
        let html = '';
        if (sender === 'bot') {
            html = `
                <div class="chatbot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chatbot-message-content">
                    <div class="chatbot-message-text">${this.formatAnswer(text)}</div>
                    ${metadata.relatedQuestions && metadata.relatedQuestions.length > 0 ? 
                        `<div class="chatbot-related-questions">
                            <strong>Related questions:</strong>
                            ${metadata.relatedQuestions.map(q => 
                                `<button class="chatbot-quick-question" onclick="Chatbot.askQuestion('${q}')">${q}</button>`
                            ).join('')}
                        </div>` : ''}
                </div>
            `;
        } else {
            html = `
                <div class="chatbot-message-content">
                    <div class="chatbot-message-text">${this.escapeHtml(text)}</div>
                </div>
                <div class="chatbot-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        }
        
        messageDiv.innerHTML = html;
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    // Format answer text (bold headers, lists, etc.)
    formatAnswer: function(text) {
        // Escape HTML first
        let formatted = this.escapeHtml(text);
        
        // Format numbered lists
        formatted = formatted.replace(/(\d+)\.\s+([^\n]+)/g, '<strong>$1.</strong> $2');
        
        // Format parenthetical notes
        formatted = formatted.replace(/\(([^)]+)\)/g, '<em>($1)</em>');
        
        // Format strong emphasis (text in quotes or caps)
        formatted = formatted.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
        
        // Format line breaks
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = `<p>${formatted}</p>`;
        
        return formatted;
    },
    
    // Escape HTML
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Ask a quick question (from related questions)
    askQuestion: function(question) {
        const input = this.container.querySelector('.chatbot-input');
        if (input) {
            input.value = question;
            this.sendMessage();
        }
    },
    
    // Show typing indicator
    showTypingIndicator: function() {
        const messagesContainer = this.container.querySelector('.chatbot-messages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message chatbot-message-bot chatbot-typing';
        typingDiv.id = 'chatbot-typing-indicator';
        typingDiv.innerHTML = `
            <div class="chatbot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="chatbot-message-content">
                <div class="chatbot-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    // Hide typing indicator
    hideTypingIndicator: function() {
        const typingIndicator = document.getElementById('chatbot-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },
    
    // Toggle chatbot open/close
    toggle: function() {
        this.isOpen = !this.isOpen;
        const chatbotWindow = this.container.querySelector('.chatbot-window');
        
        if (chatbotWindow) {
            if (this.isOpen) {
                chatbotWindow.classList.add('chatbot-open');
                // Reload context when opening
                this.loadContext();
            } else {
                chatbotWindow.classList.remove('chatbot-open');
            }
        }
    },
    
    // Open chatbot
    open: function() {
        if (!this.isOpen) {
            this.toggle();
        }
    },
    
    // Close chatbot
    close: function() {
        if (this.isOpen) {
            this.toggle();
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Chatbot will be initialized when container exists
    });
} else {
    // DOM already loaded
}

