import { useState } from 'react';
import { ChevronRight, ShieldAlert } from 'lucide-react';
import ReportDetailModal from '../components/ReportDetailModal';
import './Report.css';

// Existing incidentData...
export const incidentData = [
  {
    id: 4,
    type: 'Panic Button',
    date: 'April 25, 2025',
    time: '03:15 PM',
    location: 'TUP Library, Manila',
    user: { name: 'Sister', avatar: 'https://i.pravatar.cc/150?u=sister' },
    displayStatus: { text: 'Panic Button Active', color: 'red', icon: ShieldAlert },
    pulse: '122 bpm',
    familyNotified: 'April 25, 03:16 PM',
    braceletStatus: 'On',
  },
  {
    id: 1,
    type: 'Panic Button',
    date: 'April 24, 2025',
    time: '10:03 AM',
    location: 'South Road Drive, Kalaw Ave, Ext, Manila',
    user: { name: 'Mary', avatar: 'https://i.pravatar.cc/150?u=mary' },
    displayStatus: { text: 'Panic Button', color: 'red', icon: ShieldAlert },
    pulse: '115 bpm',
    familyNotified: 'April 24, 10:04 AM',
    braceletStatus: 'On',
  },
];

const Report = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleRowClick = (incident) => {
    setSelectedIncident(incident);
  };

  const handleCloseModal = () => {
    setSelectedIncident(null);
  };

  return (
    <div className="report-page-frame">
      <main className="app-main">
        <ul className="incident-list" aria-label="Incident list">
          {incidentData.map(incident => {
            const IconComponent = incident.displayStatus.icon;
            
            return (
              <li
                key={incident.id}
                className="incident-item"
                role="button"
                tabIndex={0}
                onClick={() => handleRowClick(incident)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRowClick(incident);
                  }
                }}
              >
                <div className="incident-link-wrapper">
                    <div className={`incident-icon-wrapper ${incident.displayStatus.color}`}>
                        <IconComponent size={20} />
                    </div>

                    <div className="incident-details">
                        <p className={`incident-type ${incident.displayStatus.color}`}>{incident.displayStatus.text}</p>
                        <p className="incident-date-location">
                        {incident.date} &bull; {incident.location}
                        </p>
                    </div>

                    <div className="incident-time-wrapper">
                        <span className="incident-date-right">
                            {incident.time}
                        </span>
                        <ChevronRight size={20} className="chevron-icon" />
                    </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>

      {selectedIncident && (
        <ReportDetailModal
          incident={selectedIncident}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Report;