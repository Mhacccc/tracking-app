import { Routes, Route} from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Navbar from "./components/Navbar";
import People from "./pages/People";
import UserProfile from "./pages/UserProfile";
import Places from "./pages/Places";
import NotificationsPage from "./pages/NotificationsPage";
import Report from "./pages/Report";
import ReportDetail from "./pages/ReportDetail";
import Home from "./pages/Home"
import "./App.css"
import Profile from "./pages/Profile"

function App() {


  // derive active nav item from pathname

  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout/>}>
          <Route index path="/" element={<Home />} />
          <Route path="people" element={<People />} />
          <Route path="report" element={<Report />} />
          <Route path="report/:incidentId" element={<ReportDetail />} /> 
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="places" element={<Places />} />
          <Route path="profile" element={<Profile />} />
          <Route path="userProfile/:userId" element={<UserProfile/>} />
        </Route>
      </Routes>
    </>

  );
}

export default App;
