import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface PaymentMethodFormData {
  type: 'bank_account' | 'credit_card' | 'debit_card' | 'eft';
  name: string;
  details: string;
  isDefault: boolean;
  // Bank Account specific fields
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  accountType?: string;
  // Card specific fields
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

function AddPaymentMethodPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    type: 'bank_account',
    name: '',
    details: '',
    isDefault: false,
    bankName: '',
    accountNumber: '',
    branchCode: '',
    accountType: 'cheque',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navItems = [
    { path: '/tenant', label: t('nav.home'), active: false },
    { path: '/tenant/payments', label: t('nav.payments'), active: false },
    { path: '/tenant/requests', label: t('nav.requests'), active: false },
    { path: '/tenant/profile', label: t('nav.profile'), active: false }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Payment method name is required';
    }

    if (formData.type === 'bank_account') {
      if (!formData.bankName?.trim()) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!formData.accountNumber?.trim()) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!formData.branchCode?.trim()) {
        newErrors.branchCode = 'Branch code is required';
      }
    } else if (formData.type === 'credit_card' || formData.type === 'debit_card') {
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
      // Generate details string based on type
      let details = '';
      if (formData.type === 'bank_account') {
        details = `${formData.bankName} - **** **** **** ${formData.accountNumber?.slice(-4)}`;
      } else if (formData.type === 'credit_card' || formData.type === 'debit_card') {
        details = `**** **** **** ${formData.cardNumber?.slice(-4)}`;
      } else {
        details = formData.details;
      }

      // Here you would typically save to your API
      // For now, we'll just store in localStorage for demo purposes
      const existingMethods = JSON.parse(localStorage.getItem('paymentMethods') || '[]');
      const newMethod = {
        id: Date.now().toString(),
        ...formData,
        details,
        createdAt: new Date().toISOString()
      };
      
      // If this is set as default, unset other defaults
      const updatedMethods = formData.isDefault 
        ? existingMethods.map((method: { isDefault: boolean }) => ({ ...method, isDefault: false }))
        : existingMethods;
      
      updatedMethods.push(newMethod);
      localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));

      // Navigate back to payment methods page
      navigate('/tenant/manage-payment-methods');
    } catch (error) {
      console.error('Error adding payment method:', error);
      setErrors({ submit: 'Failed to add payment method. Please try again.' });
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

  const getMethodTypeName = (type: string) => {
    switch (type) {
      case 'bank_account': return 'Bank Account';
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'eft': return 'EFT';
      default: return 'Other';
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

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Add Payment Method</div>
          <div className="page-subtitle">Add a new payment method to your account</div>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="type" className="form-label">Payment Method Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => updateFormData('type', e.target.value)}
                className="form-input"
              >
                <option value="bank_account">Bank Account</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="eft">EFT</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">Method Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                placeholder="e.g., Primary Bank Account"
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
          </div>

          {formData.type === 'bank_account' && (
            <div className="form-section">
              <h3 className="section-title">Bank Account Details</h3>
              
              <div className="form-group">
                <label htmlFor="bankName" className="form-label">Bank Name</label>
                <select
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => updateFormData('bankName', e.target.value)}
                  className={`form-input ${errors.bankName ? 'form-input-error' : ''}`}
                >
                  <option value="">Select Bank</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="FNB">First National Bank (FNB)</option>
                  <option value="ABSA">ABSA</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Capitec">Capitec Bank</option>
                  <option value="Discovery Bank">Discovery Bank</option>
                  <option value="African Bank">African Bank</option>
                  <option value="Investec">Investec</option>
                </select>
                {errors.bankName && <div className="form-error">{errors.bankName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="accountType" className="form-label">Account Type</label>
                <select
                  id="accountType"
                  value={formData.accountType}
                  onChange={(e) => updateFormData('accountType', e.target.value)}
                  className="form-input"
                >
                  <option value="cheque">Cheque Account</option>
                  <option value="savings">Savings Account</option>
                  <option value="transmission">Transmission Account</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="accountNumber" className="form-label">Account Number</label>
                <input
                  id="accountNumber"
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => updateFormData('accountNumber', e.target.value.replace(/\D/g, ''))}
                  className={`form-input ${errors.accountNumber ? 'form-input-error' : ''}`}
                  placeholder="Enter account number"
                  maxLength={12}
                />
                {errors.accountNumber && <div className="form-error">{errors.accountNumber}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="branchCode" className="form-label">Branch Code</label>
                <input
                  id="branchCode"
                  type="text"
                  value={formData.branchCode}
                  onChange={(e) => updateFormData('branchCode', e.target.value.replace(/\D/g, ''))}
                  className={`form-input ${errors.branchCode ? 'form-input-error' : ''}`}
                  placeholder="Enter branch code"
                  maxLength={6}
                />
                {errors.branchCode && <div className="form-error">{errors.branchCode}</div>}
              </div>
            </div>
          )}

          {(formData.type === 'credit_card' || formData.type === 'debit_card') && (
            <div className="form-section">
              <h3 className="section-title">{getMethodTypeName(formData.type)} Details</h3>
              
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
          )}

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
              {isLoading ? 'Adding...' : 'Add Payment Method'}
            </button>
          </div>
        </form>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AddPaymentMethodPage;