// src/components/Sidebar.jsx
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'; // 1. Import useLocation
import { Home, Users, Map, FileText, User, LogOut } from 'lucide-react';
import './Sidebar.css';
import logo from '../assets/logo.png'; 


// 2. Modify SidebarLink helper
const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation(); // 3. Get location

  // 4. This is our special case:
  // Check if the link is for 'People' AND the user is on a 'userProfile' page
  const isPeopleActive = (to === '/app/people' && location.pathname.startsWith('/app/userProfile'));

  return (
    <NavLink 
      to={to} 
      // 5. Combine NavLink's 'isActive' with our special 'isPeopleActive'
      className={({ isActive }) => 
        "sidebar-link" + ( (isActive || isPeopleActive) ? " active" : "" )
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );
};


function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="app-sidebar">
      <div className="sidebar-header">
        <Link to="/">
          <img src={logo} alt="PingMe Logo" className="sidebar-logo" />
        </Link>
      </div>

      <div className="sidebar-links">
        {/* These links will now use the new SidebarLink logic */}
        <SidebarLink to="/" icon={Home} label="Home" />
        <SidebarLink to="/people" icon={Users} label="People" />
        <SidebarLink to="/places" icon={Map} label="Places" />
        <SidebarLink to="/report" icon={FileText} label="Report" />
        
        <SidebarLink to="/profile" icon={User} label="My Profile" />
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-link logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;