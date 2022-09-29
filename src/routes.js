import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
//
import Login from './pages/Login';
import DashboardApp from './pages/DashboardApp';
// import Products from './pages/Products';
// import Blog from './pages/Blog';
// import User from './pages/Users';
// import NotFound from './pages/Page404';
import QaManagers from './pages/QaManagers';
import Testers from './pages/Testers';
import Projects from './pages/Projects';

import ProjectDetails from './pages/Projects/projectDetails';

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './Contexts/AuthContext';
import Loader from './components/Loader';
import Logout from './components/Logout';
import TestDetails from './pages/Projects/testDetails';


export default function Router() {
  const { token, user } = useContext(AuthContext);
  const protechtedRoutes = [
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to='/dashboard/app' replace /> },
        { path: 'app', element: <DashboardApp /> },
        // { path: 'user', element: <User /> },
        { path: 'qaManagers', element: <QaManagers /> },
        { path: 'testers', element: <Testers /> },
        { path: 'projects', element: <Projects /> },
        { path: 'projects/:id', element: <ProjectDetails /> },
        { path: 'projects/:id/tests/:testId', element: <TestDetails /> },
      ],
    },
    { path: 'logout', element: <Logout /> },
    { path: '*', element: <Navigate to='/dashboard/app' replace /> },
  ];

  const publicRoutes = [
    { path: 'login', element: <Login /> },
    //Wildcard route
    { path: '*', element: <Navigate to='/login' /> },
  ];

  const loaderRoute = [
    {
      path: '*',
      element: <Loader />,
    },
  ];

  const [routes, setRoutes] = useState(loaderRoute);

  useEffect(() => {
    if (token) {
      if (user) setRoutes(protechtedRoutes);
      else setRoutes(loaderRoute);
    } else setRoutes(publicRoutes);
    // eslint-disable-next-line
  }, [token, user]);

  return useRoutes(routes);
}
