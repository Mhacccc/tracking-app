import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../components/Header';
import './Home.css';
import { Link } from 'react-router-dom';

// Import peopleData
const peopleData = [
  { id: 1, name: 'Eman', percentage: 89, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=eman', position: [14.5921, 120.9755] },
  { id: 2, name: 'Eliza', percentage: 43, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=eliza', position: [14.5925, 120.9760] },
  { id: 3, name: 'Cyrus', percentage: 70, braceletOn: false, avatar: 'https://i.pravatar.cc/150?u=cyrus', position: [14.5918, 120.9750] },
  { id: 4, name: 'Mhac', percentage: 24, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=mhac', position: [14.5915, 120.9765] },
];

// Create a custom divIcon for each person
const createCustomIcon = (person) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="marker-content">
        <img src="${person.avatar}" alt="${person.name}" class="marker-image" />
        <div class="marker-status ${person.braceletOn ? 'online' : 'offline'}"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

function Home() {
  // Center position (TUP Manila)
  const [center] = useState([14.5921, 120.9755]);

  return (
    <div className="map-page">
      <Header title="Home" />
      <div className="map-container">
        <MapContainer 
          center={center} 
          zoom={16} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {peopleData.map(person => (
            <Marker 
              key={person.id} 
              position={person.position} 
              icon={createCustomIcon(person)}
            >
              <Popup className="custom-popup">
                <Link to={`/userProfile/${person.id}`} state={{ personData: person }} className="popup-content">
                  <img src={person.avatar} alt={person.name} className="popup-image" />
                  <div className="popup-info">
                    <h3>{person.name}</h3>
                    <p>Battery: {person.percentage}%</p>
                    <p>Status: {person.braceletOn ? 'Online' : 'Offline'}</p>
                  </div>
                </Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Home;