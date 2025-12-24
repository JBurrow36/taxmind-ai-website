// View Report functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the report
    initializeReport();
    
    // Load report data
    loadReportData();
});

async function initializeReport() {
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
    
    // Try to extract data from documents if parser is available and data hasn't been extracted yet
    if (typeof DocumentParser !== 'undefined') {
        const extractedData = loadReportFinancialData();
        
        // If no data found, try to extract it now
        if (!extractedData || (extractedData.totalIncome === 0 && extractedData.totalWages === 0)) {
            showExtractionProgress();
            
            try {
                await extractAllDocumentDataForReport();
                
                // Poll for extracted data with timeout
                const maxAttempts = 10;
                let attempts = 0;
                const pollInterval = 500; // 500ms between checks
                
                const checkForData = () => {
                    attempts++;
                    const newData = loadReportFinancialData();
                    
                    if (newData && (newData.totalIncome > 0 || newData.totalWages > 0)) {
                        hideExtractionProgress();
                        displayReportFinancialData(newData);
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkForData, pollInterval);
                    } else {
                        hideExtractionProgress();
                        showNoDataMessage();
                    }
                };
                
                // Start polling after a brief delay
                setTimeout(checkForData, pollInterval);
            } catch (error) {
                hideExtractionProgress();
                console.error('Error during data extraction:', error);
                showNotification('Error extracting data from documents. Please try re-uploading your files.', 'error');
                showNoDataMessage();
            }
            return;
        }
    }
    
    // Try to load extracted financial data
    const extractedData = loadReportFinancialData();
    
    if (extractedData && (extractedData.totalIncome > 0 || extractedData.totalWages > 0)) {
        // We have real data - display it
        displayReportFinancialData(extractedData);
    } else {
        // Show message that extraction is needed
        showNoDataMessage();
    }
}

// Show extraction progress indicator
function showExtractionProgress() {
    const warningElement = document.getElementById('reportDataWarning');
    if (warningElement) {
        warningElement.style.display = 'block';
        warningElement.querySelector('strong').textContent = 'Extracting Data...';
        warningElement.querySelector('p').textContent = 'The system is processing your documents to extract financial data. This may take a moment. Please wait...';
    }
}

// Hide extraction progress indicator
function hideExtractionProgress() {
    const warningElement = document.getElementById('reportDataWarning');
    if (warningElement) {
        warningElement.style.display = 'none';
    }
}

// Show message when no data is available
function showNoDataMessage() {
    const warningElement = document.getElementById('reportDataWarning');
    if (warningElement) {
        warningElement.style.display = 'block';
        warningElement.querySelector('strong').textContent = 'No Financial Data Found';
        warningElement.querySelector('p').textContent = 'Unable to extract financial data from your documents. Please ensure your documents contain readable text or try re-uploading them.';
        warningElement.style.background = '#fef3c7';
        warningElement.style.borderColor = '#fbbf24';
        warningElement.querySelector('i').className = 'fas fa-exclamation-triangle';
        warningElement.querySelector('i').style.color = '#d97706';
        warningElement.querySelector('strong').style.color = '#92400e';
        warningElement.querySelector('p').style.color = '#78350f';
    }
    
    // Clear fake values and show placeholders
    const reportValues = ['reportTotalIncome', 'reportTotalDeductions', 'reportTaxOwed', 'reportEstimatedRefund'];
    reportValues.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '—';
            element.style.color = '#94a3b8';
        }
    });
}

