import Header from '../components/Header';
import './People.css';

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

function transformFirebaseData(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    percentage: data.status?.battery || 0,
    braceletOn: data.status?.isBraceletOn || false,
    avatar: data.avatar,
    pulseRate: data.status?.pulseRate,
    location: data.status?.location,
    lastSeen: data.status?.lastSeen,
    sos: data.status?.sos,
    email: data.email,
    room: data.room,
    emergencyContacts: data.emergencyContacts || []
  };
}


// Simple SVG Icons for the UI

const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;



function People() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <li className="person-item">
            
            <img src={person.avatar} alt={person.name} className="avatar" />
            <div className="person-details">
              <p className="person-name">{person.name}</p>
            </div>
            <div className="person-status">
              <p className="percentage">{person.percentage}%</p>
              <p className="bracelet-status">
                Bracelet: {person.braceletOn ? 'ON' : 'OFF'}
              </p>
            </div>
            
          </li>
          </Link>
        ))}
      </ul>

    </main>
  );
}

export default People;
