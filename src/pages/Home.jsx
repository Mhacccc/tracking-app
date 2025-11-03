import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../components/Header';
import './Home.css';
import { Link } from 'react-router-dom';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

/* ---------------------- Helpers ---------------------- */

// Parse Firestore timestamps from SDK or REST format into JS Date (or null)
function parseFirestoreDate(value) {
  if (!value) return null;
  // JS Date already
  if (value instanceof Date) return value;
  // Firestore Timestamp (has toDate)
  if (typeof value?.toDate === 'function') return value.toDate();
  // REST timestampValue
  if (value?.timestampValue) return new Date(value.timestampValue);
  // plain ISO string
  if (typeof value === 'string') return new Date(value);
  return null;
}

// Get latitude/longitude from different shapes:
function parseLocation(locationField) {
  // case 1: REST API arrayValue: { arrayValue: { values: [{ doubleValue: lat }, { doubleValue: lng }] } }
  if (locationField?.arrayValue?.values) {
    const vals = locationField.arrayValue.values;
    const lat = vals[0]?.doubleValue ?? null;
    const lng = vals[1]?.doubleValue ?? null;
    if (lat !== null && lng !== null) return [lat, lng];
  }

  // case 2: SDK style as map { latitude: number, longitude: number }
  if (typeof locationField === 'object' && locationField !== null) {
    // support both { latitude, longitude } and { lat, lng } and plain array
    if ('latitude' in locationField && 'longitude' in locationField) {
      return [locationField.latitude, locationField.longitude];
    }
    if ('lat' in locationField && 'lng' in locationField) {
      return [locationField.lat, locationField.lng];
    }
  }

  // case 3: plain array [lat, lng]
  if (Array.isArray(locationField) && locationField.length >= 2) {
    return [locationField[0], locationField[1]];
  }

  // fallback default to TUP Manila
  return [14.5921, 120.9755];
}

// Build a user object merged with deviceStatus data
function buildUserWithDevice(userDoc, deviceMap) {
  const userData = userDoc.data();
  // deviceMap keyed by userId -> deviceData (pick first device if multiple)
  const deviceData = deviceMap.get(userDoc.id) || {};

  const location = parseLocation(deviceData.location);
  const lastSeenDate = parseFirestoreDate(deviceData.lastSeen);

  return {
    id: userDoc.id,
    name: userData.name || 'Unnamed User',
    avatar:
      userData.avatar ||
      'https://i.pinimg.com/originals/98/1d/6b/981d6b2e0ccb5e968a0618c8d47671da.jpg',
    battery: Number(deviceData.battery ?? 0),
    braceletOn: Boolean(deviceData.isBraceletOn ?? false),
    pulseRate: deviceData.pulseRate ?? null,
    lastSeen: lastSeenDate,
    sos: (deviceData.sos && (deviceData.sos.active ?? deviceData.sos)) || false,
    position: location,
  };
}

/* ---------------------- Marker Icon ---------------------- */

const createCustomIcon = (person) =>
  L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="marker-content">
        <img src="${person.avatar}" alt="${person.name}" class="marker-image" />
        <div class="marker-status ${person.braceletOn ? 'online' : 'offline'}"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

/* ---------------------- Component ---------------------- */

