import './App.css';
import { Routes, Route, useLocation, HashRouter } from 'react-router-dom'
import Survey from './pages/survey';
import SignIn from './pages/signIn';
import Feed from './pages/feed';
import Chat from './pages/chat';
import NavBar from './components/navBar';
import ViewProfile from './pages/viewProfile';
import EditProfile from './pages/editProfile';
import React from 'react';

function App() {

  const location = useLocation();

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
