import { useState, useEffect } from 'react';
import TopNav from "../components/TopNav.tsx";
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import Icon from '../components/Icon.tsx';

function DocumentManagementPage() {
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);
  const [documents] = useState([
    {
      id: '1',
      name: 'Lease Agreement - John Tenant',
      type: 'lease',
      category: 'legal',
      uploadedBy: 'John Tenant',
      uploadDate: '2024-01-01',
      fileSize: '2.5 MB',
      status: 'signed',
      property: 'Blue Hills Apartments',
      unit: '2A'
    },
    {
      id: '2',
      name: 'Property Inspection Report',
      type: 'inspection',
      category: 'maintenance',
      uploadedBy: 'Mike Caretaker',
      uploadDate: '2024-08-15',
      fileSize: '1.2 MB',
      status: 'approved',
      property: 'Blue Hills Apartments'
    },
    {
      id: '3',
      name: 'Rent Receipt - August 2024',
      type: 'receipt',
      category: 'financial',
      uploadedBy: 'System',
      uploadDate: '2024-08-01',
      fileSize: '0.5 MB',
      status: 'generated',
      property: 'Blue Hills Apartments',
      unit: '2A'
    },
    {
      id: '4',
      name: 'Maintenance Request - AC Repair',
      type: 'maintenance',
      category: 'maintenance',
      uploadedBy: 'John Tenant',
      uploadDate: '2024-08-25',
      fileSize: '0.8 MB',
      status: 'pending',
      property: 'Blue Hills Apartments',
      unit: '2A'
    },
    {
      id: '5',
      name: 'Property Insurance Policy',
      type: 'insurance',
      category: 'legal',
      uploadedBy: 'Sarah Manager',
      uploadDate: '2024-01-15',
      fileSize: '4.2 MB',
      status: 'active',
      property: 'Blue Hills Apartments'
    }
  ]);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState(documents);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    setFilteredDocuments(documents);
  }, [documents]);

  const loadDocuments = () => {
    setLoading(true);
    setError(null);
    setFilteredDocuments(documents);
    setLoading(false);
  };

  const navItems = [
    { path: '/manager', label: 'Dashboard', icon: 'performanceAnalytics', active: false },
    { path: '/manager/properties', label: 'Properties', icon: 'properties' },
    { path: '/manager/leases', label: 'Leases', icon: 'lease' },
    { path: '/manager/payments', label: 'Payments', icon: 'payment' }
  ];

  const totalDocuments = documents.length;
  const signedDocuments = documents.filter(d => d.status === 'signed').length;
  const pendingDocuments = documents.filter(d => d.status === 'pending').length;
  const totalSize = documents.reduce((sum, doc) => {
    const sizeInMB = parseFloat(doc.fileSize);
    return sum + (isNaN(sizeInMB) ? 0 : sizeInMB);
  }, 0);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, categoryFilter, typeFilter);
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'category') {
      setCategoryFilter(value);
      applyFilters(searchTerm, value, typeFilter);
    } else if (key === 'type') {
      setTypeFilter(value);
      applyFilters(searchTerm, categoryFilter, value);
    }
  };

  const applyFilters = (search: string, category: string, type: string) => {
    let filtered = documents;

    if (search) {
      filtered = filtered.filter(doc =>
        doc.name?.toLowerCase().includes(search.toLowerCase()) ||
        doc.uploadedBy?.toLowerCase().includes(search.toLowerCase()) ||
        doc.property?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(doc => doc.category === category);
    }

    if (type !== 'all') {
      filtered = filtered.filter(doc => doc.type === type);
    }

    setFilteredDocuments(filtered);
  };

  const documentColumns = [
    { 
      key: 'name', 
      label: 'Document',
      render: (value: string) => (
        <div style={{
          maxWidth: '150px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {value}
        </div>
      )
    },
    { key: 'type', label: 'Type' },
    { key: 'category', label: 'Category' },
    { 
      key: 'uploadedBy', 
      label: 'Uploaded By'
    },
    { 
      key: 'uploadDate', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'fileSize', 
      label: 'Size'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`status-badge ${
          value === 'signed' ? 'status-paid' : 
          value === 'approved' ? 'status-paid' :
          value === 'generated' ? 'status-progress' :
          value === 'active' ? 'status-paid' : 'status-pending'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    }
  ];

  const filters = [
    {
      key: 'category',
      value: categoryFilter,
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'legal', label: 'Legal' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'financial', label: 'Financial' },
        { value: 'insurance', label: 'Insurance' }
      ]
    },
    {
      key: 'type',
      value: typeFilter,
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'lease', label: 'Lease' },
        { value: 'inspection', label: 'Inspection' },
        { value: 'receipt', label: 'Receipt' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'insurance', label: 'Insurance' }
      ]
    }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConfirmUpload = () => {
    if (!selectedFile) return;
    
    try {
      setError(null);
      setUploading(true);
      
      setShowUploadForm(false);
      setUploadSuccess(true);
      setLastUploadedFile(selectedFile.name);
      setSelectedFile(null);
      loadDocuments();
      
      setTimeout(() => {
        setUploadSuccess(false);
        setLastUploadedFile(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to upload document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Document Management</div>
          <div className="page-subtitle">Store and manage property documents</div>
        </div>

        {error && (
          <div style={{ 
            padding: '16px', 
            margin: '16px 0', 
            background: '#fee', 
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        {uploadSuccess && (
          <div style={{ 
            padding: '16px', 
            margin: '16px 0', 
            background: '#efe', 
            border: '1px solid #cfc',
            borderRadius: '8px',
            color: '#3c3'
          }}>
            {lastUploadedFile 
              ? `"${lastUploadedFile}" uploaded successfully!` 
              : 'Document uploaded successfully!'}
          </div>
        )}
        
        <div className="dashboard-grid">
          <StatCard value={totalDocuments} label="Total Docs" />
          <StatCard value={signedDocuments} label="Signed" />
          <StatCard value={pendingDocuments} label="Pending" />
          <StatCard value={`${totalSize.toFixed(1)} MB`} label="Storage" />
        </div>
        
        <div style={{ display: 'flex',alignItems: 'center', justifyContent: 'center', margin: '24px 0' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center',justifyContent: 'center' }}>
            <SearchFilter
              placeholder="Search documents..."
              onSearch={handleSearch}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        <DataTable
          title="Document Library"
          data={filteredDocuments}
          columns={documentColumns as unknown as never}
          actions={
            <button type="button"
              className="btn btn-primary"
              onClick={() => setShowUploadForm(true)}
              style={{ 
                padding: '6px 12px', 
                fontSize: '14px',
                minWidth: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              Upload
            </button>
          }
          onRowClick={(_doc) => {}}
        />

        <div className="quick-actions">
          <ActionCard
            onClick={() => setShowUploadForm(true)}
            icon={<Icon name="uploadDoc" alt="Upload Documents" size={48} />}
            title="Upload Documents"
            description="Upload lease agreements and tenant documents"
          />
        </div>
      </div>
      
      {showUploadForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button type="button" className="close-btn" onClick={() => setShowUploadForm(false)}>×</button>
            </div>
            <div className="modal-body">
              {uploading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '18px', marginBottom: '16px' }}>Uploading...</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {selectedFile ? `Uploading "${selectedFile.name}"` : 'Please wait while we process your file'}
                  </div>
                </div>
              ) : (
                <>
                  <div className="upload-area">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" className="upload-label">
                      <div className="upload-icon">DOC</div>
                      {selectedFile ? (
                        <>
                          <div style={{ 
                            width: '100%',
                            maxWidth: '280px',
                            margin: '0 auto'
                          }}>
                            <p style={{ 
                              fontWeight: 'bold', 
                              color: '#2ecc71',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              width: '100%',
                              margin: '8px 0'
                            }}>
                              Selected: {selectedFile.name}
                            </p>
                            <p className="upload-subtitle" style={{ margin: '4px 0' }}>
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Click to change file
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <p>Click to upload or drag and drop</p>
                          <p className="upload-subtitle">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    {selectedFile && (
                      <button type="button"
                        className="btn btn-primary"
                        onClick={handleConfirmUpload}
                        style={{ marginRight: '8px' }}
                      >
                        Confirm Upload
                      </button>
                    )}
                    <button type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowUploadForm(false);
                        setSelectedFile(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default DocumentManagementPage;