// Extract data from all uploaded files for report
async function extractAllDocumentDataForReport() {
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    
    for (const [fileId, file] of Object.entries(uploadedFiles)) {
        // Check if data already extracted
        const extractionKey = `taxmind_extracted_data_${fileId}`;
        const existingData = localStorage.getItem(extractionKey);
        
        if (!existingData && typeof DocumentParser !== 'undefined') {
            try {
                // Create a file-like object from stored data
                const fileDataKey = `taxmind_file_data_${fileId}`;
                const base64Data = localStorage.getItem(fileDataKey);
                
                if (base64Data) {
                    // Convert base64 back to blob
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: file.type });
                    
                    // Create File object
                    const fileObj = new File([blob], file.name, { type: file.type });
                    
                    // Extract data with error handling
                    const result = await DocumentParser.extractFinancialData(fileObj, fileId);
                    if (result && !result.error && (result.income || result.wages)) {
                        console.log(`Successfully extracted data from ${file.name}`);
                    } else if (result && result.error) {
                        console.warn(`Extraction failed for ${file.name}: ${result.errorMessage || 'Unknown error'}`);
                    } else {
                        console.log(`No financial data found in ${file.name}`);
                    }
                }
            } catch (error) {
                console.error(`Error extracting data from ${file.name}:`, error);
            }
        }
    }
}

// Load extracted financial data for report
function loadReportFinancialData() {
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    const totals = {
        totalIncome: 0,
        totalWages: 0,
        totalDeductions: 0,
        totalTaxWithheld: 0,
        totalTaxOwed: 0,
        totalRefund: 0,
        incomeSources: [],
        deductions: []
    };
    
    Object.keys(uploadedFiles).forEach(fileId => {
        const extractionKey = `taxmind_extracted_data_${fileId}`;
        const extractedData = localStorage.getItem(extractionKey);
        
        if (extractedData) {
            try {
                const data = JSON.parse(extractedData);
                const file = uploadedFiles[fileId];
                
                if (data.income || data.wages) {
                    const amount = data.income || data.wages;
                    totals.totalIncome += amount;
                    totals.totalWages += data.wages || 0;
                    totals.incomeSources.push({
                        name: file.name + (data.detectedForm ? ` (${data.detectedForm.toUpperCase()})` : ''),
                        amount: amount
                    });
                }
                
                if (data.deductions) {
                    totals.totalDeductions += data.deductions;
                    totals.deductions.push({
                        name: file.name + ' deductions',
                        amount: data.deductions
                    });
                }
                
                if (data.taxWithheld) totals.totalTaxWithheld += data.taxWithheld;
                if (data.taxOwed) totals.totalTaxOwed += data.taxOwed;
                if (data.refund) totals.totalRefund += data.refund;
            } catch (e) {
                console.error('Error parsing extracted data:', e);
            }
        }
    });
    
    // Calculate estimated refund
    if (totals.totalTaxWithheld > 0 && totals.totalTaxOwed > 0) {
        totals.estimatedRefund = Math.max(0, totals.totalTaxWithheld - totals.totalTaxOwed);
    }
    
    return totals.totalIncome > 0 || totals.totalWages > 0 ? totals : null;
}

