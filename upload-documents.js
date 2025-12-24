// Upload Documents functionality
let uploadedFilesContainer; // Make it globally accessible

document.addEventListener('DOMContentLoaded', function() {
    console.log('Upload documents page loaded');
    
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('fileInput');
    uploadedFilesContainer = document.getElementById('uploadedFiles');
    
    if (!dragDropArea || !fileInput || !uploadedFilesContainer) {
        console.error('Required elements not found:', {
            dragDropArea: !!dragDropArea,
            fileInput: !!fileInput,
            uploadedFilesContainer: !!uploadedFilesContainer
        });
        return;
    }
    
    // Drag and drop functionality
    dragDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragDropArea.classList.add('dragover');
        console.log('Drag over');
    });
    
    dragDropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragDropArea.classList.remove('dragover');
        console.log('Drag leave');
    });
    
    dragDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragDropArea.classList.remove('dragover');
        
        console.log('Files dropped:', e.dataTransfer.files);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
    
    // Click to upload
    dragDropArea.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Click to upload');
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        console.log('File input changed:', e.target.files);
        const files = Array.from(e.target.files);
        handleFiles(files);
    });
    
    // Fallback input handler
    const fallbackInput = document.getElementById('fallbackInput');
    if (fallbackInput) {
        fallbackInput.addEventListener('change', function(e) {
            console.log('Fallback input changed:', e.target.files);
            const files = Array.from(e.target.files);
            handleFiles(files);
        });
    }
    
    // Initialize with existing files
    loadExistingFiles();
});

function handleFiles(files) {
    console.log('Handling files:', files);
    files.forEach(file => {
        if (validateFile(file)) {
            uploadFile(file);
        }
    });
}

function validateFile(file) {
    console.log('Validating file:', file.name, file.type, file.size);
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        // PDF files
        'application/pdf',
        
        // Image files
        'image/jpeg', 
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/webp',
        
        // Microsoft Office documents
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        
        // Text files
        'text/plain',
        'text/csv',
        'text/html',
        
        // Other common formats
        'application/rtf',
        'application/json',
        'application/xml',
        'text/xml',
        
        // Archive files (for compressed documents)
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
    ];
    
    if (file.size > maxSize) {
        showNotification('File size must be less than 10MB', 'error');
        console.error('File too large:', file.size);
        return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('File type not supported. Please upload PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, RTF, ZIP, or other supported formats.', 'error');
        console.error('File type not allowed:', file.type);
        return false;
    }
    
    console.log('File validation passed');
    return true;
}

function uploadFile(file) {
    console.log('Starting upload for file:', file.name);
    
    try {
        // Get the container fresh in case it wasn't initialized
        if (!uploadedFilesContainer) {
            uploadedFilesContainer = document.getElementById('uploadedFiles');
        }
        
        if (!uploadedFilesContainer) {
            console.error('Upload container not found - creating fallback');
            // Create a fallback container if it doesn't exist
            const fallbackContainer = document.createElement('div');
            fallbackContainer.id = 'uploadedFiles';
            fallbackContainer.className = 'uploaded-files';
            document.querySelector('.upload-main').appendChild(fallbackContainer);
            uploadedFilesContainer = fallbackContainer;
        }
        
        const fileId = generateFileId();
        const fileItem = createFileItem(file, fileId);
        
        uploadedFilesContainer.appendChild(fileItem);
        
        // Simulate upload progress
        simulateUploadProgress(fileId, file);
        
        // Update summary
        updateUploadSummary();
        
        // Mark analysis as ready
        markAnalysisReady();
        
        console.log('Upload process started successfully');
    } catch (error) {
        console.error('Error in upload process:', error);
        showNotification('Error uploading file. Please try again.', 'error');
    }
}

