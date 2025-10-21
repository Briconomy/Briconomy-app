import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { propertiesApi, unitsApi, formatCurrency } from '../services/api.ts';
import { useLowBandwidthMode, useImageOptimization } from '../utils/bandwidth.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

// Add styles for the image modal and gallery
const modalStyles = `
  .image-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .image-modal {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    background: white;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .modal-close {
    position: absolute;
    top: 10px;
    right: 15px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    font-size: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-image {
    width: 100%;
    height: auto;
    max-height: calc(90vh - 80px);
    object-fit: contain;
  }
  
  .modal-navigation {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-nav-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .modal-nav-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .modal-nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .image-counter {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
  }
  
  .image-navigation {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    pointer-events: none;
  }
  
  .nav-btn {
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .nav-btn:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .thumbnail-grid {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    overflow-x: auto;
    padding: 5px 0;
  }
  
  .thumbnail-btn {
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .thumbnail-btn.active {
    outline: 3px solid #007bff;
  }
  
  .thumbnail-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    display: block;
  }
  
  .main-image-container {
    position: relative;
    width: 100%;
    height: 300px;
    overflow: hidden;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .main-property-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .pricing-highlight {
    text-align: center;
    margin-bottom: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
  }
  
  .main-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 5px;
  }
  
  .price {
    font-size: 32px;
    font-weight: bold;
    color: #28a745;
  }
  
  .period {
    font-size: 18px;
    color: #6c757d;
  }

  /* Enhanced property card styling to match browse properties page */
  .property-card {
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .property-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .property-info {
    padding: 16px;
  }

  .property-price {
    font-size: 20px;
    font-weight: bold;
    color: #FF894D;
    margin-bottom: 8px;
  }

  .property-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 4px;
  }

  .property-location {
    color: #6c757d;
    font-size: 14px;
    margin-bottom: 12px;
  }

  .property-details {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    color: #6c757d;
    font-size: 14px;
    margin-bottom: 16px;
  }

  .property-type,
  .property-units,
  .occupancy-rate {
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .property-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .year-built,
  .last-renovation {
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
  }

  .property-description p {
    color: #333;
    line-height: 1.5;
    margin: 0;
  }

  .property-amenities {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .amenity-tag {
    background: rgba(22, 47, 27, 0.1);
    color: #162F1B;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }

  .property-actions {
    display: flex;
    gap: 8px;
  }

  .btn-sm {
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 0.3s ease;
    flex: 1;
  }

  .btn-sm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary.btn-sm {
    background: #f8f9fa;
    color: #495057;
    border: 2px solid #e9ecef;
  }

  .btn-secondary.btn-sm:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #dee2e6;
  }

  .btn-primary.btn-sm {
    background: #162F1B;
    color: white;
  }

  .btn-primary.btn-sm:hover:not(:disabled) {
    background: #1a3a20;
  }

  /* Unit cards styling */
  .units-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .unit-detail-card {
    margin-bottom: 0;
    border-left: 4px solid transparent;
  }

  .unit-detail-card:has(.unit-status-badge.available) {
    border-left-color: #28a745;
  }

  .unit-detail-card:has(.unit-status-badge.unavailable) {
    border-left-color: #dc3545;
  }

  .unit-status-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
  }

  .unit-status-badge.available {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
  }

  .unit-status-badge.unavailable {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }

  .unit-header-info {
    position: relative;
    padding-right: 80px;
  }

  .final-action-section {
    text-align: center;
  }

  .final-action-section .property-actions {
    justify-content: center;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .price-subtitle {
    font-size: 14px;
    color: #6c757d;
    margin-top: 5px;
  }
  
  .pricing-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .pricing-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #e9ecef;
  }
  
  .pricing-label {
    font-weight: 500;
    color: #495057;
  }
  
  .pricing-value {
    font-weight: 600;
    color: #212529;
  }
  
  .pricing-value.available {
    color: #28a745;
  }
  
  .pricing-value.unavailable {
    color: #dc3545;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined' && !document.getElementById('property-details-styles')) {
  const style = document.createElement('style');
  style.id = 'property-details-styles';
  style.textContent = modalStyles;
  document.head.appendChild(style);
}

// Mock property data based on the database scripts for fallback
const mockProperties = {
  '68c71163d8d94bff38735189': {
    id: '68c71163d8d94bff38735189',
    name: 'Blue Hills Apartments',
    address: '123 Main St, Cape Town, 8001',
    type: 'apartment',
    totalUnits: 24,
    occupiedUnits: 21,
    amenities: ['pool', 'gym', 'parking', 'security', 'laundry', 'elevator'],
    description: 'Modern apartment complex in the heart of Cape Town with stunning city views',
    yearBuilt: 2018,
    lastRenovation: 2022
  },
  '68c71163d8d94bff3873518a': {
    id: '68c71163d8d94bff3873518a',
    name: 'Green Valley Complex',
    address: '456 Oak Ave, Durban, 4001',
    type: 'complex',
    totalUnits: 18,
    occupiedUnits: 16,
    amenities: ['parking', 'garden', 'playground', 'bbq_area', 'security'],
    description: 'Family-friendly complex with beautiful gardens and recreational facilities',
    yearBuilt: 2015,
    lastRenovation: 2021
  },
  '68c71163d8d94bff3873518b': {
    id: '68c71163d8d94bff3873518b',
    name: 'Sunset Towers',
    address: '789 Beach Rd, Port Elizabeth, 6001',
    type: 'apartment',
    totalUnits: 32,
    occupiedUnits: 28,
    amenities: ['pool', 'gym', 'parking', 'ocean_view', 'concierge', 'spa'],
    description: 'Luxury beachfront apartments with panoramic ocean views',
    yearBuilt: 2020,
    lastRenovation: 2023
  }
};

function PropertyDetailsPage() {
  const { id: propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    name?: string;
    address?: string;
    type?: string;
    totalUnits?: number;
    description?: string;
    yearBuilt?: number;
    amenities?: string[];
  }>({});

  const { lowBandwidthMode } = useLowBandwidthMode();
  const { optimizeImage } = useImageOptimization();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isManager = user?.userType === 'manager';
  const isTenant = user?.userType === 'tenant';

  const navItems = isManager ? [
    { path: '/manager', label: 'Dashboard', icon: 'performanceAnalytics', active: false },
    { path: '/properties', label: 'Properties', icon: 'properties', active: true },
    { path: '/manager/leases', label: 'Leases', icon: 'lease', active: false },
    { path: '/manager/payments', label: 'Payments', icon: 'payment', active: false }
  ] : isTenant ? [
    { path: '/tenant', label: 'Dashboard', icon: 'properties', active: false },
    { path: '/properties', label: 'My Properties', icon: 'properties', active: true },
    { path: '/tenant/payments', label: 'Payments', icon: 'payment', active: false },
    { path: '/tenant/maintenance', label: 'Maintenance', icon: 'maintenance', active: false }
  ] : [
    { path: '/', label: 'Home', icon: 'logo', active: false },
    { path: '/properties', label: 'Properties', icon: 'properties', active: true },
    { path: '/login', label: 'Login', icon: 'profile', active: false }
  ];

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    } else {
      console.error('No propertyId found in URL params');
      setError('No property ID provided');
      setLoading(false);
    }
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [propertyResponse, unitsData] = await Promise.all([
        propertiesApi.getById(propertyId),
        unitsApi.getAll(propertyId)
      ]);
      
      // Handle both single property object and array response
      let propertyData;
      if (Array.isArray(propertyResponse)) {
        // API is returning array, find the specific property
        propertyData = propertyResponse.find(p => p.id === propertyId);
      } else {
        // API returned single property object
        propertyData = propertyResponse;
      }
      
      if (!propertyData) {
        throw new Error('Property not found in response');
      }
      
      setProperty(propertyData);
      setUnits(unitsData);
    } catch (err) {
      console.error('Detailed error fetching property details:', err);
      console.error('Property ID being used:', propertyId);
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      
      // Try to use mock data as fallback
      const mockProperty = mockProperties[propertyId];
      if (mockProperty) {
        setProperty(mockProperty);
        setUnits([]); // Empty units for mock data
        setError(null); // Clear error since we have fallback data
      } else {
        setError(err.message || 'Failed to load property details. API server may not be running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = () => {
    if (propertyId) {
      if (user) {
        navigate(`/apply/${propertyId}`);
      } else {
        navigate('/register', { state: { propertyId, propertyName: property?.name } });
      }
    } else {
      console.error('Property ID is undefined');
      navigate('/properties');
    }
  };

  const handleBack = () => {
    navigate('/properties');
  };

  // Manager-specific handlers
  const handleEditProperty = () => {
    setEditing(true);
    setEditForm({
      name: property.name,
      address: property.address,
      type: property.type,
      totalUnits: property.totalUnits,
      description: property.description,
      yearBuilt: property.yearBuilt,
      amenities: property.amenities
    });
  };

  const handleSaveProperty = async () => {
    try {
      await propertiesApi.update(propertyId, editForm);
      setProperty({ ...property, ...editForm });
      setEditing(false);
    } catch (err) {
      console.error('Error updating property:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({});
  };

  const handleManageUnits = () => {
    navigate(`/property/${propertyId}/units`);
  };

  const handleViewTenants = () => {
    navigate(`/property/${propertyId}/tenants`);
  };

  const handleViewMaintenance = () => {
    navigate(`/property/${propertyId}/maintenance`);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEstimatedRentRange = () => {
    if (!property) return { min: 0, max: 0 };
    
    const baseRent = property.type === 'apartment' ? 8000 : 
                    property.type === 'complex' ? 10000 : 12000;
    const occupancyMultiplier = property.occupiedUnits / property.totalUnits;
    const avgRent = Math.round(baseRent * (1 + occupancyMultiplier * 0.5));
    
    return {
      min: Math.round(avgRent * 0.8),
      max: Math.round(avgRent * 1.2)
    };
  };

  const getAvailableUnits = () => {
    return units.filter(unit => unit.status === 'available');
  };

  const calculateEstimatedRent = (property: { type: string; occupiedUnits: number; totalUnits: number }) => {
    const baseRent = property.type === 'apartment' ? 8000 : 
                    property.type === 'complex' ? 10000 : 12000;
    const occupancyMultiplier = property.occupiedUnits / property.totalUnits;
    return Math.round(baseRent * (1 + occupancyMultiplier * 0.5));
  };

  const getPropertyImages = () => {
    if (!property) return [];
    
    // Property-specific image sets based on actual property data
    const propertyImageSets = {
      // Blue Hills Apartments - Cape Town (Modern apartment complex, 2018, pool/gym/parking/security/laundry/elevator)
      '68c71163d8d94bff38735189': [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&crop=entropy', // Modern apartment building exterior
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&crop=entropy', // Modern apartment interior living room
        'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&h=600&fit=crop&crop=entropy', // Modern kitchen
        'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800&h=600&fit=crop&crop=entropy', // Swimming pool area
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=entropy', // Modern gym facility
      ],
      
      // Green Valley Complex - Durban (Family-friendly complex, 2015, parking/garden/playground/bbq_area/security)
      '68c71163d8d94bff3873518a': [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=entropy', // Family complex exterior with gardens
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=entropy', // Cozy family living room
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=entropy', // Family kitchen/dining area
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=entropy', // Garden and playground area
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop&crop=entropy', // BBQ and outdoor area
      ],
      
      // Sunset Towers - Port Elizabeth (Luxury beachfront apartments, 2020, pool/gym/parking/ocean_view/concierge/spa)
      '68c71163d8d94bff3873518b': [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&crop=entropy', // Luxury beachfront tower exterior
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&crop=entropy', // Luxury apartment interior with ocean view
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop&crop=entropy', // High-end modern kitchen
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&crop=entropy', // Luxury pool with ocean view
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop&crop=entropy', // Spa and wellness area
      ]
    };
    
    // Get property-specific images or fall back to generic property images
    const propertyImages = propertyImageSets[property.id];
    
    if (propertyImages) {
      // Use specific curated images for this property
      return propertyImages.map(img => optimizeImage(img, lowBandwidthMode));
    } else {
      // Fallback: Generate property-specific placeholder images using property characteristics
      const baseId = property.id || 'default';
      const seed = parseInt(baseId.slice(-6), 16) || 123456;
      
      // Generate themed images based on property type and characteristics
      let imageTheme = 'building';
      if (property.amenities?.includes('pool')) imageTheme = 'luxury';
      if (property.amenities?.includes('garden')) imageTheme = 'garden';
      if (property.amenities?.includes('ocean_view')) imageTheme = 'ocean';
      
      const fallbackImages = [
        `https://picsum.photos/seed/${seed}-${imageTheme}/800/600`, // Main themed image
        `https://picsum.photos/seed/${seed + 1}/800/600`, // Interior 1
        `https://picsum.photos/seed/${seed + 2}/800/600`, // Interior 2
        `https://picsum.photos/seed/${seed + 3}/800/600`, // Amenity area
        `https://picsum.photos/seed/${seed + 4}/800/600`, // Exterior/surroundings
      ];
      
      return fallbackImages.map(img => optimizeImage(img, lowBandwidthMode));
    }
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/properties" />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/browse-properties" />
        <div className="main-content">
          <div className="error-state">
            <h2>Unable to Load Property Details</h2>
            <p><strong>Error:</strong> {error}</p>
            <div className="error-details">
              <p>This might be because:</p>
              <ul>
                <li>API server is not running (run: <code>deno task api</code>)</li>
                <li>Database connection issue</li>
                <li>Invalid property ID: {propertyId}</li>
              </ul>
            </div>
            <div className="error-actions">
              <button type="button" onClick={fetchPropertyDetails} className="btn btn-primary">
                Retry Loading
              </button>
              <button type="button" onClick={() => navigate('/browse-properties')} className="btn btn-secondary">
                Back to Properties
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/properties" />
        <div className="main-content">
          <div className="error-state">
            <p>Property not found</p>
            <button onClick={handleBack} className="btn btn-primary">Back to Properties</button>
          </div>
        </div>
      </div>
    );
  }

  const rentRange = getEstimatedRentRange();
  const availableUnits = getAvailableUnits();
  const propertyImages = getPropertyImages();
  const availability = {
    available: property.totalUnits - property.occupiedUnits,
    total: property.totalUnits,
    percentage: Math.round(((property.totalUnits - property.occupiedUnits) / property.totalUnits) * 100)
  };

  // Manager View - Property Management Interface
  if (isManager) {
    const estimatedMonthlyRevenue = property.occupiedUnits * (property.type === 'apartment' ? 8000 : 
                                 property.type === 'complex' ? 10000 : 12000);
    const occupancyRate = Math.round((property.occupiedUnits / property.totalUnits) * 100);

    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/properties" />
        
        <div className="main-content">
          {editing ? (
            <div className="property-edit-form">
              <div className="page-header">
                <div className="page-title">Edit Property</div>
                <div className="page-subtitle">{property.name}</div>
              </div>

              <div className="form-section">
                <label>Property Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-section">
                <label>Address</label>
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => handleEditFormChange('address', e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-section">
                <label>Property Type</label>
                <select
                  value={editForm.type || ''}
                  onChange={(e) => handleEditFormChange('type', e.target.value)}
                  className="form-select"
                >
                  <option value="apartment">Apartment</option>
                  <option value="complex">Complex</option>
                  <option value="house">House</option>
                </select>
              </div>

              <div className="form-section">
                <label>Total Units</label>
                <input
                  type="number"
                  value={editForm.totalUnits || ''}
                  onChange={(e) => handleEditFormChange('totalUnits', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-section">
                <label>Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-actions">
                <button onClick={handleCancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSaveProperty} className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="property-details-header">
                <h1>{property.name}</h1>
                <p className="property-address">{property.address}</p>
                <div className="property-type-badge">{property.type}</div>
              </div>

              <div className="property-image-gallery">
                <div className="main-image-container">
                  <img 
                    src={propertyImages[selectedImageIndex]} 
                    alt={`${property.name} - Image ${selectedImageIndex + 1}`}
                    className="main-property-image"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEySDIyNVYxODJIMTc1VjExMlpNMTkwIDEzMkgyMFYxNDJIMTkwVjEzMlpNMTkwIDE0MkgyMFYxNTJIMTkwVjE0MlpNMTkwIDE1MkgyMFYxNjJIMTkwVjE1MloiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                <div className="thumbnail-grid">
                  {propertyImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${property.name} - Thumbnail ${index + 1}`}
                      className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="manager-financial-overview">
                <div className="financial-card">
                  <div className="financial-value">{formatCurrency(estimatedMonthlyRevenue)}</div>
                  <div className="financial-label">Estimated Monthly Revenue</div>
                </div>
                <div className="financial-card">
                  <div className="financial-value">{occupancyRate}%</div>
                  <div className="financial-label">Occupancy Rate</div>
                </div>
              </div>

              <div className="manager-actions">
                <button onClick={handleEditProperty} className="btn btn-primary">
                  Edit Property
                </button>
                <button onClick={handleManageUnits} className="btn btn-secondary">
                  Manage Units
                </button>
                <button onClick={handleViewTenants} className="btn btn-info">
                  View Tenants
                </button>
                <button onClick={handleViewMaintenance} className="btn btn-warning">
                  Maintenance
                </button>
              </div>

              <div className="property-overview-section">
                <h2>Property Overview</h2>
                <div className="overview-grid">
                  <div className="overview-item">
                    <span className="overview-label">Total Units</span>
                    <span className="overview-value">{property.totalUnits}</span>
                  </div>
                  <div className="overview-item">
                    <span className="overview-label">Occupied Units</span>
                    <span className="overview-value">{property.occupiedUnits}</span>
                  </div>
                  <div className="overview-item">
                    <span className="overview-label">Available Units</span>
                    <span className="overview-value">{availability.available}</span>
                  </div>
                  <div className="overview-item">
                    <span className="overview-label">Occupancy Rate</span>
                    <span className="overview-value">{occupancyRate}%</span>
                  </div>
                </div>
              </div>

              <div className="property-description-section">
                <h2>Description</h2>
                <p>{property.description}</p>
              </div>

              <div className="property-amenities-section">
                <h2>Amenities</h2>
                <div className="amenities-grid">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <span className="amenity-icon">Available</span>
                      <span className="amenity-name">{amenity.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {units.length > 0 && (
                <div className="manager-units-section">
                  <h2>Unit Management</h2>
                  <div className="units-summary">
                    <div className="summary-item occupied">
                      <span className="summary-count">{units.filter(u => u.status === 'occupied').length}</span>
                      <span className="summary-label">Occupied</span>
                    </div>
                    <div className="summary-item vacant">
                      <span className="summary-count">{units.filter(u => u.status === 'vacant').length}</span>
                      <span className="summary-label">Vacant</span>
                    </div>
                    <div className="summary-item maintenance">
                      <span className="summary-count">{units.filter(u => u.status === 'maintenance').length}</span>
                      <span className="summary-label">Maintenance</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="property-location-section">
                <h2>Location</h2>
                <div className="location-info">
                  <p className="address">{property.address}</p>
                  <div className="map-placeholder">
                    <div className="map-placeholder-content">
                      <span className="map-icon">Location</span>
                      <p>Interactive map coming soon</p>
                      <p className="map-subtitle">Google Maps integration will be available</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="property-actions-section">
                <div className="action-buttons">
                  <button onClick={handleBack} className="btn btn-secondary">
                    Back to Properties
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  // Tenant View - Their Rental Property Details
  if (isTenant) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/properties" />
        
        <div className="main-content">
          <div className="property-details-header">
            <h1>{property.name}</h1>
            <p className="property-address">{property.address}</p>
            <div className="property-type-badge">{property.type}</div>
          </div>

          <div className="property-image-gallery">
            <div className="main-image-container">
              <img 
                src={propertyImages[selectedImageIndex]} 
                alt={`${property.name} - Image ${selectedImageIndex + 1}`}
                className="main-property-image"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEySDIyNVYxODJIMTc1VjExMlpNMTkwIDEzMkgyMFYxNDJIMTkwVjEzMlpNMTkwIDE0MkgyMFYxNTJIMTkwVjE0MlpNMTkwIDE1MkgyMFYxNjJIMTkwVjE1MloiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                }}
              />
            </div>
            <div className="thumbnail-grid">
              {propertyImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${property.name} - Thumbnail ${index + 1}`}
                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          </div>

          <div className="tenant-property-info">
            <div className="info-section">
              <h2>My Rental Information</h2>
              <div className="rental-details">
                <div className="detail-item">
                  <span className="detail-label">Property</span>
                  <span className="detail-value">{property.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{property.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Property Type</span>
                  <span className="detail-value">{property.type}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h2>Property Amenities</h2>
              <div className="amenities-grid">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <span className="amenity-icon">Available</span>
                    <span className="amenity-name">{amenity.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="property-actions-section">
              <div className="action-buttons">
                <button onClick={handleBack} className="btn btn-secondary">
                  Back to My Properties
                </button>
                <button 
                  onClick={() => navigate('/tenant/maintenance')}
                  className="btn btn-primary"
                >
                  Report Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  // Public View - Prospective Tenant Property Details
  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton backLink="/properties" />
      
      <div className="main-content">
        <div className="property-details-header">
          <h1>{property.name}</h1>
          <p className="property-address">{property.address}</p>
          <div className="property-type-badge">{property.type}</div>
        </div>

        <div className="property-image-gallery">
          <div className="main-image-container">
            <img 
              src={propertyImages[selectedImageIndex]} 
              alt={`${property.name} view ${selectedImageIndex + 1}`}
              className="main-property-image"
              onClick={() => setShowImageModal(true)}
              style={{ cursor: 'pointer' }}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEySDIyNVYxODJIMTc1VjExMlpNMTkwIDEzMkgyMFYxNDJIMTkwVjEzMlpNMTkwIDE0MkgyMFYxNTJIMTkwVjE0MlpNMTkwIDE1MkgyMFYxNjJIMTkwVjE1MloiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+UHJvcGVydHkgVmlldw==';
              }}
            />
            <div className="image-counter">
              {selectedImageIndex + 1} / {propertyImages.length}
            </div>
            <div className="image-navigation">
              <button 
                type="button"
                className="nav-btn prev"
                onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : propertyImages.length - 1)}
                disabled={propertyImages.length <= 1}
              >
                ‹
              </button>
              <button 
                type="button"
                className="nav-btn next"
                onClick={() => setSelectedImageIndex(prev => prev < propertyImages.length - 1 ? prev + 1 : 0)}
                disabled={propertyImages.length <= 1}
              >
                ›
              </button>
            </div>
          </div>
          <div className="thumbnail-grid">
            {propertyImages.map((image, index) => (
              <button
                key={`thumb-${index}`}
                type="button"
                className={`thumbnail-btn ${selectedImageIndex === index ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`${property.name} thumbnail ${index + 1}`}
                  className="thumbnail-image"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
            <div className="image-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button"
                className="modal-close"
                onClick={() => setShowImageModal(false)}
              >
                ×
              </button>
              <img 
                src={propertyImages[selectedImageIndex]}
                alt={`${property.name} full view ${selectedImageIndex + 1}`}
                className="modal-image"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEySDIyNVYxODJIMTc1VjExMlpNMTkwIDEzMkgyMFYxNDJIMTkwVjEzMlpNMTkwIDE0MkgyMFYxNTJIMTkwVjE0MlpNMTkwIDE1MkgyMFYxNjJIMTkwVjE1MloiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+UHJvcGVydHkgVmlldw==';
                }}
              />
              <div className="modal-navigation">
                <button 
                  type="button"
                  className="modal-nav-btn prev"
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : propertyImages.length - 1)}
                  disabled={propertyImages.length <= 1}
                >
                  ‹ Previous
                </button>
                <span className="modal-counter">
                  {selectedImageIndex + 1} of {propertyImages.length}
                </span>
                <button 
                  type="button"
                  className="modal-nav-btn next"
                  onClick={() => setSelectedImageIndex(prev => prev < propertyImages.length - 1 ? prev + 1 : 0)}
                  disabled={propertyImages.length <= 1}
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="property-pricing-section">
          <div className="pricing-highlight">
            <div className="main-price">
              <span className="price">{formatCurrency(calculateEstimatedRent(property))}</span>
              <span className="period">/month</span>
            </div>
            <div className="price-subtitle">{t('prospect.average_rent')}</div>
          </div>
          
          <div className="pricing-details">
            <div className="pricing-item">
              <span className="pricing-label">{t('prospect.rent_range')}</span>
              <span className="pricing-value">
                {formatCurrency(rentRange.min)} - {formatCurrency(rentRange.max)}
              </span>
            </div>
            <div className="pricing-item">
              <span className="pricing-label">{t('prospect.available_units')}:</span>
              <span className={`pricing-value ${availability.available > 0 ? 'available' : 'unavailable'}`}>
                {availability.available > 0 ? `${availability.available} of ${property.totalUnits}` : t('prospect.fully_occupied')}
              </span>
            </div>
            <div className="pricing-item">
              <span className="pricing-label">{t('prospect.occupancy_rate')}</span>
              <span className="pricing-value">{Math.round((property.occupiedUnits / property.totalUnits) * 100)}%</span>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleApplyNow}
            className="btn btn-primary btn-large"
            disabled={availability.available === 0}
          >
            {availability.available > 0 ? t('prospect.apply_for_rental') : t('prospect.join_waitlist')}
          </button>
        </div>

        {/* Property Overview Card */}
        <div className="property-card">
          <div className="property-info">
            <div className="property-price">{formatCurrency(calculateEstimatedRent(property))}/month</div>
            <div className="property-title">{property.name}</div>
            <div className="property-location">{property.address}</div>
            
            <div className="property-details">
              <span className="property-type">{property.type}</span>
              <span className="property-units">{property.totalUnits} units</span>
              <span className="occupancy-rate">{availability.percentage}% available</span>
            </div>

            <div className="property-meta">
              {property.yearBuilt && (
                <span className="year-built">Built: {property.yearBuilt}</span>
              )}
              {property.lastRenovation && (
                <span className="last-renovation">Renovated: {property.lastRenovation}</span>
              )}
            </div>
          </div>
        </div>

        {/* Property Description Card */}
        <div className="property-card">
          <div className="property-info">
            <h3 style={{ marginBottom: '12px', color: '#2c3e50', fontSize: '18px', fontWeight: '600' }}>{t('prospect.about_property')}</h3>
            <div className="property-description">
              <p>{property.description || 'This is a beautiful property in a prime location with excellent amenities and convenient access to local attractions.'}</p>
            </div>
          </div>
        </div>

        {/* Amenities Card */}
        <div className="property-card">
          <div className="property-info">
            <h3 style={{ marginBottom: '12px', color: '#2c3e50', fontSize: '18px', fontWeight: '600' }}>{t('prospect.amenities')}</h3>
            <div className="property-amenities">
              {property.amenities.map((amenity, index) => (
                <span key={index} className="amenity-tag">
                  {amenity.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Property Actions */}
        <div className="property-card">
          <div className="property-info">
            <div className="property-actions">
              <button type="button"
                onClick={() => globalThis.location.href = '/browse-properties'}
                className="btn btn-secondary btn-sm"
              >
                {t('prospect.back_to_properties')}
              </button>
              <button type="button"
                onClick={handleApplyNow}
                className="btn btn-primary btn-sm"
                disabled={availability.available === 0}
              >
                {availability.available > 0 ? t('prospect.apply_now') : t('prospect.join_waitlist')}
              </button>
            </div>
          </div>
        </div>

        {units.length > 0 && (
          <div className="property-card">
            <div className="property-info">
              <h3 style={{ marginBottom: '16px', color: '#2c3e50', fontSize: '18px', fontWeight: '600' }}>{t('prospect.available_units')} ({units.filter(u => u.status === 'vacant').length})</h3>
              <div className="units-grid">
                {units.map((unit, index) => (
                  <div key={unit.id || `unit-${index}`} className="property-card unit-detail-card">
                    <div className="property-info">
                      <div className="unit-header-info">
                        <div className="property-price">{formatCurrency(unit.rent)}/month</div>
                        <div className="property-title">Unit {unit.unitNumber}</div>
                        <div className="property-location">{t('prospect.floor')} {unit.floor}</div>
                        
                        <div className="property-details">
                          <span className="property-type">{unit.bedrooms} {t('prospect.bed')}</span>
                          <span className="property-units">{unit.bathrooms} {t('prospect.bath')}</span>
                          <span className="occupancy-rate">{unit.sqft} {t('prospect.sqm')}</span>
                        </div>

                        <div className={`availability-badge unit-status-badge ${unit.status === 'vacant' ? 'available' : 'unavailable'}`}>
                          {unit.status === 'occupied' ? t('prospect.occupied') : 
                           unit.status === 'vacant' ? t('prospect.available') : 
                           unit.status === 'maintenance' ? t('prospect.maintenance') : 'Unknown'}
                        </div>
                      </div>

                      {unit.features && unit.features.length > 0 && (
                        <div className="property-amenities" style={{ marginTop: '12px' }}>
                          {unit.features.map((feature, idx) => (
                            <span key={idx} className="amenity-tag">
                              {feature.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {unit.maintenanceNotes && (
                        <div className="property-description" style={{ marginTop: '12px' }}>
                          <p style={{ color: '#e67e22', fontSize: '13px', fontWeight: '500' }}>
                            <strong>Maintenance Note:</strong> {unit.maintenanceNotes}
                          </p>
                        </div>
                      )}
                      
                      {unit.status === 'vacant' && (
                        <div className="property-actions" style={{ marginTop: '16px' }}>
                          <button 
                            type="button"
                            onClick={() => {
                              if (!propertyId) {
                                console.error('Property ID is undefined');
                                navigate('/properties');
                                return;
                              }

                              // Check if user is logged in
                              if (!user) {
                                // Not logged in - redirect to registration
                                navigate('/register', { 
                                  state: { 
                                    propertyId: propertyId,
                                    propertyName: property?.name || 'Selected Property',
                                    unitNumber: unit.unitNumber
                                  } 
                                });
                              } else {
                                // Logged in - go to rental application
                                navigate(`/apply/${propertyId}?unit=${unit.id || unit.unitNumber}`);
                              }
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%' }}
                          >
                            {t('prospect.apply_for_unit')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Location Card */}
        <div className="property-card">
          <div className="property-info">
            <h3 style={{ marginBottom: '12px', color: '#2c3e50', fontSize: '18px', fontWeight: '600' }}>{t('prospect.location')}</h3>
            <div className="property-location" style={{ fontSize: '16px', marginBottom: '16px' }}>{property.address}</div>
            <div className="location-map-placeholder">
              <div style={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                padding: '40px 20px', 
                borderRadius: '8px', 
                textAlign: 'center',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📍</div>
                <p style={{ color: '#6c757d', margin: '0 0 4px 0', fontWeight: '500' }}>{t('prospect.interactive_map')}</p>
                <p style={{ color: '#6c757d', margin: '0', fontSize: '12px' }}>{t('prospect.maps_coming_soon')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Action Section */}
        <div className="property-card">
          <div className="property-info">
            <div className="final-action-section">
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div className="property-price" style={{ marginBottom: '4px' }}>
                  {availability.available > 0 ? `${availability.available} ${t('prospect.units_available')}` : t('prospect.fully_occupied')}
                </div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>
                  {t('prospect.ready_to_apply')}
                </div>
              </div>
              <div className="property-actions">
                <button type="button" 
                  onClick={handleBack} 
                  className="btn btn-secondary btn-sm"
                >
                  {t('prospect.back_to_properties')}
                </button>
                <button 
                  type="button"
                  onClick={handleApplyNow}
                  className="btn btn-primary btn-sm"
                  disabled={availability.available === 0}
                >
                  {availability.available > 0 ? t('prospect.apply_now') : t('prospect.join_waitlist')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default PropertyDetailsPage;
