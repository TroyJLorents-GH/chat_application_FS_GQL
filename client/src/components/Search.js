import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_ROOMS, GET_POPULAR_TOPICS, GET_GROUPS } from '../graphql/operations';
import { Link, useParams } from 'react-router-dom';
import { Search, Filter, TrendingUp, Hash, Users, MessageCircle, Tag } from 'lucide-react';

const SearchComponent = () => {
  const { roomId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchType, setSearchType] = useState('rooms'); // 'rooms' or 'topics'
  const [isSearching, setIsSearching] = useState(false);

  const { data: groupsData } = useQuery(GET_GROUPS);
  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_ROOMS, {
    variables: { query: searchQuery, groupId: selectedGroup || null },
    skip: !searchQuery || searchQuery.length < 2
  });

  const { data: topicsData, loading: topicsLoading } = useQuery(GET_POPULAR_TOPICS, {
    variables: { groupId: selectedGroup || null, limit: 20 },
    skip: searchType !== 'topics'
  });

  const groups = groupsData?.groups || [];
  const searchResults = searchData?.searchRooms || [];
  const popularTopics = topicsData?.getPopularTopics || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
    }
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    setIsSearching(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedGroup('');
    setIsSearching(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Advanced Search</h1>
        <p className="text-gray-600 mb-4">Find rooms, messages, and trending topics</p>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search rooms, messages, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                minLength={2}
              />
            </div>
            <button
              type="submit"
              disabled={searchQuery.trim().length < 2}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Search
            </button>
            {(searchQuery || selectedGroup) && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Type Toggle */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setSearchType('rooms')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                searchType === 'rooms'
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Search className="inline h-4 w-4 mr-2" />
              Search Rooms
            </button>
            <button
              type="button"
              onClick={() => setSearchType('topics')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                searchType === 'topics'
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="inline h-4 w-4 mr-2" />
              Popular Topics
            </button>
          </div>

          {/* Group Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter by group:</span>
            <select
              value={selectedGroup}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.icon} {group.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchType === 'rooms' && (
          <div>
            {!isSearching && (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Start searching</h3>
                <p>Enter a search term to find chat rooms and messages</p>
              </div>
            )}

            {isSearching && searchQuery && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Search Results for "{searchQuery}"
                  {selectedGroup && ` in ${groups.find(g => g.id === selectedGroup)?.name}`}
                </h2>

                {searchLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((room) => (
                      <Link
                        key={room.id}
                        to={`/chat/${room.id}`}
                        className={`block p-4 rounded-lg transition-colors duration-200 ${
                          roomId === room.id
                            ? 'bg-primary-100 border border-primary-200'
                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">{room.group?.icon}</span>
                              <h3 className={`text-lg font-medium ${
                                roomId === room.id ? 'text-primary-900' : 'text-gray-900'
                              }`}>
                                {room.name}
                              </h3>
                              <span className="text-sm text-gray-500">in {room.group?.name}</span>
                            </div>
                            <p className="text-gray-600 mb-2">{room.description}</p>
                            
                            {/* Tags */}
                            {room.tags && room.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {room.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full flex items-center"
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 ml-4">
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{room.messageCount || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{room.members?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-medium mb-2">No results found</h3>
                    <p>Try adjusting your search terms or group filter</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Popular Topics */}
        {searchType === 'topics' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Topics
              {selectedGroup && ` in ${groups.find(g => g.id === selectedGroup)?.name}`}
            </h2>

            {topicsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading topics...</p>
              </div>
            ) : popularTopics.length > 0 ? (
              <div className="space-y-4">
                {popularTopics.map((topic, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        <h3 className="text-lg font-medium text-gray-900">{topic.keyword}</h3>
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                          {topic.frequency} mentions
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-2">Discussed in these rooms:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {topic.rooms.map((room) => (
                          <Link
                            key={room.id}
                            to={`/chat/${room.id}`}
                            className="block p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{room.group?.icon}</span>
                              <span className="text-sm font-medium text-gray-900">{room.name}</span>
                              <span className="text-xs text-gray-500">({room.group?.name})</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-medium mb-2">No topics found</h3>
                <p>Topics will appear as users discuss them with hashtags</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
