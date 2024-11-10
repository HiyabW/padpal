import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom'
import Survey from './pages/survey';
import SignIn from './pages/signIn';
import Feed from './pages/feed';
import Chat from './pages/chat';
import NavBar from './components/navBar';
import ViewProfile from './pages/viewProfile';
import EditProfile from './pages/editProfile';

function App() {

  const location = useLocation();

  return (
    <>
    {
      (location.pathname !== "/" && location.pathname !== "/survey") &&
      <NavBar />
    }
    <Routes>
      <Route index path='/' element={<SignIn />} />
      <Route index path='/survey' element={<Survey />} />
      <Route index path='/feed' element={<Feed />} />
      <Route index path='/chat' element={<Chat />} />
      <Route index path='/viewProfile' element={<ViewProfile />} />
      <Route index path='/editProfile' element={<EditProfile />} />
    </Routes></>
  );
}

export default App;
