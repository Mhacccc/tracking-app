// src/pages/ReportDetail.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react'; 
import './Report.css'; // Use the same CSS file for styling

const ReportDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const incident = location.state?.incidentData;

  if (!incident) {
    // Fallback if accessed directly without data
    return (
      <div className="report-page-frame" style={{padding: '20px'}}>
        <p>No incident data provided.</p>
        <button onClick={() => navigate('/report')}>Go to Report List</button>
      </div>
    );
  }

  // Helper function to render detail rows
  const DetailRow = ({ label, value, isRed = false, isGreen = false }) => (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className={`detail-value ${isRed ? 'red' : ''} ${isGreen ? 'green' : ''}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="report-page-frame" style={{paddingTop: '60px'}}>
      <div className="report-detail-card">
        <button 
          className="close-button" 
          onClick={() => navigate('/report')}
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="detail-header">
          <img 
            src={incident.user.avatar} 
            alt={`${incident.user.name}'s avatar`} 
            className="detail-avatar" 
          />
          <h1 className="detail-name">{incident.user.name}</h1>
          <p className="detail-panic-text">Panic Button</p>
        </div>

        {/* Detailed Information Rows */}
        <div className="detail-list">
          
          <DetailRow label="Date" value={incident.date} />
          <DetailRow label="Time" value={incident.time} isRed={true} />
          <DetailRow label="Location" value={incident.location} />
          <DetailRow label="Pulse Reading" value={incident.pulse} isRed={true} />
          <DetailRow label="Family Notified" value={incident.familyNotified} isRed={true} />
          <DetailRow label="Police Notified" value={incident.policeNotified} isRed={true} />
          <DetailRow label="Bracelet Status" value={incident.braceletStatus} isGreen={incident.braceletStatus === 'On'} />
          <DetailRow label="Response Status" value={incident.responseStatus} isRed={incident.responseStatus !== 'Resolved'} />

        </div>
      </div>
    </div>
  );
};

export default ReportDetail;