// Display financial data in report
function displayReportFinancialData(data) {
    // Hide warning
    const warningElement = document.getElementById('reportDataWarning');
    if (warningElement) {
        warningElement.style.display = 'none';
    }
    
    // Update summary values
    const incomeEl = document.getElementById('reportTotalIncome');
    if (incomeEl && (data.totalIncome > 0 || data.totalWages > 0)) {
        incomeEl.textContent = '$' + Math.round(data.totalIncome || data.totalWages).toLocaleString();
        incomeEl.style.color = '#1e40af';
    }
    
    const deductionsEl = document.getElementById('reportTotalDeductions');
    if (deductionsEl && data.totalDeductions > 0) {
        deductionsEl.textContent = '$' + Math.round(data.totalDeductions).toLocaleString();
        deductionsEl.style.color = '#1e40af';
    }
    
    const taxOwedEl = document.getElementById('reportTaxOwed');
    if (taxOwedEl && data.totalTaxOwed > 0) {
        taxOwedEl.textContent = '$' + Math.round(data.totalTaxOwed).toLocaleString();
        taxOwedEl.style.color = '#1e40af';
    }
    
    const refundEl = document.getElementById('reportEstimatedRefund');
    if (refundEl) {
        const refund = data.totalRefund || data.estimatedRefund || 0;
        if (refund > 0) {
            refundEl.textContent = '$' + Math.round(refund).toLocaleString();
            refundEl.style.color = '#059669';
        } else {
            refundEl.textContent = '—';
            refundEl.style.color = '#94a3b8';
        }
    }
    
    // Update refund amount in refund section
    const reportRefundEl = document.getElementById('reportRefundAmount');
    const refundDescriptionEl = document.querySelector('.refund-description');
    if (reportRefundEl) {
        const refund = data.totalRefund || data.estimatedRefund || 0;
        if (refund > 0) {
            reportRefundEl.textContent = '$' + Math.round(refund).toLocaleString();
            reportRefundEl.style.color = '#059669';
            reportRefundEl.style.fontStyle = 'normal';
            reportRefundEl.style.fontSize = '2.5rem';
            reportRefundEl.style.fontWeight = '700';
            
            // Update description
            if (refundDescriptionEl) {
                refundDescriptionEl.textContent = 'Based on extracted data from your tax documents.';
                refundDescriptionEl.style.color = '#64748b';
                refundDescriptionEl.style.fontStyle = 'normal';
            }
        } else {
            reportRefundEl.textContent = '—';
            reportRefundEl.style.color = '#94a3b8';
            reportRefundEl.style.fontStyle = 'italic';
            if (refundDescriptionEl) {
                refundDescriptionEl.textContent = 'Refund amounts will appear here once documents are processed.';
            }
        }
    }
    
    // Display income sources
    const incomeSourcesEl = document.getElementById('incomeSourcesList');
    if (incomeSourcesEl && data.incomeSources.length > 0) {
        incomeSourcesEl.innerHTML = '';
        data.incomeSources.forEach(source => {
            const item = document.createElement('div');
            item.className = 'income-item';
            item.innerHTML = `
                <span class="income-name">${source.name}</span>
                <span class="income-amount">$${Math.round(source.amount).toLocaleString()}</span>
            `;
            incomeSourcesEl.appendChild(item);
        });
    }
    
    // Display deductions
    const deductionsListEl = document.getElementById('deductionsList');
    if (deductionsListEl) {
        if (data.deductions && data.deductions.length > 0) {
            deductionsListEl.innerHTML = '';
            deductionsListEl.className = 'deductions-list'; // Remove placeholder class
            deductionsListEl.style.cssText = ''; // Reset styles
            data.deductions.forEach(deduction => {
                const item = document.createElement('div');
                item.className = 'deduction-item';
                item.innerHTML = `
                    <span class="deduction-name">${deduction.name}</span>
                    <span class="deduction-amount">$${Math.round(deduction.amount).toLocaleString()}</span>
                `;
                deductionsListEl.appendChild(item);
            });
        } else {
            deductionsListEl.innerHTML = `
                <div style="text-align: center; color: #94a3b8; font-style: italic;">
                    <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                    <span>No deduction data found in uploaded documents.</span>
                </div>
            `;
        }
    }
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
    
    // Don't animate refund amount - no real data available
    // const refundAmount = document.querySelector('.refund-amount');
    // if (refundAmount && refundAmount.textContent !== '—') {
    //     setTimeout(() => {
    //         animateCounter(refundAmount, refundAmount.textContent, 20);
    //     }, 2000);
    // }
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
    // Don't export fake data - show message that real data is needed
    showNotification('Report export requires actual analysis data. Please wait for full document processing implementation.', 'warning');
    return;
    
    // Future implementation when real data is available:
    /*
    const reportData = {
        title: document.querySelector('.page-title').textContent,
        summary: {
            totalIncome: document.getElementById('reportTotalIncome').textContent,
            totalDeductions: document.getElementById('reportTotalDeductions').textContent,
            taxOwed: document.getElementById('reportTaxOwed').textContent,
            estimatedRefund: document.getElementById('reportEstimatedRefund').textContent
        },
        generatedDate: new Date().toISOString(),
        note: 'This report contains actual data extracted from uploaded documents'
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tax-report-' + new Date().getFullYear() + '.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Report exported successfully', 'success');
    */
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
















