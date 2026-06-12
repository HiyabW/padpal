import './App.css';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import React, { Suspense, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { apiFetch } from './api/client';
import { useAuth } from './context/AuthContext';
import { setAppNavigate, ROUTES } from './navigation';
import { AppShell } from './layouts';

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

  return (
    <div className="App">
      <Suspense fallback={
        <div className="centeredDiv gradient-background2" style={{ minHeight: '100dvh' }}>
          <CircularProgress color="inherit" />
        </div>
      }>
        <Routes>
          <Route exact path={ROUTES.SIGN_IN} element={<SignIn />} />
          <Route exact path={ROUTES.SURVEY} element={<Survey />} />
          <Route element={<AppShell />}>
            <Route path={ROUTES.FEED} element={<Feed />} />
            <Route path={ROUTES.CHAT} element={<Chat />} />
            <Route path={ROUTES.VIEW_PROFILE} element={<ViewProfile />} />
            <Route path={ROUTES.EDIT_PROFILE} element={<EditProfile />} />
            <Route path={ROUTES.ROOMS} element={<Rooms />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
