import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CHAT_ROOM, GET_GROUPS } from '../graphql/operations';
import { X, MessageCircle, Hash } from 'lucide-react';

const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupId: '',
    tags: ''
  });

  const { data: groupsData, loading: groupsLoading, error: groupsError } = useQuery(GET_GROUPS);
  const groups = groupsData?.groups || [];
  
  // Debug logging
  console.log('Groups data:', groupsData);
  console.log('Groups:', groups);
  console.log('Groups loading:', groupsLoading);
  console.log('Groups error:', groupsError);
  const [error, setError] = useState('');

  const [createRoom, { loading }] = useMutation(CREATE_CHAT_ROOM, {
    onCompleted: (data) => {
      onRoomCreated();
      setFormData({ name: '', description: '', groupId: '', tags: '' });
      setError('');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Room name is required');
      return;
    }

    if (!formData.groupId) {
      setError('Please select a group for the room');
      return;
    }

    try {
      await createRoom({
        variables: {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          groupId: formData.groupId,
          tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()) : [],
        },
      });
    } catch (err) {
      // Error is handled in onError
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', groupId: '', tags: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Create New Chat Room
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter room name"
                  required
                />
              </div>

              <div>
                <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-1">
                  Group *
                </label>
                {groupsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    <div className="animate-pulse text-gray-500">Loading groups...</div>
                  </div>
                ) : groupsError ? (
                  <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
                    Error loading groups: {groupsError.message}
                  </div>
                ) : groups.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700">
                    No groups available. Please create a group first.
                  </div>
                ) : (
                  <select
                    id="groupId"
                    name="groupId"
                    value={formData.groupId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.icon} {group.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe what this room is about..."
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="react, frontend, development (comma separated)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add relevant tags separated by commas to help others find your room
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
