import AsyncStorage from '@react-native-async-storage/async-storage';

const EXERCISES_KEY = 'performedExercises';

export async function addPerformedExercises(exerciseNames) {
  try {
    const existing = await AsyncStorage.getItem(EXERCISES_KEY);
    let all = existing ? JSON.parse(existing) : [];
    all = all.concat(exerciseNames);
    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(all));
  } catch (e) {
    // handle error
  }
}

export async function getPerformedExercises() {
  try {
    const existing = await AsyncStorage.getItem(EXERCISES_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    return [];
  }
} 