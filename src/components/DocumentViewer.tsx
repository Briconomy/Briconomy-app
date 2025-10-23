import { useState, type FormEvent } from 'react';
import Icon from './Icon.tsx';

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
    },
    {
      id: '3',
      name: 'Maintenance Report - Dec 2023',
      type: 'maintenance_report',
      uploadDate: '2023-12-20',
      fileSize: '342 KB',
      url: '#'
    }
  ]);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | Document['type']>('all');
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

  const handleDeleteDocument = (id: string, docName: string) => {
    if (confirm(`Are you sure you want to delete "${docName}"?`)) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  };

  const handleSubmitUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.file || !formData.name) return;

    setUploading(true);
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
      case 'lease': return 'docs';
      case 'payment_receipt': return 'payment';
      case 'maintenance_report': return 'maintenance';
      case 'other': return 'docs';
      default: return 'docs';
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

  const getDocumentTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'lease': return 'type-lease';
      case 'payment_receipt': return 'type-payment';
      case 'maintenance_report': return 'type-maintenance';
      case 'other': return 'type-other';
      default: return 'type-other';
    }
  };

  const filteredDocuments = filterType === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === filterType);

  return (
    <div className="document-viewer">
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <div className="section-title">My Documents</div>
            <div className="section-subtitle">{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}</div>
          </div>
          <button 
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleUpload}
          >
            Upload Document
          </button>
        </div>

        <div className="document-filters">
          <button 
            type="button"
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            type="button"
            className={`filter-btn ${filterType === 'lease' ? 'active' : ''}`}
            onClick={() => setFilterType('lease')}
          >
            Leases
          </button>
          <button 
            type="button"
            className={`filter-btn ${filterType === 'payment_receipt' ? 'active' : ''}`}
            onClick={() => setFilterType('payment_receipt')}
          >
            Receipts
          </button>
          <button 
            type="button"
            className={`filter-btn ${filterType === 'maintenance_report' ? 'active' : ''}`}
            onClick={() => setFilterType('maintenance_report')}
          >
            Reports
          </button>
          <button 
            type="button"
            className={`filter-btn ${filterType === 'other' ? 'active' : ''}`}
            onClick={() => setFilterType('other')}
          >
            Other
          </button>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="empty-state-card">
            <Icon name="docs" alt="Documents" size={48} />
            <div className="empty-state-title">No documents found</div>
            <div className="empty-state-text">
              {filterType === 'all' 
                ? 'Upload your first document to get started' 
                : `No ${getDocumentTypeName(filterType).toLowerCase()}s found`}
            </div>
            {filterType === 'all' && (
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handleUpload}
              >
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="documents-list">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="document-icon-wrapper">
                  <Icon name={getDocumentIcon(doc.type)} alt={doc.type} size={32} />
                </div>
                <div className="document-info">
                  <div className="document-name">{doc.name}</div>
                  <div className="document-meta">
                    <span className={`document-type-badge ${getDocumentTypeColor(doc.type)}`}>
                      {getDocumentTypeName(doc.type)}
                    </span>
                    <span className="document-size">{doc.fileSize}</span>
                    <span className="document-date">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="document-actions">
                  <button 
                    type="button"
                    className="btn-icon"
                    onClick={() => handleViewDocument(doc)}
                    title="View"
                  >
                    <Icon name="properties" alt="View" size={20} />
                  </button>
                  <button 
                    type="button"
                    className="btn-icon"
                    onClick={() => doc.url && globalThis.open(doc.url, '_blank')}
                    title="Download"
                  >
                    <Icon name="docs" alt="Download" size={20} />
                  </button>
                  <button 
                    type="button"
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDeleteDocument(doc.id, doc.name)}
                    title="Delete"
                  >
                    <Icon name="maintenance" alt="Delete" size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadForm && (
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="section-title">Upload Document</div>
              <button 
                type="button"
                className="close-btn"
                onClick={() => setShowUploadForm(false)}
                disabled={uploading}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitUpload} className="upload-form">
                <div className="form-group">
                  <label className="form-label">Document Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter document name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Document Type</label>
                  <select
                    className="form-select"
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
                  <label className="form-label">Select File</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="file-upload"
                      className="file-input"
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        file: e.target.files?.[0] || null 
                      }))}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      required
                    />
                    <label htmlFor="file-upload" className="file-input-label">
                      {formData.file ? formData.file.name : 'Choose a file'}
                    </label>
                  </div>
                  {formData.file && (
                    <div className="file-info">
                      {(formData.file.size / 1024).toFixed(1)} KB
                    </div>
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
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedDocument && (
        <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="section-title">{selectedDocument.name}</div>
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
                <div className="document-details-card">
                  <div className="detail-row">
                    <span className="detail-label">Type</span>
                    <span className={`document-type-badge ${getDocumentTypeColor(selectedDocument.type)}`}>
                      {getDocumentTypeName(selectedDocument.type)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Size</span>
                    <span className="detail-value">{selectedDocument.fileSize}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Uploaded</span>
                    <span className="detail-value">{new Date(selectedDocument.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="document-preview-area">
                  <Icon name="docs" alt="Document" size={64} />
                  <div className="preview-text">Document Preview</div>
                  <div className="preview-subtext">
                    Preview functionality will be implemented with a document viewer
                  </div>
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
                  onClick={() => selectedDocument.url && globalThis.open(selectedDocument.url, '_blank')}
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