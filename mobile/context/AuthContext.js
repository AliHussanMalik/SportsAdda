import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session from API or state on load
  const checkCurrentSession = async () => {
    try {
      if (accessToken) {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Bypass-Tunnel-Reminder': 'true'
          }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        }
      }
    } catch (e) {
      console.error('Session restore error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCurrentSession();
  }, [accessToken]);

  const login = async (nameOrEmail, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: nameOrEmail, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setAccessToken(data.accessToken);
        return { success: true, user: data.user };
      } else {
        setError(data.error || 'Login failed');
        return { success: false, error: data.error };
      }
    } catch (e) {
      const msg = 'Network error during login';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setAccessToken(data.accessToken);
        return { success: true, user: data.user };
      } else {
        setError(data.error || 'Registration failed');
        return { success: false, error: data.error };
      }
    } catch (e) {
      const msg = 'Network error during registration';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (updatedFields) => {
    if (!user || !accessToken) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch(`${API_BASE}/auth/profiles/${user.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.profile);
        return { success: true, profile: data.profile };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e) {
      return { success: false, error: 'Network error updating profile' };
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      loading,
      error,
      login,
      register,
      updateProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
