import { Outlet } from "react-router-dom";

const LayoutAdmin = () => {
  return (
    <>
      <Outlet />
      <h1>Sidebar</h1>
      <h1>headerbar</h1>
      <hr />
    </>
  );
};

export default LayoutAdmin;
