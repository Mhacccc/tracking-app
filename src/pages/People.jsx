
import './People.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useBraceletUsers } from '../hooks/useUsers';
import { getAuth } from "firebase/auth";
import { collection, addDoc, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Plus, X } from "lucide-react";

// Simple Search Icon
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

function People() {
  const { braceletUsers, loading, error } = useBraceletUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBraceletName, setNewBraceletName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const filteredUsers = sortAndFilterUsers(braceletUsers, searchQuery);

  const handleAddBracelet = async (e) => {
    e.preventDefault();
    if (!newBraceletName.trim()) return;

    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        
        alert("You must be logged in to add a bracelet.");
        setIsSubmitting(false);
        return;
      }

      // 1. Create the braceletUser document
      // This matches your requested structure with ownerAppUserId
      const newBraceletData = {
        name: newBraceletName,
        ownerAppUserId: user.uid,
        createdAt: serverTimestamp(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newBraceletName}`, // Generate random avatar based on name
        battery: 100,
        online: false,
        braceletOn: false,
        sos: false,
        position: null
      };

      const docRef = await addDoc(collection(db, 'braceletUsers'), newBraceletData);

      // 2. Link to the appUser
      // This adds the new ID to the linkedBraceletsID array
      const appUserRef = doc(db, 'appUsers', user.uid);
      await updateDoc(appUserRef, {
        linkedBraceletsID: arrayUnion(docRef.id)
      });

      alert("Bracelet added successfully!");
      setNewBraceletName('');
      setIsModalOpen(false);
      
      // Reload to fetch the new list (since useBraceletUsers uses getDocs once)
      window.location.reload();

    } catch (err) {
      console.error("Error adding bracelet:", err);
      alert("Failed to add bracelet. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <main className="app-main page-frame">
      <div className="search-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search Name"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
          <div className="search-icon">
            <SearchIcon />
          </div>
        </div>
        
        {/* Add Bracelet Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundColor: '#000', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Add Bracelet Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '350px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Add New Bracelet</h2>
            <form onSubmit={handleAddBracelet}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
                <input 
                  type="text" 
                  value={newBraceletName} 
                  onChange={(e) => setNewBraceletName(e.target.value)}
                  placeholder="e.g. Grandma"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ width: '100%', padding: '12px', background: '#000', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Adding...' : 'Add Bracelet'}
              </button>
            </form>
          </div>
        </div>
      )}

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
