// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css'; // We will create this new CSS file next
import { Home, Users, Map, FileText } from 'lucide-react';

// Helper component for nav icons
const NavIcon = ({ to, activePath, icon: Icon, label }) => {
  const isActive = to === '/' 
    ? activePath === '/' 
    : activePath.startsWith(to);

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

  return (
    <footer className="app-navbar">
      <div className="nav-items-container">
        <NavIcon to="/" activePath={path} icon={Home} label="Home" />
        <NavIcon to="/people" activePath={path} icon={Users} label="People" />
        <NavIcon to="/places" activePath={path} icon={Map} label="Places" />
        <NavIcon to="/report" activePath={path} icon={FileText} label="Report" />
      </div>
      
    </footer>
  );
}

export default Navbar;