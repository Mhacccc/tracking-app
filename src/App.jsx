import { Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import People from "./pages/People";
import UserProfile from "./pages/UserProfile";
import Places from "./pages/Places";
import Notification from "./pages/Notification";
import Report from "./pages/Report";
import Home from "./pages/Home"
import "./App.css"

function App() {


  // derive active nav item from pathname

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/people" element={<People />} />
        <Route path="/report" element={<Report />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/places" element={<Places />} />
        <Route path="/userProfile/:userId" element={<UserProfile/>} />
      </Routes>
    </>

  );
}

export default App;
