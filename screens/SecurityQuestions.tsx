import React, { useContext, useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../baseUrl.js';
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

const { height } = Dimensions.get('window');

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  'What was the name of your first pet?',
  'What was the name of your elementary school?',
  'What is your favorite food?',
];

const SecurityQuestions = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [answer, setAnswer] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const { setUser, saveOnboardingData } = useContext(AuthContext);
  const navigation: any = useNavigation()
  const route = useRoute();

  const {
    gender,
    age,
    weight,
    height,
    activityLevel,
    selectedGoal,
    selectedFrequency,
    selectedActivity,
  } = route.params || {};
  console.log( gender,
    age,
    weight,
    height,
    activityLevel,
    selectedGoal,
    selectedFrequency,
    selectedActivity)

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('tempUserId');
        setUserId(id);
      } catch (error) {
        console.error('Error fetching tempUserId:', error);
      }
    };
    fetchUserId();
  }, []);

  const handleOnboarding = async () => {
    try {
      await saveOnboardingData(
        userId,
        age,
        height,
        weight,
        gender,
        activityLevel,
        selectedGoal,
        selectedFrequency,
        selectedActivity,
        selectedQuestion,
        answer
      );
      console.log('Onboarding complete');
      navigation.replace('Home');
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </Pressable>
        <Pressable style={styles.helpBtn}>
          <Text style={styles.helpText}>Need Help?</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Security Question</Text>
      <Text style={styles.subtext}>
        Select your security question and provide the answer
      </Text>

      <View style={styles.questionList}>
        {SECURITY_QUESTIONS.map((q, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.questionBtn,
              selectedQuestion === q && styles.selectedQuestionBtn,
            ]}
            onPress={() => setSelectedQuestion(q)}
          >
            <Text
              style={[
                styles.questionText,
                selectedQuestion === q && styles.selectedQuestionText,
              ]}
            >
              {q}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.answerInput}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Your Answer"
        placeholderTextColor="#7D8A9C"
      />

      <Pressable
        onPress={handleOnboarding}
        style={({ pressed }) => [
          styles.continueBtn,
          pressed && { transform: [{ scale: 0.96 }] },
        ]}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default SecurityQuestions;

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
    color: '#7D8A9C',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#031B4E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#7D8A9C',
    textAlign: 'center',
    marginBottom: 32,
  },
  questionList: {
    width: '100%',
    marginBottom: 24,
  },
  questionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#F7F8FA',
  },
  selectedQuestionBtn: {
    borderColor: '#0093D6',
    backgroundColor: '#E3F2FD',
  },
  questionText: {
    color: '#031B4E',
    fontSize: 15,
  },
  selectedQuestionText: {
    color: '#0093D6',
    fontWeight: 'bold',
  },
  answerInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 16,
    color: '#031B4E',
    backgroundColor: '#fff',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  continueBtn: {
    width: '85%',
    backgroundColor: '#0093D6',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
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
