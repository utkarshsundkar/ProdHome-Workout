import React from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FloatingBottom from './FloatingBottom';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const DOTS = Array.from({ length: 80 }).map(() => {
  const size = Math.random() * 4 + 1;
  return {
    left: Math.random() * width,
    top: Math.random() * height,
    width: size,
    height: size,
    borderRadius: size / 2,
    opacity: Math.random() * 0.5 + 0.1,
  };
});

export default function On5() {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#FE552B", "#FE552B"]}
        style={styles.container}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#FE552C" translucent />
        {/* Static Dots */}
        {DOTS.map((dot, idx) => (
          <View key={idx} style={[styles.dotDecoration, dot]} />
        ))}
        {/* Concentric Circles */}
        <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
          <Circle cx={width / 2} cy={height * 0.32} r={width * 0.3} stroke="#F5F6FA" strokeOpacity={0.08} strokeWidth="2" fill="none" />
          <Circle cx={width / 2} cy={height * 0.32} r={width * 0.2} stroke="#F5F6FA" strokeOpacity={0.12} strokeWidth="2" fill="none" />
          <Circle cx={width / 2} cy={height * 0.32} r={width * 0.1} stroke="#F5F6FA" strokeOpacity={0.18} strokeWidth="2" fill="none" />
        </Svg>
        {/* Focus Mode Title */}
        <Text style={styles.focusMode}>Focus Mode</Text>
        {/* 3D Pushup Figure (replace with your asset if available) */}
        <View style={styles.figureWrap}>
          <Image source={require('../assets/Focus.png')} style={styles.figureImg} resizeMode="contain" />
        </View>
        {/* Main Text */}
        <View style={styles.textBlock}>
          <Text style={styles.mainTitle}>No Shortcuts, Just{"\n"}Clean Reps</Text>
          <Text style={styles.subText}>Form over fluff. Only clean reps are counted.\nMess up? Retry. Master every rep, the right way.</Text>
        </View>
      </LinearGradient>
      {/* FloatingBottom will be attached by Onboarding, not here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dotDecoration: {
    position: 'absolute',
    backgroundColor: '#fff',
    zIndex: 0,
  },
  focusMode: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    letterSpacing: 1.5,
  },
  figureWrap: {
    width: width,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 0,
  },
  figureImg: {
    width: 280,
    height: 240,
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  mainTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  subText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 0,
  },
}); 