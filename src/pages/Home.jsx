
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import './Home.css';
import { Link } from 'react-router-dom';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

import { parseFirestoreDate, parseLocation, buildUserWithDevice, createCustomIcon } from '../utils/mapHelpers';
import { reverseGeocode } from '../utils/geocode';

/* ---------------------- Component ---------------------- */


function Home() {
  const [center, setCenter] = useState([14.5921, 120.9755]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // addressCache: { [userId]: addressString }
  const [addressCache, setAddressCache] = useState({});
  // Fetch address for a user if not already cached
  const fetchAddress = async (user) => {
    if (!user?.position || addressCache[user.id]) return;
    const [lat, lng] = user.position;
    if (isNaN(lat) || isNaN(lng)) return;
    setAddressCache((prev) => ({ ...prev, [user.id]: 'Loading address...' }));
    const address = await reverseGeocode(lat, lng);
    setAddressCache((prev) => ({ ...prev, [user.id]: address || 'Address not found' }));
  };

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
      <div className="map-container">
        <MapContainer 
          center={getInitialCenter()} 
          zoom={20} 
          style={{ height: '99%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {users.map((person) => {
            // Trigger address fetch on render if not cached
            if (!addressCache[person.id]) fetchAddress(person);
            return (
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
                      <p>Location: {addressCache[person.id] || 'Loading address...'}</p>
                      {person.sos && <p className="sos">🚨 SOS Active!</p>}
                    </div>
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default Home;
