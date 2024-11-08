import { Outlet } from "react-router-dom";

const LayoutMain = () => {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutMain;
