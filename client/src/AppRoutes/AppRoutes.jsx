import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import LayoutMain from "../Layout/LayoutMain";
import LayoutAdmin from "../Layout/LayoutAdmin";
import LayoutStudent from "../Layout/LayoutStudent";
import AdminHome from "../pages/adminPage/AdminHome";
import StudentHome from "../pages/studentPage/StudentHome";
import TeacherPage from "../pages/TeacherPage";
import CheckProject from "../pages/adminPage/CheckProject";
import ManageUser from "../pages/adminPage/ManageUser";
import ReleaseProject from "../pages/adminPage/ReleaseProject";
import UploadDoc from "../pages/adminPage/UploadDoc";
import TeacherInfo from "../pages/adminPage/TeacherInfo";

import SideStudent from "../components/SideStudent";
const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutMain />,
    children: [
      { index: true, element: <Home /> },
      { path: "SignIn", element: <SignIn /> },
      { path: "SignUp", element: <SignUp /> },
      { path: "TeacherPage", element: <TeacherPage /> },
    ],
  },
  {
    path: "/adminHome",
    element: <LayoutAdmin />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: "CheckProject", element: <CheckProject /> },
      { path: "manage-user", element: <ManageUser /> },
      { path: "release-project", element: <ReleaseProject /> },
      { path: "upload-doc", element: <UploadDoc /> },
      { path: "TeacherInfo", element: <TeacherInfo /> },
    ],
  },
  {
    path: "/studentHome",
    element: <LayoutStudent />,
    children: [
      { index: true, element: <StudentHome /> },
      { path: "SideStudent", element: <SideStudent /> },
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
