// src/components/CirclesModal.jsx
import React, { useState } from 'react';
import { X, Copy, Users, LogIn, Plus } from 'lucide-react';
import './CirclesModal.css'; // We'll create this next

// Mock Data for Rooms
const mockRooms = [
  { id: 1, name: 'Family', members: 6, icon: '🏠' },
  { id: 2, name: 'TUP Colleagues', members: 3, icon: '🎓' },
];

const CirclesModal = ({ isOpen, onClose }) => {
  // --- All this logic is moved from People.jsx ---
  const [rooms, setRooms] = useState(mockRooms);
  const [currentRoom, setCurrentRoom] = useState(rooms[0]); 
  
  // State to manage which view is active
  const [view, setView] = useState('list'); // 'list', 'create', 'join', 'success'
  
  const [newRoomName, setNewRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const handleSelectRoom = (room) => {
    setCurrentRoom(room);
    onClose(); // Close modal on selection
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      const mockCode = `PING-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const newRoom = { 
        id: rooms.length + 1, 
        name: newRoomName, 
        members: 1, 
        icon: '👤' 
      };
      
      setRooms([...rooms, newRoom]);
      setCurrentRoom(newRoom);
      setInviteCode(mockCode);
      setNewRoomName('');
      setView('success'); // Go to success view
    }
  };
  
  const handleJoinRoom = (e) => {
    e.preventDefault();
    alert(`Joining room with code: ${joinCode}... (Mock)`);
    onClose();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      alert(`Invite code "${inviteCode}" copied to clipboard!`);
    });
  };

  // Reset view when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      // Wait for animation to finish before resetting
      setTimeout(() => setView('list'), 300);
    }
  }, [isOpen]);

  // Stop click from closing modal
  const handleContentClick = (e) => e.stopPropagation();

  // --- Render different views ---
  const renderContent = () => {
    switch (view) {
      // --- CREATE ROOM VIEW ---
      case 'create':
        return (
          <form className="circles-modal-body" onSubmit={handleCreateRoom}>
            <p>Rooms let you create private groups. Invite members using a unique code.</p>
            <div className="form-group">
              <label htmlFor="roomName">Room Name</label>
              <input
                type="text"
                id="roomName"
                placeholder="e.g., Family, Work Colleagues"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="modal-primary-btn">
              Create Room
            </button>
            <button type="button" className="modal-secondary-btn" onClick={() => setView('list')}>
              Back to List
            </button>
          </form>
        );

      // --- JOIN ROOM VIEW ---
      case 'join':
        return (
          <form className="circles-modal-body" onSubmit={handleJoinRoom}>
            <p>Enter an invite code to join an existing room.</p>
            <div className="form-group">
              <label htmlFor="joinCode">Invite Code</label>
              <input
                type="text"
                id="joinCode"
                placeholder="e.g., PING-A4B2C1"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="modal-primary-btn">
              Join Room
            </button>
            <button type="button" className="modal-secondary-btn" onClick={() => setView('list')}>
              Back to List
            </button>
          </form>
        );

      // --- SUCCESS (INVITE CODE) VIEW ---
      case 'success':
        return (
          <div className="circles-modal-body invite-code-body">
            <p>Success! Share this code with members you want to invite.</p>
            <div className="invite-code-wrapper">
              <span>{inviteCode}</span>
              <button className="copy-button" onClick={handleCopyCode} aria-label="Copy code">
                <Copy size={20} />
              </button>
            </div>
            <button className="modal-primary-btn done-button" onClick={onClose}>
              Done
            </button>
          </div>
        );

      // --- DEFAULT (LIST) VIEW ---
      default:
        return (
          <div className="circles-modal-body">
            <ul className="room-list">
              {rooms.map(room => (
                <li key={room.id} className="room-list-item" onClick={() => handleSelectRoom(room)}>
                  <span className="room-icon">{room.icon}</span>
                  <div className="room-info">
                    <span className="room-name">{room.name}</span>
                    <span className="room-members">{room.members} Members</span>
                  </div>
                  {currentRoom.id === room.id && (
                    <span className="room-selected-check">✓</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="modal-actions-buttons">
              <button className="room-action-button" onClick={() => setView('join')}>
                <LogIn size={18} /> Join a Circle
              </button>
              <button className="room-action-button" onClick={() => setView('create')}>
                <Plus size={18} /> Create a Circle
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className={`circles-modal-backdrop ${isOpen ? 'open' : ''}`} 
      onClick={onClose}
    >
      <div 
        className={`circles-modal-content ${isOpen ? 'open' : ''}`} 
        onClick={handleContentClick}
      >
        <div className="circles-modal-header">
          <span className="header-drag-handle"></span>
          <h2 className="circles-modal-title">Circles</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={26} />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CirclesModal;