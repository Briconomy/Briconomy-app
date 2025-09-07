import React, { useState } from 'react';
import TopNav from '../components/TopNav';
import BottomNav from '../components/BottomNav';
import StatCard from '../components/StatCard';
import ActionCard from '../components/ActionCard';
import DataTable from '../components/DataTable';
import SearchFilter from '../components/SearchFilter';

function DocumentManagementPage() {
  const [documents, setDocuments] = useState([
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

  const navItems = [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/properties', label: 'Properties' },
    { path: '/manager/documents', label: 'Documents', active: true },
    { path: '/manager/reports', label: 'Reports' }
  ];

  const totalDocuments = documents.length;
  const signedDocuments = documents.filter(d => d.status === 'signed').length;
  const pendingDocuments = documents.filter(d => d.status === 'pending').length;
  const totalSize = documents.reduce((sum, doc) => {
    const size = parseFloat(doc.fileSize);
    return sum + (doc.fileSize.includes('MB') ? size : size / 1024);
  }, 0);

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, categoryFilter, typeFilter);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'category') {
      setCategoryFilter(value);
      applyFilters(searchTerm, value, typeFilter);
    } else if (key === 'type') {
      setTypeFilter(value);
      applyFilters(searchTerm, categoryFilter, value);
    }
  };

  const applyFilters = (search, category, type) => {
    let filtered = documents;

    if (search) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(search.toLowerCase()) ||
        doc.property.toLowerCase().includes(search.toLowerCase())
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
    { key: 'name', label: 'Document' },
    { key: 'type', label: 'Type' },
    { key: 'category', label: 'Category' },
    { key: 'uploadedBy', label: 'Uploaded By' },
    { 
      key: 'uploadDate', 
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { key: 'fileSize', label: 'Size' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: 'other',
        category: 'general',
        uploadedBy: 'Current User',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'pending',
        property: 'Blue Hills Apartments'
      };
      setDocuments(prev => [newDocument, ...prev]);
      setShowUploadForm(false);
    }
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Document Management</div>
          <div className="page-subtitle">Store and manage property documents</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={totalDocuments} label="Total Docs" />
          <StatCard value={signedDocuments} label="Signed" />
          <StatCard value={pendingDocuments} label="Pending" />
          <StatCard value={`${totalSize.toFixed(1)} MB`} label="Storage" />
        </div>

        <SearchFilter
          placeholder="Search documents..."
          onSearch={handleSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <DataTable
          title="Document Library"
          data={filteredDocuments}
          columns={documentColumns}
          actions={
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowUploadForm(true)}
            >
              Upload
            </button>
          }
          onRowClick={(doc) => {}}
        />

        <div className="quick-actions">
          <ActionCard
            onClick={() => {}}
            icon="U"
            title="Upload Documents"
            description="Add new files"
          />
          <ActionCard
            onClick={() => {}}
            icon="T"
            title="Templates"
            description="Document templates"
          />
          <ActionCard
            onClick={() => {}}
            icon="S"
            title="Sign Documents"
            description="E-signature portal"
          />
          <ActionCard
            onClick={() => {}}
            icon="A"
            title="Archive"
            description="Document archive"
          />
        </div>
      </div>
      
      {showUploadForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button className="close-btn" onClick={() => setShowUploadForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="upload-area">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="upload-label">
                  <div className="upload-icon">DOC</div>
                  <p>Click to upload or drag and drop</p>
                  <p className="upload-subtitle">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                </label>
              </div>
              
              <div className="form-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default DocumentManagementPage;