import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface FloatingBottomProps {
  page: number;
  totalPages: number;
  navigation: NavigationProp<any>;
}

export default function FloatingBottom({ page, totalPages, navigation }: FloatingBottomProps) {
  return (
    <View style={styles.bottomContent}>
      <View style={styles.dotsRow}>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <View key={idx} style={[styles.dot, { opacity: page === idx ? 1 : 0.4 }]} />
        ))}
      </View>
      <View style={styles.authButtons}>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signupButtonText}>Signup</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.termsText}>
        By continuing you agree Terms of Services & Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContent: {
    position: 'absolute',
    bottom: 48,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 0,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginHorizontal: 6,
  },
  authButtons: {
    width: '100%',
    gap: 4,
    marginBottom: 8,
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#222',
    borderRadius: 24,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  termsText: {
    color: '#e0e0e0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});