import React, { createContext, useState, useContext, useEffect } from 'react';
import { driverApi } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    id: 2,
    name: 'Ramesh Kumar',
    email: 'driver1@revroute.ai',
    role: 'Driver',
    assigned_vehicle_id: 'TRK-101',
    phone_number: '+91 98765 11111',
    license_number: 'DL-TN01-20210001',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const user = await driverApi.login({ email, password });
      if (user.role !== 'Driver') {
        throw new Error('Manager accounts must log in via the RevRoute AI Manager Web Portal.');
      }
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || 'Login failed. Please check your driver credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const setDemoDriver = (driverEmail) => {
    if (driverEmail === 'driver1@revroute.ai') {
      setCurrentUser({
        id: 2,
        name: 'Ramesh Kumar',
        email: 'driver1@revroute.ai',
        role: 'Driver',
        assigned_vehicle_id: 'TRK-101',
        phone_number: '+91 98765 11111',
        license_number: 'DL-TN01-20210001',
      });
    } else {
      setCurrentUser({
        id: 3,
        name: 'Suresh Patel',
        email: 'driver2@revroute.ai',
        role: 'Driver',
        assigned_vehicle_id: 'TRK-102',
        phone_number: '+91 98765 22222',
        license_number: 'DL-TN02-20210002',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        logout,
        setDemoDriver,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
