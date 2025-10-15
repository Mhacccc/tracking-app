// src/pages/Report.jsx
import Header from '../components/Header';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Report.css'; // Use the new CSS file

// Mock Data for Incidents
const incidentData = [
  { 
    id: 1, 
    type: 'Panic Button', 
    date: 'April 24, 2025', 
    time: '10:03 AM',
    location: 'South Road Drive, Kalaw Ave, Ext, Manila',
    user: { name: 'Mary', avatar: 'https://i.pravatar.cc/150?u=mary' },
    pulse: '115 bpm',
    familyNotified: 'April 24, 10:04 AM',
    policeNotified: 'April 24, 10:05 AM',
    braceletStatus: 'On',
    responseStatus: 'Marked Safe',
  },
  { 
    id: 2, 
    type: 'Low Battery Alert', 
    date: 'April 23, 2025', 
    time: '09:00 AM',
    location: 'Intramuros, Manila',
    user: { name: 'Eman', avatar: 'https://i.pravatar.cc/150?u=eman' },
    pulse: '75 bpm',
    familyNotified: 'N/A',
    policeNotified: 'N/A',
    braceletStatus: 'On',
    responseStatus: 'Resolved',
  },
  // Add more mock data here if needed
];


const Report = () => {
  return (
    <div className="report-page-frame">
      {/* Passing hasFilter={true} to show the filter icon on the right */}
      <Header title="Incident Report" hasFilter={true} /> 
      
      <main className="app-main">
        <ul className="incident-list">
          {incidentData.map(incident => (
            <Link 
              key={incident.id} 
              to={`/report/${incident.id}`} 
              state={{ incidentData: incident }}
            >
              <li className="incident-item">
                <div className="incident-details">
                  <p className="incident-type">{incident.type}</p>
                  <p className="incident-date">{incident.date}, {incident.time}</p>
                  <p className="incident-location">{incident.location}</p>
                </div>
                <div className="incident-date-right">
                    {incident.date.slice(0, 5)}
                </div>
                <ChevronRight size={20} className="chevron-icon" />
              </li>
            </Link>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Report;