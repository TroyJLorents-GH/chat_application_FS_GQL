import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
import { GET_CHAT_ROOM, SEND_MESSAGE, MESSAGE_ADDED } from '../graphql/operations';
import { Send, ArrowLeft, Users, Info } from 'lucide-react';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const client = useApolloClient();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { data: roomData, loading: roomLoading, error: roomError } = useQuery(GET_CHAT_ROOM, {
    variables: { id: roomId },
    fetchPolicy: 'cache-and-network',
  });

  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    update: (cache, { data }) => {
      // Update the cache to include the new message
      const existingData = cache.readQuery({
        query: GET_CHAT_ROOM,
        variables: { id: roomId },
      });

      if (existingData && data?.sendMessage) {
        cache.writeQuery({
          query: GET_CHAT_ROOM,
          variables: { id: roomId },
          data: {
            chatRoom: {
              ...existingData.chatRoom,
              messages: [...existingData.chatRoom.messages, data.sendMessage],
            },
          },
        });
      }
    },
  });

  // Real-time subscription for new messages
  const { data: subscriptionData } = useSubscription(MESSAGE_ADDED, {
    variables: { roomId },
    skip: !roomId,
  });

  // Handle subscription data updates
  useEffect(() => {
    if (subscriptionData?.messageAdded) {
      const newMessage = subscriptionData.messageAdded;
      
      // Update the cache with the new message
      const existingData = client.cache.readQuery({
        query: GET_CHAT_ROOM,
        variables: { id: roomId },
      });

      if (existingData && newMessage) {
        client.cache.writeQuery({
          query: GET_CHAT_ROOM,
          variables: { id: roomId },
          data: {
            chatRoom: {
              ...existingData.chatRoom,
              messages: [...existingData.chatRoom.messages, newMessage],
            },
          },
        });
      }
      scrollToBottom();
    }
  }, [subscriptionData, client, roomId]);

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

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
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
          <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <Users className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <Info className="h-5 w-5" />
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
        
        {isTyping && (
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500">...</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
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
    </div>
  );
};

export default ChatRoom;
