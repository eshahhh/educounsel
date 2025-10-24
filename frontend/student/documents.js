let currentUser = null;
let documents = [];

document.addEventListener('DOMContentLoaded', async function () {
    currentUser = checkAuth('student');
    if (!currentUser) return;
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

function initDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    if (!dropZone || !fileInput) return;
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(78, 205, 196, 0.1)';
    });
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--muted)';
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--muted)';
        handleFiles(e.dataTransfer.files);
    });
}

async function handleFiles(files) {
    if (!files || files.length === 0) return;
    for (let file of files) {
        if (!validateFile(file)) continue;
        await uploadFile(file);
    }
}

function validateFile(file) {
    const maxSize = Config.APP.MAX_FILE_SIZE || 10485760;
    const allowedTypes = Config.APP.ALLOWED_FILE_TYPES || [];
    if (file.size > maxSize) {
        Toast.error(`File ${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`);
        return false;
    }
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|jpg|jpeg|png)$/i)) {
        Toast.error(`File type not allowed: ${file.name}`);
        return false;
    }
    return true;
}

async function uploadFile(file) {
    try {
        Toast.info(`Uploading ${file.name}...`);
        let result;
        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            result = await MockData.uploadDocument(currentUser.id, {
                name: file.name,
                type: getDocumentType(file.name),
                size: file.size
            });
        } else {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('studentId', currentUser.id);
            const response = await fetch(
                `${Config.API_BASE_URL}${Config.ENDPOINTS.DOCUMENTS.UPLOAD}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${Storage.get(Config.STORAGE_KEYS.AUTH_TOKEN)}`
                    },
                    body: formData
                }
            );
            result = await response.json();
        }
        if (result.success) {
            Toast.success(`${file.name} uploaded successfully!`);
            documents.push(result.data);
            renderDocuments();
        } else {
            Toast.error(`Failed to upload ${file.name}`);
        }
    } catch (error) {
        console.error('Upload error:', error);
        Toast.error(`Error uploading ${file.name}`);
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
    try {
        let result;
        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            result = await MockData.getDocuments(currentUser.id);
        } else {
            result = await API.get(Config.ENDPOINTS.STUDENTS.DOCUMENTS.replace(':id', currentUser.id));
        }
        if (result.success) {
            documents = result.data;
            renderDocuments();
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        Toast.error('Failed to load documents');
    }
}

function renderDocuments() {
    const fileGrid = document.getElementById('fileGrid');
    if (!fileGrid) return;
    if (documents.length === 0) {
        fileGrid.innerHTML = '<p style="color: var(--muted-fg); text-align: center; padding: 2rem;">No documents uploaded yet</p>';
        return;
    }
    fileGrid.innerHTML = documents.map(doc => `
        <div class="file-card" data-doc-id="${doc.id}">
            <div class="file-icon">${getFileIcon(doc.name)}</div>
            <div class="file-info">
                <div class="file-name" title="${doc.name}">${truncateFileName(doc.name, 25)}</div>
                <div class="file-meta">${formatFileSize(doc.size)} • ${formatDate(doc.uploadedAt)}</div>
                <div class="file-status">
                    <span class="badge ${getStatusBadgeClass(doc.status)}">${doc.status}</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-ghost btn-sm" onclick="previewDocument(${doc.id})" title="Preview">Preview</button>
                <button class="btn btn-ghost btn-sm" onclick="downloadDocument(${doc.id})" title="Download">Download</button>
                <button class="btn btn-ghost btn-sm" onclick="deleteDocument(${doc.id})" title="Delete">Delete</button>
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
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
        let result;
        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            result = await MockData.deleteDocument(docId);
        } else {
            result = await API.delete(Config.ENDPOINTS.DOCUMENTS.DELETE.replace(':id', docId));
        }
        if (result.success) {
            Toast.success('Document deleted successfully');
            documents = documents.filter(doc => doc.id !== docId);
            renderDocuments();
        } else {
            Toast.error('Failed to delete document');
        }
    } catch (error) {
        console.error('Delete error:', error);
        Toast.error('Error deleting document');
    }
}

function previewDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        Toast.info(`Preview not implemented for: ${doc.name}`);
    }
}

function downloadDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        Toast.info(`Download not implemented for: ${doc.name}`);
    }
}

const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);
