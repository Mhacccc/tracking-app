// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css'; // We will create this new CSS file next
import { Home, Users, Map, FileText, ShieldCheck } from 'lucide-react';

// Helper component for nav icons
const NavIcon = ({ to, activePath, icon: Icon, label }) => {
  const isActive = activePath.startsWith(to);
  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span>{label}</span>
    </Link>
  );
};

function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const handleMarkSafe = () => {
    // We'll add the logic for this button later
    alert("Marked Safe!");
  };

  return (
    <footer className="app-navbar">
      <div className="nav-items-container">
        <NavIcon to="/dashboard" activePath={path} icon={Home} label="Home" />
        <NavIcon to="/people" activePath={path} icon={Users} label="People" />
        
        {/* Spacer for the center button */}
        <div className="nav-item-spacer"></div> 
        
        <NavIcon to="/places" activePath={path} icon={Map} label="Places" />
        <NavIcon to="/report" activePath={path} icon={FileText} label="Report" />
      </div>
      
      {/* Center "Mark Safe" Button */}
      <button className="nav-center-button" onClick={handleMarkSafe}>
        <ShieldCheck size={28} />
      </button>
    </footer>
  );
}

export default Navbar;