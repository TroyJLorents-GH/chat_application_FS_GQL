import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_GROUPS, GET_CHAT_ROOMS } from '../graphql/operations';
import { Link, useParams } from 'react-router-dom';
import { Search, TrendingUp, Hash, Users, MessageCircle } from 'lucide-react';

const Groups = () => {
  const { roomId } = useParams();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: groupsData, loading: groupsLoading, error: groupsError } = useQuery(GET_GROUPS);
  const { data: roomsData, loading: roomsLoading, error: roomsError } = useQuery(GET_CHAT_ROOMS, {
    variables: { groupId: selectedGroup || null },
    skip: false // Always fetch rooms
  });
  
  // Debug logging
  console.log('Groups data:', groupsData);
  console.log('Rooms data:', roomsData);
  console.log('Groups error:', groupsError);
  console.log('Rooms error:', roomsError);

  const groups = groupsData?.groups || [];
  const allRooms = roomsData?.chatRooms || [];
  
  // Filter rooms by selected group
  const rooms = selectedGroup 
    ? allRooms.filter(room => room.group?.id === selectedGroup)
    : allRooms;

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupClick = (groupId) => {
    setSelectedGroup(selectedGroup === groupId ? null : groupId);
  };

  if (groupsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat Groups</h1>
        <p className="text-gray-600 mb-4">Organized by topics and interests</p>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

              {/* Groups Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Show all rooms when no group is selected */}
          {!selectedGroup && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Chat Rooms</h2>
              {roomsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <Link
                      key={room.id}
                      to={`/chat/${room.id}`}
                      className="block p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{room.group?.icon}</span>
                        <span className="text-sm text-gray-500">({room.group?.name})</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{room.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                      
                      {/* Tags */}
                      {room.tags && room.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {room.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <MessageCircle className="h-3 w-3" />
                        <span>{room.messageCount || 0}</span>
                        <Users className="h-3 w-3" />
                        <span>{room.members?.length || 0}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No chat rooms found</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedGroup === group.id
                  ? 'border-primary-500 shadow-lg'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => handleGroupClick(group.id)}
            >
              {/* Group Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{group.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                </div>
                
                {/* Group Stats */}
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Hash className="h-4 w-4" />
                    <span>{group.roomCount} rooms</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </div>
                </div>
              </div>

              {/* Chat Rooms (when expanded) */}
              {selectedGroup === group.id && (
                <div className="p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Chat Rooms</h4>
                  {roomsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                  ) : rooms.length > 0 ? (
                    <div className="space-y-2">
                      {rooms.map((room) => (
                        <Link
                          key={room.id}
                          to={`/chat/${room.id}`}
                          className={`block p-3 rounded-lg transition-colors duration-200 ${
                            roomId === room.id
                              ? 'bg-primary-100 border border-primary-200'
                              : 'bg-white hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className={`text-sm font-medium truncate ${
                                roomId === room.id ? 'text-primary-900' : 'text-gray-900'
                              }`}>
                                {room.name}
                              </h5>
                              <p className="text-xs text-gray-500 truncate">
                                {room.description || 'No description'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <MessageCircle className="h-3 w-3" />
                              <span>{room.messageCount || 0}</span>
                              <Users className="h-3 w-3" />
                              <span>{room.members?.length || 0}</span>
                            </div>
                          </div>
                          
                          {/* Tags */}
                          {room.tags && room.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {room.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {room.tags.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                                  +{room.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No chat rooms in this group yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">No groups found</h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