function Home() {
  const [center,setCenter] = useState([14.5921, 120.9755]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDevice = null;

    // initial fetch: users + deviceStatus, then merge
    async function initialLoad() {
      try {
        const [usersSnap, deviceSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'deviceStatus')),
        ]);

        // build a map userId -> deviceData (if multiple devices per user, the last one wins)
        const deviceMap = new Map();
        deviceSnap.docs.forEach((d) => {
          const dd = d.data();
          const uid = dd.userId || dd.userID || null; // support both userId and userID naming
          if (uid) deviceMap.set(uid, dd);
        });

        const merged = usersSnap.docs.map((u) => buildUserWithDevice(u, deviceMap));
        
        // Set center to the first user with a valid location
        const userWithLocation = merged.find(user => 
          Array.isArray(user.position) && 
          user.position.length === 2 && 
          !isNaN(user.position[0]) && 
          !isNaN(user.position[1])
        );
        
        if (userWithLocation) {
          setCenter(userWithLocation.position);
        }
        
        setUsers(merged);
        setLoading(false);

        // subscribe to deviceStatus real-time updates
        unsubDevice = onSnapshot(collection(db, 'deviceStatus'), (snapshot) => {
          // build updates map by userId
          const updatesByUser = new Map();
          snapshot.docChanges().forEach((change) => {
            const dd = change.doc.data();
            const uid = dd.userId || dd.userID || null;
            if (!uid) return;
            // For 'added' and 'modified' we want the latest dd
            if (change.type === 'added' || change.type === 'modified') {
              updatesByUser.set(uid, dd);
            }
            // For 'removed', set null to indicate device removed
            if (change.type === 'removed') {
              updatesByUser.set(uid, null);
            }
          });

          if (updatesByUser.size === 0) return;

          setUsers((current) =>
            current.map((u) => {
              if (!updatesByUser.has(u.id)) return u;
              const dd = updatesByUser.get(u.id);
              if (dd === null) {
                // device removed -> clear device fields
                return {
                  ...u,
                  battery: 0,
                  braceletOn: false,
                  pulseRate: null,
                  lastSeen: null,
                  sos: false,
                };
              }
              // merge new device data into user
              const loc = parseLocation(dd.location);
              // Update center only if the user is online and has a valid location
              if (dd.isBraceletOn && Array.isArray(loc) && loc.length === 2 && !isNaN(loc[0]) && !isNaN(loc[1])) {
                setCenter(loc);
              }
              const lastSeen = parseFirestoreDate(dd.lastSeen);
              return {
                ...u,
                battery: Number(dd.battery ?? u.battery),
                braceletOn: Boolean(dd.isBraceletOn ?? u.braceletOn),
                pulseRate: dd.pulseRate ?? u.pulseRate,
                lastSeen,
                sos: (dd.sos && (dd.sos.active ?? dd.sos)) || false,
                position: loc,
              };
            })
          );
        });
      } catch (err) {
        console.error('Error initial loading users/deviceStatus:', err);
        setLoading(false);
      }
    }

    initialLoad();

    return () => {
      if (unsubDevice) unsubDevice();
    };
  }, []);
  
  if (loading) return <div className="loading">Loading map...</div>;

  const getInitialCenter = () => {
    // First, try to find an online user with SOS
    const sosUser = users.find(u => u.sos && u.braceletOn);
    if (sosUser?.position) return sosUser.position;

    // Then, try to find any online user
    const onlineUser = users.find(u => u.braceletOn);
    if (onlineUser?.position) return onlineUser.position;

    // Finally, try to find any user with a valid position
    const anyUser = users.find(u => 
      Array.isArray(u.position) && 
      u.position.length === 2 && 
      !isNaN(u.position[0]) && 
      !isNaN(u.position[1])
    );
    if (anyUser) return anyUser.position;

    // Default to TUP Manila if no valid positions found
    return center;
  };

  return (
    <div className="map-page">
      <Header title="Home" />
      <div className="map-container">
        <MapContainer 
          center={getInitialCenter()} 
          zoom={20} 
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {users.map((person) => (
            <Marker key={person.id} position={person.position} icon={createCustomIcon(person)}>
              <Popup className="custom-popup">
                <Link to={`/userProfile/${person.id}`} state={{ personData: person }} className="popup-content">
                  <img src={person.avatar} alt={person.name} className="popup-image" />
                  <div className="popup-info">
                    <h3>{person.name}</h3>
                    <p>Battery: {person.battery}%</p>
                    <p>Status: {person.braceletOn ? '🟢 Online' : '🔴 Offline'}</p>
                    <p>Pulse: {person.pulseRate ?? '—'}</p>
                    <p>Last Seen: {person.lastSeen ? person.lastSeen.toLocaleTimeString() : '—'}</p>
                    {person.sos && <p className="sos">🚨 SOS Active!</p>}
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
