import { Outlet } from "react-router-dom";
import SideAdmin from "../components/SideAdmin";
import NavAdmin from "../components/NavAdmin";

const LayoutAdmin = () => {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <SideAdmin />

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: "240px", display: "flex", flexDirection: "column" }}>
        <NavAdmin />
        <div style={{ flex: 1, paddingTop: "64px", overflow: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayoutAdmin;
