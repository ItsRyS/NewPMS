import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "../pages/homePage/Home";
import SignIn from "../pages/homePage/SignIn";
import SignUp from "../pages/homePage/SignUp";
import TeacherPage from "../pages/homePage/TeacherPage";

import LayoutMain from "../Layout/LayoutMain";
import LayoutAdmin from "../Layout/LayoutAdmin";
import LayoutStudent from "../Layout/LayoutStudent";

import AdminHome from "../pages/adminPage/AdminHome";
import StudentHome from "../pages/studentPage/StudentHome";


import CheckProject from "../pages/adminPage/CheckProject";
import ManageUser from "../pages/adminPage/ManageUser";
import ReleaseProject from "../pages/adminPage/ReleaseProject";
import UploadDoc from "../pages/adminPage/UploadDoc";
import TeacherInfo from "../pages/adminPage/TeacherInfo";


import Documentation from "../pages/studentPage/Documentation";
import SendProject from "../pages/studentPage/SendProject";
import ProjectRequest from "../pages/studentPage/ProjectRequest";
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
      { path: "Documentation", element: <Documentation /> },
      { path: "projectRequest", element: <ProjectRequest /> },
      { path: "SendProject", element: <SendProject /> },
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
