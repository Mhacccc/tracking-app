// src/pages/app/Places.jsx

import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./Places.css";
import { useState, useRef, useEffect } from "react";
import L from "leaflet";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { parseFirestoreDate, parseLocation, buildUserWithDevice, createCustomIcon } from '../utils/mapHelpers';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LOCAL_STORAGE_KEY = "pingme_geofences";
const GEOFENCE_ALERTS_KEY = "pingme_geofence_alerts";

/* ---------------------- Helpers ---------------------- */


const Places = () => {
 
  const [map, setMap] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [geofences, setGeofences] = useState(() => {
    const savedZones = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedZones ? JSON.parse(savedZones) : [];
  });

  const [zoneName, setZoneName] = useState("");
  const [pendingLayerId, setPendingLayerId] = useState(null);
  const featureGroupRef = useRef(null);
  const pendingLayerRef = useRef(null);
  const alertedUsersRef = useRef(new Set());

  // Fetch real users from Firebase on mount
  useEffect(() => {
    let unsubDevice = null;

    async function initialLoad() {
      try {
        const [usersSnap, deviceSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'deviceStatus')),
        ]);

        const deviceMap = new Map();
        deviceSnap.docs.forEach((d) => {
          const dd = d.data();
          const uid = dd.userId || dd.userID || null;
          if (uid) deviceMap.set(uid, dd);
        });

        const merged = usersSnap.docs.map((u) => buildUserWithDevice(u, deviceMap));
        setUsers(merged);
        setLoading(false);

        // Subscribe to real-time deviceStatus updates
        unsubDevice = onSnapshot(collection(db, 'deviceStatus'), (snapshot) => {
          const updatesByUser = new Map();
          snapshot.docChanges().forEach((change) => {
            const dd = change.doc.data();
            const uid = dd.userId || dd.userID || null;
            if (!uid) return;
            if (change.type === 'added' || change.type === 'modified') {
              updatesByUser.set(uid, dd);
            }
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
                return {
                  ...u,
                  battery: 0,
                  braceletOn: false,
                  pulseRate: null,
                  lastSeen: null,
                  sos: false,
                };
              }
              const loc = parseLocation(dd.location);
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
        console.error('Error loading users/deviceStatus:', err);
        setLoading(false);
      }
    }

    initialLoad();

    return () => {
      if (unsubDevice) unsubDevice();
    };
  }, []);

  // Check geofences for all users and trigger alerts
  useEffect(() => {
    const currentAlerts = [];
    const newGeofenceAlerts = [];

    // Load existing alerts to check for duplicates
    const existingAlerts = localStorage.getItem(GEOFENCE_ALERTS_KEY);
    const parsedAlerts = existingAlerts ? JSON.parse(existingAlerts) : [];

    users.forEach((user) => {
      if (!Array.isArray(user.position) || user.position.length !== 2) return;

      const userLatLng = L.latLng(user.position[0], user.position[1]);

      geofences.forEach((zone) => {
        const circleCenter = L.latLng(zone.latlngs.lat, zone.latlngs.lng);
        const distance = userLatLng.distanceTo(circleCenter);

        const avatarVisualRadius = 10

        if (distance <= zone.radius + avatarVisualRadius) {
          currentAlerts.push(`${user.name} entered ${zone.name}`);
          const alertKey = `${user.id}-${zone.id}`;

          

          // Track geofence hit only once per user-zone combination
          if (!alertedUsersRef.current.has(alertKey)) {
            alertedUsersRef.current.add(alertKey);
            console.warn(`🚨 ${user.name} entered geofence: ${zone.name}`);

            // Check if this exact alert already exists to prevent duplicates on refresh
            const alertMessage = `${user.name} entered ${zone.name}`;
            const alertExists = parsedAlerts.some((alert) => alert.message === alertMessage);

            if (!alertExists) {
              // Create notification alert object
              const alertNotification = {
                id: Date.now() + Math.random(), // Unique ID
                title: 'Geofence Alert',
                message: alertMessage,
                time: new Date().toLocaleTimeString(),
                icon: user.avatar,
                unread: true,
              };
              newGeofenceAlerts.push(alertNotification);
            }
          }
        }
      });
    });

    // Save geofence alerts to localStorage
    if (newGeofenceAlerts.length > 0) {
      const updatedAlerts = [...newGeofenceAlerts, ...parsedAlerts];
      localStorage.setItem(GEOFENCE_ALERTS_KEY, JSON.stringify(updatedAlerts));
    }

    setActiveAlerts(currentAlerts);
  }, [users, geofences]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(geofences));
  }, [geofences]);

  const handleZoneClick = (zone) => {
    if (map && zone.latlngs) {
      map.flyTo([zone.latlngs.lat, zone.latlngs.lng], 18, { animate: true, duration: 1.5 });
    }
  };

  const _onCreate = (e) => {
    const layer = e.layer;
    if (pendingLayerId !== null) {
      layer.remove();
      return;
    }
    pendingLayerRef.current = layer;
    setPendingLayerId(layer._leaflet_id);
  };

  const _onEdited = (e) => {
    const updatedGeofences = [...geofences];
    e.layers.eachLayer((layer) => {
      const id = layer.options.id; // Use our custom id stored in options
      const index = updatedGeofences.findIndex((f) => f.id === id);
      if (index !== -1) {
        updatedGeofences[index] = {
          ...updatedGeofences[index],
          latlngs: layer.getLatLng(),
          radius: layer.getRadius(),
        };
      }
    });
    setGeofences(updatedGeofences);
  };

  // --- UPDATED: Proper deletion logic ---
  const _onDeleted = (e) => {
    const deletedLayers = e.layers;
    const deletedIds = [];

    deletedLayers.eachLayer((layer) => {
      // Leaflet-draw uses _leaflet_id internally, 
      // but for saved zones, we look for the ID we assigned
      const id = layer.options.id || layer._leaflet_id;
      deletedIds.push(id);
    });

    // This updates the state, which triggers a re-render and removes the item from the list
    setGeofences((prev) => prev.filter((f) => !deletedIds.includes(f.id)));
  };

  const handleSaveZone = () => {
    if (!zoneName || !pendingLayerRef.current) return;
    const layer = pendingLayerRef.current;
    
    // We generate a unique ID to keep track of this zone in state
    const uniqueId = Date.now(); 

    const newGeofence = {
      id: uniqueId, 
      name: zoneName,
      type: "circle",
      latlngs: layer.getLatLng(),
      radius: layer.getRadius(),
    };
    
    layer.remove(); // Remove the "drawn" layer
    setGeofences((prev) => [...prev, newGeofence]);
    setPendingLayerId(null);
    setZoneName("");
    pendingLayerRef.current = null;
  };

  const handleCancel = () => {
    if (pendingLayerRef.current) pendingLayerRef.current.remove();
    setPendingLayerId(null);
    setZoneName("");
    pendingLayerRef.current = null;
  };



  if (loading) return <div className="loading">Loading map and users...</div>;

  return (
    <div className="places-page-container">
      <div className="places-info-panel">
        <h2>Geofence Monitor</h2>

        {activeAlerts.length > 0 && (
          <div className="alert-box">
            <strong>⚠️ Boundary Hit!</strong>
            <p>Inside: {activeAlerts.join(", ")}</p>
          </div>
        )}

        {pendingLayerId !== null ? (
          <div className="save-zone-form">
            <h3>New Safe Zone</h3>
            <input
              type="text"
              className="zone-name-input"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Home, School, etc."
            />
            <div className="form-buttons">
              <button onClick={handleSaveZone} className="btn-save">Save Zone</button>
              <button onClick={handleCancel} className="btn-cancel">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="geofence-list">
            <h3>Active Zones ({geofences.length})</h3>
            <ul className="zone-items-list">
              <h4 className="zone-item-h4"><span>Name</span><span>Type</span></h4>
              {geofences.map((z) => (
                <li className="zone-item" key={z.id} onClick={() => handleZoneClick(z)} style={{ cursor: 'pointer' }}>
                  <span className="zone-name">{z.name}</span>
                  <span className="zone-type">{z.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="places-map-container">
        <MapContainer center={users[0].position} zoom={20} style={{ height: "100%", width: "100%" }} whenReady={(m) => setMap(m.target)}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Render real user markers */}
          {users.map((user) => (
            <Marker 
              key={user.id} 
              position={user.position} 
              icon={createCustomIcon(user)}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <img src={user.avatar} alt={user.name} className="popup-image" />
                  <div className="popup-info">
                    <h3>{user.name}</h3>
                    <p>Battery: {user.battery}%</p>
                    <p>Status: {user.braceletOn ? '🟢 Online' : '🔴 Offline'}</p>
                    <p>Pulse: {user.pulseRate ?? '—'}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={_onCreate}
              onEdited={_onEdited}
              onDeleted={_onDeleted}
              draw={{
                polygon: false, rectangle: false, polyline: false,
                marker: false, circlemarker: false,
                circle: { shapeOptions: { color: "#A4262C" } },
              }}
            />
            
            {geofences.map((zone) => (
              <Circle
                key={zone.id}
                id={zone.id}
                center={zone.latlngs}
                radius={zone.radius}
                pathOptions={{ color: "#A4262C", fillColor: "#A4262C", fillOpacity: 0.2 }}
              />
            ))}
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
};



export default Places;