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
}

const AnnouncementSystem: React.FC<AnnouncementSystemProps> = ({ onClose }) => {
  const { user } = useAuth();
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
    targetAudience: 'all' as 'all' | 'tenants' | 'caretakers' | 'managers',
    scheduledFor: ''
  });

  const quickAnnouncementTemplates = [
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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/announcements`);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      setAnnouncements(data);
    } catch (_err) {
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
      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData)
      });

      if (!response.ok) throw new Error('Failed to create announcement');
      
      const newAnnouncement = await response.json();
      
      // Send immediate notification if not scheduled
      if (!formData.scheduledFor) {
        await notificationService.sendAnnouncement(formData.title, formData.message);
        await sendNotificationToUsers(newAnnouncement);
      }

      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        message: '',
        category: 'general',
        priority: 'medium',
        targetAudience: 'all',
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
      await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: announcement.title,
          message: announcement.message,
          type: 'announcement',
          targetAudience: announcement.targetAudience,
          createdBy: announcement.createdBy
        })
      });
    } catch (_err) {
      console.error('Failed to send notifications to users');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowQuickOptions(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <span>Quick Options</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>Custom Announcement</span>
              </button>
              {onClose && (
                <button 
                  type="button"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
      </div>

      {/* Quick Options Modal */}
      {showQuickOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Quick Announcement Options</h2>
              <button
                type="button"
                onClick={() => setShowQuickOptions(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {quickAnnouncementTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectTemplate(template)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{template.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(template.priority)}`}>
                        {template.priority}
                      </span>
                      <span className="text-sm text-gray-500">
                        {template.targetAudience}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.message}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowQuickOptions(false);
                  setShowCreateForm(true);
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
              >
                Create Custom Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Announcement</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="urgent">Urgent</option>
                    <option value="events">Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="tenants">Tenants Only</option>
                  <option value="caretakers">Caretakers Only</option>
                  <option value="managers">Managers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule For (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  value={formData.scheduledFor}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {formData.scheduledFor ? 'Schedule' : 'Send Now'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No announcements yet</p>
                <p className="text-gray-400">Create your first announcement to get started</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement._id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {getCategoryIcon(announcement.category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>To: {announcement.targetAudience}</span>
                          <span>•</span>
                          <span>{announcement.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                      {announcement.status === 'scheduled' && announcement._id && (
                        <button
                          type="button"
                          onClick={() => sendNow(announcement._id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Send Now
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{announcement.message}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      {announcement.status === 'scheduled' && announcement.scheduledFor ? (
                        <span>Scheduled for: {new Date(announcement.scheduledFor).toLocaleString()}</span>
                      ) : (
                        <span>Sent: {new Date(announcement.createdAt).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(announcement.status)}`}>
                        {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
      </div>
    </div>
  );
};

export default AnnouncementSystem;