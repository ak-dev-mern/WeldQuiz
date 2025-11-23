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

  // Check authentication status by attempting to fetch profile
  const {
    data: userData,
    isLoading,
    error,
    refetch: refetchUser,
    isFetching,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await authAPI.getProfile();
        return response.data.user;
      } catch (error) {
        // Don't throw error for 401 - just return null
        if (error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error.response?.status === 401) {
        return false;
      }
      // Retry other errors only once
      return failureCount < 1;
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });

  useEffect(() => {
    if (!isLoading && !isFetching) {
      setUser(userData || null);
      setLoading(false);
    }
  }, [userData, isLoading, isFetching]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user } = response.data;

      console.log(user);
      

      setUser(user);

      // Refetch user data to ensure we have latest
      await refetchUser();

      toast.success("Login successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user } = response.data;

      setUser(user);

      // Refetch user data to ensure we have latest
      await refetchUser();

      toast.success("Registration successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  // AuthContext.jsx - Fix the logout function
  const logout = async () => {
    try {
      // Cancel all pending queries
      queryClient.cancelQueries();

      // Clear all queries from cache FIRST
      queryClient.removeQueries();
      queryClient.clear();

      // Clear user state
      setUser(null);

      // Make logout API call
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with logout even if API call fails
    } finally {
      toast.success("Logged out successfully");
    }
  };
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;

      setUser(updatedUser);

      // Update the query cache
      queryClient.setQueryData(["user"], updatedUser);

      toast.success("Profile updated successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
      throw error;
    }
  };

  // Refresh token is now handled automatically by the browser via httpOnly cookies
  const refreshToken = async () => {
    try {
      // This will automatically use the refresh token cookie
      const response = await authAPI.refreshToken();
      return response.data.accessToken;
    } catch (error) {
      // If refresh fails, logout the user
      await logout();
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
