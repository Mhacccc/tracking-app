// src/components/TopBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';
import { Bell, MessageCircle, Users, Menu } from 'lucide-react';
import ProfileModal from './ProfileModal';
import CirclesModal from './CirclesModal'; 
import logo from '../assets/logo.png';
import avatar from '../assets/profile.png'; 

const TopBar = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCirclesModalOpen, setIsCirclesModalOpen] = useState(false);
  const navigate = useNavigate();

  // --- MODIFIED: Update handlers ---
  const handleOpenNotifications = () => navigate('/notifications');
  const handleOpenCircles = () => setIsCirclesModalOpen(true);

  return (
    <>
      <header className="app-topbar">
        <button className="topbar-mobile-menu-btn" onClick={() => setIsProfileModalOpen(true)}>
          <Menu size={26} />
        </button>
        
        <div className="topbar-logo-desktop">
          <img src={logo} alt="PingMe" />
        </div>

        <div className="topbar-mobile-search">
          <span>Search Location</span>
        </div>

        <div className="topbar-actions">
          <button className="topbar-icon-btn" onClick={handleOpenNotifications}>
            <Bell size={22} />
          </button>
          {/* This button now works */}
          <button className="topbar-icon-btn" onClick={handleOpenCircles}>
            <Users size={22} />
          </button>
          
          <button className="topbar-desktop-profile-btn" onClick={() => setIsProfileModalOpen(true)}>
            <img src={avatar} alt="Profile" />
          </button>
        </div>
      </header>

      {/* Modals */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
      <CirclesModal 
        isOpen={isCirclesModalOpen} 
        onClose={() => setIsCirclesModalOpen(false)} 
      />
    </>
  );
};

export default TopBar;