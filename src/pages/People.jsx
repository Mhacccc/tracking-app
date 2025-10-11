import Header from '../components/Header';
import profileImg from '../assets/profile.png'
import './People.css';

// Mock Data for the people list
const peopleData = [
  { id: 1, name: 'Eman', percentage: 89, braceletOn: true, avatar: profileImg },
  { id: 2, name: 'Eliza', percentage: 43, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=eliza' },
  { id: 3, name: 'Cyrus', percentage: 70, braceletOn: false, avatar: 'https://i.pravatar.cc/150?u=cyrus' },
  { id: 4, name: 'Mhac', percentage: 24, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=mhac' },
  { id: 5, name: 'Sister', percentage: 78, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=sister' },
  { id: 6, name: 'Brother', percentage: 44, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=brother' },
  { id: 7, name: 'Baby', percentage: 99, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=baby' },
];

// Simple SVG Icons for the UI

const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

function People() {
  return (
    
    <main className="app-main page-frame">
      <Header title={"People"}/>
      <div className="search-container">
        <input type="text" placeholder="Search Name" className="search-input" />
        <div className="search-icon">
          <SearchIcon />
        </div>
      </div>

      <ul className="people-list">
        {peopleData.map(person => (
          <li key={person.id} className="person-item">
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
        ))}
      </ul>

    </main>
  );
}

export default People;
