import React, { useState } from 'react';

interface FakeCheckoutProps {
  amount: number;
  invoiceNumber: string;
  tenantName: string;
  onComplete: (reference: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function FakeCheckout({ amount, invoiceNumber, tenantName, onComplete, onCancel, isLoading }: FakeCheckoutProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format inputs
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'cvv') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 4) }));
    } else if (name === 'expiryMonth') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 2) }));
    } else if (name === 'expiryYear') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 4) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    // Demo: Only 4111111111111111 is valid
    const cardNumber = formData.cardNumber.replace(/\s/g, '');

    if (cardNumber !== '4111111111111111') {
      setError('Demo card: Use 4111 1111 1111 1111');
      return false;
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      setError('Please enter expiry date');
      return false;
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      setError('Please enter valid CVV');
      return false;
    }

    if (!formData.cardholderName.trim()) {
      setError('Please enter cardholder name');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setProcessing(true);

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate reference number
      const reference = `REF-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      onComplete(reference);
    } catch (_err) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
            Card Payment
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={processing || isLoading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Order Summary */}
        <div style={{
          background: 'var(--background)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              INVOICE
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              {invoiceNumber}
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              TENANT
            </div>
            <div style={{ fontSize: '14px' }}>
              {tenantName}
            </div>
          </div>
          <div style={{
            paddingTop: '12px',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>AMOUNT</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
              {formatCurrency(amount)}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Card Number */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              CARD NUMBER
            </label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="4111 1111 1111 1111"
              disabled={processing}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
              maxLength={19}
            />
            <small style={{ display: 'block', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '11px' }}>
              Demo: 4111 1111 1111 1111
            </small>
          </div>

          {/* Cardholder Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              CARDHOLDER NAME
            </label>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              placeholder="Name on card"
              disabled={processing}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Expiry & CVV */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                EXP. MONTH
              </label>
              <input
                type="text"
                name="expiryMonth"
                value={formData.expiryMonth}
                onChange={handleInputChange}
                placeholder="MM"
                disabled={processing}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}
                maxLength={2}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="•••"
                disabled={processing}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}
                maxLength={4}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--error-light, rgba(231, 76, 60, 0.1))',
              border: '1px solid var(--error-color, #e74c3c)',
              color: 'var(--error-color, #e74c3c)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Demo Warning */}
          <div style={{
            background: 'var(--warning-light, rgba(243, 156, 18, 0.1))',
            border: '1px solid var(--warning-color, #f39c12)',
            color: 'var(--text-primary)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            marginBottom: '16px'
          }}>
            💡 <strong>Demo Mode:</strong> This is a fake checkout. No real payment is processed. Use card 4111 1111 1111 1111.
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={processing || isLoading}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing || isLoading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {processing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FakeCheckout;