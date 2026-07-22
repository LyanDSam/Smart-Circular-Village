import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

/**
 * AuthContext — Single source of truth for authentication state.
 *
 * Profile data is synced in real-time via Firestore onSnapshot().
 * No localStorage is involved. Firebase Auth manages the session.
 */
export const AuthContext = createContext({
  currentUser: null,
  profile: null,
  role: null,
  status: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Realtime auth + Firestore profile listener.
    // When admin changes role/status/rfid in Firestore,
    // the profile state updates here automatically via onSnapshot().
    const unsubscribe = authService.subscribeToAuthChanges((authUser, profileData) => {
      setCurrentUser(authUser);
      setProfile(profileData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    // Profile will be loaded reactively via onSnapshot in subscribeToAuthChanges
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    // Profile will be loaded reactively via onSnapshot in subscribeToAuthChanges
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser?.uid) {
      const updatedProfile = await authService.getUserProfile(currentUser.uid);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    }
  };

  const role = profile?.role || null;
  const status = profile?.status || null;

  // Expose both new names and legacy aliases for backward compatibility
  return (
    <AuthContext.Provider
      value={{
        // Primary API
        currentUser,
        profile,
        role,
        status,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        // Legacy aliases used by existing components
        user: currentUser,
        userProfile: profile,
        isLoading: loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
