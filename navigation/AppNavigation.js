import React, {useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import Onboarding from '../screens/Onboarding';
// import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgetPassword from '../screens/ForgetPassword';
import SecurityQuestions from '../screens/SecurityQuestions';
import NewPassword from '../screens/NewPassword';
// import ExtraCredentialScreen from '../screens/ExtraCredentialScreen';
import GenderScreen from '../screens/credentialsPages/GenderScreen';
import AgeScreen from '../screens/credentialsPages/AgeScreen';
import HeightScreen from '../screens/credentialsPages/HeightScreen';
import WeightScreen from '../screens/credentialsPages/WeightScreen';
import ActivityLevelScreen from '../screens/credentialsPages/ActivityLevelScreen';
import ExtraData from '../screens/credentialsPages/ExtraData.tsx';
import AuthContext from '../context/AuthContext';
import MainTabs from '../MainTabs.tsx'

const Stack = createStackNavigator();

const AppNavigation = () => {
  const {user, loading} = useContext(AuthContext);

  if (loading) {
    // While checking token, show splash
    return <SplashScreen navigation={{replace: () => {}}} />;
  }

  return (
    <NavigationContainer key={user ? 'nav-logged-in' : 'nav-logged-out'}>
      <Stack.Navigator
        key={user ? 'user-logged-in' : 'user-logged-out'}
        initialRouteName={user ? 'Home' : 'Splash'}
        screenOptions={{headerShown: false}}
      >
        {/* Splash and Onboarding */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        {/* Extra credential after signup */}
        {/* <Stack.Screen name="ExtraCredential" component={ExtraCredentialScreen} /> */}
        {/* Credentials flow */}
        <Stack.Screen name="Gender" component={GenderScreen} />
        <Stack.Screen name="Age" component={AgeScreen} />
        <Stack.Screen name="Height" component={HeightScreen} />
        <Stack.Screen name="Weight" component={WeightScreen} />
        <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
        <Stack.Screen name="extraData" component={ExtraData} />
        {/* Password recovery */}
        <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
        <Stack.Screen name="SecurityQuestions" component={SecurityQuestions} />
        <Stack.Screen name="NewPassword" component={NewPassword} />
        {/* Main app */}
        <Stack.Screen name="Home" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
