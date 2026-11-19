import { useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Login from './auth/Login';
import Signup from './auth/Signup';
import Loading from './components/Loading';
import ErrorBoundary, { RouteErrorBoundary } from './components/ErrorBoundary';
import DashboardPage from './pages/DashboardPage.tsx';
import { useUserStore } from './store/useUserStore';

const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useUserStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


const PublicRoutes = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useUserStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const routeErrorElement = <RouteErrorBoundary />;


const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    errorElement: routeErrorElement,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoutes>
        <DashboardPage />
      </ProtectedRoutes>
    ),
    errorElement: routeErrorElement,
  },
  {
    path: '/login',
    element: (
      <PublicRoutes>
        <Login />
      </PublicRoutes>
    ),
    errorElement: routeErrorElement,
  },
  {
    path: '/signup',
    element: (
      <PublicRoutes>
        <Signup />
      </PublicRoutes>
    ),
    errorElement: routeErrorElement,
  },
  {
    path: '*',
    element: (
      <Navigate to="/dashboard" replace />
    ),
    errorElement: routeErrorElement,
  }
]);

function App() {
  const { checkAuthentication, isCheckingAuth } = useUserStore();

  useEffect(() => {
    void checkAuthentication();
  }, [checkAuthentication]);

  if(isCheckingAuth) return <Loading/>
  return (
    <ErrorBoundary>
      <main>
        <RouterProvider router={appRouter} />
      </main>
    </ErrorBoundary>
  );
}

export default App;
