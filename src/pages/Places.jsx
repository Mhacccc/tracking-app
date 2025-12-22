// src/pages/app/Places.jsx
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './Places.css';
import { useState, useRef, useEffect, useMemo } from 'react';
import L from 'leaflet';

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LOCAL_STORAGE_KEY = 'pingme_geofences';

const Places = () => {
  const [center] = useState([14.5995, 120.9842]); // Manila
  
  // --- NEW: Person Position State ---
  const [personPos, setPersonPos] = useState({ lat: 14.5995, lng: 120.9842 });
  const [activeAlerts, setActiveAlerts] = useState([]);

  const [geofences, setGeofences] = useState(() => {
    const savedZones = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedZones ? JSON.parse(savedZones) : [];
  });

  const [zoneName, setZoneName] = useState("");
  const [pendingLayerId, setPendingLayerId] = useState(null);

  const featureGroupRef = useRef(null);
  const pendingLayerRef = useRef(null);
  const initializedLayersRef = useRef(false);

  // --- GEOFENCE LOGIC ENGINE ---
  useEffect(() => {
    const currentAlerts = [];
    
    geofences.forEach(zone => {
      if (zone.type === 'circle') {
        const personLatLng = L.latLng(personPos.lat, personPos.lng);
        const circleCenter = L.latLng(zone.latlngs.lat, zone.latlngs.lng);
        
        // Calculate distance in meters
        const distance = personLatLng.distanceTo(circleCenter);

        if (distance <= zone.radius) {
          currentAlerts.push(zone.name);
        }
      }
    });

    setActiveAlerts(currentAlerts);
  }, [personPos, geofences]);

  // Persist geofences
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(geofences));
  }, [geofences]);

  // Sync map layers on mount
  useEffect(() => {
    if (initializedLayersRef.current) return;
    const fg = featureGroupRef.current;
    if (!fg) return;

    geofences.forEach(zone => {
      let layer;
      if (zone.type === 'circle') {
        layer = L.circle(zone.latlngs, {
          radius: zone.radius,
          color: '#A4262C',
        });
      }
      if (layer) {
        layer._leaflet_id = zone.id;
        fg.addLayer(layer);
      }
    });
    initializedLayersRef.current = true;
  }, [geofences]);

  // --- EVENT HANDLERS ---
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
    e.layers.eachLayer(layer => {
      const id = layer._leaflet_id;
      if (pendingLayerId === id) return;

      const index = updatedGeofences.findIndex(f => f.id === id);
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

  const _onDeleted = (e) => {
    const deletedIds = [];
    e.layers.eachLayer(layer => {
      deletedIds.push(layer._leaflet_id);
    });
    setGeofences(prev => prev.filter(f => !deletedIds.includes(f.id)));
  };

  const handleSaveZone = () => {
    if (!zoneName || !pendingLayerRef.current) return;
    const layer = pendingLayerRef.current;
    const newGeofence = {
      id: layer._leaflet_id,
      name: zoneName,
      type: 'circle',
      latlngs: layer.getLatLng(),
      radius: layer.getRadius(),
    };
    setGeofences(prev => [...prev, newGeofence]);
    setPendingLayerId(null);
    setZoneName("");
  };

  // Draggable Marker Event
  const eventHandlers = useMemo(() => ({
    dragend(e) {
      const marker = e.target;
      setPersonPos(marker.getLatLng());
    },
  }), []);

  return (
    <div className="places-page-container">
      <div className="places-info-panel">
        <h2>Geofence Monitor</h2>
        
        {/* ALERT DISPLAY */}
        {activeAlerts.length > 0 && (
          <div className="alert-box">
            <strong>⚠️ Boundary Hit!</strong>
            <p>Person is inside: {activeAlerts.join(", ")}</p>
          </div>
        )}

        {pendingLayerId !== null ? (
          <div className="save-zone-form">
            <h3>Name this Circle</h3>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Home, School, etc."
            />
            <button onClick={handleSaveZone} className="btn-save">Save Zone</button>
          </div>
        ) : (
          <div className="geofence-list">
            <h3>Active Zones ({geofences.length})</h3>
            <ul>
              {geofences.map(z => (
                <li key={z.id}>{z.name} ({Math.round(z.radius)}m)</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="places-map-container">
        <MapContainer center={center} zoom={20} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* DRAGGABLE TEST PERSON */}
          <Marker 
            position={personPos} 
            draggable={true} 
            eventHandlers={eventHandlers}
          >
            <Popup>Drag me into a circle to test!</Popup>
          </Marker>

          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={_onCreate}
              onEdited={_onEdited}
              onDeleted={_onDeleted}
              draw={{
                polygon: false, rectangle: false, polyline: false,
                marker: false, circlemarker: false,
                circle: { shapeOptions: { color: '#A4262C' } },
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default Places;