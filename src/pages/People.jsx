


import './People.css';

// Mock Data for the people list
const peopleData = [
  { id: 1, name: 'Eman', percentage: 89, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=eman' },
  { id: 2, name: 'Eliza', percentage: 43, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=eliza' },
  { id: 3, name: 'Cyrus', percentage: 70, braceletOn: false, avatar: 'https://i.pravatar.cc/150?u=cyrus' },
  { id: 4, name: 'Mhac', percentage: 24, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=mhac' },
  { id: 5, name: 'Sister', percentage: 78, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=sister' },
  { id: 6, name: 'Brother', percentage: 44, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=brother' },
  { id: 7, name: 'Baby', percentage: 99, braceletOn: true, avatar: 'https://i.pravatar.cc/150?u=baby' },
];

// Simple SVG Icons for the UI
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const MoreIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>;
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const HomeIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const PeopleIcon = ({ active }) => <svg width="28" height="28" viewBox="0 0 24 24" fill={active ? "#A4262C" : "none"} stroke={active ? "#A4262C" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const PlacesIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const ReportIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

function People() {
  return (
    <div className="mobile-frame">
      <header className="app-header">
        <BackIcon />
        <h1>People</h1>
        <MoreIcon />
      </header>

      <main className="app-main">
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

      <div className="fab-container">
        <button className="fab">Marked Safe</button>
      </div>

      <footer className="app-footer">
        <div className="nav-item">
          <HomeIcon />
          <span>Home</span>
        </div>
        <div className="nav-item active">
          <PeopleIcon active={true} />
          <span>People</span>
        </div>
        <div className="nav-item">
          <PlacesIcon />
          <span>Places</span>
        </div>
        <div className="nav-item">
          <ReportIcon />
          <span>Health Report</span>
        </div>
      </footer>
    </div>
  );
}

export default People;
