import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import LayoutMain from "../components/Layout/LayoutMain";
import LayoutAdmin from "../components/Layout/LayoutAdmin";
import LayoutStudent from "../components/Layout/LayoutStudent";
import AdminHome from "../pages/adminPage/AdminHome";
import StudentHome from "../pages/studentPage/StudentHome";
const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutMain />,
    children: [
      { index: true, element: <Home /> },
      { path: "SignIn", element: <SignIn /> },
      { path: "SignUp", element: <SignUp /> },
    ],
  },
  {
    path: "/adminHome",
    element: <LayoutAdmin />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: "SignIn", element: <SignIn /> },
      { path: "SignUp", element: <SignUp /> },
    ],
  },
  {
    path: "/studentHome",
    element: <LayoutStudent />,
    children: [
      { index: true, element: <StudentHome /> },
      { path: "SignIn", element: <SignIn /> },
      { path: "SignUp", element: <SignUp /> },
    ],
  },
]);

const AppRoutes = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default AppRoutes;
