// src/components/TopBar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';
import { Bell, Menu } from 'lucide-react';
import logo from '../assets/logo.png';
import avatar from '../assets/red.webp'; 
import ProfileModal from './ProfileModal';

const TopBar = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  // --- MODIFIED: Update handlers ---
  const handleOpenNotifications = () => navigate('/notifications');

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
          
          <button className="topbar-desktop-profile-btn" onClick={() => setIsProfileModalOpen(true)}>
            <img src={avatar} alt="Profile" />
          </button>
        </div>
      </header>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

    </>
  );
};

export default TopBar;