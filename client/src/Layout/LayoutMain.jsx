// F:\NewPMS\client\src\Layout\LayoutMain.jsx
import { Outlet } from "react-router-dom";
import { Suspense } from "react";

const LayoutMain = () => {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};

export default LayoutMain;
