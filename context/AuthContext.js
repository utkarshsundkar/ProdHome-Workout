import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../baseUrl.js';

// Create Auth Context
const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempUserId, setTempUserId] = useState(null);

  // Check token on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        console.log('AuthProvider: Loaded token from storage:', token);
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          try {
            const res = await axios.get(`${BASE_URL}/users/current-user`);
            setUser(res.data.data.user);
            console.log(
              'AuthProvider: Loaded user from backend:',
              res.data.user,
            );
          } catch (err) {
            console.error(
              'AuthProvider: Error fetching user with token:',
              err?.response?.data || err.message,
            );
            setUser(null);
            await AsyncStorage.removeItem('accessToken'); // Remove invalid token
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('AuthProvider: Error loading token from storage:', err);
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Login User

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/users/login`, {
        email,
        password,
      });
      console.log('Login response:', res.data);
      const {accessToken, user} = res.data.data || {};
      if (!accessToken || !user) return false;
      await AsyncStorage.setItem('accessToken', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(user);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  // Register User

  const register = async (username, email, password) => {
    console.log('Registering user:', {username, email, password});
    try {
      const res = await axios.post(`${BASE_URL}/users/register`, {
        username,
        email,
        password,
      });
      console.log('Register response:', res.data);
      const user = res.data.data;
      if (!user) return false;
      // setUser(user);
      return res;
    } catch (err) {
      console.error('Register error:', err);
      return false;
    }
  };

const saveOnboardingData = async (
  userId,
  age,
  height,
  weight,
  gender,
  activityLevel,
  selectedGoal,
  selectedFrequency,
  selectedActivity,
  selectedQuestion,
  answer
) => {
  try {
    const data = {
      userId,
      age,
      height,
      weight,
      gender,
      dailyActivityLevel: activityLevel,
      primaryGoal: selectedGoal,
      workoutFrequency: selectedFrequency,
      currentFitnessLevel: selectedActivity,
      securityQuestions: selectedQuestion,
      securityQuestionsAnswer: answer,
    };

    const res = await axios.post(`${BASE_URL}/onboarding/save`, data);
    console.log('Onboarding data saved:', res.data);
    return res.data;
  } catch (err) {
    console.error('Onboarding save error:', err);
    throw err;
  }
};


  // Logout User
  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    setUser(null);
    axios.defaults.headers.common['Authorization'] = '';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        saveOnboardingData,
        setUser,
        setTempUserId,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
