import React, { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'credit_card' | 'debit_card' | 'eft';
  name: string;
  details: string;
  isDefault: boolean;
}

function PaymentMethodsManager() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'bank_account',
      name: 'Primary Bank Account',
      details: '**** **** **** 1234',
      isDefault: true
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    type: 'bank_account' as PaymentMethod['type'],
    name: '',
    details: '',
    isDefault: false
  });

  const handleAddMethod = () => {
    setEditingMethod(null);
    setFormData({
      type: 'bank_account',
      name: '',
      details: '',
      isDefault: false
    });
    setShowAddForm(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      name: method.name,
      details: method.details,
      isDefault: method.isDefault
    });
    setShowAddForm(true);
  };

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMethod) {
      // Update existing method
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === editingMethod.id 
            ? { ...formData, id: editingMethod.id }
            : formData.isDefault 
              ? { ...method, isDefault: false }
              : method
        )
      );
    } else {
      // Add new method
      const newMethod: PaymentMethod = {
        ...formData,
        id: Date.now().toString()
      };
      
      setPaymentMethods(prev => {
        if (formData.isDefault) {
          return prev.map(method => ({ ...method, isDefault: false })).concat(newMethod);
        }
        return prev.concat(newMethod);
      });
    }
    
    setShowAddForm(false);
    setEditingMethod(null);
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
                  onClick={() => handleDeleteMethod(method.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
              <button 
                type="button"
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Payment Method Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as PaymentMethod['type']
                    }))}
                  >
                    <option value="bank_account">Bank Account</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="eft">EFT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Method Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Primary Bank Account"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Account Details</label>
                  <input
                    type="text"
                    value={formData.details}
                    onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                    placeholder="e.g., **** **** **** 1234"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    Set as default payment method
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={!formData.name || !formData.details}
                  >
                    {editingMethod ? 'Update Method' : 'Add Method'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentMethodsManager;
