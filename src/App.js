import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/navBar';
import React, { Suspense, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { apiFetch } from './api/client';
import { useAuth } from './context/AuthContext';

const Feed = React.lazy(() => import('./pages/feed'));
const Chat = React.lazy(() => import('./pages/chat'));
const ViewProfile = React.lazy(() => import('./pages/viewProfile'));
const EditProfile = React.lazy(() => import('./pages/editProfile'));
const Survey = React.lazy(() => import('./pages/survey'));
const SignIn = React.lazy(() => import('./pages/signIn'));

function App() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const refreshIntervalMs = 45 * 60 * 1000;
    const timer = setInterval(() => {
      apiFetch('/auth/refreshToken', { method: 'POST' }).catch(() => {});
    }, refreshIntervalMs);

    return () => clearInterval(timer);
  }, [user, location.pathname]);

  return (
    <>
      {
        (location.pathname !== '/' && location.pathname !== '/survey') &&
        <NavBar />
      }
      <Suspense fallback={
        <div className="centeredDiv gradient-background2">
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
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
