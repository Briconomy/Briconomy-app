import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { propertiesApi, authApi } from '../services/api.ts';
import { useLowBandwidthMode } from '../utils/bandwidth.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

function RentalApplicationPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idNumber: '',
      dateOfBirth: '',
      nationality: 'South African'
    },
    employmentInfo: {
      employer: '',
      position: '',
      income: '',
      employmentDuration: '',
      employerContact: '',
      employerPhone: ''
    },
    rentalHistory: {
      currentAddress: '',
      durationAtCurrentAddress: '',
      reasonForLeaving: '',
      previousLandlordName: '',
      previousLandlordContact: ''
    },
    references: {
      reference1Name: '',
      reference1Relationship: '',
      reference1Phone: '',
      reference2Name: '',
      reference2Relationship: '',
      reference2Phone: ''
    },
    additionalInfo: {
      moveInDate: '',
      leaseDuration: '12',
      occupants: '1',
      pets: 'no',
      petDetails: '',
      specialRequirements: '',
      emergencyContact: '',
      emergencyPhone: ''
    },
    documents: {
      idDocument: null,
      payslip: null,
      bankStatement: null,
      proofOfAddress: null
    }
  });

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const { lowBandwidthMode } = useLowBandwidthMode();
  const { user, login } = useAuth();

  // Account creation states
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [signUpForm, setSignUpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'tenant'
  });
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState(null);

  const navItems = [
    { path: '/', label: 'Home', icon: 'logo', active: false },
    { path: '/browse-properties', label: 'Properties', icon: 'properties', active: true },
    { path: '/login', label: 'Login', icon: 'profile', active: false }
  ];

  // Check if user is authenticated and validate propertyId
  useEffect(() => {
    // Validate propertyId - redirect to create account if undefined or invalid
    if (!propertyId || propertyId === 'undefined' || propertyId.trim() === '') {
      navigate('/create-account', { 
        state: { 
          error: 'No property specified. Please select a property first.',
          from: '/properties'
        } 
      });
      return;
    }

    fetchPropertyDetails();
  }, [user, loading, submitted]);

  // Check if user should see account creation
  useEffect(() => {
    if (!user && !loading && !showAccountCreation && property) {
      // Show a welcome message for prospective tenants
      const timer = setTimeout(() => {
        // Auto-show account creation after a brief delay for users to read
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, showAccountCreation, property]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesApi.getById(propertyId);
      setProperty(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching property details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (documentType, file) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return formData.personalInfo.firstName && 
               formData.personalInfo.lastName && 
               formData.personalInfo.email && 
               formData.personalInfo.phone && 
               formData.personalInfo.idNumber;
      case 2:
        return formData.employmentInfo.employer && 
               formData.employmentInfo.income;
      case 3:
        return formData.rentalHistory.currentAddress;
      case 4:
        return formData.references.reference1Name && 
               formData.references.reference1Phone;
      case 5:
        return formData.additionalInfo.moveInDate;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    
    try {
      const applicationData = {
        fullName: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`,
        email: formData.personalInfo.email,
        phone: formData.personalInfo.phone,
        password: formData.personalInfo.idNumber,
        userType: 'tenant',
        appliedPropertyId: propertyId,
        profile: {
          property: property?.name,
          unitNumber: formData.additionalInfo.occupants,
          occupation: formData.employmentInfo.position,
          monthlyIncome: formData.employmentInfo.income,
          emergencyContact: formData.additionalInfo.emergencyContact 
            ? `${formData.additionalInfo.emergencyContact} (${formData.additionalInfo.emergencyPhone})`
            : '',
          moveInDate: formData.additionalInfo.moveInDate,
          idNumber: formData.personalInfo.idNumber,
          dateOfBirth: formData.personalInfo.dateOfBirth,
          nationality: formData.personalInfo.nationality,
          employer: formData.employmentInfo.employer,
          employmentDuration: formData.employmentInfo.employmentDuration,
          currentAddress: formData.rentalHistory.currentAddress,
          reasonForLeaving: formData.rentalHistory.reasonForLeaving,
          leaseDuration: formData.additionalInfo.leaseDuration,
          pets: formData.additionalInfo.pets,
          petDetails: formData.additionalInfo.petDetails
        }
      };

      console.log('[Apply] Submitting for property:', propertyId);
      const result = await authApi.registerPendingTenant(applicationData);
      console.log('[Apply] Result:', result.success ? 'Success' : 'Failed');
      
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit application. Please try again.');
      console.error('Error submitting application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Account creation handlers
  const handleSignUpChange = (field, value) => {
    setSignUpForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError(null);

    // Validate sign-up form
    if (!signUpForm.firstName || !signUpForm.lastName || !signUpForm.email || 
        !signUpForm.phone || !signUpForm.password) {
      setSignUpError('Please fill in all required fields.');
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }

    if (signUpForm.password.length < 6) {
      setSignUpError('Password must be at least 6 characters long.');
      return;
    }

    setSignUpLoading(true);

    try {
      // Simulate API call - in real implementation, this would call authApi.register()
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Login the user
      await login('mock_jwt_token_' + Date.now(), null);
      
      // Pre-fill rental application form with account information
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: signUpForm.firstName,
          lastName: signUpForm.lastName,
          email: signUpForm.email,
          phone: signUpForm.phone
        }
      }));

      setShowAccountCreation(false);
    } catch (err) {
      setSignUpError('Failed to create account. Please try again.');
      console.error('Error creating account:', err);
    } finally {
      setSignUpLoading(false);
    }
  };

  const renderAccountCreation = () => (
    <div className="account-creation-form">
      <div className="page-header">
        <div className="page-title">Create Account</div>
        <div className="page-subtitle">Create an account to submit your rental application</div>
      </div>

      {signUpError && (
        <div className="error-message">
          {signUpError}
        </div>
      )}

      <form onSubmit={handleSignUpSubmit} className="signup-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={signUpForm.firstName}
                onChange={(e) => handleSignUpChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={signUpForm.lastName}
                onChange={(e) => handleSignUpChange('lastName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={signUpForm.email}
                onChange={(e) => handleSignUpChange('email', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={signUpForm.phone}
                onChange={(e) => handleSignUpChange('phone', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Account Security</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={signUpForm.password}
                onChange={(e) => handleSignUpChange('password', e.target.value)}
                required
              />
              <small>Must be at least 6 characters long</small>
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={signUpForm.confirmPassword}
                onChange={(e) => handleSignUpChange('confirmPassword', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Account Type</h3>
          <div className="form-group">
            <select
              value={signUpForm.userType}
              onChange={(e) => handleSignUpChange('userType', e.target.value)}
            >
              <option value="tenant">Tenant</option>
              <option value="manager">Property Manager</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(`/property/${propertyId}`)}
            className="btn btn-secondary"
          >
            Back to Property
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={signUpLoading}
          >
            {signUpLoading ? 'Creating Account...' : 'Create Account & Continue'}
          </button>
        </div>
      </form>

      <div className="login-prompt">
  <p>Already have an account? <button type="button" onClick={() => navigate('/login')} className="link-button">Sign In</button></p>
      </div>
    </div>
  );

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {[...Array(totalSteps)].map((_, index) => (
          <div
            key={index}
            className={`step ${index + 1 === step ? 'active' : ''} ${index + 1 < step ? 'completed' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">
              {index === 0 && 'Personal'}
              {index === 1 && 'Employment'}
              {index === 2 && 'Rental History'}
              {index === 3 && 'References'}
              {index === 4 && 'Additional'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="form-section">
      <h3>Personal Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            value={formData.personalInfo.firstName}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.personalInfo.lastName}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            value={formData.personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            value={formData.personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>ID/Passport Number *</label>
          <input
            type="text"
            value={formData.personalInfo.idNumber}
            onChange={(e) => handleInputChange('personalInfo', 'idNumber', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            value={formData.personalInfo.dateOfBirth}
            onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nationality</label>
          <select
            value={formData.personalInfo.nationality}
            onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)}
          >
            <option value="South African">South African</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderEmploymentInfo = () => (
    <div className="form-section">
      <h3>Employment Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Current Employer *</label>
          <input
            type="text"
            value={formData.employmentInfo.employer}
            onChange={(e) => handleInputChange('employmentInfo', 'employer', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Position</label>
          <input
            type="text"
            value={formData.employmentInfo.position}
            onChange={(e) => handleInputChange('employmentInfo', 'position', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Monthly Income (ZAR) *</label>
          <input
            type="number"
            value={formData.employmentInfo.income}
            onChange={(e) => handleInputChange('employmentInfo', 'income', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Duration at Current Employer</label>
          <select
            value={formData.employmentInfo.employmentDuration}
            onChange={(e) => handleInputChange('employmentInfo', 'employmentDuration', e.target.value)}
          >
            <option value="">Select duration</option>
            <option value="0-6 months">0-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="1-2 years">1-2 years</option>
            <option value="2-5 years">2-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div>
        <div className="form-group">
          <label>Employer Contact Person</label>
          <input
            type="text"
            value={formData.employmentInfo.employerContact}
            onChange={(e) => handleInputChange('employmentInfo', 'employerContact', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Employer Phone</label>
          <input
            type="tel"
            value={formData.employmentInfo.employerPhone}
            onChange={(e) => handleInputChange('employmentInfo', 'employerPhone', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderRentalHistory = () => (
    <div className="form-section">
      <h3>Rental History</h3>
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Current Address *</label>
          <textarea
            value={formData.rentalHistory.currentAddress}
            onChange={(e) => handleInputChange('rentalHistory', 'currentAddress', e.target.value)}
            rows={3}
            required
          />
        </div>
        <div className="form-group">
          <label>Duration at Current Address</label>
          <select
            value={formData.rentalHistory.durationAtCurrentAddress}
            onChange={(e) => handleInputChange('rentalHistory', 'durationAtCurrentAddress', e.target.value)}
          >
            <option value="">Select duration</option>
            <option value="0-6 months">0-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="1-2 years">1-2 years</option>
            <option value="2-5 years">2-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div>
        <div className="form-group">
          <label>Reason for Leaving</label>
          <input
            type="text"
            value={formData.rentalHistory.reasonForLeaving}
            onChange={(e) => handleInputChange('rentalHistory', 'reasonForLeaving', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Previous Landlord Name</label>
          <input
            type="text"
            value={formData.rentalHistory.previousLandlordName}
            onChange={(e) => handleInputChange('rentalHistory', 'previousLandlordName', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Previous Landlord Contact</label>
          <input
            type="tel"
            value={formData.rentalHistory.previousLandlordContact}
            onChange={(e) => handleInputChange('rentalHistory', 'previousLandlordContact', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderReferences = () => (
    <div className="form-section">
      <h3>References</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Reference 1 Name *</label>
          <input
            type="text"
            value={formData.references.reference1Name}
            onChange={(e) => handleInputChange('references', 'reference1Name', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Relationship</label>
          <input
            type="text"
            value={formData.references.reference1Relationship}
            onChange={(e) => handleInputChange('references', 'reference1Relationship', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Reference 1 Phone *</label>
          <input
            type="tel"
            value={formData.references.reference1Phone}
            onChange={(e) => handleInputChange('references', 'reference1Phone', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Reference 2 Name</label>
          <input
            type="text"
            value={formData.references.reference2Name}
            onChange={(e) => handleInputChange('references', 'reference2Name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Relationship</label>
          <input
            type="text"
            value={formData.references.reference2Relationship}
            onChange={(e) => handleInputChange('references', 'reference2Relationship', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Reference 2 Phone</label>
          <input
            type="tel"
            value={formData.references.reference2Phone}
            onChange={(e) => handleInputChange('references', 'reference2Phone', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderAdditionalInfo = () => (
    <div className="form-section">
      <h3>Additional Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Preferred Move-in Date *</label>
          <input
            type="date"
            value={formData.additionalInfo.moveInDate}
            onChange={(e) => handleInputChange('additionalInfo', 'moveInDate', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Lease Duration</label>
          <select
            value={formData.additionalInfo.leaseDuration}
            onChange={(e) => handleInputChange('additionalInfo', 'leaseDuration', e.target.value)}
          >
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
          </select>
        </div>
        <div className="form-group">
          <label>Number of Occupants</label>
          <select
            value={formData.additionalInfo.occupants}
            onChange={(e) => handleInputChange('additionalInfo', 'occupants', e.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5+">5+</option>
          </select>
        </div>
        <div className="form-group">
          <label>Pets</label>
          <select
            value={formData.additionalInfo.pets}
            onChange={(e) => handleInputChange('additionalInfo', 'pets', e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        {formData.additionalInfo.pets === 'yes' && (
          <div className="form-group full-width">
            <label>Pet Details</label>
            <textarea
              value={formData.additionalInfo.petDetails}
              onChange={(e) => handleInputChange('additionalInfo', 'petDetails', e.target.value)}
              rows={2}
              placeholder="Please describe your pets (type, size, number)"
            />
          </div>
        )}
        <div className="form-group full-width">
          <label>Special Requirements</label>
          <textarea
            value={formData.additionalInfo.specialRequirements}
            onChange={(e) => handleInputChange('additionalInfo', 'specialRequirements', e.target.value)}
            rows={2}
            placeholder="Any special requirements or requests"
          />
        </div>
        <div className="form-group">
          <label>Emergency Contact Name</label>
          <input
            type="text"
            value={formData.additionalInfo.emergencyContact}
            onChange={(e) => handleInputChange('additionalInfo', 'emergencyContact', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Emergency Contact Phone</label>
          <input
            type="tel"
            value={formData.additionalInfo.emergencyPhone}
            onChange={(e) => handleInputChange('additionalInfo', 'emergencyPhone', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="form-section">
      <h3>Required Documents</h3>
      <div className="documents-grid">
        <div className="document-upload">
          <label>ID Document *</label>
          <div className="upload-area">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('idDocument', e.target.files[0])}
              id="idDocument"
            />
            <label htmlFor="idDocument" className="upload-label">
              {formData.documents.idDocument ? 
                formData.documents.idDocument.name : 
                'Click to upload ID document'
              }
            </label>
          </div>
        </div>
        
        <div className="document-upload">
          <label>Recent Payslip *</label>
          <div className="upload-area">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('payslip', e.target.files[0])}
              id="payslip"
            />
            <label htmlFor="payslip" className="upload-label">
              {formData.documents.payslip ? 
                formData.documents.payslip.name : 
                'Click to upload payslip'
              }
            </label>
          </div>
        </div>
        
        <div className="document-upload">
          <label>Bank Statement *</label>
          <div className="upload-area">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('bankStatement', e.target.files[0])}
              id="bankStatement"
            />
            <label htmlFor="bankStatement" className="upload-label">
              {formData.documents.bankStatement ? 
                formData.documents.bankStatement.name : 
                'Click to upload bank statement'
              }
            </label>
          </div>
        </div>
        
        <div className="document-upload">
          <label>Proof of Address</label>
          <div className="upload-area">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('proofOfAddress', e.target.files[0])}
              id="proofOfAddress"
            />
            <label htmlFor="proofOfAddress" className="upload-label">
              {formData.documents.proofOfAddress ? 
                formData.documents.proofOfAddress.name : 
                'Click to upload proof of address'
              }
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/properties" />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading application form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/properties" />
        <div className="main-content">
          <div className="error-state">
            <p>Error: {error}</p>
            <button type="button" onClick={() => navigate('/properties')} className="btn btn-primary">Back to Properties</button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/properties" />
        <div className="main-content">
          <div className="success-state">
            <div className="success-icon">Success</div>
            <h2>Application Submitted Successfully!</h2>
            <p>Thank you for your rental application for {property?.name}.</p>
            <p>Your application reference number is: <strong>APP-{Date.now().toString().slice(-6)}</strong></p>
            <p>We will review your application and contact you within 3-5 business days.</p>
            <div className="success-actions">
              <button type="button" onClick={() => navigate('/properties')} className="btn btn-primary">
                Browse More Properties
              </button>
              <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton backLink={`/property/${propertyId}`} />
      
      <div className="main-content">
        {showAccountCreation ? (
          renderAccountCreation()
        ) : (
          <>
            {property && (
              <div className="application-header">
                <h2>Rental Application</h2>
                <div className="property-summary">
                  <h3>{property.name}</h3>
                  <p>{property.address}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="rental-application-form">
              {renderStepIndicator()}

              <div className="form-content">
                {step === 1 && renderPersonalInfo()}
                {step === 2 && renderEmploymentInfo()}
                {step === 3 && renderRentalHistory()}
                {step === 4 && renderReferences()}
                {step === 5 && (
                  <>
                    {renderAdditionalInfo()}
                    {renderDocuments()}
                  </>
                )}
              </div>

              <div className="form-navigation">
                {step > 1 && (
                  <button type="button" onClick={prevStep} className="btn btn-secondary">
                    Previous
                  </button>
                )}
                
                {step < totalSteps ? (
                  <button type="button" onClick={nextStep} className="btn btn-primary">
                    Next
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>

            {lowBandwidthMode && (
              <div className="low-bandwidth-notice">
                Low bandwidth mode enabled. Large files may take longer to upload.
              </div>
            )}
          </>
        )}
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default RentalApplicationPage;
