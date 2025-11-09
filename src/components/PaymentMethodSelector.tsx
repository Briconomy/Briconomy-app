export type PaymentMethod = 'card';

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
  requiresProof: boolean;
}

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'card',
    label: 'Credit Card',
    description: 'Pay securely with your credit card',
    requiresProof: false,
  },
];

function PaymentMethodSelector({ selected, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="payment-method-selector" style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
        Payment Method
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
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
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              {method.label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {method.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { PAYMENT_METHODS, PaymentMethodOption };
export default PaymentMethodSelector;