
import './People.css';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as mapHelpers from '../utils/mapHelpers';
import { useUsers } from '../hooks/useUsers';

// Simple Search Icon
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

function People() {
  const { users, loading, error } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');

  const sortAndFilterUsers = (users, query) => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (a.sos && !b.sos) return -1;
      if (!a.sos && b.sos) return 1;
      if (a.online && !b.online) return -1;
      if (!a.online && b.online) return 1;
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
              className={`person-item ${person.sos ? 'sos' : ''}`}
            >
              <div className={`status-indicator ${person.online ? 'online' : 'offline'}`} />
              <img src={person.avatar} alt={person.name} className="avatar" />
              <div className="person-details">
                <p className="person-name">{person.name}</p>
                
              </div>
              <div className="person-status">
                <p className="percentage" style={person.online?{color:'#34A853'}:{color: "#000000"}}>{person.battery}%</p>
                <div className="safety-status-wrapper">
                  <p className="bracelet-status">
                    Bracelet: {person.online && person.braceletOn ? 'ON' : 'OFF'}
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
