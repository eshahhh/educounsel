let currentUser = null;
let documents = [];

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Documents page loaded');
    currentUser = checkAuth('student');
    if (!currentUser) {
        console.log('No current user, exiting');
        return;
    }
    console.log('Current user:', currentUser);
    updateUserName();
    initDragAndDrop();
    await loadDocuments();
});

function updateUserName() {
    const userName = currentUser.name || 'Student';
    const firstName = userName.split(' ')[0];
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = firstName;
}

window.updateUserName = function () {
    const userName = currentUser.name || 'Student';
    const firstName = userName.split(' ')[0];
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = firstName;
};

function initDragAndDrop() {
    console.log('Initializing drag and drop');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    if (!dropZone || !fileInput) {
        console.log('Drop zone or file input not found');
        return;
    }
    console.log('Found drop zone and file input');

    // Click to open file dialog
    dropZone.addEventListener('click', () => {
        console.log('Drop zone clicked, triggering file input');
        fileInput.click();
    });

    // Handle file selection via click
    fileInput.addEventListener('change', (e) => {
        console.log('File input changed, files selected:', e.target.files);
        handleFiles(e.target.files);
    });

    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        console.log('Drag over detected');
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(78, 205, 196, 0.05)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        console.log('Drag leave detected');
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--muted)';
    });

    dropZone.addEventListener('drop', (e) => {
        console.log('Drop detected, files:', e.dataTransfer.files);
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--muted)';
        handleFiles(e.dataTransfer.files);
    });
}

async function handleFiles(files) {
    console.log('Handling files:', files);
    if (!files || files.length === 0) {
        console.log('No files to handle');
        return;
    }
    for (let file of files) {
        console.log('Processing file:', file.name, 'size:', file.size);
        if (!validateFile(file)) {
            console.log('File validation failed for:', file.name);
            continue;
        }
        await uploadFile(file);
    }
}

function validateFile(file) {
    console.log('Validating file:', file.name);
    const maxSize = Config.APP.MAX_FILE_SIZE || 10485760;
    const allowedTypes = Config.APP.ALLOWED_FILE_TYPES || [];
    console.log('Max size:', maxSize, 'Allowed types:', allowedTypes);
    if (file.size > maxSize) {
        console.log('File too large');
        Toast.error(`File ${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`);
        return false;
    }
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|jpg|jpeg|png)$/i)) {
        console.log('File type not allowed');
        Toast.error(`File type not allowed: ${file.name}`);
        return false;
    }
    console.log('File validation passed');
    return true;
}

async function uploadFile(file) {
    console.log('Uploading file:', file.name);
    try {
        const formData = new FormData();
        formData.append('file', file);

        // Determine document type based on filename - required by backend
        const docType = getDocumentType(file.name);
        console.log('Document type:', docType);
        formData.append('documentType', docType);

        // applicationId is optional
        // formData.append('applicationId', 'some-uuid');

        console.log('Sending upload request');
        const result = await API.request('/documents', {
            method: 'POST',
            body: formData
        });
        console.log('Upload result:', result);

        if (result.success) {
            console.log('Upload successful');
            Toast.success(`${file.name} uploaded successfully!`);
            await loadDocuments();
        } else {
            console.log('Upload failed, no success flag');
        }
    } catch (error) {
        console.error('Upload error:', error);
        Toast.error(error.message || `Failed to upload ${file.name}`);
    }
}

function getDocumentType(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('transcript')) return 'transcript';
    if (lower.includes('passport')) return 'passport';
    if (lower.includes('sat') || lower.includes('test') || lower.includes('score')) return 'test-score';
    if (lower.includes('recommendation') || lower.includes('letter')) return 'recommendation';
    if (lower.includes('essay')) return 'essay';
    if (lower.includes('financial')) return 'financial';
    return 'other';
}

async function loadDocuments() {
    console.log('Loading documents');
    try {
        const studentId = currentUser.student?.id || currentUser.id;
        console.log('Student ID:', studentId);
        const result = await API.get(`/documents?studentId=${studentId}`);
        console.log('Load documents result:', result);

        documents = result.data || [];
        console.log('Documents loaded:', documents.length);
        renderDocuments();
    } catch (error) {
        console.error('Error loading documents:', error);
        Toast.error('Failed to load documents');
    }
}

