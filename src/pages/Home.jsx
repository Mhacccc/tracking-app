import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../components/Header';
import './Home.css';
import { Link } from 'react-router-dom';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Transform Firestore data
function transformFirebaseData(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    percentage: data.status?.battery || 0,
    braceletOn: data.status?.isBraceletOn || false,
    avatar: data.avatar,
    position: data.status?.location ? 
      [data.status.location.latitude, data.status.location.longitude] : 
      [14.5921, 120.9755], // Default to TUP Manila if no location
    pulseRate: data.status?.pulseRate,
    lastSeen: data.status?.lastSeen,
    sos: data.status?.sos
  };
}

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        const usersData = querySnapshot.docs.map(transformFirebaseData);
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) return <div className="loading">Loading map...</div>;
  if (error) return <div className="error">{error}</div>;

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
          {users.map(person => (
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