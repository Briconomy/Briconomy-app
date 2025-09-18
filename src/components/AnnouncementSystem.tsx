import React, { useState, useEffect } from 'react';
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'general' as const,
    priority: 'medium' as const,
    targetAudience: 'all' as const,
    scheduledFor: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
        createdBy: 'current_user_id', // Should come from auth context
        createdAt: new Date(),
        status: formData.scheduledFor ? 'scheduled' : 'sent',
        ...(formData.scheduledFor && { scheduledFor: new Date(formData.scheduledFor) })
      };

      const response = await fetch('/api/announcements', {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
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

      await fetch(`/api/announcements/${announcementId}/send`, {
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
    } catch (err) {
      setError('Failed to send announcement');
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent': return '🚨';
      case 'maintenance': return '🔧';
      case 'events': return '📅';
      default: return '📢';
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
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>📢</span>
                <span>Create Announcement</span>
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
            <div key={announcement._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(announcement.category)}</span>
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
                  {announcement.status === 'scheduled' && (
                    <button
                      type="button"
                      onClick={() => sendNow(announcement._id!)}
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
                  {announcement.status === 'scheduled' ? (
                    <span>Scheduled for: {new Date(announcement.scheduledFor!).toLocaleString()}</span>
                  ) : (
                    <span>Sent: {new Date(announcement.createdAt).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    announcement.status === 'sent' ? 'bg-green-100 text-green-800' :
                    announcement.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
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