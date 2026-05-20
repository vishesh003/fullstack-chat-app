import React from 'react';
import './index.css';
import Navbar from './components/Navbar';
import { Routes,Route,Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SignUpPage from './pages/SignUpPage';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore'; 
import { Loader } from 'lucide-react';
import {Toaster} from "react-hot-toast"
import { useThemeStore } from './store/useThemeStore';
const App = () => {
  const {authUser,checkAuth,isCheckingAuth,onlineUsers}=useAuthStore();
  const{theme}=useThemeStore()
  console.log({onlineUsers});
  useEffect(()=>{
    checkAuth();

  },[checkAuth]);
  console.log({authUser});
  if(isCheckingAuth&&!authUser)return (
         <div className='flex items-center justify-center h-screen'>
          <Loader className="size-10 animate-spin"/>

         </div>
  )
  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser?<HomePage/>:<Navigate to="/login"/>}/>
        <Route path="/signup" element={<SignUpPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/settings" element={authUser?<SettingsPage/>:<Navigate to="/login"/>}/>
        <Route path="/profile" element={<ProfilePage/>}/>

      </Routes>
       <Toaster/>
      

    </div>
  )
}

export default App
