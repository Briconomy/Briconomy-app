import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'credit_card' | 'debit_card' | 'eft';
  name: string;
  details: string;
  isDefault: boolean;
}

function PaymentMethodsManager() {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    // Load payment methods from localStorage
    const loadPaymentMethods = () => {
      try {
        const savedMethods = localStorage.getItem('paymentMethods');
        if (savedMethods) {
          setPaymentMethods(JSON.parse(savedMethods));
        } else {
          // Set default method if none exist
          const defaultMethods = [
            {
              id: '1',
              type: 'bank_account' as PaymentMethod['type'],
              name: 'Primary Bank Account',
              details: '**** **** **** 1234',
              isDefault: true
            }
          ];
          setPaymentMethods(defaultMethods);
          localStorage.setItem('paymentMethods', JSON.stringify(defaultMethods));
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      }
    };

    loadPaymentMethods();
  }, []);

  const handleAddMethod = () => {
    navigate('/tenant/add-payment-method'); 
  };

  const handleEditMethod = (method: PaymentMethod) => {
    navigate(`/tenant/edit-payment-method/${method.id}`);
  };

  const handleDeleteMethod = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (methodToDelete) {
      try {
        const updatedMethods = paymentMethods.filter(method => method.id !== methodToDelete.id);
        setPaymentMethods(updatedMethods);
        localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
    setShowDeleteConfirm(false);
    setMethodToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setMethodToDelete(null);
  };

  const handleSetDefault = (id: string) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }));
      setPaymentMethods(updatedMethods);
      localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const getMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'bank_account': return 'Bank';
      case 'credit_card': return 'Card';
      case 'debit_card': return 'Card';
      case 'eft': return 'Mobile';
      default: return 'Payment';
    }
  };

  const getMethodTypeName = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'bank_account': return 'Bank Account';
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'eft': return 'EFT';
      default: return 'Other';
    }
  };

  return (
    <div className="payment-methods-manager">
      <div className="section-header">
        <h3>Payment Methods</h3>
        <button 
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleAddMethod}
        >
          Add Method
        </button>
      </div>

      <div className="payment-methods-list">
        {paymentMethods.length === 0 ? (
          <div className="empty-state">
            <p>No payment methods added yet</p>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleAddMethod}
            >
              Add Your First Payment Method
            </button>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div key={method.id} className="payment-method-card">
              <div className="method-info">
                <div className="method-header">
                  <span className="method-icon">{getMethodIcon(method.type)}</span>
                  <div className="method-details">
                    <h4>{method.name}</h4>
                    <p className="method-type">{getMethodTypeName(method.type)}</p>
                    <p className="method-details-text">{method.details}</p>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </div>
              <div className="method-actions">
                {!method.isDefault && (
                  <button 
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set Default
                  </button>
                )}
                <button 
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEditMethod(method)}
                >
                  Edit
                </button>
                <button 
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteMethod(method)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showDeleteConfirm && methodToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete Payment Method</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the payment method "{methodToDelete.name}"?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PaymentMethodsManager;
