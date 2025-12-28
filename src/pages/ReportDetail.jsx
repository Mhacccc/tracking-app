// src/pages/app/ReportDetail.jsx
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react'; // Import both icons
import './UserProfile.css'; 
import './Report.css'; 
import { incidentData } from './Report';

const ReportDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { incidentId } = useParams();

  let incident = location.state?.incidentData;

  if (!incident) {
    incident = incidentData.find(item => item.id === parseInt(incidentId));
  }

  const [showLogModal, setShowLogModal] = useState(false);
  const [incidentNotes, setIncidentNotes] = useState("");

  if (!incident) {
    return (
      <div className="profile-page-container" style={{padding: '20px'}}>
        <p>No incident data found for this ID. Please return to the report list.</p>
        <button onClick={() => navigate('/report')}>Go to Report List</button>
      </div>
    );
  }
  
  const handleOpenModal = () => setShowLogModal(true);
  const handleCloseModal = () => setShowLogModal(false);

  const handleSaveLog = (e) => {
    e.preventDefault();
    console.log("Saving incident log:", incidentNotes);
    handleCloseModal();
  };

  // This is now our new list-item-based row
  const DetailRow = ({ label, value, valueColor = '' }) => (
    <div className="profile-list-item">
      <span className="item-label">{label}</span>
      <span className={`item-value ${valueColor}`}>{value}</span>
    </div>
  );

  const isIncidentActive = 
    incident.responseStatus !== 'Resolved' && 
    incident.responseStatus !== 'Marked Safe' && 
    incident.responseStatus !== 'User Confirmed Safe';
  
  // Assign colors for the text values
  const timeColor = isIncidentActive ? 'red-text' : '';
  const pulseColor = isIncidentActive ? 'red-text' : '';
  const statusColor = isIncidentActive ? 'red-text' : 'green-text';

  return (
    <>
      <div className="profile-page-container">
        <main className="profile-content">

          {/* 1. Hero Section */}
          <section className="profile-hero">
            
            {/* --- Back Button --- */}
            <button 
              className="page-back-btn" 
              onClick={() => navigate(-1)} // Go back
              aria-label="Go back"
            >
              <ChevronLeft size={28} />
            </button>
            
            <div className="profile-avatar-wrapper">
              <img 
                src={incident.user.avatar} 
                alt={`${incident.user.name}'s profile`} 
                className="profile-avatar-img" 
              />
            </div>
            <h1 className="profile-name">{incident.user.name}</h1>
            <div className="profile-status-badge panic">
              {incident.displayStatus.text}
            </div>
          </section>

          {/* 2. Details Section */}
          <section className="profile-section">
            <h2 className="profile-section-title">Incident Details</h2>
            <div className="profile-list-container">
              <DetailRow label="Date" value={incident.date} />
              <DetailRow label="Time" value={incident.time} valueColor={timeColor} />
              <DetailRow label="Location" value={incident.location} />
              <DetailRow label="Pulse Reading" value={incident.pulse} valueColor={pulseColor} />
              <DetailRow label="Family Notified" value={incident.familyNotified} />
              <DetailRow label="Bracelet Status" value={incident.braceletStatus} />
            </div>
          </section>

          {/* 3. Action Button Section */}
          {isIncidentActive && (
            <section className="profile-section">
              <button 
                className="mark-safe-button"
                onClick={handleOpenModal}
              >
                Mark User as Safe & Log Details
              </button>
            </section>
          )}

        </main>
      </div>

      {/* Modal remains the same, it uses styles from Report.css */}
      {showLogModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Incident Details</h2>
              <button className="modal-close-button" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSaveLog}>
              <p>Add notes about the incident for future reference. This will mark the alert as resolved.</p>
              <div className="form-group">
                <label htmlFor="incidentNotes">Incident Notes</label>
                <textarea
                  id="incidentNotes"
                  placeholder="e.g., User confirmed it was an accidental press. User is safe."
                  rows="4"
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="modal-create-button">
                Mark Safe & Save Log
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportDetail;