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
import { useState, useRef, useEffect, useMemo } from "react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LOCAL_STORAGE_KEY = "pingme_geofences";

const Places = () => {
  const [center] = useState([14.5995, 120.9842]);
  const [map, setMap] = useState(null);
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

  useEffect(() => {
    const currentAlerts = [];
    geofences.forEach((zone) => {
      const personLatLng = L.latLng(personPos.lat, personPos.lng);
      const circleCenter = L.latLng(zone.latlngs.lat, zone.latlngs.lng);
      if (personLatLng.distanceTo(circleCenter) <= zone.radius) {
        currentAlerts.push(zone.name);
      }
    });
    setActiveAlerts(currentAlerts);
  }, [personPos, geofences]);

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

  const eventHandlers = useMemo(() => ({
    dragend(e) { setPersonPos(e.target.getLatLng()); },
  }), []);

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
        <MapContainer center={center} zoom={20} style={{ height: "100%", width: "100%" }} whenReady={(m) => setMap(m.target)}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={personPos} draggable={true} eventHandlers={eventHandlers}><Popup>Test Person</Popup></Marker>
          
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
                id={zone.id} // Pass the ID to the circle options
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