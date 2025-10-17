import Header from '../components/Header';
import './People.css';

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

async function fetchUserWithStatus(userId, userData) {

  try {
    const deviceStatusDoc = await getDoc(doc(db, 'deviceStatus', userId));
    
    const statusData = deviceStatusDoc.exists() ? deviceStatusDoc.data() : {};


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
      sos: statusData.sos || false
    };
  } catch (error) {
    console.error(`Error fetching device status for user ${userId}:`, error);
    return null;
  }
}


// Simple SVG Icons for the UI

const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;



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
        // Filter out any null results from failed fetches
        const validUsers = usersWithStatus.filter(user => user !== null);
        
        setUsers(validUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
        setLoading(false);
      }
    }

    fetchUsers();

    // Set up real-time listener for device status updates
    const unsubscribeDeviceStatus = onSnapshot(
      collection(db, 'deviceStatus'),
      async (snapshot) => {
        try {
          const updates = {};
          const updatingSet = new Set();
          
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
              updates[change.doc.id] = change.doc.data();
              updatingSet.add(change.doc.id);
            }
          });

          // Show loading state for updating users
          setUpdatingUsers(updatingSet);

          // Update users array with new device status
          setUsers(currentUsers => 
            currentUsers.map(user => {
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
                  isOnline: lastSeen ? 
                    (new Date().getTime() - lastSeen.getTime()) < 5 * 60 * 1000 // 5 minutes
                    : false
                };
              }
              return user;
            })
          );

          // Clear loading state after update
          setTimeout(() => {
            setUpdatingUsers(current => {
              const newSet = new Set(current);
              updatingSet.forEach(id => newSet.delete(id));
              return newSet;
            });
          }, 500); // Short delay to show loading state
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

    // Cleanup subscription
    return () => unsubscribeDeviceStatus();
  }, []);

  const sortAndFilterUsers = (users, query) => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.sort((a, b) => {
      // SOS users first
      if (a.sos && !b.sos) return -1;
      if (!a.sos && b.sos) return 1;

      // Then online users (bracelet on)
      if (a.braceletOn && !b.braceletOn) return -1;
      if (!a.braceletOn && b.braceletOn) return 1;

      // Finally sort by name
      return a.name.localeCompare(b.name);
    });
  };

  const filteredUsers = sortAndFilterUsers(users, searchQuery);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
    
  return (
    <main className="app-main page-frame">
      <Header title={"People"}/>
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
        {filteredUsers.map(person => (
          <Link key={person.id} to={`/userProfile/${person.id}`} state={{ personData: person }} >
          <li className={`person-item ${person.sos ? 'sos' : ''} ${updatingUsers.has(person.id) ? 'updating' : ''}`}>
            <div className={`status-indicator ${person.isOnline ? 'online' : 'offline'}`} />
            <img src={person.avatar} alt={person.name} className="avatar" />
            <div className="person-details">
              <p className="person-name">{person.name}</p>
              {person.sos && <span className="sos-badge">SOS</span>}
            </div>
            <div className="person-status">
              <p className="percentage">{person.battery}%</p>
              <p className="bracelet-status">
                Bracelet: {person.braceletOn ? 'ON' : 'OFF'}
              </p>
              {person.lastSeen && (
                <p className="last-seen">
                  Last seen: {new Date(person.lastSeen).toLocaleTimeString()}
                </p>
              )}
            </div>
          </li>
          </Link>
        ))}
      </ul>

    </main>
  );
}

export default People;
