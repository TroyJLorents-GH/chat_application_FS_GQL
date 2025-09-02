import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Plus, LogOut, User, Users } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { JOIN_CHAT_ROOM } from '../graphql/operations';

const Sidebar = ({ rooms, loading, onCreateRoom, onLogout, user }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [joinRoom] = useMutation(JOIN_CHAT_ROOM);

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Chat App</h1>
            <p className="text-sm text-gray-500">Real-time messaging</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Create room button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateRoom}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Create Room</span>
        </button>
      </div>

      {/* Chat rooms */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Chat Rooms
          </h2>
          
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No chat rooms yet</p>
              <p className="text-xs text-gray-400">Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/chat/${room.id}`}
                  className={`
                    block p-3 rounded-lg transition-colors duration-200 group
                    ${roomId === room.id 
                      ? 'bg-primary-50 border border-primary-200' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`
                        text-sm font-medium truncate
                        ${roomId === room.id ? 'text-primary-900' : 'text-gray-900'}
                      `}>
                        {room.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {room.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Users className="h-3 w-3" />
                      <span>{room.members?.length || 0}</span>
                    </div>
                  </div>
                  
                  {room.messageCount > 0 && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {room.messageCount} message{room.messageCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {/* Join Room Button */}
                  <div className="mt-2">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await joinRoom({ variables: { roomId: room.id } });
                          // Refresh the page to show updated member count
                          window.location.reload();
                        } catch (error) {
                          console.error('Error joining room:', error);
                        }
                      }}
                      className="w-full px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                    >
                      Join Room
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
