import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHAT_ROOMS, GET_GROUPS, JOIN_CHAT_ROOM } from '../graphql/operations';
import { MessageCircle, Users, Search, Hash } from 'lucide-react';

const AllRooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const { data: groupsData, loading: groupsLoading } = useQuery(GET_GROUPS);
  const { data: roomsData, loading: roomsLoading, refetch } = useQuery(GET_CHAT_ROOMS, {
    variables: { groupId: selectedGroup || null }
  });
  const [joinRoom] = useMutation(JOIN_CHAT_ROOM);

  const groups = groupsData?.groups || [];
  const allRooms = roomsData?.chatRooms || [];

  // Filter rooms by search query
  const filteredRooms = allRooms.filter(room => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      room.name.toLowerCase().includes(query) ||
      room.description?.toLowerCase().includes(query) ||
      room.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">All Chat Rooms</h1>
        <p className="text-gray-600">Discover and join chat rooms by topic</p>
        
        {/* Search and Filter */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.icon} {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {roomsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Link
                key={room.id}
                to={`/chat/${room.id}`}
                className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all duration-200"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{room.group?.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-500">{room.group?.name}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                
                {/* Tags */}
                {room.tags && room.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {room.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                        +{room.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{room.messageCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{room.members?.length || 0}</span>
                    </div>
                  </div>
                  <span className="text-xs">
                    {room.lastActivity ? new Date(room.lastActivity).toLocaleDateString() : 'New'}
                  </span>
                </div>
                
                {/* Join Room Button */}
                <div className="mt-4">
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        console.log('Attempting to join room:', room.id);
                        const result = await joinRoom({ variables: { roomId: room.id } });
                        console.log('Join room result:', result);
                        // Refresh the data to show updated member count
                        refetch();
                        alert('Successfully joined the room!');
                      } catch (error) {
                        console.error('Error joining room:', error);
                        alert(`Error joining room: ${error.message}`);
                      }
                    }}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Join Room
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Hash className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? `No rooms match "${searchQuery}"`
                : selectedGroup 
                  ? `No rooms in this group yet`
                  : 'No chat rooms available'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRooms;
