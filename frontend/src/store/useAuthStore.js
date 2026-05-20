import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "/";

export const useAuthStore = create((set, get) => ({

  authUser: null,
  onlineUsers: [],

  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  socket: null,

  // CHECK AUTH
  checkAuth: async () => {

    set({ isCheckingAuth: true });

    try {

      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });

      get().connectSocket();

    } catch (error) {

      if (error.response?.status === 401) {

        set({ authUser: null });

      } else {

        console.log("Error in checkAuth:", error);

      }

    } finally {

      set({ isCheckingAuth: false });

    }
  },

  // SIGNUP
  signup: async (data) => {

    set({ isSigningUp: true });

    try {

      const res = await axiosInstance.post(
        "/auth/signup",
        data
      );

      set({ authUser: res.data });

      get().connectSocket();

      toast.success("Account created successfully");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      set({ isSigningUp: false });

    }
  },

  // LOGIN
  login: async (data) => {

    set({ isLoggingIn: true });

    try {

      const res = await axiosInstance.post(
        "/auth/login",
        data
      );

      set({ authUser: res.data });

      get().connectSocket();

      toast.success("Logged in successfully");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      set({ isLoggingIn: false });

    }
  },

  // LOGOUT
  logout: async () => {

    try {

      await axiosInstance.post("/auth/logout");

      get().disconnectSocket();

      set({
        authUser: null,
        onlineUsers: [],
      });

      toast.success("Logged out successfully");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  },

  // UPDATE PROFILE
  updateProfile: async (data) => {

    set({ isUpdatingProfile: true });

    try {

      const res = await axiosInstance.put(
        "/auth/update-profile",
        data
      );

      set({ authUser: res.data });

      toast.success(
        "Profile updated successfully"
      );

    } catch (error) {

      console.log(
        "Error in update profile:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      set({ isUpdatingProfile: false });

    }
  },

  // CONNECT SOCKET
  connectSocket: () => {

    const { authUser } = get();

    if (
      !authUser ||
      get().socket?.connected
    ) {
      return;
    }

    const socket = io(BASE_URL, {

      query: {
        userId: authUser._id,
      },

      withCredentials: true,
    });

    socket.connect();

    socket.on(
      "getOnlineUsers",
      (userIds) => {

        set({
          onlineUsers: userIds,
        });
      }
    );

    set({ socket });
  },

  // DISCONNECT SOCKET
  disconnectSocket: () => {

    if (get().socket?.connected) {

      get().socket.disconnect();
    }

    set({
      socket: null,
      onlineUsers: [],
    });
  },

}));