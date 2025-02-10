import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// ใช้ React.lazy สำหรับ Dynamic Import
const Home = lazy(() => import('../pages/homePage/Home'));
const SignIn = lazy(() => import('../pages/homePage/SignIn'));
const SignUp = lazy(() => import('../pages/homePage/SignUp'));
const TeacherPage = lazy(() => import('../pages/homePage/TeacherPage'));

const LayoutMain = lazy(() => import('../Layout/LayoutMain'));
const LayoutAdmin = lazy(() => import('../Layout/LayoutAdmin'));
const LayoutStudent = lazy(() => import('../Layout/LayoutStudent'));

const AdminHome = lazy(() => import('../pages/adminPage/AdminHome'));
const StudentHome = lazy(() => import('../pages/studentPage/StudentHome'));

const CheckProject = lazy(() => import('../pages/adminPage/CheckProject'));
const ManageUser = lazy(() => import('../pages/adminPage/ManageUser'));
const ReleaseProjectPage = lazy(
  () => import('../pages/adminPage/ReleaseProjectPage')
);

const UploadDoc = lazy(() => import('../pages/adminPage/UploadDoc'));
const TeacherInfo = lazy(() => import('../pages/adminPage/TeacherInfo'));
const AddOldProject = lazy(() => import('../pages/adminPage/AddOldProject'));
const OldProject = lazy(() => import('../pages/homePage/OldProject'));
const ViewProjectDocuments = lazy(
  () => import('../pages/adminPage/ViewProjectDocuments')
);
const ProjectTypesPage = lazy(() => import('../pages/adminPage/ProjectTypesPage'));
const ProfileUser = lazy(() => import('../pages/studentPage/ProfileUser'));
const Documentation = lazy(() => import('../pages/studentPage/Documentation'));
const SendProject = lazy(() => import('../pages/studentPage/SendProject'));
const ProjectRequest = lazy(
  () => import('../pages/studentPage/ProjectRequest')
);
const UploadProjectDocument = lazy(
  () => import('../pages/studentPage/UploadProjectDocument')
);

// สร้าง Router โดยใช้ Lazy Components
const router = createBrowserRouter([
  {
    future: { v7_startTransition: true, v7_relativeSplatsPath: true },
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LayoutMain />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'signin',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SignIn />
          </Suspense>
        ),
      },
      {
        path: 'signup',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SignUp />
          </Suspense>
        ),
      },
      {
        path: 'TeacherPage',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <TeacherPage />
          </Suspense>
        ),
      },
      {
        path: 'OldProject',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <OldProject />
          </Suspense>
        ),
      }
    ],
  },
  {
    path: '/adminHome',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LayoutAdmin />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminHome />
          </Suspense>
        ),
      },

      {
        path: 'CheckProject',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CheckProject />
          </Suspense>
        ),
      },
      {
        path: 'manage-user',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ManageUser />
          </Suspense>
        ),
      },
      {
        path: 'release-project',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ReleaseProjectPage />
          </Suspense>
        ),
      },
      {
        path: 'upload-doc',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <UploadDoc />
          </Suspense>
        ),
      },
      {
        path: 'TeacherInfo',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <TeacherInfo />
          </Suspense>
        ),
      },
      {
        path: 'ViewProjectDocuments',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ViewProjectDocuments />
          </Suspense>
        ),
      },
      {
        path: 'project-types',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectTypesPage />
          </Suspense>
        ),
      },
      {
        path: 'AddOldProject',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AddOldProject />
          </Suspense>
        ),
      }

    ],
  },
  {
    path: '/studentHome',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LayoutStudent />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <StudentHome />
          </Suspense>
        ),
      },
      {
        path: 'ProfileUser',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProfileUser />
          </Suspense>
        ),
      },
      {
        path: 'Documentation',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Documentation />
          </Suspense>
        ),
      },
      {
        path: 'projectRequest',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectRequest />
          </Suspense>
        ),
      },
      {
        path: 'SendProject',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SendProject />
          </Suspense>
        ),
      },
      {
        path: 'UploadProjectDocument',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <UploadProjectDocument />
          </Suspense>
        ),
      },
      // Add more routes here
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
