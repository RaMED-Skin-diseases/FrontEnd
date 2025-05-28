import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the Authentication Context
export const AuthContext = createContext();

// Storage utility for cross-platform compatibility
const Storage = {
  // For storing data
  setItem: async (key, value) => {
    try {
      // For React Native
      if (typeof AsyncStorage !== 'undefined') {
        await AsyncStorage.setItem(key, value);
      } 
      // For Web
      else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
    }
  },
  
  // For retrieving data
  getItem: async (key) => {
    try {
      // For React Native
      if (typeof AsyncStorage !== 'undefined') {
        return await AsyncStorage.getItem(key);
      } 
      // For Web
      else if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },
  
  // For removing data
  removeItem: async (key) => {
    try {
      // For React Native
      if (typeof AsyncStorage !== 'undefined') {
        await AsyncStorage.removeItem(key);
      } 
      // For Web
      else if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Function to log in a user
  const login = async (access, refresh, user) => {
    setIsLoading(true);
    try {
      await Storage.setItem('accessToken', access);
      await Storage.setItem('refreshToken', refresh);
      await Storage.setItem('userData', JSON.stringify(user));
      
      setUserToken(access);
      setRefreshToken(refresh);
      setUserData(user);
    } catch (error) {
      console.error('Login error:', error);
    }
    setIsLoading(false);
  };

  // Function to log out a user
  const logout = async () => {
    setIsLoading(true);
    try {
      await Storage.removeItem('accessToken');
      await Storage.removeItem('refreshToken');
      await Storage.removeItem('userData');
      
      setUserToken(null);
      setRefreshToken(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsLoading(false);
  };

  // Function to refresh the access token
  const refreshAuthToken = async () => {
    try {
      if (!refreshToken) return false;

      const response = await fetch('https://skinwise.tech/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        await Storage.setItem('accessToken', data.access);
        setUserToken(data.access);
        console.log('🔄 Access token refreshed');
        return true;
      } else {
        console.error('Failed to refresh token:', data);
        // If refresh token is invalid, log out the user
        if (data.code === 'token_not_valid') {
          await logout();
        }
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Check if the user is logged in when the app starts
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      const accessToken = await Storage.getItem('accessToken');
      const storedRefreshToken = await Storage.getItem('refreshToken');
      const storedUserData = await Storage.getItem('userData');
      
      if (accessToken && storedRefreshToken && storedUserData) {
        setUserToken(accessToken);
        setRefreshToken(storedRefreshToken);
        setUserData(JSON.parse(storedUserData));
        
        // Set up token refresh interval
        const refreshInterval = setInterval(() => {
          refreshAuthToken();
        }, 120000); // Refresh every 2 minutes
        
        // Clean up interval on unmount - this should be returned to useEffect, not here
        return () => clearInterval(refreshInterval);
      }
    } catch (error) {
      console.error('isLoggedIn error:', error);
    } finally {
      // Always set loading to false when done, regardless of outcome
      setIsLoading(false);
    }
  };

  // Run the isLoggedIn check when the component mounts
  useEffect(() => {
    let refreshInterval;
    
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        
        const accessToken = await Storage.getItem('accessToken');
        const storedRefreshToken = await Storage.getItem('refreshToken');
        const storedUserData = await Storage.getItem('userData');
        
        if (accessToken && storedRefreshToken && storedUserData) {
          setUserToken(accessToken);
          setRefreshToken(storedRefreshToken);
          setUserData(JSON.parse(storedUserData));
          
          // Set up token refresh interval
          refreshInterval = setInterval(() => {
            refreshAuthToken();
          }, 120000); // Refresh every 2 minutes
        }
      } catch (error) {
        console.error('isLoggedIn error:', error);
      } finally {
        // Always set loading to false when done, regardless of outcome
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
    
    // Clean up interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        isLoading,
        userToken,
        userData,
        refreshToken,
        login,
        logout,
        refreshAuthToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
