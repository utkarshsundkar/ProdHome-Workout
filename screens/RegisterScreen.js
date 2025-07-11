import React, {useContext, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AuthContext from '../context/AuthContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
const {height} = Dimensions.get('window');

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {register} = useContext(AuthContext);
  const {setTempUserId} = useContext(AuthContext);
  const navigation = useNavigation();

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }
    try {
      const successResult = await register(username, email, password);
      // console.log('Registering user:', successResult.data.data._id);
      if (successResult && successResult.data && successResult.data.data) {
      const newUserId = successResult.data.data._id; 
      await AsyncStorage.setItem('tempUserId', newUserId);
      setTimeout(() => {
        navigation.replace('Gender'); 
      }, 800);
    } else {
      setError('Registration failed. Please check your details.');
    }
  } catch (err) {
    setError('Registration failed. Please check your details.');
    console.error('Registration error:', err);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subheading}>
        Fill the details to create an account
      </Text>
      {success ? (
        <Text style={{color: 'green', marginBottom: 10}}>{success}</Text>
      ) : null}
      {error ? (
        <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
      ) : null}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>USERNAME</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder=""
          placeholderTextColor="#7D8A9C"
        />
        <View style={styles.underline} />
        <Text style={styles.inputLabel}>EMAIL</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder=""
          placeholderTextColor="#7D8A9C"
        />
        <View style={styles.underline} />
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
      </View>
      <Pressable
        onPress={handleRegister}
        style={({pressed}) => [
          styles.signInBtn,
          pressed && {transform: [{scale: 0.96}]},
        ]}>
        <Text style={styles.signInBtnText}>Register</Text>
      </Pressable>
      <TouchableOpacity
        onPress={() => navigation.navigate('Sign In')}
        style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: height * 0.03,
    alignItems: 'center',
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
  signInBtn: {
    width: '80%',
    backgroundColor: '#0093D6',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  signInBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  forgotBtn: {
    marginTop: 18,
    alignItems: 'center',
    width: '100%',
  },
  forgotText: {
    color: '#FF6B35',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default RegisterScreen;
