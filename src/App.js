import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom'
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
        <Route index exact path='/' element={<SignIn />} />
        <Route index exact path='/survey' element={<Survey />} />
        <Route index exact path='/feed' element={<Feed />} />
        <Route index exact path='/chat' element={<Chat />} />
        <Route index exact path='/viewProfile' element={<ViewProfile />} />
        <Route index exact path='/editProfile' element={<EditProfile />} />
        <Route path="*">
          <h2>Page Not Found</h2>
        </Route>
      </Routes></>
  );
}

export default App;
