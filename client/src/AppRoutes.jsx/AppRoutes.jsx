import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "../pages/Home";
import SignIn from "../pages/Signin";
import SignUp from "../pages/Signup";
import AdminDashboard from "../pages/adminPage/AdminDashboard";
const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/SignIn", element: <SignIn /> },
  { path: "/SignUp", element: <SignUp /> },
  { path: "/AdminHome", element: <AdminDashboard /> },
]);

const AppRoutes = () => {
  return (
    <>
    <RouterProvider router={router} />
  </>
  )
  
};

export default AppRoutes;
