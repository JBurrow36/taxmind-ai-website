// AI Analysis functionality
document.addEventListener('DOMContentLoaded', function() {
    // Start the analysis simulation
    startAnalysis();
    
    // Initialize the page
    initializePage();
});

function initializePage() {
    // Check if files are ready for analysis
    const filesReady = localStorage.getItem('taxmind_files_ready_for_analysis') === 'true';
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    
    if (!filesReady || Object.keys(uploadedFiles).length === 0) {
        showNotification('Please upload documents first before running analysis.', 'warning');
        // Redirect to upload page
        setTimeout(() => {
            window.location.href = 'upload-documents.html';
        }, 2000);
        return;
    }
    
    // Display uploaded files
    displayUploadedFiles(uploadedFiles);
    
    // Check if analysis is already completed
    const analysisCompleted = localStorage.getItem('taxmind_analysis_completed') === 'true';
    
    if (analysisCompleted) {
        showCompletedResults();
    } else {
        startAnalysis();
    }
}

function displayUploadedFiles(files) {
    const filesList = document.getElementById('uploadedFilesList');
    if (!filesList) return;
    
    filesList.innerHTML = '';
    
    Object.values(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-status ${file.analyzed ? 'status-completed' : 'status-pending'}">
                <i class="fas ${file.analyzed ? 'fa-check-circle' : 'fa-clock'}"></i>
                ${file.analyzed ? 'Analyzed' : 'Pending'}
            </div>
        `;
        filesList.appendChild(fileItem);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function startAnalysis() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const analysisProgress = document.getElementById('analysisProgress');
    const analysisResults = document.getElementById('analysisResults');
    
    // Get uploaded files information
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    const fileCount = Object.keys(uploadedFiles).length;
    
    // Update progress text to show file count
    progressText.textContent = `Analyzing ${fileCount} uploaded documents...`;
    
    let progress = 0;
    let currentStep = 1;
    
    const steps = [
        { text: 'Processing business tax documents...', step: 1 },
        { text: 'Extracting business information (EIN, address, tax year)...', step: 1 },
        { text: 'Analyzing income sources (sales, catering, interest)...', step: 2 },
        { text: 'Processing expense categories (COGS, rent, salaries)...', step: 2 },
        { text: 'Calculating taxable income and deductions...', step: 3 },
        { text: 'Determining tax liability and rates...', step: 3 },
        { text: 'Optimizing business tax strategy...', step: 4 },
        { text: 'Generating comprehensive tax report...', step: 4 }
    ];
    
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 2; // Random progress between 2-10%
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Complete the analysis
            completeAnalysis();
            return;
        }
        
        // Update progress bar
        progressBar.style.width = progress + '%';
        
        // Update progress text and steps
        const stepIndex = Math.floor((progress / 100) * steps.length);
        if (stepIndex < steps.length) {
            progressText.textContent = steps[stepIndex].text;
            updateAnalysisStep(steps[stepIndex].step);
        }
        
        // Update insights in real-time
        updateInsights(progress);
        
    }, 800);
}

function updateAnalysisStep(stepNumber) {
    // Reset all steps
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        const status = step.querySelector('.step-status');
        
        step.classList.remove('active', 'completed');
        status.className = 'step-status status-pending';
        status.textContent = 'Pending';
    }
    
    // Update current and completed steps
    for (let i = 1; i <= stepNumber; i++) {
        const step = document.getElementById(`step${i}`);
        const status = step.querySelector('.step-status');
        
        if (i < stepNumber) {
            step.classList.add('completed');
            status.className = 'step-status status-completed';
            status.textContent = 'Completed';
        } else if (i === stepNumber) {
            step.classList.add('active');
            status.className = 'step-status status-active';
            status.textContent = 'In Progress';
        }
    }
}

function updateInsights(progress) {
    const insights = document.getElementById('aiInsights');
    
    // Update insights based on progress
    if (progress > 25) {
        updateInsightValue(0, '8 expense categories identified');
    }
    
    if (progress > 50) {
        updateInsightValue(1, '21% corporate tax rate');
    }
    
    if (progress > 75) {
        updateInsightValue(2, '$4,427 estimated tax');
    }
}

function updateInsightValue(index, value) {
    const insightItems = document.querySelectorAll('.insight-item');
    if (insightItems[index]) {
        const valueElement = insightItems[index].querySelector('.insight-value');
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
}

function completeAnalysis() {
    // Update progress to 100%
    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('progressText').textContent = 'Analysis complete!';
    
    // Mark all steps as completed
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        const status = step.querySelector('.step-status');
        
        step.classList.remove('active');
        step.classList.add('completed');
        status.className = 'step-status status-completed';
        status.textContent = 'Completed';
    }
    
    // Mark uploaded files as analyzed
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    Object.keys(uploadedFiles).forEach(fileId => {
        uploadedFiles[fileId].analyzed = true;
    });
    localStorage.setItem('taxmind_uploaded_files', JSON.stringify(uploadedFiles));
    
    // Hide progress section and show results
    setTimeout(() => {
        document.getElementById('analysisProgress').style.display = 'none';
        document.getElementById('analysisResults').style.display = 'block';
        
        // Animate results
        animateResults();
        
        // Store completion status
        localStorage.setItem('taxmind_analysis_completed', 'true');
        
        // Show success notification
        showNotification('AI analysis completed successfully!', 'success');
    }, 1000);
}

function animateResults() {
    const resultValues = document.querySelectorAll('.result-value');
    
    resultValues.forEach((element, index) => {
        setTimeout(() => {
            animateCounter(element, element.textContent, index);
        }, index * 200);
    });
}

function animateCounter(element, targetValue, index) {
    const isDollar = targetValue.includes('$');
    const isPercentage = targetValue.includes('%');
    const numericValue = parseFloat(targetValue.replace(/[$,%]/g, ''));
    
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
        
        element.textContent = displayValue;
    }, 50);
}

function showCompletedResults() {
    // Hide progress section
    document.getElementById('analysisProgress').style.display = 'none';
    
    // Show results
    document.getElementById('analysisResults').style.display = 'block';
    
    // Mark all steps as completed
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        const status = step.querySelector('.step-status');
        
        step.classList.remove('active');
        step.classList.add('completed');
        status.className = 'step-status status-completed';
        status.textContent = 'Completed';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
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
    // R to restart analysis
    if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        restartAnalysis();
    }
});

function restartAnalysis() {
    // Clear completion status
    localStorage.removeItem('taxmind_analysis_completed');
    
    // Reset UI
    document.getElementById('analysisProgress').style.display = 'block';
    document.getElementById('analysisResults').style.display = 'none';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').textContent = 'Starting analysis...';
    
    // Restart analysis
    startAnalysis();
}

