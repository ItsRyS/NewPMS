import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/adminPage/adminHome"; // ใช้ชื่อที่ตรงกับไฟล์

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/AdminHome" element={<AdminDashboard />} /> {/* แก้ชื่อให้ตรงกัน */}
      </Routes>
    </Router>
  );
}

export default App;
