// src/pages/app/UserProfile.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Phone, Wifi, Battery, ChevronLeft } from 'lucide-react'; 
import './UserProfile.css';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { createCustomIcon } from '../utils/mapHelpers';

// Fix for Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ✅ Helper component to fix map rendering issue
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);
  return null;
};

const UserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const person = location.state?.personData;

  if (!person) {
    return <div>No user data provided! Please go back to the people list.</div>;
  }


  const isOnline = person.braceletOn;
  const batteryLevel = person.battery;
  const userPosition =
    person.location && Array.isArray(person.location)
      ? person.location
      : [14.5995, 120.9842]; // ✅ fallback to Manila if null

  const getBatteryColor = (level) => {
    if (level < 30) return 'red-text';
    if (level < 60) return 'orange-text';
    return 'green-text';
  };
  const batteryColorClass = getBatteryColor(batteryLevel);


  return (
    <div className="profile-page-container">
      <main className="profile-content">
        {/* --- Hero Section --- */}
        <section className="profile-hero">
          <button
            className="page-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="profile-avatar-wrapper">
            <img
              src={person.avatar}
              alt={`${person.name}'s profile`}
              className="profile-avatar-img"
            />
          </div>
          <h1 className="profile-name">{person.name}</h1>
          <div
            className={`profile-status-badge ${
              isOnline ? 'online' : 'offline'
            }`}
          >
            <div className="status-dot"></div>
            {isOnline ? 'Bracelet Online' : 'Bracelet Offline'}
          </div>
        </section>

        {/* --- Device Status --- */}
        <section className="profile-section">
          <h2 className="profile-section-title">Device Status</h2>
          <div className="profile-list-container">
            <div className="profile-list-item">
              <div className="item-icon-wrapper">
                <Heart size={20} />
              </div>
              <span className="item-label">Pulse Rate</span>
              <span className="item-value red-text">89 bpm</span>
            </div>

            <div className="profile-list-item">
              <div className="item-icon-wrapper">
                <Battery size={20} />
              </div>
              <span className="item-label">Bracelet Battery</span>
              <span className={`item-value ${batteryColorClass}`}>
                {batteryLevel}%
              </span>
            </div>

            <div className="profile-list-item">
              <div className="item-icon-wrapper">
                <Wifi size={20} />
              </div>
              <span className="item-label">Connection</span>
              <span
                className={`item-value ${
                  isOnline ? 'green-text' : 'red-text'
                }`}
              >
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </section>

        {/* --- Location & Contact --- */}
        <section className="profile-section">
          <h2 className="profile-section-title">Location & Contact</h2>
          <div className="profile-list-container">
            {/* ✅ Fixed: Map with explicit height and resize handler */}
            <div className="profile-map-wrapper">
              <MapContainer
                center={userPosition}
                zoom={15}
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%' }}
              >
                <ResizeMap />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={userPosition}
                  icon={createCustomIcon(person)}
                />
              </MapContainer>
            </div>

            <div className="profile-list-item">
              <div className="item-icon-wrapper">
                <MessageSquare size={20} />
              </div>
              <span className="item-label">Chat</span>
              <span className="item-action">&gt;</span>
            </div>

            <div className="profile-list-item">
              <div className="item-icon-wrapper">
                <Phone size={20} />
              </div>
              <span className="item-label">Call</span>
              <span className="item-action">&gt;</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserProfile;
