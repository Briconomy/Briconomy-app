import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import PaymentChart from '../components/PaymentChart.tsx';

function TenantPaymentsPage() {
  const [payments, setPayments] = useState([
    { id: '1', amount: 12500, dueDate: '2024-09-01', status: 'pending', type: 'rent' },
    { id: '2', amount: 12500, dueDate: '2024-08-01', status: 'paid', type: 'rent', paymentDate: '2024-08-01' },
    { id: '3', amount: 500, dueDate: '2024-08-15', status: 'paid', type: 'utilities', paymentDate: '2024-08-14' }
  ]);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const navItems = [
    { path: '/tenant', label: 'Home', active: false },
    { path: '/tenant/payments', label: 'Payments', active: true },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile' }
  ];

  const totalDue = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const nextPayment = payments
    .filter(p => p.status === 'pending')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  const handleMakePayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = (paymentData) => {
    setPayments(prev => prev.map(p => 
      p.id === paymentData.id 
        ? { ...p, status: 'paid', paymentDate: new Date().toISOString().split('T')[0] }
        : p
    ));
    setShowPaymentForm(false);
    setSelectedPayment(null);
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Payments</div>
          <div className="page-subtitle">Manage your rent and utilities</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={`R${totalDue.toLocaleString()}`} label="Total Due" />
          <StatCard value={nextPayment ? `R${nextPayment.amount.toLocaleString()}` : 'R0'} label="Next Payment" />
          <StatCard value={nextPayment ? `${Math.ceil((new Date(nextPayment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days` : 'N/A'} label="Days Until Due" />
          <StatCard value="Good" label="Payment Status" />
        </div>

        <ChartCard title="Payment History">
          <PaymentChart />
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Payment Schedule</div>
          </div>
          
          {payments.map((payment) => (
            <div key={payment.id} className="list-item">
              <div className="item-info">
                <h4>{payment.type === 'rent' ? 'Rent Payment' : 'Utilities'}</h4>
                <p>Due: {new Date(payment.dueDate).toLocaleDateString()} - R{payment.amount.toLocaleString()}</p>
                {payment.paymentDate && (
                  <p className="text-sm text-gray-600">Paid: {new Date(payment.paymentDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="item-actions">
                <span className={`status-badge ${payment.status === 'paid' ? 'status-paid' : payment.status === 'pending' ? 'status-pending' : 'status-overdue'}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
                {payment.status === 'pending' && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleMakePayment(payment)}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="quick-actions">
          <ActionCard
            onClick={() => {}}
            icon="R"
            title="Payment History"
            description="View all past payments"
          />
          <ActionCard
            onClick={() => {}}
            icon="I"
            title="Payment Methods"
            description="Manage payment options"
          />
          <ActionCard
            onClick={() => {}}
            icon="S"
            title="Statements"
            description="Download statements"
          />
        </div>
      </div>
      
      {showPaymentForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Make Payment</h3>
              <button className="close-btn" onClick={() => setShowPaymentForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-details">
                <p><strong>Amount:</strong> R{selectedPayment?.amount.toLocaleString()}</p>
                <p><strong>Type:</strong> {selectedPayment?.type}</p>
                <p><strong>Due Date:</strong> {new Date(selectedPayment?.dueDate).toLocaleDateString()}</p>
              </div>
              
              <div className="payment-methods">
                <h4>Select Payment Method</h4>
                <div className="payment-options">
                  <label className="payment-option">
                    <input type="radio" name="paymentMethod" value="bank_transfer" />
                    <span>Bank Transfer</span>
                  </label>
                  <label className="payment-option">
                    <input type="radio" name="paymentMethod" value="card" />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="payment-option">
                    <input type="radio" name="paymentMethod" value="eft" />
                    <span>EFT</span>
                  </label>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handlePaymentSubmit(selectedPayment)}
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantPaymentsPage;