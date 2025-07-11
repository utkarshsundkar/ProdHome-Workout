import React, { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';

const ACTIVITY_LEVELS = [
  {
    emoji: '🧑‍💻',
    title: 'Low',
    subtitle: 'Little to no exercise',
  },
  {
    emoji: '🚶‍♂️',
    title: 'Moderate',
    subtitle: 'Exercise or sports 1-3 days a week',
  },
  {
    emoji: '🏃‍♂️',
    title: 'High',
    subtitle: 'Exercise or sports 3-5 days a week',
  },
];

export default function ActivityLevelScreen({ navigation }: any) {
  const route=useRoute();
  const {gender,age,weight,height}=route.params;
  console.log(gender,age,weight,height)
  const [selectedIndex, setSelectedIndex] = useState(1); // Default to Lightly Active

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg} />
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.stepText}>6/10</Text>
      </View>
      {/* Title */}
      <Text style={styles.title}>Select Your Activity Level</Text>
      <Text style={styles.subtitle}>Tell us about your daily activity level to tailor your workouts accordingly.</Text>
      {/* Activity List */}
      <FlatList
        data={ACTIVITY_LEVELS}
        keyExtractor={(item) => item.title}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item, index }) => {
          const isSelected = index === selectedIndex;
          return (
            <TouchableOpacity
              style={[styles.activityBox, isSelected && styles.selectedBox]}
              onPress={() => setSelectedIndex(index)}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.textCol}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
              </View>
              {isSelected && <Text style={styles.checkMark}>✔️</Text>}
            </TouchableOpacity>
          );
        }}
      />
      {/* Bottom Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.replace('extraData',{gender,age,weight,height,activityLevel: ACTIVITY_LEVELS[selectedIndex].title})}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#222',
    fontWeight: '600',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  progressBarBg: {
    position: 'absolute',
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6EAF3',
  },
  progressBarFill: {
    width: '60%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563FF',
  },
  stepText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#A0A4A8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  list: {
    flexGrow: 0,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  activityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E6EAF3',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  selectedBox: {
    borderColor: '#2563FF',
    backgroundColor: '#F3F6FD',
  },
  emoji: {
    fontSize: 28,
    marginRight: 16,
  },
  textCol: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#A0A4A8',
  },
  checkMark: {
    fontSize: 22,
    color: '#2563FF',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 'auto',
    marginBottom: 24,
  },
  skipBtn: {
    flex: 1,
    backgroundColor: '#F3F6FD',
    borderRadius: 24,
    marginRight: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: '#2563FF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueBtn: {
    flex: 1,
    backgroundColor: '#2563FF',
    borderRadius: 24,
    marginLeft: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});