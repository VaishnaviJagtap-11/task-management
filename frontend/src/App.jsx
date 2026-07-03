import React, { useEffect, useState, useCallback } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  Outlet,
  Navigate
} from 'react-router-dom';

import Layout from './components/Layout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './pages/Dashboard';
import PendingPage from './pages/PendingPage';
import CompletePage from './pages/CompletePage';
import Profile from './components/Profile'

const App = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAuthSubmit = (data) => {

    const user = {
      email: data.email,
      name: data.name || 'User',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.name || 'User'
      )}&background=random`
    };

    localStorage.setItem(
      'currentUser',
      JSON.stringify(user)
    );

    setCurrentUser(user);

    navigate('/', { replace: true });
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    setCurrentUser(null);

    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");

    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);



  const ProtectedLayout = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    return (
      <Layout
        user={currentUser}
        onLogout={handleLogout}
      >
        <Outlet />
      </Layout>
    );
  };

  return (
    <Routes>

      <Route
        path="/"
        element={<ProtectedLayout />}
      >
        <Route
          index
          element={<Dashboard />}
        />

        <Route
          path="pending"
          element={<PendingPage />}
        />

        <Route
          path="completed"
          element={<CompletePage />}
        />
        <Route path="profile" element={<Profile user={currentUser} setCurrentUser={setCurrentUser} onLogout={handleLogout}/>} />

      </Route>

      {/* Login */}
      <Route
        path="/login"
        element={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Login
              onSubmit={handleAuthSubmit}
              onSwitchMode={() =>
                navigate('/signup')
              }
            />
          </div>
        }
      />

      {/* Signup */}
      <Route
        path="/signup"
        element={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <SignUp
              onSubmit={handleAuthSubmit}
              onSwitchMode={() =>
                navigate('/login')
              }
            />
          </div>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={currentUser ? "/" : "/login"}
            replace
          />
        }
      />

    </Routes>
  );
};

export default App;