function createFileItem(file, fileId) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.id = `file-${fileId}`;
    
    const fileIcon = getFileIcon(file.type);
    const fileSize = formatFileSize(file.size);
    
    fileItem.innerHTML = `
        <div class="file-icon">
            <i class="${fileIcon}"></i>
        </div>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${fileSize}</div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-${fileId}"></div>
            </div>
        </div>
        <div class="file-status status-uploading" id="status-${fileId}">
            <i class="fas fa-spinner fa-spin"></i>
            Uploading...
        </div>
        <div class="file-actions">
            <button class="action-btn" onclick="viewFile('${file.name}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn" onclick="deleteFile('${fileId}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return fileItem;
}

function getFileIcon(fileType) {
    if (fileType === 'application/pdf') return 'fas fa-file-pdf';
    if (fileType.includes('image')) return 'fas fa-file-image';
    if (fileType.includes('word')) return 'fas fa-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
    if (fileType === 'text/csv') return 'fas fa-file-csv';
    return 'fas fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function simulateUploadProgress(fileId, file) {
    console.log('Starting upload simulation for:', file.name);
    
    const progressBar = document.getElementById(`progress-${fileId}`);
    const statusElement = document.getElementById(`status-${fileId}`);
    
    if (!progressBar || !statusElement) {
        console.error('Progress elements not found for file:', fileId);
        return;
    }
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Update status to completed
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
            statusElement.className = 'file-status status-completed';
            
            // Store file in localStorage
            storeFile(file, fileId);
            
            // Extract financial data from the document
            extractDocumentData(file, fileId);
            
            showNotification('File uploaded successfully!', 'success');
            console.log('Upload completed for:', file.name);
        }
        
        progressBar.style.width = progress + '%';
    }, 200);
}

function storeFile(file, fileId) {
    // Extract file content for content-based detection
    TaxTypeDetector.extractFileContent(file, function(fileContent) {
        // Detect tax type from both file name and content
        let taxTypeDetection = TaxTypeDetector.detectTaxType(file.name, fileContent);
        
        // Enhance detection with learned patterns if training system is available
        if (typeof AITrainingSystem !== 'undefined') {
            taxTypeDetection = AITrainingSystem.enhanceDetectionWithLearning(
                taxTypeDetection,
                file.name,
                fileContent
            );
        }
        
        // Store the actual file content as base64 for document viewer
        // Use FileReader to convert file to base64
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Store base64 data (remove data:application/pdf;base64, prefix if present)
                const base64Data = e.target.result.split(',')[1] || e.target.result;
                
                // Store file data separately to avoid bloating the main files object
                const fileDataKey = `taxmind_file_data_${fileId}`;
                
                // Check localStorage size limit (typically 5-10MB per origin)
                // For files larger than ~3MB base64, warn user
                const estimatedSize = (base64Data.length * 3) / 4; // Approximate base64 to bytes
                if (estimatedSize > 3 * 1024 * 1024) {
                    const sizeMB = Math.round(estimatedSize / 1024 / 1024);
                    const warningMsg = `File "${file.name}" is large (${sizeMB}MB). This may exceed browser storage limits. Consider uploading smaller files.`;
                    console.warn(warningMsg);
                    showNotification(warningMsg, 'warning');
                }
                
                // Try to store with error handling
                try {
                    localStorage.setItem(fileDataKey, base64Data);
                    console.log(`Stored file data for ${file.name} (${fileId})`);
                } catch (error) {
                    if (error.name === 'QuotaExceededError' || error.code === 22) {
                        const errorMsg = `Cannot store file "${file.name}" - browser storage limit exceeded. Please clear some space or use a smaller file.`;
                        console.error(errorMsg, error);
                        showNotification(errorMsg, 'error');
                        // Remove from uploaded files list since we can't store it
                        const files = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
                        delete files[fileId];
                        localStorage.setItem('taxmind_uploaded_files', JSON.stringify(files));
                    } else {
                        console.error('Error storing file data:', error);
                        showNotification(`Error storing file "${file.name}". Please try again.`, 'error');
                    }
                    throw error; // Re-throw to prevent continuing
                }
            } catch (error) {
                console.error('Error storing file data:', error);
                // Continue anyway - metadata is still stored
            }
        };
        reader.onerror = function() {
            console.error('Error reading file for storage');
        };
        reader.readAsDataURL(file);
        
        const files = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
        files[fileId] = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
            status: 'completed',
            analyzed: false,
            taxType: taxTypeDetection.typeId,
            taxTypeName: taxTypeDetection.typeName,
            taxTypeConfidence: taxTypeDetection.confidence,
            contentAnalyzed: taxTypeDetection.hasContent
        };
        localStorage.setItem('taxmind_uploaded_files', JSON.stringify(files));
        
        // Store detected tax types for analysis
        updateTaxTypeSummary();
        
        // Mark that we have files ready for analysis
        localStorage.setItem('taxmind_files_ready_for_analysis', 'true');
        
        // Collect training data (behind the scenes)
        if (typeof AITrainingSystem !== 'undefined' && typeof window.taxmindCollectTrainingData === 'function') {
            window.taxmindCollectTrainingData(
                { name: file.name, type: file.type, size: file.size, content: fileContent },
                taxTypeDetection,
                null // Analysis result will be added after analysis completes
            );
        }
        
        const detectionMethod = taxTypeDetection.hasContent ? 'content-based' : 'filename-based';
        console.log(`Detected tax type: ${taxTypeDetection.typeName} (confidence: ${taxTypeDetection.confidence}%, method: ${detectionMethod}) for account type: ${taxTypeDetection.accountType}`);
        
        // Show warning if confidence is low
        if (taxTypeDetection.isLowConfidence || taxTypeDetection.confidence < 50) {
            const warningMessage = `Tax type detection confidence is low (${taxTypeDetection.confidence}%). Detected as "${taxTypeDetection.typeName}" but you may want to verify this is correct.`;
            console.warn(warningMessage);
            showNotification(warningMessage, 'warning');
        }
        
        // Extract financial data from the document after storing
        // Do this after file metadata is stored so we have the fileId
        if (typeof DocumentParser !== 'undefined') {
            // Get the file object from the FileReader callback
            extractDocumentData(file, fileId);
        }
    });
}

// Extract financial data from uploaded document
async function extractDocumentData(file, fileId) {
    // Check if document parser is available
    if (typeof DocumentParser === 'undefined') {
        console.log('Document parser not loaded - skipping data extraction');
        return;
    }
    
    try {
        console.log(`Starting data extraction for ${file.name}...`);
        
        // Extract financial data
        const financialData = await DocumentParser.extractFinancialData(file, fileId);
        
        if (financialData && (financialData.income || financialData.wages)) {
            console.log(`Successfully extracted data from ${file.name}:`, financialData);
            showNotification(`Extracted financial data from ${file.name}`, 'success');
        } else {
            console.log(`No financial data found in ${file.name}`);
        }
    } catch (error) {
        console.error('Error extracting document data:', error);
        // Don't show error to user - extraction is background process
    }
}

function updateTaxTypeSummary() {
    const files = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    const taxTypes = {};
    
    Object.values(files).forEach(file => {
        if (file.taxType) {
            if (!taxTypes[file.taxType]) {
                taxTypes[file.taxType] = {
                    count: 0,
                    files: []
                };
            }
            taxTypes[file.taxType].count++;
            taxTypes[file.taxType].files.push(file.name);
        }
    });
    
    localStorage.setItem('taxmind_detected_tax_types', JSON.stringify(taxTypes));
}

function loadExistingFiles() {
    const files = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    
    // Get the container fresh
    if (!uploadedFilesContainer) {
        uploadedFilesContainer = document.getElementById('uploadedFiles');
    }
    
    if (!uploadedFilesContainer) {
        console.error('Cannot load existing files - container not found');
        return;
    }
    
    // Clear existing files
    uploadedFilesContainer.innerHTML = '';
    
    Object.keys(files).forEach(fileId => {
        const file = files[fileId];
        const fileItem = createExistingFileItem(file, fileId);
        uploadedFilesContainer.appendChild(fileItem);
    });
    
    updateUploadSummary();
}

function createExistingFileItem(file, fileId) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.id = `file-${fileId}`;
    
    const fileIcon = getFileIcon(file.type);
    const fileSize = formatFileSize(file.size);
    
    // Add tax type badge if available
    const taxTypeBadge = file.taxType ? 
        `<span class="tax-type-badge" style="
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 8px;
            display: inline-block;
        ">${file.taxTypeName || file.taxType}</span>` : '';
    
    fileItem.innerHTML = `
        <div class="file-icon">
            <i class="${fileIcon}"></i>
        </div>
        <div class="file-info">
            <div class="file-name">
                ${file.name}
                ${taxTypeBadge}
            </div>
            <div class="file-size">${fileSize}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 100%"></div>
            </div>
        </div>
        <div class="file-status status-completed">
            <i class="fas fa-check-circle"></i>
            Completed
        </div>
        <div class="file-actions">
            <button class="action-btn" onclick="viewFile('${file.name}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn" onclick="deleteFile('${fileId}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return fileItem;
}

// View file with TaxMind interactive highlights
function viewFileWithTaxMind(fileId) {
    // Store the file ID to view
    localStorage.setItem('taxmind_viewing_file_id', fileId);
    
    // Navigate to document highlights page
    window.location.href = 'document-highlights.html?fileId=' + fileId;
}

function updateUploadSummary() {
    const files = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    const fileCount = Object.keys(files).length;
    const totalSize = Object.values(files).reduce((sum, file) => sum + file.size, 0);
    const processedCount = Object.values(files).filter(file => file.status === 'completed').length;
    
    document.getElementById('totalFiles').textContent = fileCount;
    document.getElementById('totalSize').textContent = formatFileSize(totalSize);
    document.getElementById('processedFiles').textContent = processedCount;
    
    // Update the quick action button to show analysis is ready
    if (fileCount > 0) {
        updateAnalysisButton();
    }
}

function markAnalysisReady() {
    const files = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    const fileCount = Object.keys(files).length;
    
    if (fileCount > 0) {
        localStorage.setItem('taxmind_files_ready_for_analysis', 'true');
        showNotification('Files uploaded successfully! You can now run AI analysis.', 'success');
    }
}

function updateAnalysisButton() {
    const analysisButton = document.querySelector('a[href="ai-analysis.html"]');
    if (analysisButton) {
        analysisButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        analysisButton.style.borderColor = '#10b981';
        analysisButton.innerHTML = `
            <div class="action-icon">
                <i class="fas fa-robot"></i>
            </div>
            <div class="action-title">Run AI Analysis</div>
            <div class="action-desc">Ready to analyze ${Object.keys(JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}')).length} files</div>
        `;
    }
}

function deleteFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        const files = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
        delete files[fileId];
        localStorage.setItem('taxmind_uploaded_files', JSON.stringify(files));
        
        const fileElement = document.getElementById(`file-${fileId}`);
        if (fileElement) {
            fileElement.remove();
        }
        
        updateUploadSummary();
        showNotification('File deleted successfully!', 'success');
    }
}

function viewFile(fileName) {
    showNotification(`Viewing file: ${fileName}`, 'info');
    // In a real application, this would open a file viewer modal
}

function selectDocumentType(type) {
    const typeCards = document.querySelectorAll('.doc-type-card');
    typeCards.forEach(card => card.classList.remove('selected'));
    
    // Find the clicked card and add selected class
    const clickedCard = document.querySelector(`[onclick="selectDocumentType('${type}')"]`);
    if (clickedCard) {
        clickedCard.classList.add('selected');
        
        // Add visual feedback
        setTimeout(() => {
            clickedCard.classList.remove('selected');
        }, 1000);
    }
    
    showNotification(`Selected document type: ${type}`, 'info');
}

function generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    
    .doc-type-card.selected {
        border-color: #2563eb !important;
        background: #f0f9ff !important;
        transform: scale(1.02);
    }
`;
document.head.appendChild(style);

// Test upload function for debugging
function testUpload() {
    console.log('Test upload triggered');
    
    // Debug: Check if elements exist
    console.log('Debug info:', {
        uploadedFilesContainer: !!uploadedFilesContainer,
        containerElement: !!document.getElementById('uploadedFiles'),
        dragDropArea: !!document.getElementById('dragDropArea'),
        fileInput: !!document.getElementById('fileInput')
    });
    
    // Create a test file object
    const testFile = {
        name: 'test-document.pdf',
        size: 1024000, // 1MB
        type: 'application/pdf',
        lastModified: Date.now()
    };
    
    console.log('Created test file:', testFile);
    
    // Test the upload process
    if (validateFile(testFile)) {
        uploadFile(testFile);
    } else {
        console.error('Test file validation failed');
    }
}

// Debug function to check page state
function debugPageState() {
    console.log('=== PAGE DEBUG INFO ===');
    console.log('uploadedFilesContainer:', uploadedFilesContainer);
    console.log('Container element:', document.getElementById('uploadedFiles'));
    console.log('All elements:', {
        dragDropArea: document.getElementById('dragDropArea'),
        fileInput: document.getElementById('fileInput'),
        uploadedFiles: document.getElementById('uploadedFiles'),
        fallbackInput: document.getElementById('fallbackInput')
    });
    console.log('LocalStorage files:', localStorage.getItem('taxmind_uploaded_files'));
    console.log('========================');
}

// Make functions globally available
window.testUpload = testUpload;
window.debugPageState = debugPageState;

