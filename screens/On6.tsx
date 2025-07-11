import React from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions, Image, TouchableOpacity } from 'react-native';
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

export default function On6() {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#FE552B", "#FE552B"]}
        style={styles.container}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#FE552B" translucent />
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
        {/* Title */}
        <Text style={styles.title}>Custom{"\n"}Workout</Text>
        {/* Workout Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Image source={{ uri: 'https://img.icons8.com/color/48/000000/calendar--v1.png' }} style={styles.cardIcon} />
            <View>
              <Text style={styles.cardDay}>Monday</Text>
              <Text style={styles.cardType}>Full Body</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={styles.editDayBtn}><Text style={styles.editDayText}>Edit Day</Text></TouchableOpacity>
            <TouchableOpacity style={styles.addExBtn}><Text style={styles.addExText}>Add Exercises</Text></TouchableOpacity>
          </View>
        </View>
        {/* Main Text */}
        <View style={styles.textBlock}>
          <Text style={styles.mainTitle}>Your Goals{"\n"}Your Plan</Text>
          <Text style={styles.subText}>Build custom workouts tailored to your fitness goals whether it's fat loss, muscle gain, or endurance.\nWe adapt to you, not the other way around.</Text>
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
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 56,
    marginLeft: 24,
    marginBottom: 24,
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  cardDay: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardType: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  editDayBtn: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginRight: 8,
  },
  editDayText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addExBtn: {
    backgroundColor: '#3E4DB8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  addExText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textBlock: {
    width: '100%',
    position: 'absolute',
    bottom: 240,
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  mainTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    marginTop: 10,
  },
  subText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'left',
    opacity: 0.9,
    marginTop: 0,
  },
}); 