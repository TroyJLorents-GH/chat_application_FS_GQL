import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_ME, GET_CHAT_ROOMS } from '../graphql/operations';
import AuthContext from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import ChatRoom from './ChatRoom';
import CreateRoomModal from './CreateRoomModal';
import Groups from './Groups';
import SearchComponent from './Search';
import { LogOut, Plus, Menu, X } from 'lucide-react';

const ChatLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const { data: meData, loading: meLoading } = useQuery(GET_ME);
  const { data: roomsData, loading: roomsLoading, refetch: refetchRooms } = useQuery(GET_CHAT_ROOMS, {
    variables: {} // Get all rooms without group filtering
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateRoom = () => {
    setCreateRoomModalOpen(true);
  };

  const handleRoomCreated = () => {
    setCreateRoomModalOpen(false);
    refetchRooms();
  };

  if (meLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          rooms={roomsData?.chatRooms || []}
          loading={roomsLoading}
          onCreateRoom={handleCreateRoom}
          onLogout={handleLogout}
          user={meData?.me}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateRoom}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Plus className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-medium mb-2">Welcome to Chat!</h3>
                    <p className="text-gray-400">Select a chat room to start messaging</p>
                  </div>
                </div>
              } 
            />
            <Route path="/groups" element={<Groups />} />
            <Route path="/search" element={<SearchComponent />} />
            <Route path="/:roomId" element={<ChatRoom />} />
          </Routes>
        </div>
      </div>

      {/* Create room modal */}
      {createRoomModalOpen && (
        <CreateRoomModal
          isOpen={createRoomModalOpen}
          onClose={() => setCreateRoomModalOpen(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
};

export default ChatLayout;
