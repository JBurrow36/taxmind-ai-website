// View Report functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the report
    initializeReport();
    
    // Load report data
    loadReportData();
});

function initializeReport() {
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
    
    // Animate the report values
    animateReportValues();
}

function loadReportData() {
    // Load user data
    const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
    
    // Update page title with user's name
    if (currentUser.firstName) {
        document.title = `${currentUser.firstName}'s Tax Report 2023 - TaxMind AI`;
    }
}

function animateReportValues() {
    // Animate summary values
    const summaryValues = document.querySelectorAll('.summary-value');
    summaryValues.forEach((element, index) => {
        setTimeout(() => {
            animateCounter(element, element.textContent, index);
        }, index * 200);
    });
    
    // Animate income amounts
    const incomeAmounts = document.querySelectorAll('.income-amount');
    incomeAmounts.forEach((element, index) => {
        setTimeout(() => {
            animateCounter(element, element.textContent, index);
        }, (index + 4) * 200);
    });
    
    // Animate deduction amounts
    const deductionAmounts = document.querySelectorAll('.deduction-amount');
    deductionAmounts.forEach((element, index) => {
        setTimeout(() => {
            animateCounter(element, element.textContent, index);
        }, (index + 7) * 200);
    });
    
    // Animate calculation amounts
    const calculationAmounts = document.querySelectorAll('.calculation-amount');
    calculationAmounts.forEach((element, index) => {
        setTimeout(() => {
            animateCounter(element, element.textContent, index);
        }, (index + 14) * 200);
    });
    
    // Animate refund amount
    const refundAmount = document.querySelector('.refund-amount');
    if (refundAmount) {
        setTimeout(() => {
            animateCounter(refundAmount, refundAmount.textContent, 20);
        }, 2000);
    }
}

function animateCounter(element, targetValue, index) {
    const isDollar = targetValue.includes('$');
    const isPercentage = targetValue.includes('%');
    const isNegative = targetValue.includes('-');
    const numericValue = parseFloat(targetValue.replace(/[$,%-]/g, ''));
    
    let current = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.round(current);
        if (isDollar) {
            displayValue = '$' + displayValue.toLocaleString();
        } else if (isPercentage) {
            displayValue = displayValue + '%';
        }
        
        if (isNegative) {
            displayValue = '-' + displayValue;
        }
        
        element.textContent = displayValue;
    }, 50);
}

function printReport() {
    // Create print-friendly version
    const printWindow = window.open('', '_blank');
    const reportContent = document.querySelector('.report-main').innerHTML;
    const reportTitle = document.querySelector('.page-title').textContent;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${reportTitle}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .page-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                .card-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
                .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
                .summary-section { background: #f0f0f0; padding: 20px; margin-bottom: 20px; }
                .income-section, .deductions-section, .tax-calculation { 
                    background: #f9f9f9; padding: 15px; margin-bottom: 15px; 
                }
                .income-item, .deduction-item, .calculation-item { 
                    display: flex; justify-content: space-between; 
                    padding: 5px 0; border-bottom: 1px solid #ddd; 
                }
                .refund-section { 
                    background: #e8f5e8; padding: 20px; text-align: center; 
                }
                .refund-amount { font-size: 32px; font-weight: bold; color: #28a745; }
                @media print {
                    body { margin: 0; }
                    .action-buttons { display: none; }
                }
            </style>
        </head>
        <body>
            <h1 class="page-title">${reportTitle}</h1>
            ${reportContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    
    showNotification('Report sent to printer', 'success');
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
    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printReport();
    }
    
    // F for file taxes
    if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        window.location.href = 'file-taxes.html';
    }
});

// Add smooth scrolling for anchor links
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

// Add export functionality
function exportReport() {
    const reportData = {
        title: document.querySelector('.page-title').textContent,
        summary: {
            totalIncome: '$75,000',
            totalDeductions: '$12,500',
            taxOwed: '$8,750',
            estimatedRefund: '$2,340'
        },
        income: [
            { name: 'W-2 Wages', amount: '$65,000' },
            { name: 'Freelance Income', amount: '$8,500' },
            { name: 'Investment Income', amount: '$1,500' }
        ],
        deductions: [
            { name: 'Home Office Expenses', amount: '$1,200' },
            { name: 'Business Meals', amount: '$800' },
            { name: 'Professional Development', amount: '$340' },
            { name: 'Charitable Contributions', amount: '$1,500' },
            { name: 'Medical Expenses', amount: '$2,100' },
            { name: 'State & Local Taxes', amount: '$3,200' },
            { name: 'Mortgage Interest', amount: '$2,360' }
        ],
        generatedDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tax-report-2023.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Report exported successfully', 'success');
}

// Add export button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add export button if not exists
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons && !document.querySelector('.export-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'action-btn secondary export-btn';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Report';
        exportBtn.onclick = exportReport;
        actionButtons.appendChild(exportBtn);
    }
});


