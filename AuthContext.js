import React, { createContext, useState, useEffect, useContext, useRef } from 'react'; // Added useRef
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const Storage = {
  setItem: async (key, value) => {
    try {
      if (typeof AsyncStorage !== 'undefined') {
        await AsyncStorage.setItem(key, value);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
    }
  },
  getItem: async (key) => {
    try {
      if (typeof AsyncStorage !== 'undefined') {
        return await AsyncStorage.getItem(key);
      } else if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },
  removeItem: async (key) => {
    try {
      if (typeof AsyncStorage !== 'undefined') {
        await AsyncStorage.removeItem(key);
      } else if (typeof localStorage !== 'undefined') {
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
  const [refreshToken, setRefreshToken] = useState(null); // Keep state for potential UI use
  const refreshIntervalRef = useRef(null); // Use useRef for interval ID

  // --- Token Refresh Interval Management ---
  const clearTokenRefreshInterval = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.log('Cleared token refresh interval.');
    }
  };

  const startTokenRefreshInterval = () => {
    clearTokenRefreshInterval(); // Clear existing interval first
    console.log('Starting token refresh interval (every 2 minutes).');
    refreshIntervalRef.current = setInterval(async () => {
      console.log("Interval: Attempting scheduled token refresh.");
      // *** Read the latest refresh token directly from storage inside the interval ***
      const currentRefreshTokenFromStorage = await Storage.getItem('refreshToken');
      if (currentRefreshTokenFromStorage) {
          console.log("Interval: Found refresh token in storage.");
          await refreshAuthToken(currentRefreshTokenFromStorage);
      } else {
          console.error("Interval: Refresh token missing from storage during scheduled refresh. Logging out.");
          await logout(); // Logout if token disappears from storage
      }
    }, 120000); // Refresh every 2 minutes (120000 ms)
  };
  // --- End Interval Management ---

  // Function to refresh the access token - relies on passed token
  const refreshAuthToken = async (tokenToRefresh) => {
    if (!tokenToRefresh) {
      console.error('refreshAuthToken called without a token.');
      // Avoid calling logout here if called from interval, as interval checks storage first
      return false;
    }

    try {
      console.log('Attempting to refresh token...');
      const response = await fetch('https://skinwise.tech/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: tokenToRefresh } ),
      });

      const data = await response.json();

      if (response.ok) {
        await Storage.setItem('accessToken', data.access);
        setUserToken(data.access);
        // Optionally update refresh token in storage and state if backend sends a new one
        if (data.refresh && data.refresh !== tokenToRefresh) {
           console.log("Received new refresh token from backend.");
           await Storage.setItem('refreshToken', data.refresh);
           setRefreshToken(data.refresh); // Update state as well
        }
        console.log('🔄 Access token refreshed successfully.');
        return true;
      } else {
        console.error('Failed to refresh token:', response.status, data);
        if (data.code === 'token_not_valid' || response.status === 401) {
          console.log('Refresh token invalid or expired. Logging out.');
          await logout(); // Logout on invalid refresh token
        }
        return false;
      }
    } catch (error) {
      console.error('Error during token refresh network request:', error);
      // Decide if logout is appropriate on network errors
      // await logout();
      return false;
    }
  };

  // Function to log in a user
  const login = async (access, refresh, user) => {
    setIsLoading(true);
    try {
      console.log("Login: Saving tokens and user data...");
      await Storage.setItem('accessToken', access);
      await Storage.setItem('refreshToken', refresh);
      await Storage.setItem('userData', JSON.stringify(user));
      console.log("Login: Tokens and user data saved.");

      setUserToken(access);
      setRefreshToken(refresh); // Set state
      setUserData(user);
      startTokenRefreshInterval(); // Start interval after successful login
      console.log("Login: State updated and refresh interval started.");
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log out a user
  const logout = async () => {
    console.log("Logout: Clearing tokens, user data, and interval...");
    setIsLoading(true);
    clearTokenRefreshInterval(); // Clear interval first
    try {
      await Storage.removeItem('accessToken');
      await Storage.removeItem('refreshToken');
      await Storage.removeItem('userData');
      
      setUserToken(null);
      setRefreshToken(null);
      setUserData(null);
      console.log("Logout: Storage and state cleared.");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check user's login status on app startup
  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoading(true);
      let storedAccessToken = null;
      let storedRefreshToken = null;
      let storedUserData = null;

      try {
        console.log('Auth Check: Retrieving tokens from storage...');
        storedAccessToken = await Storage.getItem('accessToken');
        storedRefreshToken = await Storage.getItem('refreshToken');
        storedUserData = await Storage.getItem('userData');
        console.log('Auth Check: Retrieved Access Token:', storedAccessToken ? 'Exists' : 'null');
        console.log('Auth Check: Retrieved Refresh Token:', storedRefreshToken ? 'Exists' : 'null');

        if (storedAccessToken) {
          console.log('Auth Check: Access Token found.');
          try {
            const decodedToken = jwtDecode(storedAccessToken);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp > currentTime) {
              console.log('Auth Check: Access token is valid.');
              setUserToken(storedAccessToken);
              setRefreshToken(storedRefreshToken); // Set state from storage
              if (storedUserData) setUserData(JSON.parse(storedUserData));
              startTokenRefreshInterval(); // Start the interval
            } else {
              console.log('Auth Check: Access token is expired.');
              if (!storedRefreshToken) {
                 console.error("Auth Check: Cannot refresh, refresh token is missing from storage!");
                 await logout();
              } else {
                 console.log('Auth Check: Refresh token found in storage. Attempting immediate refresh...');
                 const refreshSuccessful = await refreshAuthToken(storedRefreshToken);
                 if (refreshSuccessful) {
                   console.log('Auth Check: Immediate refresh successful.');
                   // State (userToken, potentially refreshToken) was set within refreshAuthToken
                   startTokenRefreshInterval(); // Start interval after successful refresh
                 } else {
                   console.log('Auth Check: Immediate refresh failed (logout likely triggered within refreshAuthToken).');
                   // No need to start interval if refresh failed
                 }
              }
            }
          } catch (decodeError) {
            console.error('Auth Check: Error decoding access token (invalid format?). Logging out.', decodeError);
            await logout();
          }
        } else {
          console.log('Auth Check: No access token found in storage. Ensuring logged out state.');
          // Ensure clean state if somehow logged in without token
          setUserToken(null);
          setRefreshToken(null);
          setUserData(null);
          clearTokenRefreshInterval();
        }
      } catch (error) {
        console.error('Auth Check: Error during initial login status check:', error);
        await logout(); 
      } finally {
        setIsLoading(false);
        console.log('Auth Check: Initial auth check complete.');
      }
    };

    checkLoginStatus();

    // Cleanup function for the useEffect hook
    return () => {
      console.log("AuthContext unmounting. Clearing interval.");
      clearTokenRefreshInterval();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <AuthContext.Provider 
      value={{ 
        isLoading,
        userToken,
        userData,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
