import { Outlet } from "react-router-dom";
import SideAdmin from "../components/SideAdmin";
import NavAdmin from "../components/NavAdmin";
import FooterHome from "../components/FooterHome";

const LayoutAdmin = () => {
  return (
    <div style={{ display: "flex" }}>
      <SideAdmin />
      <div style={{ flex: 1 }}>
        <NavAdmin />
        <Outlet />
        <FooterHome />
      </div>
    </div>
  );
};

export default LayoutAdmin;
