import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/navBar';
import React, { Suspense, useEffect } from 'react';
import Cookies from 'js-cookie';
import { apiFetch } from './api/client';
import LoadingSpinner from './components/loadingSpinner';

const Feed = React.lazy(() => import('./pages/feed'));
const Chat = React.lazy(() => import('./pages/chat'));
const ViewProfile = React.lazy(() => import('./pages/viewProfile'));
const EditProfile = React.lazy(() => import('./pages/editProfile'));
const Survey = React.lazy(() => import('./pages/survey'));
const SignIn = React.lazy(() => import('./pages/signIn'));

function App() {
  const location = useLocation();

  useEffect(() => {
    const token = Cookies.get('isLoggedIn');
    if (!token) return;

    // Decode JWT expiry without a library (JWTs are base64url encoded)
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.exp) return;
      const expiresInMs = payload.exp * 1000 - Date.now();
      const refreshAtMs = expiresInMs - 5 * 60 * 1000; // refresh 5 min before expiry
      if (refreshAtMs <= 0) {
        apiFetch('/feed/');
        return;
      }
      const timer = setTimeout(() => {
        apiFetch('/auth/refreshToken', { method: 'POST' });
      }, refreshAtMs);
      return () => clearTimeout(timer);
    } catch {
      // Non-standard JWT — skip proactive refresh
    }
  }, [location.pathname]);

  return (
    <>
      {
        (location.pathname !== '/' && location.pathname !== '/survey') &&
        <NavBar />
      }
      <Suspense fallback={<LoadingSpinner />}>
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
