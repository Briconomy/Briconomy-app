import React, { useState } from 'react';
import { useOffline, apiWithOfflineFallback } from '../hooks/useOffline.ts';

interface OfflineMaintenanceFormProps {
  tenantId: string;
  propertyId: string;
  onSuccess?: (data: any) => void;
}

const OfflineMaintenanceForm: React.FC<OfflineMaintenanceFormProps> = ({ 
  tenantId, 
  propertyId, 
  onSuccess 
}) => {
  const { isOnline, storeOfflineData } = useOffline();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const requestData = {
        ...formData,
        tenantId,
        propertyId,
        reportedDate: new Date().toISOString(),
        status: 'pending'
      };

      const result = await apiWithOfflineFallback(
        () => fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        }),
        requestData,
        'maintenance_request'
      );

      if (result.offline) {
        setMessage(`Request saved offline. It will be submitted when you're back online.`);
      } else {
        setMessage('Maintenance request submitted successfully!');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'plumbing',
        priority: 'medium',
        location: ''
      });

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      setMessage('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Report Maintenance Issue</h2>
          <div className={`flex items-center space-x-2 text-sm ${
            isOnline ? 'text-green-600' : 'text-orange-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-orange-500'
            }`}></div>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {!isOnline && (
          <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded mb-6">
            <p className="text-sm">
              📱 You're currently offline. Your request will be saved locally and submitted automatically when you're back online.
            </p>
          </div>
        )}

        {message && (
          <div className={`border px-4 py-3 rounded mb-6 ${
            message.includes('offline') 
              ? 'bg-orange-100 border-orange-300 text-orange-800'
              : message.includes('success')
              ? 'bg-green-100 border-green-300 text-green-800'
              : 'bg-red-100 border-red-300 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Please provide as much detail as possible about the issue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="heating">Heating/Cooling</option>
                <option value="appliances">Appliances</option>
                <option value="structural">Structural</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location in Property
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Kitchen, Bathroom, Living Room"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Submitting...' : isOnline ? 'Submit Request' : 'Save Offline'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p>* Required fields</p>
          {!isOnline && (
            <p className="mt-2 text-orange-600">
              💾 This form works offline. Your data will be automatically submitted when connection is restored.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineMaintenanceForm;