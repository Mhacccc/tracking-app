// src/pages/app/NotificationsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import './NotificationsPage.css';
import logo from '../assets/logo.png'; // Use our logo

// Mock data based on Figma
// --- VIBE-CODE: Added the minor alerts from Report.jsx here ---
const notifications = [
  {
    id: 1,
    title: 'PingMe',
    message: "Welcome to PingMe notifications. Here, you'll receive important and updates from the App.",
    time: 'Today',
    icon: logo, // Use our app logo
    unread: true,
  },
  {
    id: 2, 
    title: 'Low Battery Alert', 
    message: "Eman's bracelet is at 24%.", // From old Report.jsx
    time: 'Apr 23', // From old Report.jsx
    icon: logo, // We can change this later to a battery icon
    unread: true,
  },
  { 
    id: 3, 
    title: 'Geofence Exit', 
    message: "Mhac left 'TUP Gate 3'.", // From old Report.jsx
    time: 'Apr 22', // From old Report.jsx
    icon: logo, // We can change this later to a map icon
    unread: false,
  },
  // We can add more alerts here later
];

const NotificationsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <button className="header-btn-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={26} />
        </button>
        <h1 className="notifications-title">Notification</h1>
        <button className="header-btn-more">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <main className="notifications-content">
        <ul className="notifications-list">
          {notifications.map(item => (
            <li key={item.id} className={`notification-item ${item.unread ? 'unread' : ''}`}>
              <div className="notification-icon">
                <img src={item.icon} alt={item.title} />
              </div>
              <div className="notification-text">
                <p className="notification-title-text">{item.title}</p>
                <p className="notification-message">{item.message}</p>
              </div>
              <div className="notification-meta">
                <span className="notification-time">{item.time}</span>
                {item.unread && <div className="notification-unread-dot"></div>}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default NotificationsPage;