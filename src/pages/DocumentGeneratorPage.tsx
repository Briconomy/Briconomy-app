import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import Modal from '../components/Modal.tsx';
import { terminationsApi, formatCurrency, formatDate } from '../services/api.ts';

interface Termination {
  _id: string;
  tenant: {
    name: string;
    email: string;
  };
  unit: {
    number: string;
    property: string;
  };
  currentRent: number;
  terminationDate: string;
  requestDate: string;
  reason: string;
  notice: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rejectionReason?: string;
  approvedBy?: string;
  notes?: string;
}

interface Document {
  name: string;
  type: 'PDF' | 'DOC' | 'XLS';
  description: string;
  generated: boolean;
  downloadUrl?: string;
  generatedDate?: string;
  required: boolean;
  category: 'legal' | 'financial' | 'inspection' | 'administrative';
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[];
  autoGenerate: boolean;
}

const DocumentGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTermination, setSelectedTermination] = useState<Termination | null>(null);
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{terminationId: string, docName: string} | null>(null);
  const [filters, setFilters] = useState({
    status: 'approved'
  });

  const navItems = [
    { path: '/manager', label: 'Dashboard' },
    { path: '/manager/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases', active: true },
    { path: '/manager/payments', label: 'Payments' },
    { path: '/manager/terminations', label: 'Terminations', active: true }
  ];

  const documentTemplates: DocumentTemplate[] = [
    {
      id: 'termination_notice',
      name: 'Termination Notice',
      description: 'Official notice of lease termination',
      category: 'legal',
      fields: ['tenant_name', 'property_address', 'unit_number', 'termination_date', 'reason'],
      autoGenerate: true
    },
    {
      id: 'settlement_statement',
      name: 'Settlement Statement',
      description: 'Financial settlement calculation and breakdown',
      category: 'financial',
      fields: ['tenant_name', 'security_deposit', 'penalties', 'refunds', 'final_amount'],
      autoGenerate: true
    },
    {
      id: 'inspection_report',
      name: 'Final Inspection Report',
      description: 'Property condition report at termination',
      category: 'inspection',
      fields: ['property_condition', 'damages', 'repairs_needed', 'inspection_date'],
      autoGenerate: false
    },
    {
      id: 'refund_authorization',
      name: 'Refund Authorization',
      description: 'Authorization for security deposit refund',
      category: 'financial',
      fields: ['tenant_name', 'refund_amount', 'bank_details', 'authorization_date'],
      autoGenerate: true
    },
    {
      id: 'termination_certificate',
      name: 'Termination Certificate',
      description: 'Certificate confirming lease termination completion',
      category: 'administrative',
      fields: ['tenant_name', 'property_address', 'termination_date', 'certificate_number'],
      autoGenerate: true
    }
  ];

  useEffect(() => {
    const fetchTerminations = async () => {
      try {
        setLoading(true);
        try {
          const response = await terminationsApi.getAll(filters);
          setTerminations(response.data || []);
        } catch (apiError) {
          console.log('API not available, using mock data:', apiError);
          const mockTerminations: Termination[] = [
            {
              _id: '1',
              tenant: { name: 'John Smith', email: 'john@example.com' },
              unit: { number: '101', property: 'Sunset Apartments' },
              currentRent: 12000,
              terminationDate: '2024-03-15',
              requestDate: '2024-01-15',
              reason: 'Relocating for work',
              notice: 60,
              status: 'approved',
              approvedBy: 'Manager Johnson',
              notes: 'Tenant has been excellent, no issues'
            },
            {
              _id: '2',
              tenant: { name: 'Sarah Johnson', email: 'sarah@example.com' },
              unit: { number: '205', property: 'Oak Ridge Complex' },
              currentRent: 14500,
              terminationDate: '2024-02-28',
              requestDate: '2024-01-10',
              reason: 'Purchasing a home',
              notice: 45,
              status: 'approved',
              approvedBy: 'Manager Davis',
              notes: 'Early termination approved due to home purchase'
            },
            {
              _id: '3',
              tenant: { name: 'Mike Davis', email: 'mike@example.com' },
              unit: { number: '312', property: 'Pine Valley Residences' },
              currentRent: 11000,
              terminationDate: '2024-04-01',
              requestDate: '2024-02-01',
              reason: 'Financial hardship',
              notice: 60,
              status: 'completed',
              notes: 'Termination completed successfully'
            }
          ];
          setTerminations(mockTerminations);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching terminations:', error);
        setLoading(false);
      }
    };

    fetchTerminations();
  }, [filters]);

  useEffect(() => {
    const docs: Record<string, Document[]> = {};
    terminations.forEach(termination => {
      docs[termination._id] = generateDocumentsForTermination(termination);
    });
    setDocuments(docs);
  }, [terminations]);

  const generateDocumentsForTermination = (termination: Termination): Document[] => {
    const baseDocuments: Document[] = [
      {
        name: 'Termination Notice',
        type: 'PDF',
        description: 'Official notice of lease termination',
        generated: termination.status !== 'pending',
        downloadUrl: termination.status !== 'pending' ? '#' : undefined,
        generatedDate: termination.status !== 'pending' ? new Date().toISOString().split('T')[0] : undefined,
        required: true,
        category: 'legal'
      },
      {
        name: 'Settlement Statement',
        type: 'PDF',
        description: 'Financial settlement calculation and breakdown',
        generated: termination.status === 'approved' || termination.status === 'completed',
        downloadUrl: termination.status === 'approved' || termination.status === 'completed' ? '#' : undefined,
        generatedDate: termination.status === 'approved' || termination.status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
        required: true,
        category: 'financial'
      },
      {
        name: 'Final Inspection Report',
        type: 'PDF',
        description: 'Property condition report at termination',
        generated: termination.status === 'completed',
        downloadUrl: termination.status === 'completed' ? '#' : undefined,
        generatedDate: termination.status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
        required: true,
        category: 'inspection'
      },
      {
        name: 'Refund Authorization',
        type: 'PDF',
        description: 'Authorization for security deposit refund',
        generated: termination.status === 'completed',
        downloadUrl: termination.status === 'completed' ? '#' : undefined,
        generatedDate: termination.status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
        required: true,
        category: 'financial'
      },
      {
        name: 'Termination Certificate',
        type: 'PDF',
        description: 'Certificate confirming lease termination completion',
        generated: termination.status === 'completed',
        downloadUrl: termination.status === 'completed' ? '#' : undefined,
        generatedDate: termination.status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
        required: false,
        category: 'administrative'
      }
    ];

    return baseDocuments;
  };

  const handleFilterChange = (status: string) => {
    setFilters({ status });
  };

  const viewTerminationDetails = (termination: Termination) => {
    setSelectedTermination(termination);
    setShowDetailsModal(true);
  };

  const handleGenerateDocument = async (terminationId: string, docName: string) => {
    try {
      setGenerating(true);
      setSelectedDocument({ terminationId, docName });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDocuments(prev => ({
        ...prev,
        [terminationId]: prev[terminationId].map(doc => 
          doc.name === docName 
            ? { ...doc, generated: true, generatedDate: new Date().toISOString().split('T')[0], downloadUrl: '#' }
            : doc
        )
      }));
      
      alert(`${docName} generated successfully!`);
      setSelectedDocument(null);
      
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAllDocuments = async () => {
    try {
      setGenerating(true);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedDocs = { ...documents };
      Object.keys(updatedDocs).forEach(terminationId => {
        const termination = terminations.find(t => t._id === terminationId);
        if (termination && (termination.status === 'approved' || termination.status === 'completed')) {
          updatedDocs[terminationId] = updatedDocs[terminationId].map(doc => ({
            ...doc,
            generated: true,
            generatedDate: new Date().toISOString().split('T')[0],
            downloadUrl: '#'
          }));
        }
      });
      
      setDocuments(updatedDocs);
      alert('All available documents generated successfully!');
      setShowGenerateModal(false);
      
    } catch (error) {
      console.error('Error generating documents:', error);
      alert('Failed to generate documents. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadDocument = (docName: string, tenantName: string) => {
    alert(`Downloading ${docName} for ${tenantName}...`);
  };

  const getStatusBadge = (status: Termination['status']) => {
    const badges = {
      pending: 'status-pending',
      approved: 'status-paid',
      rejected: 'status-overdue',
      completed: 'status-paid'
    };
    return badges[status];
  };

  const getCategoryIcon = (category: Document['category']) => {
    const icons = {
      legal: 'Legal',
      financial: 'Money',
      inspection: 'Search',
      administrative: 'List'
    };
    return icons[category];
  };

  const summaryStats = {
    totalTerminations: terminations.length,
    approvedTerminations: terminations.filter(t => t.status === 'approved').length,
    completedTerminations: terminations.filter(t => t.status === 'completed').length,
    totalDocuments: Object.values(documents).reduce((sum, docs) => sum + docs.length, 0),
    generatedDocuments: Object.values(documents).reduce((sum, docs) => sum + docs.filter(d => d.generated).length, 0)
  };

  if (loading) {
return (
     <div className="app-container mobile-only">
       <TopNav showLogout showBackButton />
       <div className="main-content">
          <div className="page-header">
            <div className="page-title">Document Generator</div>
            <div className="page-subtitle">Generate and manage termination documents</div>
          </div>
          <div className="loading">Loading terminations...</div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Document Generator</div>
          <div className="page-subtitle">Generate and manage termination documents</div>
        </div>

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-value">{summaryStats.approvedTerminations}</div>
            <div className="stat-label">Approved Terminations</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summaryStats.completedTerminations}</div>
            <div className="stat-label">Completed Terminations</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summaryStats.generatedDocuments}/{summaryStats.totalDocuments}</div>
            <div className="stat-label">Documents Generated</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round((summaryStats.generatedDocuments / summaryStats.totalDocuments) * 100)}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="statusFilter">Filter by Status:</label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {terminations.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">Document</div>
            <h5>No Terminations Available</h5>
            <p>There are no terminations available for document generation.</p>
            <button type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/manager/terminations')}
            >
              Back to Terminations
            </button>
          </div>
        ) : (
          <div className="document-list">
            {terminations.map(termination => {
              const terminationDocs = documents[termination._id] || [];
              
              return (
                <div key={termination._id} className="document-case">
                  <div className="case-header">
                    <div className="case-info">
                      <h5>{termination.tenant.name}</h5>
                      <div className="case-details">
                        <span className="property">{termination.unit.property}</span>
                        <span className="unit">Unit {termination.unit.number}</span>
                        <span className="rent">{formatCurrency(termination.currentRent)}/month</span>
                      </div>
                    </div>
                    <div className="case-status">
                      <span className={`status-badge ${getStatusBadge(termination.status)}`}>
                        {termination.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="document-grid">
                    {terminationDocs.map((doc, index) => (
                      <div key={index} className="document-card">
                        <div className="document-card-header">
                          <div className="document-icon">
                            {getCategoryIcon(doc.category)}
                          </div>
                          <div className="document-title">
                            <h6>{doc.name}</h6>
                            <span className="document-type-badge">{doc.type}</span>
                            {doc.required && <span className="required-badge">Required</span>}
                          </div>
                        </div>
                        
                        <div className="document-card-body">
                          <div className="document-description">
                            <p>{doc.description}</p>
                          </div>
                          
                          <div className="document-status-row">
                            <span className={`status-indicator ${doc.generated ? 'generated' : 'pending'}`}>
                              {doc.generated ? 'Generated' : 'Pending'}
                            </span>
                            {doc.generatedDate && (
                              <span className="generated-date">
                                {formatDate(doc.generatedDate)}
                              </span>
                            )}
                          </div>
                          
                          <div className="document-actions">
                            {doc.generated ? (
                              <div className="action-buttons">
                                <button type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleDownloadDocument(doc.name, termination.tenant.name)}
                                >
                                  View
                                </button>
                                <button type="button"
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => handleDownloadDocument(doc.name, termination.tenant.name)}
                                >
                                  Download
                                </button>
                              </div>
                            ) : (
                              <div className="pending-info">
                                <p>This document will be available when the termination status changes.</p>
                                {termination.status === 'approved' && (
                                  <button type="button"
                                    className="btn btn-sm btn-outline"
                                    onClick={() => handleGenerateDocument(termination._id, doc.name)}
                                    disabled={generating && selectedDocument?.docName === doc.name}
                                  >
                                    {generating && selectedDocument?.docName === doc.name ? 'Generating...' : 'Generate Now'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="case-actions">
                    <button type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => viewTerminationDetails(termination)}
                    >
                      View Details
                    </button>
                    {termination.status === 'approved' && (
                      <button type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          const pendingDocs = terminationDocs.filter(d => !d.generated);
                          if (pendingDocs.length > 0) {
                            alert(`${pendingDocs.length} documents are ready for generation for ${termination.tenant.name}`);
                          } else {
                            alert('All documents have been generated for this termination.');
                          }
                        }}
                      >
                        Generate Available
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="page-actions">
          <button type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/manager/terminations')}
          >
            Back to Terminations
          </button>
          <button type="button"
            className="btn btn-outline"
            onClick={() => setShowTemplatesModal(true)}
          >
            View Templates
          </button>
          {terminations.filter(t => t.status === 'approved').length > 0 && (
            <button type="button"
              className="btn btn-primary"
              onClick={() => setShowGenerateModal(true)}
            >
              Generate All Available
            </button>
          )}
        </div>
      </div>

      <Modal 
        isOpen={showDetailsModal && selectedTermination !== null}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTermination(null);
        }}
        title="Termination Details"
      >
        {selectedTermination && (
          <div className="termination-details">
            <div className="detail-section">
              <h4>Tenant Information</h4>
              <p><strong>Name:</strong> {selectedTermination.tenant.name}</p>
              <p><strong>Email:</strong> {selectedTermination.tenant.email}</p>
            </div>

            <div className="detail-section">
              <h4>Property Information</h4>
              <p><strong>Property:</strong> {selectedTermination.unit.property}</p>
              <p><strong>Unit:</strong> {selectedTermination.unit.number}</p>
              <p><strong>Current Rent:</strong> {formatCurrency(selectedTermination.currentRent)}/month</p>
            </div>

            <div className="detail-section">
              <h4>Termination Details</h4>
              <p><strong>Request Date:</strong> {formatDate(selectedTermination.requestDate)}</p>
              <p><strong>Termination Date:</strong> {formatDate(selectedTermination.terminationDate)}</p>
              <p><strong>Notice Period:</strong> {selectedTermination.notice} days</p>
              <p><strong>Reason:</strong> {selectedTermination.reason}</p>
              {selectedTermination.notes && (
                <p><strong>Notes:</strong> {selectedTermination.notes}</p>
              )}
            </div>

            {documents[selectedTermination._id] && (
              <div className="detail-section">
                <h4>Document Status</h4>
                <div className="document-status-list">
                  {documents[selectedTermination._id].map((doc, index) => (
                    <div key={index} className="document-status-item">
                      <span className={`doc-status ${doc.generated ? 'generated' : 'pending'}`}>
                        {doc.generated ? 'Generated' : 'Pending'}
                      </span>
                      <span className="doc-name">{doc.name}</span>
                      <span className="doc-type">{doc.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTermination(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate All Available Documents"
      >
        <div className="generate-all-modal">
          <div className="generate-content">
            <div className="generate-icon">Document</div>
            <h5>Generate All Available Documents</h5>
            <p>This will generate all available documents for all approved terminations.</p>
            <div className="generate-stats">
              <div className="stat-row">
                <span>Approved Terminations:</span>
                <span>{terminations.filter(t => t.status === 'approved').length}</span>
              </div>
              <div className="stat-row">
                <span>Documents to Generate:</span>
                <span>
                  {terminations.filter(t => t.status === 'approved').reduce((sum, t) => {
                    const docs = documents[t._id] || [];
                    return sum + docs.filter(d => !d.generated).length;
                  }, 0)}
                </span>
              </div>
            </div>
            <p className="generate-warning">This process may take a few moments to complete.</p>
          </div>
          
          <div className="modal-actions">
            <button type="button"
              className="btn btn-secondary"
              onClick={() => setShowGenerateModal(false)}
              disabled={generating}
            >
              Cancel
            </button>
            <button type="button"
              className="btn btn-primary"
              onClick={handleGenerateAllDocuments}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate All Documents'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        title="Document Templates"
      >
        <div className="templates-modal">
          <div className="templates-content">
            <h5>Available Document Templates</h5>
            <p>These templates are used to generate termination documents automatically.</p>
            
            <div className="templates-grid">
              {documentTemplates.map(template => (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <h6>{template.name}</h6>
                    <span className="template-category">{template.category}</span>
                  </div>
                  <p className="template-description">{template.description}</p>
                  <div className="template-fields">
                    <strong>Required Fields:</strong>
                    <ul>
                      {template.fields.map((field, index) => (
                        <li key={index}>{field.replace('_', ' ')}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="template-auto-generate">
                    <span className={`auto-status ${template.autoGenerate ? 'enabled' : 'disabled'}`}>
                      {template.autoGenerate ? 'Auto-generate' : 'Manual generate'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button"
              className="btn btn-secondary"
              onClick={() => setShowTemplatesModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
};

export default DocumentGeneratorPage;
