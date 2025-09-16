import React, { useState } from 'react';

interface Document {
  id: string;
  name: string;
  type: 'lease' | 'payment_receipt' | 'maintenance_report' | 'other';
  uploadDate: string;
  fileSize: string;
  url?: string;
}

function DocumentViewer() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Lease Agreement - 2024',
      type: 'lease',
      uploadDate: '2024-01-01',
      fileSize: '2.4 MB',
      url: '#'
    },
    {
      id: '2',
      name: 'Payment Receipt - January 2024',
      type: 'payment_receipt',
      uploadDate: '2024-01-15',
      fileSize: '156 KB',
      url: '#'
    }
  ]);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as Document['type'],
    file: null as File | null
  });

  const handleUpload = () => {
    setFormData({
      name: '',
      type: 'other',
      file: null
    });
    setShowUploadForm(true);
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.name) return;

    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const newDocument: Document = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: `${(formData.file.size / 1024).toFixed(1)} KB`,
        url: '#'
      };

      setDocuments(prev => [...prev, newDocument]);
      setShowUploadForm(false);
      setUploading(false);
      setFormData({
        name: '',
        type: 'other',
        file: null
      });
    }, 1500);
  };

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'lease': return 'Document';
      case 'payment_receipt': return 'Receipt';
      case 'maintenance_report': return 'Report';
      case 'other': return 'File';
      default: return 'Document';
    }
  };

  const getDocumentTypeName = (type: Document['type']) => {
    switch (type) {
      case 'lease': return 'Lease Agreement';
      case 'payment_receipt': return 'Payment Receipt';
      case 'maintenance_report': return 'Maintenance Report';
      case 'other': return 'Other Document';
      default: return 'Document';
    }
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  return (
    <div className="document-viewer">
      <div className="section-header">
        <h3>Documents</h3>
        <button 
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleUpload}
        >
          Upload Document
        </button>
      </div>

      <div className="documents-grid">
        {documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents uploaded yet</p>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-icon">{getDocumentIcon(doc.type)}</div>
              <div className="document-info">
                <h4>{doc.name}</h4>
                <p className="document-type">{getDocumentTypeName(doc.type)}</p>
                <p className="document-meta">
                  {formatFileSize(doc.fileSize)} • {new Date(doc.uploadDate).toLocaleDateString()}
                </p>
              </div>
              <div className="document-actions">
                <button 
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => handleViewDocument(doc)}
                >
                  View
                </button>
                <button 
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => doc.url && window.open(doc.url, '_blank')}
                >
                  Download
                </button>
                <button 
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteDocument(doc.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showUploadForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button 
                type="button"
                className="close-btn"
                onClick={() => setShowUploadForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitUpload}>
                <div className="form-group">
                  <label>Document Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter document name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Document Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as Document['type']
                    }))}
                  >
                    <option value="lease">Lease Agreement</option>
                    <option value="payment_receipt">Payment Receipt</option>
                    <option value="maintenance_report">Maintenance Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Select File</label>
                  <input
                    type="file"
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      file: e.target.files?.[0] || null 
                    }))}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                  {formData.file && (
                    <p className="file-info">
                      Selected: {formData.file.name} ({(formData.file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUploadForm(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={!formData.file || !formData.name || uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedDocument && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>{selectedDocument.name}</h3>
              <button 
                type="button"
                className="close-btn"
                onClick={() => setSelectedDocument(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="document-preview">
                <div className="document-details">
                  <p><strong>Type:</strong> {getDocumentTypeName(selectedDocument.type)}</p>
                  <p><strong>Size:</strong> {formatFileSize(selectedDocument.fileSize)}</p>
                  <p><strong>Upload Date:</strong> {new Date(selectedDocument.uploadDate).toLocaleDateString()}</p>
                </div>
                <div className="document-placeholder">
                  <div className="placeholder-icon">Document</div>
                  <p>Document preview would appear here</p>
                  <p className="placeholder-text">
                    This is a placeholder for the actual document viewer. 
                    In a real implementation, this would show the document content.
                  </p>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedDocument(null)}
                >
                  Close
                </button>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => selectedDocument.url && window.open(selectedDocument.url, '_blank')}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentViewer;
