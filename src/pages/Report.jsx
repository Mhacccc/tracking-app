// src/pages/app/Report.jsx
import { ChevronRight, ShieldAlert, BatteryWarning, MapPin } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import './Report.css'; 

// --- MODIFIED: Added 'export' so other files can use this mock data ---
// --- VIBE-CODE: Filtered to ONLY show major "Panic Button" incidents ---
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
    responseStatus: 'Alert Active',
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
    responseStatus: 'Marked Safe',
  },
  // --- REMOVED Low Battery and Geofence alerts from this page ---
];

const Report = () => {
  const navigate = useNavigate();

  const handleRowClick = (incident) => {
    navigate(`/report/${incident.id}`, { state: { incidentData: incident } });
  };

  return (
    <div className="report-page-frame">
      <main className="app-main">
        <ul className="incident-list" aria-label="Incident list">
          {incidentData.map(incident => {
            const IconComponent = incident.displayStatus.icon;

            return (
              <li key={incident.id} className="incident-item">
                <Link
                  to={`/report/${incident.id}`}
                  state={{ incidentData: incident }}
                  className="incident-link-wrapper"
                  role="link"
                  tabIndex={0}
                  onClick={(e) => {
                    handleRowClick(incident);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(incident);
                    }
                  }}
                >
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
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default Report;