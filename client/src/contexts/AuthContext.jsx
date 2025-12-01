import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const AuthContext = createContext();


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Optimized user query with better error handling
  const {
    data: userData,
    isLoading: isQueryLoading,
    error,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await authAPI.getProfile();
        return response.data.user;
      } catch (error) {
        // Don't throw for auth or rate limit errors
        if (error.response?.status === 401 || error.response?.status === 429) {
          return null;
        }
        // For other errors, wait and retry once
        await new Promise((resolve) => setTimeout(resolve, 1000));
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Only retry once and never for 401/429
      if (error.response?.status === 401 || error.response?.status === 429) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: 2000,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Handle errors globally
  useEffect(() => {
    if (error) {
      if (error.response?.status === 429) {
        console.warn("Rate limit hit in user query");
      }
    }
  }, [error]);

  // Sync state with query data
  useEffect(() => {
    if (!isQueryLoading) {
      setUser(userData || null);
      setLoading(false);
    }
  }, [userData, isQueryLoading]);

  const login = async (credentials) => {
    try {
      // Clear cache first
      queryClient.removeQueries(["user"]);

      const response = await authAPI.login(credentials);
      const { user } = response.data;

      // Update cache directly
      queryClient.setQueryData(["user"], user);

      toast.success("Login successful!");
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Too many login attempts. Please wait 1 minute.");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      queryClient.removeQueries(["user"]);

      const response = await authAPI.register(userData);
      const { user } = response.data;

      queryClient.setQueryData(["user"], user);

      toast.success("Registration successful!");
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Too many registration attempts. Please wait 1 minute.");
      } else {
        toast.error(error.response?.data?.message || "Registration failed");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear state immediately
      setUser(null);
      setLoading(false);

      // Clear all queries
      queryClient.removeQueries();

      // Make logout call (fire and forget)
      authAPI.logout().catch(console.error);

      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear everything
      setUser(null);
      queryClient.removeQueries();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;

      queryClient.setQueryData(["user"], updatedUser);

      toast.success("Profile updated successfully");
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Too many update requests. Please wait a moment.");
      } else {
        toast.error(error.response?.data?.message || "Profile update failed");
      }
      throw error;
    }
  };

  const value = {
    user,
    loading: loading || isQueryLoading,
    login,
    register,
    logout,
    updateProfile,
    refetchUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
