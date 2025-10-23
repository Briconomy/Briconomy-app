import React from 'react';

export type PaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'cheque';

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  requiresProof: boolean;
}

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'card',
    label: 'Credit/Debit Card',
    description: 'Pay securely with your card',
    icon: '💳',
    requiresProof: false,
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Transfer from your bank account',
    icon: '🏦',
    requiresProof: true,
  },
  {
    id: 'cash',
    label: 'Cash Payment',
    description: 'Pay in cash (require proof)',
    icon: '💵',
    requiresProof: true,
  },
  {
    id: 'cheque',
    label: 'Cheque',
    description: 'Pay by cheque (require proof)',
    icon: '📜',
    requiresProof: true,
  },
];

function PaymentMethodSelector({ selected, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="payment-method-selector" style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
        Select Payment Method
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.id}
            onClick={() => onChange(method.id)}
            style={{
              padding: '16px',
              border: selected === method.id ? '2px solid var(--primary)' : '1px solid var(--border-primary)',
              borderRadius: '12px',
              background: selected === method.id ? 'var(--primary-light, rgba(52, 152, 219, 0.1))' : 'var(--surface)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {method.icon}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              {method.label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {method.description}
            </div>
            {method.requiresProof && (
              <div style={{
                fontSize: '11px',
                color: 'var(--warning-color, #f39c12)',
                marginTop: '8px',
                fontWeight: '500'
              }}>
                ⚠️ Proof required
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { PAYMENT_METHODS, PaymentMethodOption };
export default PaymentMethodSelector;