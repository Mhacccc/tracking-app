
import './People.css';

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';



  
// 🔧 Fetch user data + their linked device status (matched by userId)
async function fetchUserWithStatus(userId, userData) {
  try {
    // Find deviceStatus where userId == user's ID
    const statusQuery = query(collection(db, 'deviceStatus'), where('userId', '==', userId));
    const statusSnapshot = await getDocs(statusQuery);
    
    let statusData = {};
    if (!statusSnapshot.empty) {
      statusData = statusSnapshot.docs[0].data();
    }
    

    return {
      id: userId,
      name: userData.name || '',
      email: userData.email || '',
      avatar: userData.avatar || 'https://i.pinimg.com/originals/98/1d/6b/981d6b2e0ccb5e968a0618c8d47671da.jpg',
      room: userData.room || '',
      emergencyContacts: userData.emergencyContacts || [],
      battery: parseInt(statusData.battery) || 0,
      braceletOn: statusData.isBraceletOn || false,
      pulseRate: statusData.pulseRate || 0,
      location: statusData.location || null,
      lastSeen: statusData.lastSeen?.toDate() || null,
      sos: statusData.sos || false,
    };
  } catch (error) {
    console.error(`Error fetching device status for user ${userId}:`, error);
    return null;
  }
}

// Simple Search Icon
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

function People() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUsers, setUpdatingUsers] = useState(new Set());

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        // Fetch user data and their corresponding device status
        const usersPromises = usersSnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          return fetchUserWithStatus(doc.id, userData);
        });

        const usersWithStatus = await Promise.all(usersPromises);
        const validUsers = usersWithStatus.filter((user) => user !== null);

        setUsers(validUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
        setLoading(false);
      }
    }

    fetchUsers();

    // 🔥 Real-time listener for deviceStatus collection
    const unsubscribeDeviceStatus = onSnapshot(
      collection(db, 'deviceStatus'),
      (snapshot) => {
        try {
          const updates = {};
          const updatingSet = new Set();

          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            if (change.type === 'modified' || change.type === 'added') {
              // ✅ Use userId field as key to match with users
              if (data.userId) {
                updates[data.userId] = data;
                updatingSet.add(data.userId);
              }
            }
          });

          setUpdatingUsers(updatingSet);

          // Update user states
          setUsers((currentUsers) =>
            currentUsers.map((user) => {
              const deviceUpdate = updates[user.id];
              if (deviceUpdate) {
                const lastSeen = deviceUpdate.lastSeen?.toDate() || null;
                return {
                  ...user,
                  battery: parseInt(deviceUpdate.battery) || user.battery,
                  braceletOn: deviceUpdate.isBraceletOn,
                  pulseRate: deviceUpdate.pulseRate || 0,
                  location: deviceUpdate.location || null,
                  lastSeen,
                  sos: deviceUpdate.sos || false,
                  isOnline: lastSeen
                    ? new Date().getTime() - lastSeen.getTime() < 5 * 60 * 1000
                    : false,
                };
              }
              return user;
            })
          );

          // Clear updating indicator after short delay
          setTimeout(() => {
            setUpdatingUsers((current) => {
              const newSet = new Set(current);
              updatingSet.forEach((id) => newSet.delete(id));
              return newSet;
            });
          }, 500);
        } catch (err) {
          console.error('Error handling device status update:', err);
          setError('Error updating device status. Some information may be outdated.');
        }
      },
      (error) => {
        console.error('Error in device status listener:', error);
        setError('Lost connection to device status updates. Please refresh the page.');
      }
    );

    return () => unsubscribeDeviceStatus();
  }, []);

  const sortAndFilterUsers = (users, query) => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (a.sos && !b.sos) return -1;
      if (!a.sos && b.sos) return 1;
      if (a.braceletOn && !b.braceletOn) return -1;
      if (!a.braceletOn && b.braceletOn) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const filteredUsers = sortAndFilterUsers(users, searchQuery);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <main className="app-main page-frame">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search Name"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="search-icon">
          <SearchIcon />
        </div>
      </div>

      <ul className="people-list">
        {filteredUsers.map((person) => (
          <Link key={person.id} to={`/userProfile/${person.id}`} state={{ personData: person }}>
            <li
              className={`person-item ${person.sos ? 'sos' : ''} ${
                updatingUsers.has(person.id) ? 'updating' : ''
              }`}
            >
              <div className={`status-indicator ${person.isOnline ? 'online' : 'offline'}`} />
              <img src={person.avatar} alt={person.name} className="avatar" />
              <div className="person-details">
                <p className="person-name">{person.name}</p>
                
              </div>
              <div className="person-status">
                <p className="percentage" style={person.braceletOn?{color:'#34A853'}:{color: "#000000"}}>{person.battery}%</p>
                <div className="safety-status-wrapper">
                  <p className="bracelet-status">
                    Bracelet: {person.braceletOn ? 'ON' : 'OFF'}
                  </p>
                </div>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </main>
  );
}

export default People;
