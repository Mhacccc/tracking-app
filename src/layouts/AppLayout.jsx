// src/layouts/AppLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar'; // 1. Import TopBar
import './AppLayout.css'; 

const AppLayout = () => {
  return (
    <div className="app-layout-container">
      {/* --- RENDER ALL LAYOUT COMPONENTS --- */}
      
      {/* Desktop-only Sidebar */}
      <Sidebar />
      
      {/* Top bar (is responsive inside) */}
      <TopBar />

      {/* Main page content */}
      <main className="app-content-main">
        <Outlet />
      </main>

      {/* Mobile-only Bottom Navbar */}
      <Navbar /> 
    </div>
  );
};

export default AppLayout;