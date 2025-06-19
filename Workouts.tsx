import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';

const Workouts = () => {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workouts</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.placeholderText}>Your workouts will appear here.</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FFA726',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 18,
    color: '#FFA726',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default Workouts; 