function renderDocuments() {
    const grid = document.getElementById('fileGrid');
    if (!grid) return;

    if (documents.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted-fg);">No documents uploaded yet</p>';
        return;
    }

    grid.innerHTML = documents.map(doc => `
    <div class="document-item">
        <div class="document-icon">${getFileIcon(doc.file_path || doc.name)}</div>
        <div class="document-info">
            <div class="document-name">${truncateFileName(doc.file_path ? doc.file_path.split('/').pop() : doc.name, 20)}</div>
            <div class="document-meta">${formatFileSize(doc.file_size || 0)} • ${formatDate(doc.uploaded_at)}</div>
        </div>
        <div class="document-status">
            <span class="badge ${getStatusBadgeClass(doc.status)}">${doc.status || 'pending'}</span>
        </div>
        <div class="document-actions">
            <button class="btn-icon" onclick="previewDocument('${doc.id}')" title="Preview">👁️</button>
            <button class="btn-icon" onclick="downloadDocument('${doc.id}')" title="Download">⬇️</button>
            <button class="btn-icon" onclick="deleteDocument('${doc.id}')" title="Delete">🗑️</button>
        </div>
    </div>
`).join('');
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': 'PDF',
        'doc': 'DOC',
        'docx': 'DOC',
        'jpg': 'IMG',
        'jpeg': 'IMG',
        'png': 'IMG'
    };
    return icons[ext] || 'FILE';
}

function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
    return nameWithoutExt.slice(0, maxLength - ext.length - 4) + '...' + ext;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
}

function getStatusBadgeClass(status) {
    const classes = {
        'approved': 'badge-success',
        'pending': 'badge-warning',
        'rejected': 'badge-error'
    };
    return classes[status] || '';
}

async function deleteDocument(docId) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }

    try {
        await API.delete(`/documents/${docId}`);
        Toast.success('Document deleted successfully');
        await loadDocuments();
    } catch (error) {
        console.error('Error deleting document:', error);
        Toast.error(error.message || 'Failed to delete document');
    }
}

window.deleteDocument = async function (docId) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }

    try {
        await API.delete(`/documents/${docId}`);
        Toast.success('Document deleted successfully');
        await loadDocuments();
    } catch (error) {
        console.error('Error deleting document:', error);
        Toast.error(error.message || 'Failed to delete document');
    }
};

function previewDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        Toast.info(`Preview not implemented for: ${doc.name}`);
    }
}

window.previewDocument = function (docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        Toast.info(`Preview not implemented for: ${doc.name}`);
    }
};

function downloadDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        Toast.info(`Download not implemented for: ${doc.name}`);
    }
}

window.downloadDocument = function (docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        Toast.info(`Download not implemented for: ${doc.name}`);
    }
};

const documentStyle = document.createElement('style');
documentStyle.textContent = `
    .file-grid {
        display: grid;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    
    .file-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: white;
        transition: box-shadow 0.2s;
    }
    
    .file-card:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .file-icon {
        font-size: 2rem;
        flex-shrink: 0;
    }
    
    .file-info {
        flex: 1;
        min-width: 0;
    }
    
    .file-name {
        font-weight: 500;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .file-meta {
        font-size: 0.85rem;
        color: var(--muted-fg);
        margin-bottom: 0.5rem;
    }
    
    .file-actions {
        display: flex;
        gap: 0.5rem;
        flex-shrink: 0;
    }
    
    .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 1rem;
    }
    
    .file-upload-zone {
        border: 2px dashed var(--border);
        border-radius: 8px;
        padding: 3rem;
        text-align: center;
        background: var(--muted);
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .file-upload-zone:hover {
        border-color: var(--primary);
        background: rgba(78, 205, 196, 0.05);
    }
    
    .file-upload-zone p {
        margin: 0;
        color: var(--muted-fg);
    }
    
    .document-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: white;
        transition: box-shadow 0.2s;
    }
    
    .document-item:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .document-icon {
        font-size: 2rem;
        flex-shrink: 0;
    }
    
    .document-info {
        flex: 1;
        min-width: 0;
    }
    
    .document-name {
        font-weight: 500;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .document-meta {
        font-size: 0.85rem;
        color: var(--muted-fg);
        margin-bottom: 0.5rem;
    }
    
    .document-status {
        flex-shrink: 0;
    }
    
    .document-actions {
        display: flex;
        gap: 0.5rem;
        flex-shrink: 0;
    }
    
    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background 0.2s;
    }
    
    .btn-icon:hover {
        background: var(--muted);
    }
    
    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .badge-success {
        background: #d4edda;
        color: #155724;
    }
    
    .badge-warning {
        background: #fff3cd;
        color: #856404;
    }
    
    .badge-error {
        background: #f8d7da;
        color: #721c24;
    }
`;
document.head.appendChild(documentStyle);
