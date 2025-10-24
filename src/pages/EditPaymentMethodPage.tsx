import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface PaymentMethodFormData {
  type: 'credit_card';
  name: string;
  details: string;
  isDefault: boolean;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

function EditPaymentMethodPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    type: 'credit_card',
    name: '',
    details: '',
    isDefault: false,
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navItems = [
    { path: '/tenant', label: t('nav.home'), active: false },
    { path: '/tenant/payments', label: t('nav.payments'), active: false },
    { path: '/tenant/requests', label: t('nav.requests'), active: false },
    { path: '/tenant/profile', label: t('nav.profile'), active: false }
  ];

  useEffect(() => {
    // Load existing payment method data
    const loadPaymentMethod = () => {
      try {
        const existingMethods = JSON.parse(localStorage.getItem('paymentMethods') || '[]');
        const method = existingMethods.find((m: { id: string }) => m.id === id);
        
        if (method) {
          setFormData(method);
        } else {
          // Method not found, redirect back
          navigate('/tenant/manage-payment-methods');
          return;
        }
      } catch (error) {
        console.error('Error loading payment method:', error);
        setErrors({ load: 'Failed to load payment method data' });
      } finally {
        setIsLoadingData(false);
      }
    };

    if (id) {
      loadPaymentMethod();
    } else {
      navigate('/tenant/manage-payment-methods');
    }
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Payment method name is required';
    }

    if (!formData.cardNumber?.trim()) {
      newErrors.cardNumber = 'Card number is required';
    }
    if (!formData.expiryDate?.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    }
    if (!formData.cvv?.trim()) {
      newErrors.cvv = 'CVV is required';
    }
    if (!formData.cardholderName?.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const details = `**** **** **** ${formData.cardNumber?.slice(-4)}`;

      const existingMethods = JSON.parse(localStorage.getItem('paymentMethods') || '[]');
      const methodIndex = existingMethods.findIndex((m: { id: string }) => m.id === id);

      if (methodIndex !== -1) {
        const updatedMethod = {
          ...formData,
          id,
          details,
          updatedAt: new Date().toISOString()
        };

        if (formData.isDefault) {
          existingMethods.forEach((method: { isDefault: boolean }, index: number) => {
            if (index !== methodIndex) {
              method.isDefault = false;
            }
          });
        }

        existingMethods[methodIndex] = updatedMethod;
        localStorage.setItem('paymentMethods', JSON.stringify(existingMethods));
      }

      navigate('/tenant/manage-payment-methods');
    } catch (error) {
      console.error('Error updating payment method:', error);
      setErrors({ submit: 'Failed to update payment method. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/tenant/manage-payment-methods');
  };

  const updateFormData = (field: keyof PaymentMethodFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  if (isLoadingData) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading payment method...</p>
          </div>
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
          <div className="page-title">Edit Credit Card</div>
          <div className="page-subtitle">Update your credit card details</div>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          {errors.load && (
            <div className="error-message">
              {errors.load}
            </div>
          )}

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Card Nickname</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                placeholder="e.g., Primary Credit Card"
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Credit Card Details</h3>
              
              <div className="form-group">
                <label htmlFor="cardholderName" className="form-label">Cardholder Name</label>
                <input
                  id="cardholderName"
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => updateFormData('cardholderName', e.target.value)}
                  className={`form-input ${errors.cardholderName ? 'form-input-error' : ''}`}
                  placeholder="Name as it appears on card"
                />
                {errors.cardholderName && <div className="form-error">{errors.cardholderName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber" className="form-label">Card Number</label>
                <input
                  id="cardNumber"
                  type="text"
                  value={formatCardNumber(formData.cardNumber || '')}
                  onChange={(e) => updateFormData('cardNumber', e.target.value.replace(/\s/g, ''))}
                  className={`form-input ${errors.cardNumber ? 'form-input-error' : ''}`}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {errors.cardNumber && <div className="form-error">{errors.cardNumber}</div>}
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                  <input
                    id="expiryDate"
                    type="text"
                    value={formatExpiryDate(formData.expiryDate || '')}
                    onChange={(e) => updateFormData('expiryDate', e.target.value.replace(/\D/g, ''))}
                    className={`form-input ${errors.expiryDate ? 'form-input-error' : ''}`}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {errors.expiryDate && <div className="form-error">{errors.expiryDate}</div>}
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="cvv" className="form-label">CVV</label>
                  <input
                    id="cvv"
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => updateFormData('cvv', e.target.value.replace(/\D/g, ''))}
                    className={`form-input ${errors.cvv ? 'form-input-error' : ''}`}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && <div className="form-error">{errors.cvv}</div>}
                </div>
              </div>
            </div>

          <div className="form-section">
            <div className="form-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => updateFormData('isDefault', e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-label">Set as default payment method</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Payment Method'}
            </button>
          </div>
        </form>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default EditPaymentMethodPage;