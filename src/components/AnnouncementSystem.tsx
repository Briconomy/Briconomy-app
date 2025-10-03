import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { notificationService } from '../services/notifications.ts';

interface Announcement {
  _id?: string;
  title: string;
  message: string;
  category: 'general' | 'maintenance' | 'urgent' | 'events';
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'tenants' | 'caretakers' | 'managers';
  createdBy: string;
  createdAt: Date;
  scheduledFor?: Date;
  status: 'draft' | 'sent' | 'scheduled';
  readBy?: string[];
}

interface AnnouncementSystemProps {
  onClose?: () => void;
  userRole?: 'admin' | 'manager' | 'caretaker' | 'tenant';
}

const AnnouncementSystem: React.FC<AnnouncementSystemProps> = ({ onClose, userRole }) => {
  const { user } = useAuth();
  const currentUserRole = userRole || user?.userType;
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'general' as 'general' | 'maintenance' | 'urgent' | 'events',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetAudience: (currentUserRole === 'manager' ? 'tenants' : 'all') as 'all' | 'tenants' | 'caretakers' | 'managers',
    scheduledFor: ''
  });

  const getQuickAnnouncementTemplates = () => {
    if (currentUserRole === 'manager') {
      return [
        {
          title: 'Rent Payment Due',
          message: 'This is a friendly reminder that rent payments are due by [DATE]. Please ensure your payment is submitted on time to avoid late fees.',
          category: 'general' as const,
          priority: 'medium' as const,
          targetAudience: 'tenants' as const
        },
        {
          title: 'Property Maintenance Notice',
          message: 'Scheduled maintenance will be performed on [DATE] from [TIME] to [TIME]. Please plan accordingly and contact us if you have any concerns.',
          category: 'maintenance' as const,
          priority: 'medium' as const,
          targetAudience: 'tenants' as const
        },
        {
          title: 'Maintenance Task Assignment',
          message: 'New maintenance tasks have been assigned. Please check your dashboard for details and complete them by [DATE].',
          category: 'maintenance' as const,
          priority: 'medium' as const,
          targetAudience: 'caretakers' as const
        },
        {
          title: 'Urgent Property Issue',
          message: 'URGENT: There is an issue requiring immediate attention at [PROPERTY/UNIT]. Please address this matter promptly.',
          category: 'urgent' as const,
          priority: 'high' as const,
          targetAudience: 'caretakers' as const
        },
        {
          title: 'Lease Renewal Notice',
          message: 'Your lease is approaching its expiration date on [DATE]. Please contact us to discuss renewal options.',
          category: 'general' as const,
          priority: 'medium' as const,
          targetAudience: 'tenants' as const
        },
        {
          title: 'Property Inspection Schedule',
          message: 'Property inspections will be conducted on [DATE]. Please ensure all units are accessible and notify tenants in advance.',
          category: 'maintenance' as const,
          priority: 'medium' as const,
          targetAudience: 'caretakers' as const
        }
      ];
    }
    
    // Default templates for admin users
    return [
      {
        title: 'System Maintenance',
        message: 'The system will be undergoing scheduled maintenance from [TIME] to [TIME] on [DATE]. Access may be limited during this period.',
        category: 'maintenance' as const,
        priority: 'high' as const,
        targetAudience: 'all' as const
      },
      {
        title: 'Payment Reminder',
        message: 'This is a friendly reminder that rent payments are due by [DATE]. Please ensure your payment is submitted on time to avoid late fees.',
        category: 'general' as const,
        priority: 'medium' as const,
        targetAudience: 'tenants' as const
      },
      {
        title: 'Emergency Notice',
        message: 'URGENT: [DESCRIPTION OF EMERGENCY]. Please follow the instructions provided and contact management immediately if you need assistance.',
        category: 'urgent' as const,
        priority: 'high' as const,
        targetAudience: 'all' as const
      },
      {
        title: 'Building Updates',
        message: 'Important building updates: [DETAILS]. These changes will take effect on [DATE]. Please review and contact management with any questions.',
        category: 'general' as const,
        priority: 'medium' as const,
        targetAudience: 'all' as const
      },
      {
        title: 'Policy Changes',
        message: 'We are implementing new policies regarding [POLICY AREA]. These changes will be effective [DATE]. Please review the attached documentation.',
        category: 'general' as const,
        priority: 'medium' as const,
        targetAudience: 'all' as const
      },
      {
        title: 'Maintenance Schedule',
        message: 'Routine maintenance will be performed in [AREA/BUILDING] on [DATE] from [TIME] to [TIME]. Access may be restricted during this period.',
        category: 'maintenance' as const,
        priority: 'medium' as const,
        targetAudience: 'managers' as const
      }
    ];
  };

  const quickAnnouncementTemplates = getQuickAnnouncementTemplates();

  useEffect(() => {
    console.log('AnnouncementSystem mounted, current user role:', currentUserRole);
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = getApiBaseUrl();
      console.log('Fetching announcements from:', `${API_BASE_URL}/api/announcements`);
      const response = await fetch(`${API_BASE_URL}/api/announcements`);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      console.log('Fetched announcements:', data);
      console.log('Announcements with IDs:', data.map(a => ({ title: a.title, id: a._id, hasId: !!a._id })));
      setAnnouncements(data);
    } catch (_err) {
      console.error('Error fetching announcements:', _err);
      setError(_err instanceof Error ? _err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getApiBaseUrl = () => {
    try {
      const loc = globalThis.location;
      const protocol = loc.protocol || 'http:';
      const hostname = loc.hostname || 'localhost';
      const port = loc.port || '';
      if (port === '5173') return `${protocol}//${hostname}:8816`;
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    } catch (_) {
      return 'http://localhost:8816';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      const announcementData = {
        ...formData,
        createdBy: user?.id || 'admin-user',
        createdAt: new Date(),
        status: formData.scheduledFor ? 'scheduled' : 'sent',
        ...(formData.scheduledFor && { scheduledFor: new Date(formData.scheduledFor) })
      };

      const API_BASE_URL = getApiBaseUrl();
      console.log(`Creating announcement at: ${API_BASE_URL}/api/announcements`);
      console.log('Announcement data:', announcementData);
      
      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData)
      });

      console.log('Create announcement response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create announcement error:', response.status, errorText);
        throw new Error(`Failed to create announcement: ${response.status} ${errorText}`);
      }
      
      const newAnnouncement = await response.json();
      console.log('Created announcement:', newAnnouncement);
      
      // Send immediate notification if not scheduled
      if (!formData.scheduledFor) {
        try {
          await notificationService.sendAnnouncement(formData.title, formData.message);
        } catch (error) {
          console.warn('Browser notification failed:', error);
        }
        try {
          await sendNotificationToUsers(newAnnouncement);
        } catch (error) {
          console.warn('Server notification failed:', error);
        }
      }

      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        message: '',
        category: 'general',
        priority: 'medium',
        targetAudience: currentUserRole === 'manager' ? 'tenants' : 'all',
        scheduledFor: ''
      });
      setError(null);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendNow = async (announcementId: string) => {
    try {
      const announcement = announcements.find(a => a._id === announcementId);
      if (!announcement) return;

      const API_BASE_URL = getApiBaseUrl();
      await fetch(`${API_BASE_URL}/api/announcements/${announcementId}/send`, {
        method: 'POST'
      });

      await notificationService.sendAnnouncement(announcement.title, announcement.message);
      
      setAnnouncements(prev => 
        prev.map(a => 
          a._id === announcementId 
            ? { ...a, status: 'sent' as const }
            : a
        )
      );
    } catch (_err) {
      setError('Failed to send announcement');
    }
  };

  const deleteAnnouncement = async (announcement: Announcement) => {
    console.log('Delete requested for announcement:', { id: announcement._id, title: announcement.title });
    console.log('Current announcements:', announcements.map(a => ({ id: a._id, title: a.title })));
    
    if (!confirm('Are you sure you want to permanently delete this announcement?')) {
      return;
    }

    try {
      setLoading(true);
      const API_BASE_URL = getApiBaseUrl();
      
      // If announcement has a proper _id, use the standard delete endpoint
      if (announcement._id && typeof announcement._id === 'string' && announcement._id.length === 24) {
        console.log(`Sending DELETE request to: ${API_BASE_URL}/api/announcements/${announcement._id}`);
        
        const response = await fetch(`${API_BASE_URL}/api/announcements/${announcement._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Delete API response:', result);

          // Remove the announcement from the local state by _id
          setAnnouncements(prev => {
            const filtered = prev.filter(a => a._id !== announcement._id);
            console.log(`Filtered by _id: ${filtered.length} (was ${prev.length})`);
            return filtered;
          });
          console.log(`Announcement ${announcement._id} deleted successfully`);
          
          // Also send notification to remove from everyone's notification widgets
          await broadcastAnnouncementDeletion(announcement);
        } else if (response.status === 500) {
          // Ghost announcement - remove from UI anyway since it's not in database
          setAnnouncements(prev => {
            const filtered = prev.filter(a => a._id !== announcement._id);
            console.log(`Ghost announcement removed from UI: ${filtered.length} (was ${prev.length})`);
            return filtered;
          });
          console.log(`Ghost announcement ${announcement._id} removed from UI (was not in database)`);
        } else {
          const errorText = await response.text();
          console.error('Delete API error:', response.status, errorText);
          throw new Error(`Failed to delete announcement: ${response.status} ${errorText}`);
        }
      } else {
        // For announcements without proper _id, delete by matching content
        console.log('Announcement lacks proper _id, deleting by content match');
        
        const response = await fetch(`${API_BASE_URL}/api/announcements/delete-by-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: announcement.title,
            message: announcement.message,
            createdBy: announcement.createdBy,
            createdAt: announcement.createdAt
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Delete by content API response:', result);

          // Remove the announcement from local state by matching content
          setAnnouncements(prev => {
            const filtered = prev.filter(a => !(
              a.title === announcement.title && 
              a.message === announcement.message && 
              a.createdBy === announcement.createdBy
            ));
            console.log(`Filtered by content: ${filtered.length} (was ${prev.length})`);
            return filtered;
          });
          console.log(`Announcement "${announcement.title}" deleted successfully by content match`);
          
          // Also send notification to remove from everyone's notification widgets
          await broadcastAnnouncementDeletion(announcement);
        } else if (response.status === 500) {
          // Ghost announcement - remove from UI anyway since it's not in database
          setAnnouncements(prev => {
            const filtered = prev.filter(a => !(
              a.title === announcement.title && 
              a.message === announcement.message && 
              a.createdBy === announcement.createdBy
            ));
            console.log(`Ghost announcement removed from UI: ${filtered.length} (was ${prev.length})`);
            return filtered;
          });
          console.log(`Ghost announcement "${announcement.title}" removed from UI (was not in database)`);
        } else {
          const errorText = await response.text();
          console.error('Delete by content API error:', response.status, errorText);
          throw new Error(`Failed to delete announcement: ${response.status} ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template: typeof quickAnnouncementTemplates[0]) => {
    setFormData({
      title: template.title,
      message: template.message,
      category: template.category,
      priority: template.priority,
      targetAudience: template.targetAudience,
      scheduledFor: ''
    });
    setShowQuickOptions(false);
    setShowCreateForm(true);
  };

  const sendNotificationToUsers = async (announcement: Announcement) => {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const requestBody = {
        title: announcement.title,
        message: announcement.message,
        type: 'announcement',
        targetAudience: announcement.targetAudience,
        createdBy: announcement.createdBy || user?.id || 'unknown'
      };
      
      console.log(`Sending notification to ${API_BASE_URL}/api/notifications with body:`, requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Notification sent successfully:', result);
    } catch (error) {
      console.error('Failed to send notifications to users:', error);
      // Don't throw the error - just log it so the announcement still gets created
    }
  };

  const broadcastAnnouncementDeletion = async (announcement: Announcement) => {
    try {
      const API_BASE_URL = getApiBaseUrl();
      
      // Send a special notification to tell all users to remove this announcement from their notifications
      const requestBody = {
        title: `Announcement Deleted: ${announcement.title}`,
        message: `The announcement "${announcement.title}" has been removed.`,
        type: 'announcement_deleted',
        targetAudience: announcement.targetAudience,
        createdBy: user?.id || 'manager',
        announcementId: announcement._id,
        originalTitle: announcement.title
      };
      
      console.log(`Broadcasting announcement deletion to all users:`, requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        console.log('Announcement deletion broadcasted successfully');
      } else {
        console.warn('Failed to broadcast announcement deletion');
      }
    } catch (error) {
      console.error('Failed to broadcast announcement deletion:', error);
      // Don't throw - deletion succeeded, broadcast is just a bonus
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent': return 'U';
      case 'maintenance': return 'M';
      case 'events': return 'E';
      default: return 'A';
    }
  };

  if (loading && announcements.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
      paddingTop: '60px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '480px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>Announcements</h1>
            {onClose && (
              <button 
                type="button"
                onClick={onClose}
                style={{
                  color: '#6b7280',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => setShowQuickOptions(true)}
              style={{
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a';
              }}
            >
              Quick Options
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              Custom Announcement
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
      </div>

      {/* Quick Options Modal */}
      {showQuickOptions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '16px',
          paddingTop: '60px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: 0
              }}>Quick Templates</h2>
              <button
                type="button"
                onClick={() => setShowQuickOptions(false)}
                style={{
                  color: '#6b7280',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickAnnouncementTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectTemplate(template)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>{template.title}</h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        backgroundColor: template.priority === 'high' ? '#fef2f2' : template.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                        color: template.priority === 'high' ? '#dc2626' : template.priority === 'medium' ? '#d97706' : '#16a34a'
                      }}>
                        {template.priority}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {template.targetAudience}
                      </span>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>{template.message}</p>
                </button>
              ))}
            </div>

            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowQuickOptions(false);
                  setShowCreateForm(true);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                Create Custom Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '16px',
          paddingTop: '60px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: 0
              }}>Create Announcement</h2>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  color: '#6b7280',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="urgent">Urgent</option>
                    <option value="events">Events</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Target Audience
                </label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {currentUserRole === 'manager' ? (
                    <>
                      <option value="tenants">Tenants Only</option>
                      <option value="caretakers">Caretakers Only</option>
                    </>
                  ) : (
                    <>
                      <option value="all">All Users</option>
                      <option value="tenants">Tenants Only</option>
                      <option value="caretakers">Caretakers Only</option>
                      <option value="managers">Managers Only</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Schedule For (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  value={formData.scheduledFor}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                paddingTop: '12px' 
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    backgroundColor: loading ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    opacity: loading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }
                  }}
                >
                  {formData.scheduledFor ? 'Schedule' : 'Send Now'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#d1d5db',
                    color: '#374151',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#9ca3af';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1d5db';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          {/* Announcements List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ color: '#6b7280', fontSize: '18px', margin: '0 0 8px 0' }}>No announcements yet</p>
                <p style={{ color: '#9ca3af', margin: 0 }}>Create your first announcement to get started</p>
              </div>
            ) : (
              announcements.map((announcement) => {
                return (
                <div key={announcement._id} style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#dbeafe',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                        fontWeight: 'bold'
                      }}>
                        {getCategoryIcon(announcement.category)}
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>{announcement.title}</h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          <span>To: {announcement.targetAudience}</span>
                          <span>•</span>
                          <span>{announcement.category}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        backgroundColor: announcement.priority === 'high' ? '#fef2f2' : announcement.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                        color: announcement.priority === 'high' ? '#dc2626' : announcement.priority === 'medium' ? '#d97706' : '#16a34a'
                      }}>
                        {announcement.priority}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {announcement.status === 'scheduled' && announcement._id && (
                          <button
                            type="button"
                            onClick={() => sendNow(announcement._id)}
                            style={{
                              color: '#2563eb',
                              fontSize: '14px',
                              fontWeight: '500',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#1d4ed8';
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#2563eb';
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            Send Now
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Delete button clicked for:', announcement.title);
                            deleteAnnouncement(announcement);
                          }}
                          style={{
                            color: '#dc2626',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#b91c1c';
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Delete announcement permanently"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <p style={{
                    color: '#374151',
                    marginBottom: '12px',
                    lineHeight: '1.5',
                    margin: '0 0 12px 0'
                  }}>{announcement.message}</p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <div>
                      {announcement.status === 'scheduled' && announcement.scheduledFor ? (
                        <span>Scheduled for: {new Date(announcement.scheduledFor).toLocaleString()}</span>
                      ) : (
                        <span>Sent: {new Date(announcement.createdAt).toLocaleString()}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        backgroundColor: announcement.status === 'sent' ? '#dcfce7' : announcement.status === 'scheduled' ? '#dbeafe' : '#f3f4f6',
                        color: announcement.status === 'sent' ? '#166534' : announcement.status === 'scheduled' ? '#1e40af' : '#374151'
                      }}>
                        {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
      </div>
    </div>
  );
};

export default AnnouncementSystem;