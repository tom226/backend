import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [membershipActive, setMembershipActive] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        api.setToken(storedToken);
        setToken(storedToken);
        setUser(parsedUser);
        const localMembership = Boolean(
          parsedUser?.isCommunityMember ||
          parsedUser?.membershipActive ||
          parsedUser?.communityMembershipActive ||
          parsedUser?.membership?.status === 'active'
        );
        setMembershipActive(localMembership);
        // Verify token is still valid
        try {
          await api.verifyToken();
          try {
            const membershipRes = await api.getCommunityMembership();
            if (membershipRes && typeof membershipRes.membershipActive === 'boolean') {
              setMembershipActive(membershipRes.membershipActive);
              if (membershipRes.membershipActive) {
                const updatedUser = {
                  ...parsedUser,
                  isCommunityMember: true,
                  membershipActive: true,
                  membership: membershipRes.membership || parsedUser.membership || {},
                };
                setUser(updatedUser);
                await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
              }
            }
          } catch {
            // Keep local membership state when membership API is temporarily unavailable
          }
        } catch {
          // Token expired, clear auth
          await clearAuth();
        }
      }
    } catch (e) {
      console.log('Error loading auth:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (authToken, userData) => {
    try {
      api.setToken(authToken);
      setToken(authToken);
      const normalizedUser = {
        ...userData,
        isCommunityMember: Boolean(
          userData?.isCommunityMember ||
          userData?.membershipActive ||
          userData?.communityMembershipActive ||
          userData?.membership?.status === 'active'
        ),
      };
      setUser(normalizedUser);
      setMembershipActive(Boolean(normalizedUser.isCommunityMember));
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(normalizedUser));
    } catch (e) {
      console.log('Error saving auth:', e);
    }
  };

  const clearAuth = async () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    setMembershipActive(false);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  };

  const logout = async () => {
    await clearAuth();
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setMembershipActive(Boolean(newUser?.isCommunityMember || newUser?.membershipActive || newUser?.communityMembershipActive));
    setUser(newUser);
    AsyncStorage.setItem('userData', JSON.stringify(newUser));
  };

  const activateCommunityMembership = async () => {
    if (!user) return;
    try {
      const result = await api.activateCommunityMembership({ amount: 200, plan: 'monthly' });
      const updatedUser = {
        ...user,
        ...(result.user || {}),
        isCommunityMember: true,
        membershipActive: true,
        membership: {
          ...(result.membership || {}),
          status: 'active',
          amount: 200,
          currency: 'INR',
          plan: 'monthly',
        },
      };
      setUser(updatedUser);
      setMembershipActive(true);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (e) {
      // Keep local fallback so user can continue in non-blocking mode
      const updatedUser = {
        ...user,
        isCommunityMember: true,
        membershipActive: true,
        membership: {
          ...(user.membership || {}),
          status: 'active',
          amount: 200,
          currency: 'INR',
          plan: 'monthly',
          startedAt: new Date().toISOString(),
        },
      };
      setUser(updatedUser);
      setMembershipActive(true);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  const isLoggedIn = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isLoggedIn,
      membershipActive,
      login,
      logout,
      updateUser,
      activateCommunityMembership,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
