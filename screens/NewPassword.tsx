import React, { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { StyleSheet, View, Text, TextInput, Pressable, SafeAreaView, Animated, Dimensions } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import axios from 'axios';
import { BASE_URL } from '../src/api';
import { useRoute } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');

type Props = {
  onBack: () => void;
  onContinue: () => void;
};

const ChangePassword: React.FC<Props> = ({ onBack, onContinue }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
   const route = useRoute();
    const { email } = route.params;
  const navigation = useNavigation();
  const continueScale = useRef(new Animated.Value(1)).current;
  const handleContinueIn = () => {
    Animated.spring(continueScale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };
  const handleContinueOut = () => {
    Animated.spring(continueScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
    // onContinue();
  };
 const handleChangePassword = async() => {
  if (password !== confirm) {
    alert("Passwords do not match. Please try again.");
    return;
    
  }

  console.log(email);
  try {

    const response= await axios.post(`${BASE_URL}/users/change-password`, {email, newPassword: password });
    if (response.status === 200) {
      Alert.alert("Success", "Your password has been changed successfully.");
      navigation.navigate('Sign In'); // Navigate to the login screen after changing the password
    } else {
      Alert.alert("Error", "Failed to change password. Please try again.");
    }

  } catch (error) {
    console.error("Error changing password:", error);
    Alert.alert("Error", "There was an error changing your password. Please try again later.");
    
  }
  //
 }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      
      {/* Title */}
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.subheading}>Enter your new password</Text>
      {/* Input Fields */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder=""
          placeholderTextColor="#7D8A9C"
          secureTextEntry
        />
        <View style={styles.underline} />
        <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder=""
          placeholderTextColor="#7D8A9C"
          secureTextEntry
        />
        <View style={styles.underline} />
      </View>
      {/* Continue Button */}
      <Pressable
        // onPressIn={handleContinueIn}
        // onPressOut={handleContinueOut}
        style={({ pressed }) => [
          styles.continueBtn,
          pressed && { transform: [{ scale: 0.96 }] }
        ]}
      >
        <Text style={styles.continueBtnText} onPress={()=>handleChangePassword()}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: height * 0.06,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backBtn: {
    padding: 4,
  },
  backArrow: {
    fontSize: 24,
    color: '#031B4E',
    fontWeight: 'bold',
  },
  helpBtn: {
    padding: 4,
  },
  helpText: {
    color: '#7D8A9C',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#031B4E',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subheading: {
    fontSize: 14,
    color: '#7D8A9C',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'System',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 36,
  },
  inputLabel: {
    color: '#7D8A9C',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 2,
    marginTop: 18,
  },
  input: {
    fontSize: 16,
    color: '#031B4E',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'System',
    paddingVertical: 8,
  },
  underline: {
    width: '100%',
    height: 1.2,
    backgroundColor: '#E0E0E0',
    marginTop: -2,
    borderRadius: 1,
  },
  continueBtn: {
    width: '80%',
    backgroundColor: '#0093D6',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  continueBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});

export default ChangePassword; 