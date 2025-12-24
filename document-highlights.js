// Document Highlights Page - Dedicated Grammarly-like highlighting system
// Separate from analysis page for focused document review

const DocumentHighlights = {
    pdfDoc: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    highlights: [],
    renderTask: null,
    currentFileId: null,
    fileObject: null, // Store the actual file object for rendering
    
    // Initialize the highlights page
    init: function() {
        // Configure PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        
        // Load file list
        this.loadFileList();
        
        // Check if file ID is in URL
        const urlParams = new URLSearchParams(window.location.search);
        const fileId = urlParams.get('fileId');
        if (fileId) {
            this.loadDocument(fileId);
        }
    },
    
    // Load list of uploaded files
    loadFileList: function() {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;
        
        const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
        
        if (Object.keys(uploadedFiles).length === 0) {
            fileList.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.5; margin-bottom: 1rem; display: block;"></i>
                    <p>No documents uploaded yet.</p>
                    <a href="upload-documents.html" style="color: #2563eb; text-decoration: none; font-weight: 600;">Upload Documents →</a>
                </div>
            `;
            return;
        }
        
        fileList.innerHTML = '';
        
        Object.entries(uploadedFiles).forEach(([fileId, file]) => {
            const fileCard = document.createElement('div');
            fileCard.className = 'file-card';
            fileCard.onclick = () => this.loadDocument(fileId);
            
            const taxTypeBadge = file.taxType ? 
                `<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-left: 0.5rem;">${file.taxTypeName || file.taxType}</span>` : '';
            
            fileCard.innerHTML = `
                <div class="file-card-name">
                    <i class="fas fa-file-pdf" style="margin-right: 0.5rem; color: #2563eb;"></i>
                    ${file.name}
                    ${taxTypeBadge}
                </div>
                <div class="file-card-info">
                    ${this.formatFileSize(file.size)} • ${file.analyzed ? 'Analyzed' : 'Not analyzed'}
                </div>
            `;
            
            fileList.appendChild(fileCard);
        });
    },
    
    // Load PDF document
    loadDocument: async function(fileId) {
        try {
            this.currentFileId = fileId;
            
            // Get file data from localStorage
            const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
            const file = uploadedFiles[fileId];
            
            if (!file) {
                this.showError('Document not found');
                return;
            }
            
            // Hide file selector, show viewer
            document.getElementById('fileSelector').style.display = 'none';
            document.getElementById('documentViewer').style.display = 'grid';
            
            // Update document name
            document.getElementById('viewer-document-name').textContent = file.name;
            
            // Show loading state
            const container = document.getElementById('pdf-container');
            container.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>Loading document...</p>
                </div>
            `;
            
            // Try to get file object from indexedDB or create a demo PDF
            await this.loadPDFFile(fileId, file);
            
            // Load highlights if available
            const allHighlights = JSON.parse(localStorage.getItem('taxmind_document_highlights') || '{}');
            let highlights = allHighlights[fileId] || [];
            
            // If no highlights exist, generate them
            if (highlights.length === 0 && typeof HighlightEngine !== 'undefined') {
                const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
                const accountType = currentUser.accountType || 'individual';
                const documentContent = file.name + ' ' + (file.contentSnippet || '');
                
                highlights = await HighlightEngine.analyzeDocument(
                    fileId, 
                    documentContent, 
                    file.taxType || 'income', 
                    accountType
                );
                
                // Store highlights
                allHighlights[fileId] = highlights;
                localStorage.setItem('taxmind_document_highlights', JSON.stringify(allHighlights));
            }
            
            this.loadHighlights(highlights);
            
            // Update document info
            this.updateDocumentInfo(file);
            
        } catch (error) {
            console.error('Error loading document:', error);
            this.showError('Failed to load document: ' + error.message);
        }
    },
    
    // Load PDF file - try to get from storage or show message
    async loadPDFFile(fileId, fileMeta) {
        try {
            // Check if we have file data stored
            const fileDataKey = `taxmind_file_data_${fileId}`;
            let fileData = localStorage.getItem(fileDataKey);
            
            if (fileData) {
                try {
                    // Convert base64 back to Uint8Array
                    const binaryString = atob(fileData);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    
                    // Check if it's a PDF by trying to render it
                    if (fileMeta.type === 'application/pdf' || fileMeta.name.toLowerCase().endsWith('.pdf')) {
                        await this.renderPDF(bytes);
                        return;
                    } else {
                        // For non-PDF files (images, etc.), show them differently
                        await this.renderImageFile(fileData, fileMeta);
                        return;
                    }
                } catch (renderError) {
                    console.error('Error rendering stored file:', renderError);
                    // Fall through to show demo message
                }
            }
            
            // If no stored file data, show message
            await this.renderDemoPDF(fileMeta);
            
        } catch (error) {
            console.error('Error loading PDF file:', error);
            // Fallback to demo message
            await this.renderDemoPDF(fileMeta);
        }
    },
    
    // Render image files (JPG, PNG, etc.)
    async renderImageFile(base64Data, fileMeta) {
        const container = document.getElementById('pdf-container');
        
        const img = document.createElement('img');
        img.src = 'data:' + fileMeta.type + ';base64,' + base64Data;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.border = '1px solid #e2e8f0';
        img.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        img.style.background = 'white';
        
        img.onload = () => {
            // Create overlay container for highlights
            const overlayContainer = document.createElement('div');
            overlayContainer.className = 'pdf-overlay-container';
            overlayContainer.style.position = 'absolute';
            overlayContainer.style.top = '0';
            overlayContainer.style.left = '0';
            overlayContainer.style.width = img.width + 'px';
            overlayContainer.style.height = img.height + 'px';
            overlayContainer.style.pointerEvents = 'none';
            overlayContainer.id = 'pdf-overlay-container';
            
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.appendChild(img);
            wrapper.appendChild(overlayContainer);
            
            container.innerHTML = '';
            container.appendChild(wrapper);
            
            // Render highlights after image loads
            setTimeout(() => this.renderHighlightsOnCanvas(), 100);
        };
        
        img.onerror = () => {
            this.showError('Failed to load image file');
        };
        
        this.totalPages = 1;
        this.currentPage = 1;
        this.updatePageInfo();
    },
    
    // Render actual PDF using PDF.js
    async renderPDF(pdfData) {
        try {
            const loadingTask = pdfjsLib.getDocument({ data: pdfData });
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            this.currentPage = 1;
            
            // Update page info
            this.updatePageInfo();
            
            // Render first page
            await this.renderPage(1);
        } catch (error) {
            console.error('Error rendering PDF:', error);
            throw error;
        }
    },
    
    // Render demo PDF (when actual file content is not available)
    async renderDemoPDF(fileMeta) {
        const container = document.getElementById('pdf-container');
        
        // Show message that file content is not available
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <h3>Document Preview</h3>
                <p><strong>File:</strong> ${fileMeta.name}</p>
                <p><strong>Size:</strong> ${this.formatFileSize(fileMeta.size)}</p>
                ${fileMeta.taxType ? `<p><strong>Tax Type:</strong> ${fileMeta.taxTypeName || fileMeta.taxType}</p>` : ''}
                <p style="margin-top: 1.5rem; color: #64748b;">
                    To view the actual document, please re-upload the file. The document content needs to be stored to display it here.
                </p>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #64748b;">
                    Highlights, suggestions, and red flags are displayed in the sidebar.
                </p>
            </div>
        `;
        
        // Set up for highlight overlays (on a minimal container)
        this.totalPages = 1;
        this.currentPage = 1;
        this.updatePageInfo();
        
        // Create a placeholder overlay container
        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'pdf-overlay-container';
        overlayContainer.id = 'pdf-overlay-container';
        overlayContainer.style.display = 'none'; // Hidden since no document to overlay on
        
        container.appendChild(overlayContainer);
    },
    
    // Render a page of the PDF
    renderPage: async function(pageNum) {
        if (!this.pdfDoc) return;
        
        this.currentPage = pageNum;
        const container = document.getElementById('pdf-container');
        
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale });
            
            // Create canvas for this page
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render PDF page to canvas
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Clear container and add page
            container.innerHTML = '';
            
            const pageWrapper = document.createElement('div');
            pageWrapper.className = 'pdf-page';
            pageWrapper.style.position = 'relative';
            pageWrapper.style.display = 'inline-block';
            
            const overlayContainer = document.createElement('div');
            overlayContainer.className = 'pdf-overlay-container';
            overlayContainer.style.position = 'absolute';
            overlayContainer.style.top = '0';
            overlayContainer.style.left = '0';
            overlayContainer.style.width = canvas.width + 'px';
            overlayContainer.style.height = canvas.height + 'px';
            overlayContainer.style.pointerEvents = 'none';
            overlayContainer.id = 'pdf-overlay-container';
            
            pageWrapper.appendChild(canvas);
            pageWrapper.appendChild(overlayContainer);
            container.appendChild(pageWrapper);
            
            // Render highlights on this page
            this.renderHighlightsOnPage(pageNum, viewport);
            
            this.updatePageInfo();
        } catch (error) {
            console.error('Error rendering page:', error);
            this.showError('Failed to render page: ' + error.message);
        }
    },
    
    // Render highlights on the current page
    renderHighlightsOnPage: function(pageNum, viewport) {
        const overlayContainer = document.getElementById('pdf-overlay-container');
        if (!overlayContainer) return;
        
        // Clear existing highlights
        overlayContainer.innerHTML = '';
        
        // Get highlights for this page
        const pageHighlights = this.highlights.filter(h => 
            (h.page === pageNum || h.page === undefined || h.page === null)
        );
        
        pageHighlights.forEach(highlight => {
            this.createHighlightOverlay(highlight, overlayContainer, viewport);
        });
    },
    
    // Render highlights on demo canvas
    renderHighlightsOnCanvas: function() {
        const container = document.getElementById('pdf-container');
        const overlayContainer = document.getElementById('pdf-overlay-container');
        if (!overlayContainer) return;
        
        // Clear existing highlights
        overlayContainer.innerHTML = '';
        
        // Get highlights (all go on page 1 for demo)
        const pageHighlights = this.highlights;
        
        // For demo canvas, use percentage-based positioning
        pageHighlights.forEach((highlight, index) => {
            const highlightDiv = document.createElement('div');
            highlightDiv.className = `highlight-box highlight-${highlight.type}`;
            highlightDiv.id = `highlight-overlay-${highlight.id}`;
            highlightDiv.title = highlight.message;
            
            // Position based on index (staggered layout for demo)
            const topOffset = 120 + (index * 80); // Start below header
            const leftOffset = 50;
            const width = 700;
            const height = 30;
            
            highlightDiv.style.position = 'absolute';
            highlightDiv.style.left = leftOffset + 'px';
            highlightDiv.style.top = topOffset + 'px';
            highlightDiv.style.width = width + 'px';
            highlightDiv.style.height = height + 'px';
            highlightDiv.style.cursor = 'pointer';
            highlightDiv.style.pointerEvents = 'all';
            
            // Add tooltip
            highlightDiv.addEventListener('mouseenter', () => {
                this.showHighlightTooltip(highlightDiv, highlight.message);
            });
            
            highlightDiv.addEventListener('click', () => {
                // Scroll to highlight in sidebar
                const sidebarItem = document.getElementById(`highlight-${highlight.id}`);
                if (sidebarItem) {
                    sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    sidebarItem.style.background = '#fff3cd';
                    setTimeout(() => {
                        sidebarItem.style.background = '';
                    }, 2000);
                }
            });
            
            overlayContainer.appendChild(highlightDiv);
        });
    },
    
    // Create highlight overlay for PDF page
    createHighlightOverlay: function(highlight, container, viewport) {
        const highlightDiv = document.createElement('div');
        highlightDiv.className = `highlight-box highlight-${highlight.type}`;
        highlightDiv.id = `highlight-overlay-${highlight.id}`;
        highlightDiv.title = highlight.message;
        
        // Use bbox if available, otherwise use default positioning
        if (highlight.bbox) {
            const { x, y, width, height } = highlight.bbox;
            highlightDiv.style.left = (x * viewport.scale) + 'px';
            highlightDiv.style.top = (y * viewport.scale) + 'px';
            highlightDiv.style.width = (width * viewport.scale) + 'px';
            highlightDiv.style.height = (height * viewport.scale) + 'px';
        } else {
            // Default positioning
            highlightDiv.style.left = '50px';
            highlightDiv.style.top = '200px';
            highlightDiv.style.width = '500px';
            highlightDiv.style.height = '20px';
        }
        
        highlightDiv.style.position = 'absolute';
        highlightDiv.style.cursor = 'pointer';
        highlightDiv.style.pointerEvents = 'all';
        
        highlightDiv.addEventListener('mouseenter', () => {
            this.showHighlightTooltip(highlightDiv, highlight.message);
        });
        
        highlightDiv.addEventListener('click', () => {
            const sidebarItem = document.getElementById(`highlight-${highlight.id}`);
            if (sidebarItem) {
                sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                sidebarItem.style.background = '#fff3cd';
                setTimeout(() => {
                    sidebarItem.style.background = '';
                }, 2000);
            }
        });
        
        container.appendChild(highlightDiv);
    },
    
    // Show tooltip for highlight
    showHighlightTooltip: function(element, message) {
        // Remove existing tooltip
        const existingTooltip = document.querySelector('.highlight-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'highlight-tooltip';
        tooltip.textContent = message;
        tooltip.style.position = 'absolute';
        tooltip.style.background = '#1e293b';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '6px';
        tooltip.style.fontSize = '0.875rem';
        tooltip.style.maxWidth = '300px';
        tooltip.style.zIndex = '1000';
        tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - 40) + 'px';
        
        document.body.appendChild(tooltip);
        
        element.addEventListener('mouseleave', () => {
            tooltip.remove();
        }, { once: true });
    },
    
    // Update page info display
    updatePageInfo: function() {
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        }
        
        // Update zoom display
        const zoomDisplay = document.querySelector('.highlights-zoom span');
        if (zoomDisplay) {
            zoomDisplay.textContent = Math.round(this.scale * 100) + '%';
        }
        
        // Update button states
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
    },
    
    // Update document info panel
    updateDocumentInfo: function(file) {
        const docInfo = document.getElementById('document-info');
        if (!docInfo) return;
        
        docInfo.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <strong style="color: #64748b; font-size: 0.85rem;">File Name</strong>
                <p style="margin: 0.25rem 0 0; color: #1e293b;">${file.name}</p>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong style="color: #64748b; font-size: 0.85rem;">File Size</strong>
                <p style="margin: 0.25rem 0 0; color: #1e293b;">${this.formatFileSize(file.size)}</p>
            </div>
            ${file.taxType ? `
            <div style="margin-bottom: 1rem;">
                <strong style="color: #64748b; font-size: 0.85rem;">Tax Type</strong>
                <p style="margin: 0.25rem 0 0; color: #1e293b;">${file.taxTypeName || file.taxType}</p>
            </div>
            ` : ''}
            ${file.analyzed ? `
            <div style="margin-bottom: 1rem;">
                <strong style="color: #64748b; font-size: 0.85rem;">Status</strong>
                <p style="margin: 0.25rem 0 0; color: #059669;">
                    <i class="fas fa-check-circle"></i> Analyzed
                </p>
            </div>
            ` : ''}
        `;
    },
    
    // Previous page
    prevPage: function() {
        if (this.currentPage > 1) {
            this.renderPage(this.currentPage - 1);
        }
    },
    
    // Next page
    nextPage: function() {
        if (this.currentPage < this.totalPages) {
            this.renderPage(this.currentPage + 1);
        }
    },
    
    // Zoom in
    zoomIn: function() {
        this.scale = Math.min(this.scale + 0.25, 3.0);
        if (this.pdfDoc) {
            this.renderPage(this.currentPage);
        }
        this.updatePageInfo();
    },
    
    // Zoom out
    zoomOut: function() {
        this.scale = Math.max(this.scale - 0.25, 0.5);
        if (this.pdfDoc) {
            this.renderPage(this.currentPage);
        }
        this.updatePageInfo();
    },
    
    // Load highlights from highlight engine
    loadHighlights: function(highlights) {
        this.highlights = highlights;
        this.displayHighlightsList();
        
        // Render highlights on document if it's loaded
        if (this.pdfDoc || document.getElementById('demo-pdf-canvas')) {
            if (this.pdfDoc) {
                // Re-render current page with highlights
                this.renderPage(this.currentPage);
            } else {
                // Render on demo canvas
                this.renderHighlightsOnCanvas();
            }
        }
    },
    
    // Display highlights in sidebar
    displayHighlightsList: function() {
        const highlightsList = document.getElementById('highlights-list');
        if (!highlightsList) return;
        
        highlightsList.innerHTML = '';
        
        if (this.highlights.length === 0) {
            highlightsList.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">No highlights found for this document</p>';
            return;
        }
        
        // Group by type
        const suggestions = this.highlights.filter(h => h.type === 'suggestion');
        const warnings = this.highlights.filter(h => h.type === 'warning');
        const redflags = this.highlights.filter(h => h.type === 'redflag');
        
        // Display red flags first
        redflags.forEach(highlight => {
            highlightsList.appendChild(this.createHighlightItem(highlight));
        });
        
        // Then warnings
        warnings.forEach(highlight => {
            highlightsList.appendChild(this.createHighlightItem(highlight));
        });
        
        // Then suggestions
        suggestions.forEach(highlight => {
            highlightsList.appendChild(this.createHighlightItem(highlight));
        });
    },
    
    // Create highlight item element
    createHighlightItem: function(highlight) {
        const item = document.createElement('div');
        item.className = `highlight-item ${highlight.type}`;
        item.id = `highlight-${highlight.id}`;
        
        item.innerHTML = `
            <div class="highlight-item-header">
                <span class="highlight-item-type ${highlight.type}">${this.getTypeLabel(highlight.type)}</span>
            </div>
            <div class="highlight-item-text">${highlight.message}</div>
            ${highlight.page ? `<div class="highlight-item-location">Page ${highlight.page}</div>` : ''}
        `;
        
        item.addEventListener('click', () => {
            // Navigate to page and highlight (if PDF is loaded)
            if (highlight.page && highlight.page !== this.currentPage && this.pdfDoc) {
                this.renderPage(highlight.page);
            }
            // Scroll to highlight on document
            const highlightOverlay = document.getElementById(`highlight-overlay-${highlight.id}`);
            if (highlightOverlay) {
                highlightOverlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlightOverlay.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    highlightOverlay.style.transform = '';
                }, 500);
            }
        });
        
        return item;
    },
    
    // Get type label
    getTypeLabel: function(type) {
        const labels = {
            'suggestion': 'Suggestion',
            'warning': 'Warning',
            'redflag': 'Red Flag'
        };
        return labels[type] || type;
    },
    
    // Show error message
    showError: function(message) {
        const container = document.getElementById('pdf-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p style="color: #ef4444;">${message}</p>
            </div>
        `;
    },
    
    // Format file size
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Select different file
function selectDifferentFile() {
    document.getElementById('fileSelector').style.display = 'block';
    document.getElementById('documentViewer').style.display = 'none';
    DocumentHighlights.currentFileId = null;
    DocumentHighlights.pdfDoc = null;
    DocumentHighlights.currentPage = 1;
    DocumentHighlights.totalPages = 0;
}
