import {create} from "zustand"
import { axiosInstance } from "../lib/axios"
import axios from "axios";
import toast from "react-hot-toast";
import {io} from "socket.io-client";

const BASE_URL=import.meta.env.MODE==="development"?"http://localhost:5001":"/"

export const useAuthStore=create((set,get)=>({
    authUser : null,
    onlineUsers:[],
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth: true,
    socket:null,
   checkAuth: async () => {
  set({ isCheckingAuth: true });

  try {
    const res =await axios.get("http://localhost:5001/api/auth/check", {
  withCredentials: true,
});
    set({ authUser: res.data });
    get().connectSocket();
  } catch (error) {
    if (error.response?.status === 401) {
      set({ authUser: null });
    } else {
      console.log("Error:", error);
    }
  } finally {
    set({ isCheckingAuth: false });  // ✅ THIS FIXES YOUR ISSUE
  }
},
signup:async (data)=>{
  set({ isSigningUp:true});
  try {
  const res= await axiosInstance.post("/auth/signup",data);
  toast.success("Account created successfully");
  set({authUser:res.data});
  get().connectSocket()
    
  } catch (error) {
    toast.error(error.response.data.message);
    
  }finally{
    set({isSigningUp:false});
  }
},
login: async(data)=>{
set({isLoggingIn:true});
try {
  const res=await axiosInstance.post("/auth/login",data);
  set({authUser:res.data});
   window.location.href = "/"; 
  toast.success("Logged in successfully");
} catch (error) {
  toast.error(error.response.data.message)
  
}finally{
  set({isLoggingIn:false})
}
},
logout:async ()=>{
  try {
    await axiosInstance.post("/auth/logout");
    set({authUser:null});
    toast.success("Logged out successfully");
    get().disconnectSocket();  
  } catch (error) {
    toast.error(error.response.data.message)
    
  }


},
updateProfile: async (data)=>{
set({ isUpdatingProfile:true});
try {
  const res=await axiosInstance.put("/auth/update-profile",data);
  set({authUser:res.data});
  toast.success("Profile updated successfully");
} catch (error) {
  console.log("error in update profile",error);
  toast.error(error.response.data.message);
  
}finally{
  set({isUpdatingProfile:false});
}
},
connectSocket:()=>{
  const {authUser}=get();
  if(!authUser|| get().socket?.connected)return;
  const socket=io(BASE_URL,{
    query:{
      userId:authUser._id,
    },
  })

  socket.connect()
  set({socket:socket})
  socket.on("getOnlineUsers",(usersIds)=>{
   set({onlineUsers:usersIds}) 
  })
},
disconnectSocket:()=>{
  if(get().socket?.connected)get().socket.disconnect();
}

}))