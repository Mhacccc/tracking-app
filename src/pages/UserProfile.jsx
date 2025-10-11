// UserProfile.jsx

import "./UserProfile.css";
import profileImg from "../assets/profile.png";

// Import the placeholder profile image
// Assuming the assets folder is one level up

// Import the separate CSS file
import './UserProfile.css';

const UserProfile = () => {

  return (
    // CHANGE: Renamed container class
    <div className="web-profile-container"> 
      
      {/* --- Top Bar --- */}
      <header className="web-header"> 
        <button className="icon-button back-button" aria-label="Go Back">
          <ChevronLeft size={24} />
        </button>
        {/* The MoreVertical icon will now be on the far right of the page content */}
        <button className="icon-button menu-button" aria-label="More Options">
          <MoreVertical size={24} />
        </button>
      </header>

      {/* --- Main Profile Content Card --- */}
      {/* CHANGE: Added a surrounding card class for the entire content block */}
      <main className="profile-card-web">
        
        {/* --- Top Row: Image, Name, Badge --- */}
        <section className="profile-hero-section">
            {/* Profile Image */}
            <div className="profile-image-container">
              <img 
                src={profileImg} 
                alt="Eman's profile" 
                className="profile-picture-mobile" 
              />
            </div>
            
            <div className="profile-info-block">
                {/* Name */}
                <h1 className="profile-name-mobile">Eman</h1>
                
                {/* Heart Rate Badge */}
                <div className="heart-rate-badge">
                  <Heart size={14} fill="white" color="white" className="heart-icon" />
                  <span className="heart-rate-text">89 bpm</span>
                </div>
            </div>
        </section>

        {/* --- Status Cards & Contact List (Now Side-by-Side/Stacked) --- */}
        <section className="detail-sections-wrapper">
            
            {/* 1. Status Cards Section */}
            <div className="detail-section status-section">
                <h2 className="section-title">Status</h2>
                <div className="status-cards-container">
                    {/* Battery Card (Left) */}
                    <div className="status-card">
                        <span className="card-label">Battery:</span>
                        <span className="card-value green-text">89%</span>
                    </div>

                    {/* Bracelet Status Card (Right) */}
                    <div className="status-card">
                        <span className="card-label">Bracelet Status:</span>
                        <span className="card-value green-text">ON</span>
                    </div>
                </div>
            </div>

            {/* 2. Contact List Section */}
            <div className="detail-section contact-section">
                <h2 className="section-title">Contact & Location</h2>
                <div className="contact-list web-list">
                    
                    {/* Chat */}
                    <div className="list-item">
                        <MessageSquare size={22} className="list-icon" />
                        <span className="list-text">Chat with Eman</span>
                    </div>
                    
                    {/* Phone Number */}
                    <div className="list-item">
                        <Phone size={22} className="list-icon" />
                        <span className="list-text">09123456789</span>
                    </div>
                    
                    {/* Location */}
                    <div className="list-item location-item">
                        <MapPin size={22} className="list-icon" />
                        <span className="list-text">TUP Manila</span>
                        <a href="/" className="open-map-link">Open Map</a>
                    </div>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
};

export default UserProfile;