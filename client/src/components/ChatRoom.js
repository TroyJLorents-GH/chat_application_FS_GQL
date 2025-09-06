import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_CHAT_ROOM, SEND_MESSAGE, MESSAGE_ADDED, LEAVE_CHAT_ROOM } from '../graphql/operations';
import { Send, ArrowLeft, Users, Info, X, LogOut } from 'lucide-react';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: roomData, loading: roomLoading, error: roomError, refetch } = useQuery(GET_CHAT_ROOM, {
    variables: { id: roomId },
    fetchPolicy: 'cache-and-network',
  });

  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      // Refetch the chat room data to show the new message
      refetch();
    },
  });

  const [leaveRoom, { loading: leavingRoom }] = useMutation(LEAVE_CHAT_ROOM, {
    onCompleted: () => {
      // Navigate back to the main chat page after leaving
      navigate('/chat');
    },
  });

  // Real-time subscription for new messages
  useSubscription(MESSAGE_ADDED, {
    variables: { roomId },
    skip: !roomId,
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data?.messageAdded) {
        // Refetch the chat room data to show the new message
        refetch();
        scrollToBottom();
      }
    },
  });

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom();
  }, [roomData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sendingMessage) return;

    try {
      await sendMessage({
        variables: {
          roomId,
          text: message.trim(),
        },
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


  if (roomLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat room...</p>
        </div>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-medium mb-2">Error loading chat room</h3>
          <p className="text-gray-500 mb-4">{roomError.message}</p>
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const room = roomData?.chatRoom;
  if (!room) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-medium mb-2">Chat room not found</h3>
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/chat')}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
            <p className="text-sm text-gray-500">
              {room.members?.length || 0} member{(room.members?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowMembersModal(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            title="View Members"
          >
            <Users className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setShowInfoModal(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            title="Room Info"
          >
            <Info className="h-5 w-5" />
          </button>
          <button 
            onClick={async () => {
              if (window.confirm('Are you sure you want to leave this room?')) {
                try {
                  await leaveRoom({ variables: { roomId } });
                } catch (error) {
                  console.error('Error leaving room:', error);
                  alert('Error leaving room. Please try again.');
                }
              }
            }}
            disabled={leavingRoom}
            className="p-2 rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 disabled:opacity-50"
            title="Leave Room"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {room.messages?.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500">Be the first to start the conversation!</p>
          </div>
        ) : (
          room.messages?.map((msg) => (
            <div key={msg.id} className="flex space-x-3 animate-fade-in">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {msg.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {msg.author?.name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <p className="text-sm text-gray-900">{msg.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
        
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={sendingMessage}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendingMessage}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Room Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Room Information</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{room.name}</h4>
                <p className="text-sm text-gray-600">{room.description || 'No description available'}</p>
              </div>
              
              {room.group && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Group</h5>
                  <p className="text-sm text-gray-600">{room.group.icon} {room.group.name}</p>
                </div>
              )}
              
              {room.tags && room.tags.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {room.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                <span>Created: {new Date(room.createdAt).toLocaleDateString()}</span>
                <span>{room.messageCount || 0} messages</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Room Members</h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {room.members && room.members.length > 0 ? (
                room.members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No members in this room</p>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t text-sm text-gray-500 text-center">
              {room.members?.length || 0} member{(room.members?.length || 0) !== 1 ? 's' : ''} total
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
