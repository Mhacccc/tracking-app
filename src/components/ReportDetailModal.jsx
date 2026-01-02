import { useState } from 'react';
import { X } from 'lucide-react';
import './ReportDetailModal.css';

const ReportDetailModal = ({ incident, onClose }) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [incidentNotes, setIncidentNotes] = useState("");

  if (!incident) {
    return null;
  }

  const handleOpenLogModal = () => setShowLogModal(true);
  const handleCloseLogModal = () => setShowLogModal(false);

  const handleSaveLog = (e) => {
    e.preventDefault();
    console.log("Saving incident log:", incidentNotes);
    handleCloseLogModal();
    onClose(); // Close the main detail modal as well
  };

  const DetailRow = ({ label, value, valueColor = '' }) => (
    <div className="report-detail-modal-row">
      <span className="report-detail-modal-label">{label}</span>
      <span className={`report-detail-modal-value ${valueColor}`}>{value}</span>
    </div>
  );

  const isIncidentActive =
    incident.responseStatus !== 'Resolved' &&
    incident.responseStatus !== 'Marked Safe' &&
    incident.responseStatus !== 'User Confirmed Safe';

  const timeColor = isIncidentActive ? 'red-text' : '';
  const pulseColor = isIncidentActive ? 'red-text' : '';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{incident.displayStatus.text}</h2>
          <button className="modal-close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="report-detail-modal-body">
            <section className="profile-hero">
                <div className="profile-avatar-wrapper">
                <img
                    src={incident.user.avatar}
                    alt={`${incident.user.name}'s profile`}
                    className="profile-avatar-img"
                />
                </div>
                <h1 className="profile-name">{incident.user.name}</h1>
            </section>
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

            {isIncidentActive && (
                <section className="profile-section">
                <button
                    className="mark-safe-button"
                    onClick={handleOpenLogModal}
                >
                    Mark User as Safe & Log Details
                </button>
                </section>
            )}
        </div>

        {/* Inner Modal for logging */}
        {showLogModal && (
            <div className="modal-backdrop" onClick={handleCloseLogModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                    <h2>Log Incident Details</h2>
                    <button className="modal-close-button" onClick={handleCloseLogModal}>
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

      </div>
    </div>
  );
};

export default ReportDetailModal;
