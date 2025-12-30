
import { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import * as mapHelpers from '../utils/mapHelpers';

export function useBraceletUsers() {
  const [braceletUsers, setBraceletUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubDevice = null;

    async function initialLoad() {
      try {
        setLoading(true);
        const [usersSnap, deviceSnap] = await Promise.all([
          getDocs(collection(db, 'braceletUsers')),
          getDocs(collection(db, 'deviceStatus')),
        ]);

        const deviceMap = new Map();
        deviceSnap.docs.forEach((d) => {
          const dd = d.data();
          const uid = dd.userId || dd.userID || null;
          if (uid) deviceMap.set(uid, dd);
        });

        const merged = usersSnap.docs.map((u) => mapHelpers.buildUserWithDevice(u, deviceMap));
        setBraceletUsers(merged);
        setLoading(false);

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

          setBraceletUsers((current) =>
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
                  position: u.position, // Keep last known position
                  online: false,
                };
              }
              const loc = mapHelpers.parseLocation(dd.location) || mapHelpers.parseLocation(dd);
              const lastSeen = mapHelpers.parseFirestoreDate(dd.lastSeen);
              const online = mapHelpers.isUserOnline(lastSeen);

              return {
                ...u,
                battery: Number(dd.battery ?? u.battery),
                // LOGIC FIX: If offline, force braceletOn to false
                braceletOn: online ? Boolean(dd.isBraceletOn ?? u.braceletOn) : false,
                pulseRate: dd.pulseRate ?? u.pulseRate,
                lastSeen,
                sos: (dd.sos && (dd.sos.active ?? dd.sos)) || false,
                position: loc || u.position, // Keep old position if new one is null
                online: online,
              };
            })
          );
        }, (err) => {
          console.error('Error in device status listener:', err);
          setError('Lost connection to device status updates.');
        });
      } catch (err) {
        console.error('Error initial loading users/deviceStatus:', err);
        setError('Failed to load initial data.');
        setLoading(false);
      }
    }

    initialLoad();

    return () => {
      if (unsubDevice) unsubDevice();
    };
  }, []);

  // Periodically refresh online status (every minute) to mark users as offline if data is stale
  useEffect(() => {
    const interval = setInterval(() => {
      setBraceletUsers((current) => {
        let hasChanges = false;
        const updatedUsers = current.map((u) => {
          const online = mapHelpers.isUserOnline(u.lastSeen);
          // LOGIC FIX: If user timed out (went offline), turn off bracelet status locally
          const braceletOn = online ? u.braceletOn : false;

          if (u.online !== online || u.braceletOn !== braceletOn) {
            hasChanges = true;
            return { ...u, online, braceletOn };
          }
          return u;
        });
        return hasChanges ? updatedUsers : current;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return { braceletUsers, loading, error };
}
