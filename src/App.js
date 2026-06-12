import './App.css';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { BottomNavBar } from './components/nav';
import React, { Suspense, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { apiFetch } from './api/client';
import { useAuth } from './context/AuthContext';
import { setAppNavigate } from './navigation';

const Feed = React.lazy(() => import('./pages/feed'));
const Chat = React.lazy(() => import('./pages/chat'));
const ViewProfile = React.lazy(() => import('./pages/viewProfile'));
const EditProfile = React.lazy(() => import('./pages/editProfile'));
const Survey = React.lazy(() => import('./pages/survey'));
const SignIn = React.lazy(() => import('./pages/signIn'));
const Rooms = React.lazy(() => import('./pages/rooms'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setAppNavigate(navigate);
    return () => setAppNavigate(null);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const refreshIntervalMs = 45 * 60 * 1000;
    const timer = setInterval(() => {
      apiFetch('/auth/refreshToken', { method: 'POST' }).catch(() => {});
    }, refreshIntervalMs);

    return () => clearInterval(timer);
  }, [user, location.pathname]);

  const hideNav = location.pathname === '/' || location.pathname === '/survey';

  return (
    <div className="App">
      {!hideNav && <BottomNavBar />}
      <Suspense fallback={
        <div className="centeredDiv gradient-background2" style={{ minHeight: '100dvh' }}>
          <CircularProgress color="inherit" />
        </div>
      }>
        <Routes>
          <Route exact path='/' element={<SignIn />} />
          <Route exact path='/survey' element={<Survey />} />
          <Route exact path='/feed' element={<Feed />} />
          <Route exact path='/chat' element={<Chat />} />
          <Route exact path='/viewProfile' element={<ViewProfile />} />
          <Route exact path='/editProfile' element={<EditProfile />} />
          <Route exact path='/rooms' element={<Rooms />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
