import React, { useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions, Image, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

interface On4Props {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function On4({ onSwipeLeft, onSwipeRight }: On4Props) {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -50 && onSwipeLeft) {
          onSwipeLeft();
        } else if (gestureState.dx > 50 && onSwipeRight) {
          onSwipeRight();
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <LinearGradient
        colors={['#FE552B', '#FE552B']}
        style={styles.container}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
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
        {/* Top Section */}
        <View style={styles.topSection}>
          
          <View style={styles.exerciseRow}>
            <Text style={styles.exerciseName}>High Knees</Text>
            <View style={styles.repsPill}>
              <Text style={styles.repsText}>Reps · 20</Text>
            </View>
          </View>
        </View>
        {/* Center Avatar PNG */}
        <View style={styles.avatarWrap}>
          <Image source={require('../assets/human.png')} style={styles.avatarImg} resizeMode="contain" />
        </View>
        {/* Title and Subtitle */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>Track Every Move.{"\n"}Train Smarter.</Text>
          <Text style={styles.subtitle}>With motion-tracking tech, get instant feedback on your form and progress just using your phone camera</Text>
        </View>
      </LinearGradient>
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
  topSection: {
    marginTop: 56,
    paddingHorizontal: 28,
  },
  legsLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#fff2',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  repsPill: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginLeft: 10,
  },
  repsText: {
    color: '#6B5EE4',
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatarWrap: {
    position: 'absolute',
    top: height * 0.13,
    left: 0,
    width: width,
    alignItems: 'center',
    zIndex: 10,
  },
  avatarImg: {
    width: width * 0.62,
    height: height * 0.56,
  },
  textBlock: {
    position: 'absolute',
    bottom: height * 0.32,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 34,
  },
  subtitle: {
    color: '#e0e0e0',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 0,
    marginTop: 4,
  },
});