import './App.css';
import { Routes, Route, useLocation, HashRouter } from 'react-router-dom'
import Survey from './pages/survey';
import SignIn from './pages/signIn';
import Feed from './pages/feed';
import Chat from './pages/chat';
import NavBar from './components/navBar';
import ViewProfile from './pages/viewProfile';
import EditProfile from './pages/editProfile';
import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { apiFetch } from './utils/apiFetch';

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
        (location.pathname !== "/" && location.pathname !== "/survey") &&
        <NavBar />
      }
        <Routes>
          <Route exact path='/' element={<SignIn />} />
          <Route exact path='/survey' element={<Survey />} />
          <Route exact path='/feed' element={<Feed />} />
          <Route exact path='/chat' element={<Chat />} />
          <Route exact path='/viewProfile' element={<ViewProfile />} />
          <Route exact path='/editProfile' element={<EditProfile />} />
        </Routes>
    </>
  );
}

export default App;
