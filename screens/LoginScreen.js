import React, { useState, useContext } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, SafeAreaView, Dimensions, TouchableOpacity } from "react-native";
import AuthContext from "../context/AuthContext.js";
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setError("");
    try {
      const success = await login(email, password);
      if (success) {
        setError("");
        navigation.navigate("Home");
        console.log("Login successful, navigating to Home");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login failed", error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleForgotPassword = () => {
    navigation.navigate("ForgetPassword");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subheading}>Fill the detail to sign in account</Text>
      {/* Error Message */}
      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
      {/* Input Fields */}
      <View style={styles.inputGroup}>
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
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            placeholder=""
            placeholderTextColor="#7D8A9C"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} hitSlop={10}>
            <Icon
          name={showPassword ? 'eye' : 'eye-off'}
          size={24}
          color="#333"
        />
          </TouchableOpacity>
        </View>
        <View style={styles.underline} />
      </View>
      {/* Sign In Button */}
      <Pressable onPress={handleLogin} style={({ pressed }) => [styles.signInBtn, pressed && { transform: [{ scale: 0.96 }] }] }>
        <Text style={styles.signInBtnText}>Sign In</Text>
      </Pressable>
      {/* Forgot Password */}
      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
      {/* Register Button */}
      <TouchableOpacity onPress={() => navigation.navigate("Register") } style={{ marginTop: 18 }}>
        <Text style={{ color: '#0093D6', fontWeight: 'bold', fontSize: 15, textAlign: 'center', letterSpacing: 0.2 }}>Don't have an account? Register</Text>
      </TouchableOpacity>
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  eyeIcon: {
    fontSize: 18,
    color: '#7D8A9C',
  },
  signInBtn: {
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

export default LoginScreen;