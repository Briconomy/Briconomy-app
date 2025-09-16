import React, { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  response?: string;
}

function HelpSupport() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'emergency'>('faq');
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I pay my rent?',
      answer: 'You can pay your rent through the Payments page. We accept bank transfers, EFT, and credit/debit cards. Simply select your preferred payment method and follow the instructions.',
      category: 'Payments'
    },
    {
      id: '2',
      question: 'How do I report a maintenance issue?',
      answer: 'Go to the Requests page and click "New Request". Fill in the details of the issue, select the priority level, and submit. Our maintenance team will be notified immediately.',
      category: 'Maintenance'
    },
    {
      id: '3',
      question: 'Can I view my lease agreement?',
      answer: 'Yes, you can view your lease agreement in the Documents section of your Profile page. All your important documents are stored there for easy access.',
      category: 'Documents'
    },
    {
      id: '4',
      question: 'How do I update my contact information?',
      answer: 'You can update your contact information by going to your Profile page and clicking the "Edit" button. Make sure to keep your emergency contact information up to date.',
      category: 'Profile'
    },
    {
      id: '5',
      question: 'What if I lose my keys?',
      answer: 'In case of lost keys, please contact us immediately through the emergency contact or submit a high-priority maintenance request. There may be a replacement fee for new keys.',
      category: 'Emergency'
    },
    {
      id: '6',
      question: 'How do I renew my lease?',
      answer: 'Your lease renewal options will be available in your profile before your current lease expires. You can also contact your property manager to discuss renewal options.',
      category: 'Lease'
    }
  ];

  const emergencyContacts = [
    { name: 'Property Manager', phone: '+27 11 234 5678', type: 'Primary' },
    { name: 'Emergency Maintenance', phone: '+27 11 234 5679', type: '24/7' },
    { name: 'Security', phone: '+27 11 234 5680', type: '24/7' },
    { name: 'Fire Department', phone: '10177', type: 'Emergency' },
    { name: 'Police', phone: '10111', type: 'Emergency' },
    { name: 'Ambulance', phone: '10177', type: 'Emergency' }
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;

    setSubmitting(true);
    
    // Simulate ticket submission
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: Date.now().toString(),
        subject: formData.subject,
        message: formData.message,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      setTickets(prev => [newTicket, ...prev]);
      setShowContactForm(false);
      setSubmitting(false);
      setFormData({
        subject: '',
        message: '',
        priority: 'medium'
      });
    }, 1000);
  };

  const toggleFAQ = (id: string) => {
    setSelectedFAQ(selectedFAQ === id ? null : id);
  };

  const getFAQByCategory = (category: string) => {
    return faqItems.filter(item => item.category === category);
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'status-pending';
      case 'in_progress': return 'status-progress';
      case 'resolved': return 'status-paid';
      default: return 'status-pending';
    }
  };

  return (
    <div className="help-support">
      <div className="tab-navigation">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          FAQ
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Us
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          Emergency
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'faq' && (
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>
            
            <div className="faq-categories">
              <div className="faq-category">
                <h4>Payments</h4>
                {getFAQByCategory('Payments').map(item => (
                  <div key={item.id} className="faq-item">
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => toggleFAQ(item.id)}
                    >
                      {item.question}
                      <span className="faq-icon">{selectedFAQ === item.id ? '−' : '+'}</span>
                    </button>
                    {selectedFAQ === item.id && (
                      <div className="faq-answer">{item.answer}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="faq-category">
                <h4>Maintenance</h4>
                {getFAQByCategory('Maintenance').map(item => (
                  <div key={item.id} className="faq-item">
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => toggleFAQ(item.id)}
                    >
                      {item.question}
                      <span className="faq-icon">{selectedFAQ === item.id ? '−' : '+'}</span>
                    </button>
                    {selectedFAQ === item.id && (
                      <div className="faq-answer">{item.answer}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="faq-category">
                <h4>Documents & Profile</h4>
                {getFAQByCategory('Documents').concat(getFAQByCategory('Profile')).map(item => (
                  <div key={item.id} className="faq-item">
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => toggleFAQ(item.id)}
                    >
                      {item.question}
                      <span className="faq-icon">{selectedFAQ === item.id ? '−' : '+'}</span>
                    </button>
                    {selectedFAQ === item.id && (
                      <div className="faq-answer">{item.answer}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="faq-category">
                <h4>Lease & Emergency</h4>
                {getFAQByCategory('Lease').concat(getFAQByCategory('Emergency')).map(item => (
                  <div key={item.id} className="faq-item">
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => toggleFAQ(item.id)}
                    >
                      {item.question}
                      <span className="faq-icon">{selectedFAQ === item.id ? '−' : '+'}</span>
                    </button>
                    {selectedFAQ === item.id && (
                      <div className="faq-answer">{item.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="contact-section">
            <h3>Contact Support</h3>
            
            <div className="contact-info">
              <div className="contact-card">
                <h4>Phone Support</h4>
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
                <p><strong>Primary:</strong> +27 11 234 5678</p>
              </div>

              <div className="contact-card">
                <h4>Email Support</h4>
                <p>For general inquiries:</p>
                <p><strong>support@briconomy.com</strong></p>
                <p>For urgent matters:</p>
                <p><strong>urgent@briconomy.com</strong></p>
              </div>

              <div className="contact-card">
                <h4>Office Location</h4>
                <p>123 Main Street</p>
                <p>Blue Hills, Johannesburg</p>
                <p>South Africa, 2090</p>
                <p>Office Hours: 8:00 AM - 5:00 PM</p>
              </div>
            </div>

            <div className="support-tickets">
              <div className="section-header">
                <h4>Your Support Tickets</h4>
                <button 
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowContactForm(true)}
                >
                  New Ticket
                </button>
              </div>

              {tickets.length === 0 ? (
                <div className="empty-state">
                  <p>No support tickets yet</p>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowContactForm(true)}
                  >
                    Create Your First Ticket
                  </button>
                </div>
              ) : (
                <div className="tickets-list">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-info">
                        <h4>{ticket.subject}</h4>
                        <p className="ticket-message">{ticket.message}</p>
                        <p className="ticket-meta">
                          {new Date(ticket.createdAt).toLocaleDateString()} • 
                          <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="emergency-section">
            <h3>Emergency Contacts</h3>
            <div className="emergency-warning">
              <strong>WARNING: For life-threatening emergencies, call 10177 (Ambulance/Fire) or 10111 (Police) immediately</strong>
            </div>

            <div className="emergency-contacts-grid">
              {emergencyContacts.map(contact => (
                <div key={contact.name} className="emergency-contact-card">
                  <div className="contact-type">{contact.type}</div>
                  <h4>{contact.name}</h4>
                  <p className="contact-phone">
                    <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                      {contact.phone}
                    </a>
                  </p>
                  <button 
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => window.location.href = `tel:${contact.phone.replace(/\s/g, '')}`}
                  >
                    Call Now
                  </button>
                </div>
              ))}
            </div>

            <div className="emergency-procedures">
              <h4>Emergency Procedures</h4>
              <div className="procedure-list">
                <div className="procedure-item">
                  <h5>Fire Emergency</h5>
                  <ol>
                    <li>Evacuate immediately using nearest exit</li>
                    <li>Call Fire Department: 10177</li>
                    <li>Notify building management</li>
                    <li>Do not use elevators</li>
                    <li>Meet at designated assembly point</li>
                  </ol>
                </div>

                <div className="procedure-item">
                  <h5>Medical Emergency</h5>
                  <ol>
                    <li>Call Ambulance: 10177</li>
                    <li>Provide first aid if trained</li>
                    <li>Notify emergency contacts</li>
                    <li>Inform property management</li>
                    <li>Stay with the person until help arrives</li>
                  </ol>
                </div>

                <div className="procedure-item">
                  <h5>Security Emergency</h5>
                  <ol>
                    <li>Call Police: 10111</li>
                    <li>Lock yourself in a safe room</li>
                    <li>Notify building security</li>
                    <li>Do not confront intruders</li>
                    <li>Wait for authorities to arrive</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showContactForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Support Ticket</h3>
              <button 
                type="button"
                className="close-btn"
                onClick={() => setShowContactForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitTicket}>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    placeholder="Please provide detailed information about your issue..."
                    required
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowContactForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={!formData.subject || !formData.message || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
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

export default HelpSupport;
