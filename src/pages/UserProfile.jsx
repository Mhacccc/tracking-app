import { useLocation } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Heart, MessageSquare, Phone, MapPin } from 'lucide-react';


import "./UserProfile.css";



const UserProfile = () => {
  const location = useLocation();
  const person = location.state?.personData;
  console.log(person)
  if (!person) {
    return <div>No user data provided! Please go back to the people list.</div>;
  }

  return (
    <div className="web-profile-container"> 
      
      <header className="web-header"> 
        <button className="icon-button back-button" aria-label="Go Back">
          <ChevronLeft size={24} />
        </button>
        <button className="icon-button menu-button" aria-label="More Options">
          <MoreVertical size={24} />
        </button>
      </header>

      <main className="profile-card-web">
        
        <section className="profile-hero-section">
            <div className="profile-image-container">
              <img 
                src={person.avatar} 
                alt="Eman's profile" 
                className="profile-picture-mobile" 
              />
            </div>
            
            <div className="profile-info-block">
                <h1 className="profile-name-mobile">{person.name}</h1>
                
                <div className="heart-rate-badge">
                  <Heart size={14} fill="white" color="white" className="heart-icon" />
                  <span className="heart-rate-text">{person.pulseRate}</span>
                </div>
            </div>
        </section>

        <section className="detail-sections-wrapper">
            
            <div className="detail-section status-section">
                <h2 className="section-title">Status</h2>
                <div className="status-cards-container">
                    <div className="status-card">
                        <span className="card-label">Battery:</span>
                        <span className="card-value green-text">{person.battery}%</span>
                    </div>

                    <div className="status-card">
                        <span className="card-label">Bracelet Status:</span>
                        <span className="card-value green-text">{person.braceletOn?"On":"Off"}</span>
                    </div>
                </div>
            </div>

            <div className="detail-section contact-section">
                <h2 className="section-title">Contact & Location</h2>
                <div className="contact-list web-list">
                    
                    <div className="list-item">
                        <MessageSquare size={22} className="list-icon" />
                        <span className="list-text">Chat with Eman</span>
                    </div>
                    
                    <div className="list-item">
                        <Phone size={22} className="list-icon" />
                        <span className="list-text">09123456789</span>
                    </div>
                    
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