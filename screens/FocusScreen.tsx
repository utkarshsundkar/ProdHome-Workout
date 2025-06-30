import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  DeviceEventEmitter,
  Alert,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  Platform,
  TextInput,
} from 'react-native';
import {
  configure,
  startAssessment,
  startCustomAssessment,
  setSessionLanguage,
  startCustomWorkout,
  startWorkoutProgram,
  setEndExercisePreferences,
  setCounterPreferences,
} from '@sency/react-native-smkit-ui';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout';
import EditText from '../components/EditText';
import ThreeCheckboxes from '../components/ThreeCheckboxes';
import React from 'react';
import PlanSection from '../components/PlanSection';
import PropTypes from 'prop-types';
import { useIsFocused } from '@react-navigation/native';
import { Svg, Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addPerformedExercises } from '../utils/exerciseTracker';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const playIconColors = ['#C7B8F9', '#B8F9D7', '#F9B8B8', '#F9EBB8', '#B8E6F9'];
const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Add this helper function near the top, after imports:
function formatExerciseName(name) {
  return name
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

const App = ({ isNightMode, setIsNightMode, inFocusMode, setInFocusMode }) => {
  const [didConfig, setDidConfig] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showWFPUI, setWPFUI] = React.useState(false);
  const [week, setWeek] = React.useState('1');
  const [bodyZone, setBodyZone] = React.useState(SMWorkoutLibrary.BodyZone.FullBody);
  const [difficulty, setDifficulty] = React.useState(SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty);
  const [duration, setDuration] = React.useState(SMWorkoutLibrary.WorkoutDuration.Long);
  const [language, setLanguage] = React.useState(SMWorkoutLibrary.Language.English);
  const [name, setName] = React.useState('YOUR_PROGRAM_ID');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [summaryMessage, setSummaryMessage] = React.useState('');
  const [parsedSummaryData, setParsedSummaryData] = React.useState<any>(null);
  const [selectedExercises, setSelectedExercises] = React.useState<{ name: string, duration: number }[]>([]);
  const [creditScore, setCreditScore] = React.useState(0);
  const [performanceAnalysis, setPerformanceAnalysis] = React.useState<{ strengths: string[], improvements: string[] }>({ strengths: [], improvements: [] });

  // New state for the exercise selection modal
  const [exerciseSelectionModalVisible, setExerciseSelectionModalVisible] = React.useState(false);

  // New state variables for the assessment info modal
  const [assessmentInfoModalVisible, setAssessmentInfoModalVisible] = React.useState(false);
  const [currentAssessmentExercises, setCurrentAssessmentExercises] = React.useState<any[]>([]);
  const [currentAssessmentType, setCurrentAssessmentType] = React.useState<string | null>(null); // To store the category type
  const [hasRestarted, setHasRestarted] = React.useState(false);

  const [showPlanModal, setShowPlanModal] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null);
  const [selectedLevel, setSelectedLevel] = React.useState('beginner');
  const [startDisabled, setStartDisabled] = React.useState(false);

  const [retryReason, setRetryReason] = React.useState('');
  const exercisesToRetryRef = React.useRef<any[]>([]);

  const isFocused = useIsFocused();

  const [todayCleanReps, setTodayCleanReps] = useState(0);
  const [todayCleanTime, setTodayCleanTime] = useState(0);

  // Define exercises for the Focus Mode assessment
  const focusAssessmentExercises = [
    { name: 'Push-ups', reps: 10 },
    { name: 'Squats', reps: 10 },
    { name: 'Jumping Jacks', reps: 20 },
  ];

  // Add level durations mapping
  const levelDurations = {
    beginner: 30,
    performer: 60,
    advanced: 120
  };

  // Plan exercise data (example)
  const planData = [
    {
      id: 1,
      name: 'Full Stack Fitness',
      level: 'All Levels',
      time: '30-45 min',
      focus: 'Full Body',
      image: require('../assets/Trial.png'),
      exercises: [
        {
          name: 'Push-ups',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          }
        },
        {
          name: 'Squats',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          }
        },
        {
          name: 'Plank',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 20,
            performer: 30,
            advanced: 40
          }
        }
      ]
    },
    {
      id: 2,
      name: 'Fat Burner',
      level: 'All Levels',
      time: '20-30 min',
      focus: 'Cardio',
      image: require('../assets/Trial2.png'),
      exercises: [
        {
          name: 'Jumping Jacks',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          }
        },
        {
          name: 'High Knees',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 20,
            performer: 30,
            advanced: 40
          }
        },
        {
          name: 'Push-ups',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          }
        },
        {
          name: 'Skater Hops',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          }
        },
        {
          name: 'Jumps',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          }
        }
      ]
    },
    {
      id: 'plank-core-stability',
      name: 'Plank & Core Stability',
      level: 'Beginner',
      time: '4 min',
      focus: 'Core',
      image: require('../assets/plankM.png'),
      exercises: [
        {
          name: 'High Plank',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Side Plank',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Tuck Hold',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Plank',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Shoulder Taps Plank',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Shoulder Press',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Overhead Squat',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Reverse Sit to Table Top',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Glute Bridge',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Oblique Crunches',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        },
        {
          name: 'Crunches',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/plankM.png')
        }
      ]
    },
    {
      id: 'mobility-stretch',
      name: 'Mobility & Stretch',
      level: 'Beginner',
      time: '5 min',
      focus: 'Mobility',
      image: require('../assets/MobileM.png'),
      exercises: [
        {
          name: 'Hamstring mobility',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/MobileM.png')
        },
        {
          name: 'Standing hamstring mobility',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/MobileM.png')
        },
        {
          name: 'Side Bend Left',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/MobileM.png')
        },
        {
          name: 'Side Bend Right',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/MobileM.png')
        },
        {
          name: 'Standing Knee Raise Left',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/MobileM.png')
        },
        {
          name: 'Standing Knee Raise Right',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/MobileM.png')
        },
        {
          name: 'Jefferson curl',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/MobileM.png')
        },
        {
          name: 'Side Lunge Right',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/MobileM.png')
        },
        {
          name: 'Side Lunge Left',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 10,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/MobileM.png')
        }
      ]
    },
    {
      id: 'cardio-basic',
      name: 'Cardio Basic',
      level: 'Beginner',
      time: '8 min',
      focus: 'Cardio',
      image: require('../assets/JumpingJacks.png'),
      exercises: [
        {
          name: 'Jumping Jacks',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          },
          image: require('../assets/JumpingJacks.png')
        },
        {
          name: 'High Knees',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 20,
            performer: 30,
            advanced: 40
          },
          image: require('../assets/JumpingJacks.png')
        },
        {
          name: 'Ski Jumps',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          },
          image: require('../assets/JumpingJacks.png')
        },
        {
          name: 'Skater Hops',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          },
          image: require('../assets/JumpingJacks.png')
        },
        {
          name: 'Jumps',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          },
          image: require('../assets/JumpingJacks.png')
        }
      ]
    },
    {
      id: 'cardio-hardcore',
      name: 'Cardio Hardcore',
      level: 'Advanced',
      time: '12 min',
      focus: 'Cardio',
      image: require('../assets/JumpingJacks.png'),
      exercises: [
        {
          name: 'Jumping Jacks',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          },
          image: require('../assets/JumpingJacks.png')
        },
        {
          name: 'High Knees',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 20,
            performer: 30,
            advanced: 40
          },
          image: require('../assets/JumpingJacks.png')
        },
        {
          name: 'Ski Jumps',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          },
          image: require('../assets/JumpingJacks.png')
        },
        {
          name: 'Skater Hops',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          },
          image: require('../assets/JumpingJacks.png')
        },
        {
          name: 'Lunge',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 12,
            performer: 20,
            advanced: 30
          },
          image: require('../assets/JumpingJacks.png')
        },
        {
          name: 'Jumps',
          duration: {
            beginner: 30,
            performer: 60,
            advanced: 120
          },
          reps: {
            beginner: 15,
            performer: 25,
            advanced: 35
          },
          image: require('../assets/JumpingJacks.png')
        },
       
      ]
    },
  ];

  // Map display names to Sency detector IDs
  const exerciseIdMap = {
    'Push-ups': 'PushupRegular',
    'Squats': 'SquatRegular',
    'Plank': 'PlankHighStatic',
    'High Plank': 'PlankHighStatic',
    'Side Plank': 'PlankSideLowStatic',
    'Tuck Hold': 'TuckHold',
    'Hamstring mobility': 'HamstringMobility',
    'Standing hamstring mobility': 'StandingHamstringMobility',
    'Side Bend Left': 'StandingSideBendLeft',
    'Side Bend Right': 'StandingSideBendRight',
    'Standing knee raises': 'HighKnees',
    'Standing Knee Raise Left': 'StandingKneeRaiseLeft',
    'Standing Knee Raise Right': 'StandingKneeRaiseRight',
    'Jefferson curl': 'JeffersonCurlRight',
    'Jumping Jacks': 'JumpingJacks',
    'High Knees': 'HighKnees',
    'Ski Jumps': 'SkiJumps',
    'Skater Hops': 'SkaterHops',
    'Lunge': 'LungeFront',
    'Jumps': 'Jumps',
    // Add more mappings for common variations
    'Pushup': 'PushupRegular',
    'PushupRegular': 'PushupRegular',
    'Squat': 'SquatRegular',
    'SquatRegular': 'SquatRegular',
    'PlankHighStatic': 'PlankHighStatic',
    'PlankSideLowStatic': 'PlankSideLowStatic',
    'TuckHold': 'TuckHold',
    'StandingAlternateToeTouch': 'StandingAlternateToeTouch',
    'StandingSideBendRight': 'StandingSideBendRight',
    'HighKnees': 'HighKnees',
    'JeffersonCurlRight': 'JeffersonCurlRight',
    'JumpingJacks': 'JumpingJacks',
    'SkiJumps': 'SkiJumps',
    'SkaterHops': 'SkaterHops',
    'StandingKneeRaiseLeft': 'StandingKneeRaiseLeft',
    'Side Lunge Right': 'LungeSideRight',
    'Side Lunge Left': 'LungeSideLeft',
    'Shoulder Taps Plank': 'PlankHighShoulderTaps',
    'Shoulder Press': 'ShouldersPress',
    'Overhead Squat': 'SquatRegularOverheadStatic',
    'Reverse Sit to Table Top': 'ReverseSitToTableTop',
    'Glute Bridge': 'GlutesBridge',
    'Oblique Crunches': 'StandingObliqueCrunches',
    'Crunches': 'Crunches',
  };

  // Map display names to scoring type and UI
  const exerciseScoringMap = {
    'Push-ups': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Squats': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Plank': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'High Plank': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'Side Plank': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'Tuck Hold': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'Hamstring mobility': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Standing hamstring mobility': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Side Bend Left': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'Side Bend Right': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'Standing knee raises': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Standing Knee Raise Left': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'Standing Knee Raise Right': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'Jefferson curl': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'Jumping Jacks': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'High Knees': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Ski Jumps': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Skater Hops': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Lunge': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Side Lunge Right': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Side Lunge Left': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Jumps': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    // Add more mappings for common variations
    'Pushup': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'PushupRegular': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Squat': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'SquatRegular': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'PlankHighStatic': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'PlankSideLowStatic': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'TuckHold': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'StandingAlternateToeTouch': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'StandingSideBendRight': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'HighKnees': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'JeffersonCurlRight': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'JumpingJacks': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'SkiJumps': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'SkaterHops': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'StandingKneeRaiseLeft': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'LungeSide': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Shoulder Taps Plank': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Shoulder Press': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Overhead Squat': { type: SMWorkoutLibrary.ScoringType.Time, ui: [SMWorkoutLibrary.UIElement.Timer] },
    'Reverse Sit to Table Top': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Glute Bridge': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Oblique Crunches': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
    'Crunches': { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] },
  };

  // ... inside App component, before useEffect and any use of getTodayKey ...
  const getTodayKey = () => `focusScore-${new Date().toISOString().slice(0, 10)}`;

  useEffect(() => {
    configureSMKitUI();
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    const didExitWorkoutSubscription = DeviceEventEmitter.addListener('didExitWorkout', params => {
      handleEvent(params.summary);
      console.log('Received didExitWorkout event with message:', params.summary);
    });

    const workoutDidFinishSubscription = DeviceEventEmitter.addListener('workoutDidFinish', params => {
      handleEvent(params.summary);
      console.log('Received workoutDidFinish event with message:', params.summary);
    });

    return () => {
      didExitWorkoutSubscription.remove();
      workoutDidFinishSubscription.remove();
    };
  }, [isFocused]);

  // Load today's score on mount
  useEffect(() => {
    const loadTodayScore = async () => {
      try {
        const stored = await AsyncStorage.getItem(getTodayKey());
        if (stored) {
          const { cleanReps, cleanTime } = JSON.parse(stored);
          setTodayCleanReps(cleanReps);
          setTodayCleanTime(cleanTime);
        }
      } catch (e) {
        // Ignore errors
      }
    };
    loadTodayScore();
  }, []);

  const analyzePerformance = (data: any) => {
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (!data.exercises || data.exercises.length === 0) {
      return { strengths, improvements };
    }

    // Analyze each exercise
    data.exercises.forEach(exercise => {
      const exerciseName = exercise.pretty_name || exercise.exercise_id || 'Unknown Exercise';
      const score = exercise.total_score || 0;
      const repsPerfect = exercise.reps_performed_perfect || 0;
      const timePerfect = exercise.time_in_position_perfect || 0;

      // Example analysis logic (customize based on your scoring system and exercise types)
      if (score >= 8) { // High score threshold
        strengths.push(`${exerciseName}: Excellent performance with a score of ${score}.`);
      } else if (score <= 3) { // Low score threshold
        improvements.push(`${exerciseName}: Room for improvement. Current score: ${score}.`);
      }

      // Analyze reps and time if available
      if (repsPerfect > 0) {
        strengths.push(`${exerciseName}: Completed ${repsPerfect} perfect repetitions.`);
      }
      if (timePerfect > 0) {
        strengths.push(`${exerciseName}: Held correct position for ${timePerfect.toFixed(1)} seconds.`);
      }
    });

    return { strengths, improvements };
  };

  const handleEvent = async (summary) => {
    console.log('handleEvent called for summary:', summary);
    if (!isFocused) return;
    try {
      setModalVisible(false);
      setParsedSummaryData(null);
      setTimeout(() => {
        setSummaryMessage(summary);
        let parsed: { exercises?: any[] } | null = null;
        try {
          parsed = JSON.parse(summary);
        } catch (e) {
          parsed = null;
        }
        setParsedSummaryData(parsed);
        // Track only exercises with at least one rep/time
        if (parsed && parsed.exercises && Array.isArray(parsed.exercises)) {
          const performed = parsed.exercises.filter(ex => {
            const exerciseName = ex.exercise_info?.pretty_name || ex.exercise_info?.exercise_id || ex.pretty_name || ex.exercise_id || ex.name;
            const scoring = exerciseScoringMap[exerciseName] || { type: SMWorkoutLibrary.ScoringType.Reps };
            if (scoring.type === SMWorkoutLibrary.ScoringType.Time) {
              const total = ex.time_in_position ?? ex.exercise_info?.time_in_position ?? 0;
              return total > 0;
            } else {
              const reps = ex.reps_performed ?? ex.exercise_info?.reps_performed ?? 0;
              return reps > 0;
            }
          }).map(ex =>
            ex.exercise_info?.pretty_name ||
            ex.exercise_info?.exercise_id ||
            ex.pretty_name ||
            ex.exercise_id ||
            ex.name
          );
          if (performed.length > 0) addPerformedExercises(performed);
          if (performed.length > 0) DeviceEventEmitter.emit('performedExercisesUpdated');
        }
        setModalVisible(true);
        if (parsed && parsed.exercises) {
          console.log('Summary after assessment:', parsed.exercises.map((e) => ({
            name: e.pretty_name || e.exercise_id,
            total: e.reps_performed,
            clean: e.reps_performed_perfect
          })));
        }
      }, 200);
    } catch (e) {
      console.error('Error handling event:', e);
      Alert.alert('Error', 'Failed to process assessment results.');
    }
  };

  const onDuration = (index) => {
    setDuration(index === 0 ? SMWorkoutLibrary.WorkoutDuration.Long : SMWorkoutLibrary.WorkoutDuration.Short);
  };

  const onLanguage = (index) => {
    setLanguage(index === 0 ? SMWorkoutLibrary.Language.Hebrew : SMWorkoutLibrary.Language.English);
  };

  const onBodyZone = (index) => {
    setBodyZone(
      index === 0 ? SMWorkoutLibrary.BodyZone.UpperBody :
      index === 1 ? SMWorkoutLibrary.BodyZone.LowerBody :
      SMWorkoutLibrary.BodyZone.FullBody
    );
  };

  const onDifficulty = (index) => {
    setDifficulty(
      index === 0 ? SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty :
      index === 1 ? SMWorkoutLibrary.WorkoutDifficulty.MidDifficulty :
      SMWorkoutLibrary.WorkoutDifficulty.HighDifficulty
    );
  };

  const handleExerciseSelect = (exerciseName: string) => {
    setSelectedExercises(prev => {
      const index = prev.findIndex(e => e.name === exerciseName);
      if (index > -1) {
        // Use filter to create a new array without the selected exercise
        return prev.filter((_, i) => i !== index);
      } else {
        // Add the new exercise with a default duration
        return [...prev, { name: exerciseName, duration: 30 }];
      }
    });
  };

  const handleCategorySelect = async (category: string) => {
    if (!didConfig) {
      showAlert('Configuration Required', 'Please wait for configuration to complete.');
      return;
    }

    let exercisesToShow: any[] = [];
    let assessmentToStart: string | null = category;

    try {
      switch (category) {
        case 'Burn Calories Faster':
          const burnCaloriesPlans = planData.filter(plan => 
            plan.id === 'fat-burner' || 
            plan.id === 'hiit-workout' || 
            plan.id === 'plank-core-stability'
          );
          setSelectedPlan(burnCaloriesPlans[0]); // Show the first plan by default
          setShowPlanModal(true);
          break;
        case 'FocusMode':
          await startFocusModeAssessment();
          break;
        // ... existing code ...
      }
      // ... existing code ...
    } catch (error) {
      console.error('Error preparing assessment:', error);
      Alert.alert('Error', 'Failed to prepare assessment. Please try again.');
    }
  };

  // New function to start the assessment from the info modal
  const startAssessmentFromInfoModal = async () => {
    setAssessmentInfoModalVisible(false); // Close the info modal
    setIsLoading(true); // Show loading indicator
    setHasRestarted(false); // Reset restart flag on manual start

    try {
      switch (currentAssessmentType) {
        case 'Fitness':
          await startAssessmentSession(
            SMWorkoutLibrary.AssessmentTypes.Fitness,
            true,
            ''
          );
          break;
        case 'Movement':
          await startAssessmentSession(
            SMWorkoutLibrary.AssessmentTypes.Body360,
            true,
            ''
          );
          break;
        case 'Cardio':
          await startAssessmentSession(
            SMWorkoutLibrary.AssessmentTypes.Fitness, // Using Fitness type for Cardio
            true,
            ''
          );
          break;
        case 'Strength':
           // Start the predefined strength assessment if you have a separate function for it,
           // or if it uses startCustomAssessment with the specific strength exercises.
           // For now, let's assume you might have a startStrengthAssessment function or
           // it uses startCustomAssessment with the defined strengthExercises.
           // Example using startCustomAssessment with the previously defined exercises:
           const strengthExercises = [
            new SMWorkoutLibrary.SMExercise(
              "Burpees",
              35,
              "BurpeesRegular",
              null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
              "BurpeesRegular",
              "",
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              "Froggers",
              35,
              "FroggersRegular",
              null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
              "FroggersRegular",
              "",
              null
            )
          ];
           const strengthWorkout = new SMWorkoutLibrary.SMWorkout('strength', 'Strength Assessment', null, null, strengthExercises, null, null, null);
           await startCustomAssessment(strengthWorkout, null, true, false); // Assuming showSummary is false for these
          break;
        case 'Custom Fitness':
          await startSMKitUICustomAssessment();
          break;
        default:
          console.error('Unknown assessment type to start:', currentAssessmentType);
          Alert.alert('Start Error', 'Could not determine the assessment type to start.');
          break;
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      Alert.alert('Start Error', 'Failed to start assessment.');
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  const handleStartWorkout = async () => {
    if (selectedExercises.length === 0) {
      showAlert('No Exercises', 'Please select at least one exercise');
      return;
    }

    try {
      const exercises = selectedExercises.map(({ name: exerciseName }) => {
        let detectorId;
        let scoringType;
        let targetReps: number | null = null;
        let targetTime: number | null = null;
        let uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];

        switch(exerciseName) {
          case 'High Plank':
            detectorId = 'PlankHighStatic';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 30;
            uiElements = [SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Air Squat':
            detectorId = 'SquatRegular';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            break;
          case 'Push-ups':
            detectorId = 'PushupRegular';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            break;
          case 'OH Squat':
            detectorId = 'SquatRegularOverheadStatic';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 20;
            uiElements = [SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Knee Raise Left':
            detectorId = 'StandingKneeRaiseLeft';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 15;
            uiElements = [SMWorkoutLibrary.UIElement.GaugeOfMotion, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Knee Raise Right':
            detectorId = 'StandingKneeRaiseRight';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 15;
            uiElements = [SMWorkoutLibrary.UIElement.GaugeOfMotion, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Side Bend Left':
            detectorId = 'StandingSideBendLeft';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 30;
            uiElements = [SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Side Bend Right':
            detectorId = 'StandingSideBendRight';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 30;
            uiElements = [SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Standing Alternate Toe Touch':
            detectorId = 'StandingAlternateToeTouch';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Jefferson Curl':
            detectorId = 'JeffersonCurlRight';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 20;
            uiElements = [SMWorkoutLibrary.UIElement.GaugeOfMotion, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Alternate Windmill Toe Touch':
            detectorId = 'AlternateWindmillToeTouch';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'AlternateWindmillToeTouch',           // name
              35,                                     // totalSeconds
              'AlternateWindmillToeTouch',            // videoInstruction
              null,                                   // exerciseIntro
              uiElements,                             // UI elements
              'AlternateWindmillToeTouch',            // detector
              '',                                     // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,                          // scoring type based on exercise
                0.3,                                  // threshold
                targetTime,                           // targetTime (for plank and static holds)
                targetReps,                           // targetReps (for dynamic exercises)
                null,                                 // targetDistance
                null                                  // targetCalories
              ),
              '',                                     // failedSound
              exerciseName,                           // exerciseTitle (display name)
              'Complete the exercise',                 // subtitle
              'Reps',                                 // scoreTitle
              'clean reps'                            // scoreSubtitle
            );
          case 'Burpees':
            detectorId = 'Burpees';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'Burpees',           // name
              35,                     // totalSeconds
              'Burpees',            // videoInstruction
              null,                  // exerciseIntro
              uiElements,            // UI elements
              'Burpees',            // detector
              '',                    // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,         // scoring type based on exercise
                0.3,                 // threshold
                targetTime,          // targetTime (for plank and static holds)
                targetReps,          // targetReps (for dynamic exercises)
                null,                // targetDistance
                null                 // targetCalories
              ),
              '',                    // failedSound
              exerciseName,          // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',  // scoreTitle
              'clean reps'  // scoreSubtitle
            );
          case 'Crunches':
            detectorId = 'Crunches';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 15;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Froggers':
            detectorId = 'Froggers';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'Froggers',           // name
              35,                     // totalSeconds
              'Froggers',            // videoInstruction
              null,                  // exerciseIntro
              uiElements,            // UI elements
              'Froggers',            // detector
              '',                    // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,         // scoring type based on exercise
                0.3,                 // threshold
                targetTime,          // targetTime (for plank and static holds)
                targetReps,          // targetReps (for dynamic exercises)
                null,                // targetDistance
                null                 // targetCalories
              ),
              '',                    // failedSound
              exerciseName,          // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',  // scoreTitle
              'clean reps'  // scoreSubtitle
            );
          case 'Glute Bridge':
            detectorId = 'GlutesBridge';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'GlutesBridge',           // name
              35,                         // totalSeconds
              'GlutesBridge',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'GlutesBridge',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'High Knees':
            detectorId = 'HighKnees';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 20;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'HighKnees',           // name
              35,                     // totalSeconds
              'HighKnees',            // videoInstruction
              null,                  // exerciseIntro
              uiElements,            // UI elements
              'HighKnees',            // detector
              '',                    // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,         // scoring type based on exercise
                0.3,                 // threshold
                targetTime,          // targetTime (for plank and static holds)
                targetReps,          // targetReps (for dynamic exercises)
                null,                // targetDistance
                null                 // targetCalories
              ),
              '',                    // failedSound
              exerciseName,          // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',  // scoreTitle
              'clean reps'  // scoreSubtitle
            );
          case 'Jumping Jacks':
            detectorId = 'JumpingJacks';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 20;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'JumpingJacks',           // name
              35,                         // totalSeconds
              'JumpingJacks',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'JumpingJacks',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Jumps':
            detectorId = 'Jumps';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 15;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'Jumps',           // name
              35,                         // totalSeconds
              'Jumps',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'Jumps',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Lateral Raises':
            detectorId = 'LateralRaise';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'LateralRaise',           // name
              35,                         // totalSeconds
              'LateralRaise',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'LateralRaise',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Lunge':
            detectorId = 'LungeFront';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'LungeFront',           // name
              35,                         // totalSeconds
              'LungeFront',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'LungeFront',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Lunge Jump':
            detectorId = 'LungeJump';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'LungeJump',           // name
              35,                         // totalSeconds
              'LungeJump',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'LungeJump',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Side Lunge Right':
            detectorId = 'LungeSideRight';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'LungeSideRight',           // name
              35,                         // totalSeconds
              'LungeSideRight',           // videoInstruction
              null,                       // exerciseIntro
              uiElements,                 // UI elements
              'LungeSideRight',           // detector
              '',                         // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,              // scoring type based on exercise
                0.3,                      // threshold
                null,                     // targetTime (should be null for reps-based)
                targetReps,               // targetReps (for dynamic exercises)
                null,                     // targetDistance
                null                      // targetCalories
              ),
              '',                         // failedSound
              exerciseName,               // exerciseTitle (display name)
              'Complete the exercise',    // subtitle
              'Reps',                     // scoreTitle
              'clean reps'                // scoreSubtitle
            );
          case 'Mountain Climber Plank':
            detectorId = 'MountainClimberPlank';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 20;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'MountainClimberPlank',           // name
              35,                         // totalSeconds
              'MountainClimberPlank',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'MountainClimberPlank',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Shoulder Taps Plank':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'PlankHighShoulderTaps',           // name
              35,                         // totalSeconds
              'PlankHighShoulderTaps',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'PlankHighShoulderTaps',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Reverse Sit to Table Top':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'ReverseSitToTableTop',           // name
              35,                         // totalSeconds
              'ReverseSitToTableTop',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'ReverseSitToTableTop',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                12,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Skater Hops':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'SkaterHops',           // name
              35,                         // totalSeconds
              'SkaterHops',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'SkaterHops',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Ski Jumps':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'SkiJumps',           // name
              35,                         // totalSeconds
              'SkiJumps',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'SkiJumps',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Rotation Jab Squat':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'SquatAndRotationJab',           // name
              35,                         // totalSeconds
              'SquatAndRotationJab',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'SquatAndRotationJab',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                12,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Bicycle Crunches':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'StandingBicycleCrunches',           // name
              35,                         // totalSeconds
              'StandingBicycleCrunches',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'StandingBicycleCrunches',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Oblique Crunches':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'StandingObliqueCrunches',           // name
              35,                         // totalSeconds
              'StandingObliqueCrunches',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'StandingObliqueCrunches',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Shoulder Press':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'ShouldersPress',           // name
              35,                         // totalSeconds
              'ShouldersPress',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'ShouldersPress',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                12,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Side Plank':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'PlankSideLowStatic',           // name
              35,                         // totalSeconds
              'PlankSideLowStatic',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.Timer], // UI elements
              'PlankSideLowStatic',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Time,  // scoring type
                0.3,                     // threshold
                30,                      // targetTime
                null,                    // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Hold the position',   // subtitle
              'Time',                    // scoreTitle
              'seconds'               // scoreSubtitle
            );
          case 'Tuck Hold':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'TuckHold',           // name
              35,                         // totalSeconds
              'TuckHold',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.Timer], // UI elements
              'TuckHold',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Time,  // scoring type
                0.3,                     // threshold
                30,                      // targetTime
                null,                    // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Hold the position',   // subtitle
              'Time',                    // scoreTitle
              'seconds'               // scoreSubtitle
            );
          case 'Side Lunge Left':
            detectorId = 'LungeSideLeft';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'LungeSideLeft',           // name
              35,                         // totalSeconds
              'LungeSideLeft',           // videoInstruction
              null,                       // exerciseIntro
              uiElements,                 // UI elements
              'LungeSideLeft',           // detector
              '',                         // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,              // scoring type based on exercise
                0.3,                      // threshold
                null,                     // targetTime (should be null for reps-based)
                targetReps,               // targetReps (for dynamic exercises)
                null,                     // targetDistance
                null                      // targetCalories
              ),
              '',                         // failedSound
              exerciseName,               // exerciseTitle (display name)
              'Complete the exercise',    // subtitle
              'Reps',                     // scoreTitle
              'clean reps'                // scoreSubtitle
            );
          default:
            if (exerciseName === 'Lunge Jump') {
              detectorId = 'LungeJump';
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 12;
              uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            } else if (exerciseName === 'Lateral Raises') {
              detectorId = 'LateralRaise';
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 12;
              uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            } else if (exerciseName === 'Shoulder Taps Plank') {
              detectorId = 'PlankHighShoulderTaps';
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 20;
              uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            } else if (exerciseName === 'Rotation Jab Squat') {
              detectorId = 'SquatAndRotationJab';
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 12;
              uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            } else {
              detectorId = exerciseName;
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 10;
            }
            break;
        }

        return new SMWorkoutLibrary.SMAssessmentExercise(
          detectorId,           // name (using detector ID as name for consistency)
          35,                     // totalSeconds
          exerciseName === 'Alternate Windmill Toe Touch' ? 'AlternateWindmillToeTouch' : detectorId,            // videoInstruction
          null,                  // exerciseIntro
          uiElements,            // UI elements
          detectorId,            // detector
          '',                    // successSound
          new SMWorkoutLibrary.SMScoringParams(
            scoringType,         // scoring type based on exercise
            0.3,                 // threshold
            targetTime,          // targetTime (for plank and static holds)
            targetReps,          // targetReps (for dynamic exercises)
            null,                // targetDistance
            null                 // targetCalories
          ),
          '',                    // failedSound
          exerciseName,          // exerciseTitle (display name)
          scoringType === SMWorkoutLibrary.ScoringType.Time ? 'Hold the position' : 'Complete the exercise',   // subtitle
          scoringType === SMWorkoutLibrary.ScoringType.Time ? 'Time' : 'Reps',  // scoreTitle
          scoringType === SMWorkoutLibrary.ScoringType.Time ? 'seconds held' : 'clean reps'  // scoreSubtitle
        );
      });

      const workout = new SMWorkoutLibrary.SMWorkout(
        '50',
        'Custom Workout',
        null,
        null,
        exercises,
        null,
        null,
        null,
      );

      const result = await startCustomAssessment(workout, null, true, false);
      console.log('Assessment result:', result.summary);
      console.log('Did finish:', result.didFinish);
    } catch (e) {
      showAlert('Workout Error', e.message);
    }
  };

  // Modified close handler for summary modal
  const handleSummaryModalClose = async () => {
    setModalVisible(false);
  };

  // New function to start a custom assessment from the modal
  const handleStartFocusAssessment = async () => {
    if (selectedExercises.length === 0) {
      showAlert('No Exercises', 'Please select at least one exercise');
      return;
    }
    // First, close the modal
    setExerciseSelectionModalVisible(false);

    // Re-introducing a longer delay as requested to diagnose the iOS issue
    setTimeout(async () => {
      setIsLoading(true);
      try {
        const exercises = selectedExercises.map(exercise => {
          const { name, duration } = exercise;
          const detectorId = exerciseIdMap[name] || name;
          const scoring = exerciseScoringMap[name] || { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter] };
          const targetReps = 10; // Default target for rep-based exercises

          return new SMWorkoutLibrary.SMAssessmentExercise(
            detectorId,
            duration, // Use selected duration as total seconds
            detectorId,
            null,
            scoring.ui,
            detectorId,
            '',
            new SMWorkoutLibrary.SMScoringParams(
              scoring.type,
              0.3,
              scoring.type === SMWorkoutLibrary.ScoringType.Time ? duration : null,
              scoring.type === SMWorkoutLibrary.ScoringType.Reps ? targetReps : null,
              null,
              null
            ),
            '',
            name,
            scoring.type === SMWorkoutLibrary.ScoringType.Time ? 'Hold the position' : 'Complete clean reps',
            scoring.type === SMWorkoutLibrary.ScoringType.Time ? 'Time' : 'Reps',
            scoring.type === SMWorkoutLibrary.ScoringType.Time ? 'seconds held' : 'clean reps'
          );
        });

        const workout = new SMWorkoutLibrary.SMWorkout(
          'custom-focus-assessment',
          'Custom Focus Assessment',
          null,
          null,
          exercises,
          null,
          null,
          null
        );

        const result = await startCustomAssessment(workout, null, true, false);
        await handleEvent(result.summary);

      } catch (e) {
        showAlert('Assessment Error', e.message);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Increased delay to 1 second
  };

  return (
    <SafeAreaView style={[styles.safeArea, isNightMode && { backgroundColor: '#111' }]}>
      <View style={[styles.mainContainer, { flex: 1, marginTop: 4, paddingBottom: 32, justifyContent: 'flex-start' }, isNightMode && { backgroundColor: '#111' }]}>
      {isLoading && <ActivityIndicator size="large" color="#C4A484" />}
        
        {/* Focus Mode Header Section */}
        <View style={{marginTop: 4, marginBottom: 8}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 0}}>
            <Text style={{fontSize: 28, fontWeight: 'bold', color: isNightMode ? '#fff' : '#111', letterSpacing: 1}}>Focus Mode</Text>
          </View>
          <Text style={{fontSize: 15, color: isNightMode ? '#ccc' : '#333', marginBottom: 6, marginTop: -2}}>Only clean reps count</Text>
          <View style={{alignItems: 'center', marginVertical: 8}}>
            <Image 
              source={require('../assets/Focus.png')}
              style={{
                width: 320,
                height: 230,
                resizeMode: 'contain'
              }}
            />
          </View>
        </View>
        {/* Stats Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, marginHorizontal: 2 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: isNightMode ? '#fff' : '#111', fontSize: 16, fontWeight: 'bold' }}>Clean Reps</Text>
            <Text style={{ color: isNightMode ? '#fff' : '#111', fontSize: 18, fontWeight: 'bold' }}>{todayCleanReps}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: isNightMode ? '#fff' : '#111', fontSize: 16, fontWeight: 'bold' }}>Clean Time (s)</Text>
            <Text style={{ color: isNightMode ? '#fff' : '#111', fontSize: 18, fontWeight: 'bold' }}>{todayCleanTime}</Text>
          </View>
        </View>
        
       
        {/* Only show clean/score boxes and per-exercise list if there is valid summary data */}
        {parsedSummaryData && parsedSummaryData.exercises && parsedSummaryData.exercises.length > 0 && (
          // ...clean percentage and score boxes, per-exercise list...
          (() => {
            // ...existing code for clean percentage and score boxes, per-exercise list...
          })()
        )}
        <View style={{height: 1, backgroundColor: '#E53935', width: '100%', marginBottom: 8}} />
        {/* Why Focus Mode Card */}
        <View style={{backgroundColor: isNightMode ? '#222' : '#222', borderRadius: 12, padding: 10, marginBottom: 8, marginHorizontal: 2}}>
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 4}}>Why Focus Mode ?</Text>
          <Text style={{color: '#aaa', fontSize: 12, lineHeight: 16}}>
            In Focus Mode, only clean reps count. If you don't match clean reps to total reps, you'll repeat the assessment. Clean reps earn you extra credits.
          </Text>
        </View>
        {/* Start Assessment Button */}
        <TouchableOpacity
          style={{
            backgroundColor: inFocusMode ? '#22C55E' : '#E53935', // green if in focus mode, red otherwise
            borderRadius: 10,
            minHeight: 56,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 4,
            marginHorizontal: 2,
            opacity: 1,
          }}
          onPress={() => {
            if (inFocusMode) {
              setSelectedExercises([]); // Reset selection
              setExerciseSelectionModalVisible(true);
            }
          }}
          disabled={!inFocusMode}
        >
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>Choose your assessment</Text>
        </TouchableOpacity>
        {/* Start/Exit Focus Mode Button */}
        {!inFocusMode ? (
          <TouchableOpacity
            style={{backgroundColor: '#2196F3', borderRadius: 10, minHeight: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 4, marginHorizontal: 2}}
            onPress={() => setInFocusMode(true)}
          >
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>Start Focus Mode</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={{backgroundColor: isNightMode ? '#333' : '#222', borderRadius: 10, minHeight: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 4, marginHorizontal: 2}}
            onPress={() => {
              const totalReps = parsedSummaryData && parsedSummaryData.exercises
                ? parsedSummaryData.exercises.reduce((acc, ex) => acc + (ex.reps_performed || 0), 0)
                : 0;
              const cleanReps = parsedSummaryData && parsedSummaryData.exercises
                ? parsedSummaryData.exercises.reduce((acc, ex) => acc + (ex.reps_performed_perfect || 0), 0)
                : 0;
              if (totalReps === cleanReps) {
                setInFocusMode(false);
              } else {
                console.log('Focus mode exited forcefully');
              }
            }}
          >
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>Exit Focus Mode</Text>
          </TouchableOpacity>
        )}
      
        {/* Credit Counter at Top Right (restored) */}
      {/* Removed creditCounterContainer, profileSection, dark mode button, and motivational quote */}

      {/* Header Section - Remove logo and welcome text */}
      {/* <View style={styles.headerContainer}>
        <Image 
            source={require('./assets/logo1.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome to </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.titleText, { color: 'white' }]}>Ar</Text>
            <Text style={[styles.titleText, { color: '#E08714' }]}>thlete</Text>
            <Text style={[styles.titleText, { color: 'white' }]}> AI Experience</Text>
          </View>
        </View> */}

        {/* Profile Button and Motivational Quote */}
      {/* Profile Button and Motivational Quote */}
      {/* Removed profileSection, profileButton, profileIcon, motivationalQuote, featureButtonRow, featureButton, featureButtonRanks, featureButtonProgress, featureButtonTracker, featureButtonCommunity, featureButtonSelected, featureIcon, featureLabel, carouselContainer, carouselContent, bannerContainer, bannerTitle, bannerSubtitle, plansCarousel, plansCarouselContent, planContainer, planText, burnCaloriesContainer, burnCaloriesHeading, burnCaloriesDescription, fitnessMetricsSection, fitnessMetricsHeader, fitnessMetricsTitle, fitnessMetricsSeeAll, metricsCarousel, metricsCarouselContent, metricCard, scoreCard, hydrationCard, caloriesCard, metricCardTitle, chartPlaceholder, circlesPlaceholder, metricCardValue, barChartContainer, bar, lineGraphContainer, goalLine, userInputLine, progressBarContainer, progressBarFill */}

        {/* New Section: Fitness Metrics */}
        {/* Removed fitnessMetricsSection and its content */}

        {/* New Section: Burn Calories Fast */}
        {/* Removed Burn Calories Fast PlanSection */}

        {/* New Section: Plank & Mobility */}
        {/* Removed Plank & Mobility PlanSection */}

        {/* New Section: Cardio */}
        {/* Removed Cardio PlanSection */}

        {/* Move Modals outside ScrollView for iOS compatibility */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleSummaryModalClose}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.18)' }}>
          <LinearGradient
            colors={["#f5f6fa", "#ffffff"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ width: '92%', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#b6c3e0', shadowOpacity: 0.10, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 8, borderWidth: 2, borderColor: '#000' }}
          >
            {parsedSummaryData && parsedSummaryData.exercises && parsedSummaryData.exercises.length > 0 ? (() => {
              // Calculate overall clean % (sum time for time-based, reps for rep-based)
              let totalClean = 0;
              let totalPossible = 0;
              parsedSummaryData.exercises.forEach(ex => {
                const exerciseName = ex.exercise_info?.pretty_name || ex.exercise_info?.exercise_id || ex.pretty_name || ex.exercise_id || ex.name;
                const scoring = exerciseScoringMap[exerciseName] || { type: SMWorkoutLibrary.ScoringType.Reps };
                if (scoring.type === SMWorkoutLibrary.ScoringType.Time) {
                  totalClean += ex.time_in_position_perfect ?? ex.exercise_info?.time_in_position_perfect ?? 0;
                  totalPossible += ex.time_in_position ?? ex.exercise_info?.time_in_position ?? 0;
                } else {
                  totalClean += ex.reps_performed_perfect ?? ex.exercise_info?.reps_performed_perfect ?? 0;
                  totalPossible += ex.reps_performed ?? ex.exercise_info?.reps_performed ?? 0;
                }
              });
              const percent = totalPossible > 0 ? Math.round((totalClean / totalPossible) * 100) : 0;
              // Calculate average score
              const scores = parsedSummaryData.exercises.map(ex => ex.total_score ?? 0);
              const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
              const radius = 48;
              const strokeWidth = 10;
              const circumference = 2 * Math.PI * radius;
              const progress = circumference * (percent / 100);
              return (
                <>
                  {/* Overall Summary: Clean Percentage Graph and Score in Separate Boxes */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 32, paddingHorizontal: 0, maxWidth: '100%', gap: 16 }}>
                    {/* Clean Percentage Box */}
                    <LinearGradient
                      colors={["#f5f6fa", "#ffffff"]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={[styles.summaryBox, { flex: 1, borderColor: '#000', borderWidth: 2 }]}
                    >
                      <View style={{ width: 110, height: 110, justifyContent: 'center', alignItems: 'center' }}>
                        <LinearGradient
                          colors={["#f5f6fa", "#ffffff"]}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                          style={{ position: 'absolute', width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e6eaf3' }}
                        />
                        <View style={{ position: 'absolute' }}>
                          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#5b7cff', textAlign: 'center' }}>{percent}%</Text>
                          <Text style={{ fontSize: 14, color: '#7a8ca3', textAlign: 'center', fontWeight: '600' }}>Clean</Text>
                  </View>
                        <Svg width={110} height={110} style={{ position: 'absolute', left: 0, top: 0 }}>
                          <Circle cx={55} cy={55} r={radius} stroke="#e6eaf3" strokeWidth={strokeWidth} fill="none" />
                          <Circle
                            cx={55} cy={55} r={radius}
                            stroke="#5b7cff"
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={`${circumference},${circumference}`}
                            strokeDashoffset={circumference - progress}
                            strokeLinecap="round"
                            rotation="-90"
                            origin="55,55"
                          />
                        </Svg>
                        </View>
                    </LinearGradient>
                    {/* Score Box */}
                    <LinearGradient
                      colors={["#f5f6fa", "#ffffff"]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={[styles.summaryBox, { flex: 1, borderColor: '#000', borderWidth: 2 }]}
                    >
                      <Text style={{ color: '#7a8ca3', fontSize: 16, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}>Score</Text>
                      <Text style={{ color: '#5b7cff', fontSize: 36, fontWeight: 'bold', letterSpacing: 1 }}>{avgScore}</Text>
                    </LinearGradient>
                    </View>
                  {/* List each exercise with clean/total reps or time and score (no graph) */}
                  <ScrollView style={{ width: '100%', maxHeight: 400 }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}>
                    {parsedSummaryData.exercises.length > 0 ? (
                      parsedSummaryData.exercises.map((ex, idx) => {
                        const exerciseName = ex.exercise_info?.pretty_name || ex.exercise_info?.exercise_id || ex.pretty_name || ex.exercise_id || ex.name;
                        const scoring = exerciseScoringMap[exerciseName] || { type: SMWorkoutLibrary.ScoringType.Reps };
                        let clean = 0, total = 0, cleanLabel = '', totalLabel = '';
                        if (scoring.type === SMWorkoutLibrary.ScoringType.Time) {
                          clean = ex.time_in_position_perfect ?? ex.exercise_info?.time_in_position_perfect ?? 0;
                          total = ex.time_in_position ?? ex.exercise_info?.time_in_position ?? 0;
                          cleanLabel = 'Clean Time (s)';
                          totalLabel = 'Total Time (s)';
                        } else {
                          clean = ex.reps_performed_perfect ?? ex.exercise_info?.reps_performed_perfect ?? 0;
                          total = ex.reps_performed ?? ex.exercise_info?.reps_performed ?? 0;
                          cleanLabel = 'Clean Reps';
                          totalLabel = 'Total Reps';
                        }
                        return (
                          <View key={idx} style={{ marginBottom: 24, alignItems: 'center', width: '100%' }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 8 }}>{formatExerciseName(exerciseName)}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                              <View style={{ alignItems: 'center', marginHorizontal: 18 }}>
                                <Text style={{ color: '#888', fontSize: 14 }}>{cleanLabel}</Text>
                                <Text style={{ color: '#222', fontSize: 22, fontWeight: 'bold' }}>{clean}</Text>
                        </View>
                              <View style={{ width: 1, height: 36, backgroundColor: '#000', marginHorizontal: 8 }} />
                              <View style={{ alignItems: 'center', marginHorizontal: 18 }}>
                                <Text style={{ color: '#888', fontSize: 14 }}>{totalLabel}</Text>
                                <Text style={{ color: '#222', fontSize: 22, fontWeight: 'bold' }}>{total}</Text>
                        </View>
                    </View>
                </View>
                        );
                      })
                    ) : null}
            </ScrollView>
                  {/* Start Again or Close Button */}
                  {(() => {
                    let exercisesToRetry = [];
                    let allSkipped = false;
                    if (parsedSummaryData && parsedSummaryData.exercises && Array.isArray(parsedSummaryData.exercises)) {
                      exercisesToRetry = parsedSummaryData.exercises.filter((ex) => {
                        const exerciseName = ex.exercise_info?.pretty_name || 
                                           ex.exercise_info?.exercise_id || 
                                           ex.pretty_name || 
                                           ex.exercise_id ||
                                           ex.name;
                        
                        // Determine if this is a time-based exercise
                        const scoring = exerciseScoringMap[exerciseName] || { type: SMWorkoutLibrary.ScoringType.Reps };
                        const isTimeBased = scoring.type === SMWorkoutLibrary.ScoringType.Time;
                        
                        if (isTimeBased) {
                          // For time-based exercises (like planks), check time in position
                          const totalTime = ex.time_in_position ?? ex.exercise_info?.time_in_position ?? 0;
                          const perfectTime = ex.time_in_position_perfect ?? ex.exercise_info?.time_in_position_perfect ?? 0;
                          return totalTime > 0 && totalTime !== perfectTime;
                        } else {
                          // For rep-based exercises, check reps performed
                          const reps = ex.reps_performed ?? ex.exercise_info?.reps_performed ?? 0;
                          const clean = ex.reps_performed_perfect ?? ex.exercise_info?.reps_performed_perfect ?? 0;
                          return reps > 0 && reps !== clean;
                        }
                      });
                      
                      // Check if all are skipped (all reps/time == 0)
                      allSkipped = parsedSummaryData.exercises.every((ex) => {
                        const exerciseName = ex.exercise_info?.pretty_name || 
                                           ex.exercise_info?.exercise_id || 
                                           ex.pretty_name || 
                                           ex.exercise_id ||
                                           ex.name;
                        
                        const scoring = exerciseScoringMap[exerciseName] || { type: SMWorkoutLibrary.ScoringType.Reps };
                        const isTimeBased = scoring.type === SMWorkoutLibrary.ScoringType.Time;
                        
                        if (isTimeBased) {
                          const totalTime = ex.time_in_position ?? ex.exercise_info?.time_in_position ?? 0;
                          return totalTime === 0;
                        } else {
                          const reps = ex.reps_performed ?? ex.exercise_info?.reps_performed ?? 0;
                          return reps === 0;
                        }
                      });
                    }
                    if (exercisesToRetry.length > 0) {
                      // Show Start Again button
                      return (
            <TouchableOpacity
                          style={{ marginTop: 16, backgroundColor: '#2196F3', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 1, borderColor: '#1976D2' }}
                          onPress={async () => {
                            setModalVisible(false);
                            setParsedSummaryData(null); // Reset summary data
                            setIsLoading(true);
                            try {
                              const retryExercises = exercisesToRetry.map((ex: any) => {
                                // ...existing retry mapping logic...
                                const name = ex.exercise_info?.pretty_name || 
                                           ex.exercise_info?.exercise_id || 
                                           ex.pretty_name || 
                                           ex.exercise_id ||
                                           ex.name;
                                if (!name) return null;
                                if (!exerciseIdMap[name] && !exerciseScoringMap[name]) {
                                  const fallbackName = Object.keys(exerciseIdMap).find(key => 
                                    key.toLowerCase().includes(name.toLowerCase()) || 
                                    name.toLowerCase().includes(key.toLowerCase())
                                  );
                                  if (fallbackName) {
                                    const detectorId = exerciseIdMap[fallbackName];
                                    const scoring = exerciseScoringMap[fallbackName];
                                    const scoringType = scoring.type;
                                    const targetReps = 10;
                                    const duration = 35;
                                    const scoringParams = new SMWorkoutLibrary.SMScoringParams(
                                      scoringType,
                                      0.3,
                                      scoringType === SMWorkoutLibrary.ScoringType.Time ? duration : null,
                                      scoringType === SMWorkoutLibrary.ScoringType.Reps ? targetReps : null,
                                      null,
                                      null
                                    );
                                    return new SMWorkoutLibrary.SMAssessmentExercise(
                                      detectorId,
                                      duration,
                                      detectorId,
                                      null,
                                      scoring.ui,
                                      detectorId,
                                      '',
                                      scoringParams,
                                      '',
                                      name,
                                      scoringType === SMWorkoutLibrary.ScoringType.Time ? 'Hold the position' : 'Complete clean reps',
                                      scoringType === SMWorkoutLibrary.ScoringType.Time ? 'Time' : 'Reps',
                                      scoringType === SMWorkoutLibrary.ScoringType.Time ? 'seconds held' : 'clean reps'
                                    );
                                  }
                                  // If no fallback found, use a default exercise
                                  return new SMWorkoutLibrary.SMAssessmentExercise(
                                    'SquatRegular',
                                    35,
                                    'SquatRegular',
                                    null,
                                    [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                                    'SquatRegular',
                                    '',
                                    new SMWorkoutLibrary.SMScoringParams(
                                      SMWorkoutLibrary.ScoringType.Reps,
                                      0.3,
                                      null,
                                      10,
                                      null,
                                      null
                                    ),
                                    '',
                                    name,
                                    'Complete clean reps',
                                    'Reps',
                                    'clean reps'
                                  );
                                }
                                const detectorId = exerciseIdMap[name] || name;
                                const scoring = exerciseScoringMap[name] || { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter] };
                                const scoringType = scoring.type;
                                let targetReps = 10;
                                let duration = 35;
                                if (scoringType === SMWorkoutLibrary.ScoringType.Reps) {
                                  targetReps = 10;
                                }
                                if (scoringType === SMWorkoutLibrary.ScoringType.Time) {
                                  duration = 35;
                                }
                                const scoringParams = new SMWorkoutLibrary.SMScoringParams(
                                  scoringType,
                                  0.3,
                                  scoringType === SMWorkoutLibrary.ScoringType.Time ? duration : null,
                                  scoringType === SMWorkoutLibrary.ScoringType.Reps ? targetReps : null,
                                  null,
                                  null
                                );
                                return new SMWorkoutLibrary.SMAssessmentExercise(
                                  detectorId,
                                  duration,
                                  detectorId,
                                  null,
                                  scoring.ui,
                                  detectorId,
                                  '',
                                  scoringParams,
                                  '',
                                  name,
                                  scoringType === SMWorkoutLibrary.ScoringType.Time ? 'Hold the position' : 'Complete clean reps',
                                  scoringType === SMWorkoutLibrary.ScoringType.Time ? 'Time' : 'Reps',
                                  scoringType === SMWorkoutLibrary.ScoringType.Time ? 'seconds held' : 'clean reps'
                                );
                              }).filter(Boolean) as SMWorkoutLibrary.SMExercise[];
                              if (retryExercises.length === 0) {
                                setIsLoading(false);
                                showAlert('No exercises to retry', 'There are no exercises to retry.');
                                return;
                              }
                              await new Promise(resolve => setTimeout(resolve, 1500)); // Longer delay for iOS
                              try {
                                const result = await startCustomAssessment(
                                  new SMWorkoutLibrary.SMWorkout(
                                    'retry-unclean-exercises',
                                    'Retry Unclean Exercises',
                                    null,
                                    null,
                                    retryExercises,
                                    null,
                                    null,
                                    null
                                  ),
                                  null,
                                  true,
                                  false
                                );
                                if (result && result.summary) {
                                  handleEvent(result.summary);
                                }
                              } catch (e) {
                                showAlert('Retry Error', e.message || String(e));
                              }
                            } catch (e) {
                              showAlert('Retry Error', e.message || String(e));
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Start Again</Text>
            </TouchableOpacity>
                      );
                    }
                    // Show Close button if all are skipped or all are clean
                    if (allSkipped || (parsedSummaryData && parsedSummaryData.exercises && parsedSummaryData.exercises.length > 0)) {
                      return (
                        <TouchableOpacity
                          style={{ marginTop: 16, backgroundColor: '#f5f5f5', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 1, borderColor: '#eee' }}
                          onPress={() => setModalVisible(false)}
                        >
                          <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 18 }}>Close</Text>
                        </TouchableOpacity>
                      );
                    }
                    return null;
                  })()}
                </>
              );
            })() : (
              Platform.OS === 'android' ? (
                <Text style={[styles.modalText, { color: '#222' }]}>No exercises performed in this assessment.</Text>
              ) : (
                <Text style={[styles.modalText, { color: '#222' }]}>{summaryMessage}</Text>
              )
            )}
          </LinearGradient>
        </View>
      </Modal>

      {/* New Modal for Assessment Info */}
      <Modal
        transparent={true}
        visible={assessmentInfoModalVisible}
        animationType="slide"
        onRequestClose={() => setAssessmentInfoModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Assessment Exercises</Text>
              {currentAssessmentExercises.length > 0 ? (
                currentAssessmentExercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseInfoContainer}>
                    <Text style={styles.exerciseInfoName}>{exercise.name}</Text>
                    {exercise.description && <Text style={styles.exerciseInfoDescription}>{exercise.description}</Text>}
                  </View>
                ))
              ) : (
                <Text style={styles.modalText}>No exercise information available for this assessment type.</Text>
              )}
            </ScrollView>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.startButton]} // Reusing startButton style
                onPress={startAssessmentFromInfoModal}>
                <Text style={styles.buttonText}>Start Assessment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => setAssessmentInfoModalVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Modal for Exercise Selection */}
      <Modal
        visible={exerciseSelectionModalVisible}
        animationType="slide"
        onRequestClose={() => setExerciseSelectionModalVisible(false)}>
        <SafeAreaView style={{flex: 1, backgroundColor: isNightMode ? '#111' : '#f2f2f7'}}>
          {/* Header */}
          <View style={[styles.selectionModalHeader, { borderBottomColor: isNightMode ? '#333' : '#e5e5ea', backgroundColor: isNightMode ? '#1c1c1e' : '#fff' }]}>
            <TouchableOpacity onPress={() => setExerciseSelectionModalVisible(false)}>
              <Text style={styles.selectionModalCloseButton}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.selectionModalTitle, { color: isNightMode ? '#fff' : '#000' }]}>Select Exercises</Text>
            <TouchableOpacity onPress={handleStartFocusAssessment} disabled={selectedExercises.length === 0}>
              <Text style={[styles.selectionModalStartButton, selectedExercises.length === 0 && styles.disabledButtonText]}>Start</Text>
            </TouchableOpacity>
          </View>

          {/* Exercise List */}
          <ScrollView style={{flex: 1}}>
            <View style={[styles.listContainer, { borderColor: isNightMode ? '#333' : '#ccc', backgroundColor: isNightMode ? '#1c1c1e' : '#fff' }]}> 
              {Array.from(new Set(planData.flatMap(plan => plan.exercises?.map(ex => ex.name) || []))).map((exerciseName, index) => {
                const selectedExercise = selectedExercises.find(e => e.name === exerciseName);
                const isSelected = !!selectedExercise;
                const isLastItem = index === Object.keys(exerciseIdMap).length - 1;

                return (
                  <View key={exerciseName}>
                    <TouchableOpacity
                      style={[styles.selectionModalExerciseItem]}
                      onPress={() => handleExerciseSelect(exerciseName)}
                      activeOpacity={0.6}
                    >
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={[styles.checkbox, { borderColor: isNightMode && !isSelected ? '#555' : '#cecece' }, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={[styles.selectionModalExerciseText, { color: isNightMode ? '#fff' : '#000' }]}>{formatExerciseName(exerciseName)}</Text>
                      </View>
                      {isSelected && (
                        <View 
                          style={{flexDirection: 'row', alignItems: 'center'}}
                          onStartShouldSetResponder={() => true}
                        >
                          <TextInput
                            style={[styles.durationInput, { color: isNightMode ? '#fff' : '#000', backgroundColor: isNightMode ? '#333' : '#f0f0f0', borderColor: isNightMode ? '#444' : '#e0e0e0' }]}
                            value={String(selectedExercise.duration)}
                            onChangeText={(text) => {
                              const duration = parseInt(text, 10) || 0;
                              setSelectedExercises(prev => prev.map(ex => ex.name === exerciseName ? { ...ex, duration } : ex));
                            }}
                            keyboardType="numeric"
                            maxLength={3}
                          />
                          <Text style={{color: isNightMode ? '#888' : '#666', marginLeft: 8, fontSize: 16}}>sec</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    {!isLastItem && <View style={[styles.separator, { backgroundColor: isNightMode ? '#333' : '#e0e0e0' }]} />}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

        {/* Add the bottom modal for plan details */}
        <Modal
          visible={showPlanModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPlanModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-start' }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: isNightMode ? '#1a1a1a' : '#f2f2f7' }}>
              {selectedPlan && (
                <>
                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => setShowPlanModal(false)}
                    style={{
                      position: 'absolute',
                      top: Platform.OS === 'android' ? 40 : 70,
                      right: 24,
                      zIndex: 10,
                      backgroundColor: '#fff',
                      borderRadius: 24,
                      width: 44,
                      height: 44,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ fontSize: 28, color: '#E53935', fontWeight: 'bold', lineHeight: 30 }}>×</Text>
                  </TouchableOpacity>
                  {/* Plan Image */}
                  <Image
                    source={selectedPlan.image}
                    style={{ width: '100%', height: 220, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderRadius: 0, resizeMode: 'cover' }}
                  />
                  {/* Plan Info Header and all modal content in a ScrollView */}
                  <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
                    <Text style={{ color: isNightMode ? '#fff' : '#111', fontSize: 26, fontWeight: 'bold', marginBottom: 8 }}>{selectedPlan.name}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 16, justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: isNightMode ? '#fff' : '#111', fontWeight: 'bold', fontSize: 16 }}>Beginner</Text>
                        <Text style={{ color: isNightMode ? '#aaa' : '#888', fontSize: 13 }}>Level</Text>
    </View>
                      <Text style={{ color: isNightMode ? '#aaa' : '#888', fontSize: 18, marginHorizontal: 28, marginTop: 2 }}>|</Text>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: isNightMode ? '#fff' : '#111', fontWeight: 'bold', fontSize: 16 }}>18 mins</Text>
                        <Text style={{ color: isNightMode ? '#aaa' : '#888', fontSize: 13 }}>Time</Text>
                      </View>
                      <Text style={{ color: isNightMode ? '#aaa' : '#888', fontSize: 18, marginHorizontal: 28, marginTop: 2 }}>|</Text>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: isNightMode ? '#fff' : '#111', fontWeight: 'bold', fontSize: 16 }}>Abs</Text>
                        <Text style={{ color: isNightMode ? '#aaa' : '#888', fontSize: 13 }}>Focus Area</Text>
                      </View>
                    </View>
                    {/* Level Selection UI - moved here */}
                    <View style={{ marginBottom: 28 }}>
                      <Text style={{ fontSize: 18, fontWeight: '600', color: isNightMode ? '#fff' : '#000', marginBottom: 12 }}>
                        Select Level
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                        {['beginner', 'performer', 'advanced'].map((level) => (
                          <TouchableOpacity
                            key={level}
                            style={{
                              flex: 1,
                              minWidth: 0, // Important for iOS
                              marginHorizontal: 2,
                              padding: 12,
                              borderRadius: 8,
                              backgroundColor: selectedLevel === level ? '#2196F3' : isNightMode ? '#333' : '#f0f0f0',
                              alignItems: 'center',
                            }}
                            onPress={() => {
                              setSelectedLevel(level);
                              setStartDisabled(true);
                              setTimeout(() => setStartDisabled(false), 200);
                            }}
                          >
                            <Text
                              style={{
                                color: selectedLevel === level ? '#fff' : isNightMode ? '#fff' : '#000',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                textAlign: 'center',
                              }}
                              numberOfLines={1}
                              ellipsizeMode='tail'
                            >
                              {level === 'performer' ? 'Performer' : level.charAt(0).toUpperCase() + level.slice(1)}
                            </Text>
                            <Text
                              style={{
                                color: selectedLevel === level ? '#fff' : isNightMode ? '#aaa' : '#666',
                                fontSize: 12,
                                marginTop: 4,
                                textAlign: 'center',
                              }}
                              numberOfLines={1}
                              ellipsizeMode='tail'
                            >
                              {levelDurations[level]}s
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    {/* Exercises List */}
                    <Text style={{ color: isNightMode ? '#fff' : '#111', fontWeight: 'bold', fontSize: 20, marginBottom: 12, paddingHorizontal: 24, marginTop: 12 }}>Exercises ({selectedPlan.exercises.length})</Text>
                    {selectedPlan.exercises && Array.isArray(selectedPlan.exercises) && selectedPlan.exercises.map((ex, idx) => {
                      if (!ex || !ex.name) return null;
                      const iconColor = playIconColors[idx % playIconColors.length];

                      return (
                        <View key={idx} style={[styles.planExerciseItem, { backgroundColor: isNightMode ? '#2c2c2e' : '#fff' }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={[styles.planPlayIcon, { backgroundColor: iconColor }]}>
                              <Text style={styles.planPlayIconText}>▶</Text>
                          </View>
                          <View>
                              <Text style={[styles.planExerciseName, { color: isNightMode ? '#fff' : '#000' }]}>{ex.name}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Text style={{ color: iconColor, fontSize: 14, marginRight: 6 }}>🕒</Text>
                                <Text style={styles.planExerciseDuration}>
                                  {formatDuration(ex.duration[selectedLevel])}
                                </Text>
                          </View>
                        </View>
                          </View>
                          <Text style={styles.planExerciseReps}>
                            Repetition {ex.reps[selectedLevel]}x
                          </Text>
                        </View>
                      );
                    })}
                    {/* Disclaimer below the exercise list */}
                    <View style={{ marginTop: 18, marginBottom: 8, paddingHorizontal: 24 }}>
                      <Text style={{ color: isNightMode ? '#E53935' : '#B71C1C', fontSize: 14, textAlign: 'center', fontWeight: '600' }}>
                        Please keep your mobile phone on a stable surface (preferably on the ground) and step back and stand in the Frame.
                      </Text>
                    </View>
                  </ScrollView>
                  {/* Start Button */}
                  <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 24, backgroundColor: isNightMode ? '#111' : '#fff' }}>
                    <TouchableOpacity
                      style={{ backgroundColor: startDisabled ? '#90caf9' : '#2196F3', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
                      disabled={startDisabled}
                      onPress={() => {
                        setStartDisabled(true);
                        setShowPlanModal(false);
                        setTimeout(async () => {
                          if (selectedPlan) {
                            // Use selectedPlan and selectedLevel for any plan
                            const customExercises = selectedPlan.exercises.map((exercise, idx) => {
                              const scoring = exerciseScoringMap[exercise.name] || { type: SMWorkoutLibrary.ScoringType.Reps, ui: [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer] };
                              // Special handling for Plank & Core Stability exercises
                              if (["High Plank", "Side Plank", "Tuck Hold", "Plank", "Hamstring Mobility", "Standing Hamstring Mobility", "Side bend", "Standing knee raises", "Jefferson curl"].includes(exercise.name)) {
                                const scoring = exerciseScoringMap[exercise.name];
                                // Set correct video instruction names for hamstring exercises
                                let videoInstruction = exerciseIdMap[exercise.name];
                                if (exercise.name === "Hamstring Mobility") {
                                  videoInstruction = "HamstringMobility";
                                } else if (exercise.name === "Standing Hamstring Mobility") {
                                  videoInstruction = "StandingHamstringMobility";
                                }
                                return new SMWorkoutLibrary.SMAssessmentExercise(
                                  exerciseIdMap[exercise.name],
                                  exercise.duration[selectedLevel],
                                  videoInstruction,
                                  null,
                                  scoring.ui,
                                  exerciseIdMap[exercise.name],
                                  '',
                                  new SMWorkoutLibrary.SMScoringParams(
                                    scoring.type,
                                    0.3,
                                    scoring.type === SMWorkoutLibrary.ScoringType.Time ? exercise.duration[selectedLevel] : null,
                                    scoring.type === SMWorkoutLibrary.ScoringType.Reps ? exercise.reps[selectedLevel] : null,
                                    null,
                                    null
                                  ),
                                  '',
                                  exercise.name,
                                  scoring.type === SMWorkoutLibrary.ScoringType.Time ? 'Hold the position' : 'Complete the exercise',
                                  scoring.type === SMWorkoutLibrary.ScoringType.Time ? 'Time' : 'Reps',
                                  scoring.type === SMWorkoutLibrary.ScoringType.Time ? 'seconds held' : 'clean reps'
                                );
                              } else {
                                return new SMWorkoutLibrary.SMAssessmentExercise(
                                  exerciseIdMap[exercise.name] || exercise.name.replace(/\s+/g, ''),
                                  exercise.duration[selectedLevel],
                                  exerciseIdMap[exercise.name] || exercise.name.replace(/\s+/g, ''),
                                  null,
                                  scoring.ui,
                                  exerciseIdMap[exercise.name] || exercise.name.replace(/\s+/g, ''),
                                  '',
                                  new SMWorkoutLibrary.SMScoringParams(
                                    scoring.type,
                                    0.3,
                                    scoring.type === SMWorkoutLibrary.ScoringType.Time ? exercise.duration[selectedLevel] : null,
                                    scoring.type === SMWorkoutLibrary.ScoringType.Reps ? exercise.reps[selectedLevel] : null,
                                    null,
                                    null
                                  ),
                                  '',
                                  exercise.name,
                                  scoring.type === SMWorkoutLibrary.ScoringType.Time ? 'Hold the position' : 'Complete the exercise',
                                  scoring.type === SMWorkoutLibrary.ScoringType.Time ? 'Time' : 'Reps',
                                  scoring.type === SMWorkoutLibrary.ScoringType.Time ? 'seconds held' : 'clean reps'
                                );
                              }
                            });
                            const customWorkout = new SMWorkoutLibrary.SMWorkout(
                              selectedPlan.name.toLowerCase().replace(/\s+/g, '-'),
                              selectedPlan.name,
                              null,
                              null,
                              customExercises,
                              null,
                              null,
                              null
                            );
                            try {
                              const result = await startCustomAssessment(customWorkout, null, true, false);
                              
                              // Add a small delay before showing the summary modal
                              await new Promise(resolve => setTimeout(resolve, 1000));
                              
                              setSummaryMessage(result.summary);
                              const parsed = JSON.parse(result.summary);
                              setParsedSummaryData(parsed);
                              setModalVisible(true);
                            } catch (e) {
                              Alert.alert('Assessment Error', e.message);
                            }
                          }
                          setStartDisabled(false);
                        }, 1000);
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>Start</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </SafeAreaView>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );

  async function configureSMKitUI() {
    setIsLoading(true);
    try {
      
      var res = await configure("public_live_a5jSYbzaDk7sgalguc");
      console.log("Configuration successful:", res);
      setIsLoading(false);
      setDidConfig(true);
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Configure Failed', e.message, [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
    }
  }

  async function startWorkoutProgramSession() {
    try {
      const parsedWeek = parseInt(week, 10);
      if (isNaN(parsedWeek)) {
        throw new Error('Invalid week number');
      }
      var config = new SMWorkoutLibrary.WorkoutConfig(
        parsedWeek,
        bodyZone,
        difficulty,
        duration,
        language,
        name,
      );
      var result = await startWorkoutProgram(config);
      console.log(result.summary);
      console.log(result.didFinish);
    } catch (e) {
      Alert.alert('Unable to start workout program', e.message, [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
    }
  }
  async function startAssessmentSession(
    type: SMWorkoutLibrary.AssessmentTypes,
    showSummary: boolean,
    customAssessmentID: string
  ) {
    try {
      console.log('Starting assessment with type:', type);
      const result = await startAssessment(
        type,
        showSummary,
        null,
        false,
        customAssessmentID
      );
      console.log('Assessment result:', result.summary);
      console.log('Did finish:', result.didFinish);
      // Set summary and show modal directly (cross-platform)
      setSummaryMessage(result.summary);
      let parsed: any = null;
      try {
        parsed = JSON.parse(result.summary);
        setParsedSummaryData(parsed);
      } catch (e) {
        setParsedSummaryData(null);
      }
      setModalVisible(true);
      return result;
    } catch (e) {
      console.error('Assessment error:', e);
      Alert.alert('Unable to start assessment', e.message);
      return { summary: '', didFinish: false };
    }
  }

  async function startSMKitUICustomWorkout() {
    try {
      var exercises = [
        new SMWorkoutLibrary.SMAssessmentExercise(
          'SquatRegularOverheadStatic',
          30,
          'SquatRegularOverheadStatic',
          null,
          [
            SMWorkoutLibrary.UIElement.GaugeOfMotion,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'SquatRegularOverheadStatic',
          'stam',
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.5,
            20,
            null,
            null,
            null,
          ),
          '',
          'SquatRegularOverheadStatic',
          'Subtitle',
          'timeInPosition',
          'clean reps'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'Jefferson Curl',
          30,
          'JeffersonCurlRight',
          null,
          [
            SMWorkoutLibrary.UIElement.GaugeOfMotion,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'JeffersonCurlRight',
          'stam',
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.5,
            20,
            null,
            null,
            null,
          ),
          '',
          'JeffersonCurlRight',
          'Subtitle',
          'timeInPosition',
          'clean reps'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'Push-Up',
          30,
          'PushupRegular',
          null,
          [
            SMWorkoutLibrary.UIElement.RepsCounter,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'PushupRegular',
          'stam',
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps,
            0.5,
            null,
            6,
            null,
            null,
          ),
          '',
          'PushupRegular',
          'Subtitle',
          'Reps',
          'clean reps'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'LungeFrontRight',
          30,
          'LungeFrontRight',
          null,
          [
            SMWorkoutLibrary.UIElement.GaugeOfMotion,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'LungeFront',
          'stam',
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps,
            0.5,
            null,
            20,
            null,
            null,
          ),
          '',
          'LungeFrontRight',
          'Subtitle',
          'timeInPosition',
          'clean reps'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'LungeFrontLeft',
          30,
          'LungeFrontLeft',
          null,
          [
            SMWorkoutLibrary.UIElement.GaugeOfMotion,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'LungeFront',
          'stam',
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps,
            0.5,
            null,
            20,
            null,
            null,
          ),
          '',
          'LungeFrontLeft',
          'Subtitle',
          'timeInPosition',
          'clean reps'
        ),
      ];

      var assessment = new SMWorkoutLibrary.SMWorkout(
        '50',
        'demo workout',
        null,
        null,
        exercises,
        null,
        null,
        null,
      );

      var result = await startCustomWorkout(assessment);
      console.log(result.summary);
      console.log(result.didFinish);
    } catch (e) {
      console.error(e);
      showAlert('Custom workout error', e.message);
    }
  }

  async function startSMKitUICustomAssessment() {
    try {
      // Set language and preferences first
      await setSessionLanguage(SMWorkoutLibrary.Language.Hebrew);
      setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
      setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);

      // Optional: Use local sound files instead of URLs
      const successSound = '';  // Remove URL and use local file or leave empty
      const failedSound = '';   // Remove URL and use local file or leave empty

      const exercises = [
        new SMWorkoutLibrary.SMAssessmentExercise(
          'SquatRegular',
          35,
          'SquatRegular',
          null,
          [
            SMWorkoutLibrary.UIElement.RepsCounter,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'SquatRegular',
          successSound,
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps,
            0.3,
            null,
            5,
            null,
            null,
          ),
          failedSound,
          'SquatRegular',
          'Subtitle',
          'Reps',
          'clean reps'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'LungeFront',
          35,
          'LungeFront',
          null,
          [
            SMWorkoutLibrary.UIElement.RepsCounter,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'LungeFront',
          successSound,
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps,
            0.3,
            null,
            5,
            null,
            null,
          ),
          failedSound,
          'LungeFront',
          'Subtitle',
          'Reps',
          'clean reps'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'HighKnees',
          35,
          'HighKnees',
          null,
          [
            SMWorkoutLibrary.UIElement.RepsCounter,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'HighKnees',
          successSound,
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps,
            0.3,
            null,
            5,
            null,
            null,
          ),
          failedSound,
          'HighKnees',
          'Subtitle',
          'Reps',
          'clean reps'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'SquatRegularOverheadStatic',
          35,
          'SquatRegularOverheadStatic',
          null,
          [
            SMWorkoutLibrary.UIElement.RepsCounter,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'SquatRegularOverheadStatic',
          successSound,
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.3,
            15,
            null,
            null,
            null,
          ),
          failedSound,
          'SquatRegularOverheadStatic',
          'Subtitle',
          'Time',
          'seconds held'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'PlankHighStatic',
          35,
          'PlankHighStatic',
          null,
          [
            SMWorkoutLibrary.UIElement.RepsCounter,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'PlankHighStatic',
          successSound,
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.3,
            15,
            null,
            null,
            null,
          ),
          failedSound,
          'PlankHighStatic',
          'Subtitle',
          'Time',
          'seconds held'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'StandingSideBendRight',
          35,
          'StandingSideBendRight',
          null,
          [
            SMWorkoutLibrary.UIElement.RepsCounter,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'StandingSideBendRight',
          successSound,
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.3,
            15,
            null,
            null,
            null,
          ),
          failedSound,
          'StandingSideBendRight',
          'Subtitle',
          'Time',
          'seconds held'
        ),
      ];

      var assessment = new SMWorkoutLibrary.SMWorkout(
        '50',
        'demo workout',
        null,
        null,
        exercises,
        null,
        null,
        null,
      );

      var result = await startCustomAssessment(assessment, null, true, false);
      console.log('Assessment result:', result.summary);
      console.log('Did finish:', result.didFinish);
    } catch (e) {
      console.error('Custom assessment error:', e);
      showAlert('Custom assessment error', e.message);
    }
  }

  // Helper to start Fitness assessment and check clean reps
  async function startFitnessAssessmentWithCleanCheck(summary: string | null = null) {
    let assessmentSummary = summary;

    if (!assessmentSummary) {
      let result = await startAssessmentSession(
        SMWorkoutLibrary.AssessmentTypes.Fitness,
        true,
        ''
      );
      assessmentSummary = result.summary;
    }

    // Parse the summary to check clean reps vs total reps
    let parsed: any = null;
    try {
      parsed = typeof assessmentSummary === 'string' ? JSON.parse(assessmentSummary) : assessmentSummary;
    } catch (e) {
      parsed = null;
    }
    // If any exercise has clean reps != total reps, or total reps is 0, trigger restart after modal
    let needsRetry = false;
    let retryReason = '';
    if (parsed && parsed.exercises && Array.isArray(parsed.exercises)) {
      for (const ex of parsed.exercises) {
        if (
          typeof ex.reps_performed === 'number' &&
          typeof ex.reps_performed_perfect === 'number'
        ) {
          if (ex.reps_performed === 0) {
            needsRetry = true;
            retryReason = 'No reps were performed. The assessment will restart.';
            break;
          }
          if (ex.reps_performed !== ex.reps_performed_perfect) {
            needsRetry = true;
            retryReason = 'Not all reps were clean. The assessment will restart.';
            break;
          }
        }
      }
    }
    if (needsRetry) {
      // Do not auto-retry here; handled in modal close now
     
    }
  }

  // New function to handle the Focus Mode assessment
  async function startFocusModeAssessment() {
    try {
      const exercises = focusAssessmentExercises.map(exerciseInfo => {
        // This logic is simplified. You would use your existing exercise mapping
        // to create full SMAssessmentExercise objects.
        const { name, reps } = exerciseInfo;
        const detectorId = exerciseIdMap[name] || name;
        const scoring = exerciseScoringMap[name];
        
        return new SMWorkoutLibrary.SMAssessmentExercise(
          detectorId,
          35, // totalSeconds per exercise
          detectorId,
          null,
          scoring.ui,
          detectorId,
          '',
          new SMWorkoutLibrary.SMScoringParams(
            scoring.type,
            0.3,
            null,
            reps,
            null,
            null
          ),
          '',
          name,
          'Complete the exercise',
          'Reps',
          'clean reps'
        );
      });

      const workout = new SMWorkoutLibrary.SMWorkout(
        'focus-mode-assessment',
        'Focus Mode Assessment',
        null,
        null,
        exercises,
        null,
        null,
        null
      );

      const result = await startCustomAssessment(workout, null, true, false);
      
      // Handle the summary and clean check
      await handleEvent(result.summary);
      await startFitnessAssessmentWithCleanCheck(result.summary); // Re-use the clean check logic

    } catch (e) {
      showAlert('Assessment Error', e.message);
    }
  }
};

function showAlert(title, message) {
  Alert.alert(title, message, [
    { text: 'OK', onPress: () => console.log('OK Pressed') },
  ]);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    backgroundColor: '#fff',
    padding: '5%', // Use a single padding property for consistency
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    color: '#000000', // Black text for visibility on white background
  },
  personalizedPlansText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'left',
    marginTop: -80,
    marginBottom: 15,
    // Removed paddingHorizontal: '5%',
  },
  headerContainer: {
    marginTop: '2%',
    marginBottom: '4%',
  },
  logo: {
    width: '20%',
    height: undefined,
    aspectRatio: 1,
    marginBottom: 0,
    borderRadius: 20,
  },
  welcomeText: {
    marginRight: 10,
    fontSize: 24,
    color: '#FF9800', // Orange text
    opacity: 0.85,
  },
  titleText: {
    fontSize:27,
    color: '#FF9800', // Orange text
    fontWeight: 'bold',
  },
  categoryScrollContainer: {
    flex: 1,
    marginBottom: 10,
  },
  categoryContainer: {
    width: '100%',
  },
  categoryButton: {
    width: '100%',
    height: '8%',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFE5B4', // Light orange border
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
    marginBottom: '2%',
    backgroundColor: '#FFF7ED', // Very light orange background
  },
  categoryText: {
    color: '#FF9800', // Orange text
    fontSize: 18,
    textAlign: 'center',
  },
  instructionText: {
    color: '#FFA726', // Orange accent
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  exerciseScrollContainer: {
    flex: 1,
    marginBottom: 10,
  },
  exerciseContainer: {
    width: '100%',
  },
  exerciseButton: {
    width: '100%',
    height: '8%',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFE5B4', // Light orange border
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
    marginBottom: '2%',
    backgroundColor: '#FFF7ED', // Very light orange background
  },
  exerciseText: {
    color: '#FF9800', // Orange text
    fontSize: 18,
    textAlign: 'center',
  },
  bottomContainer: {
    marginTop: '2%',
    paddingBottom: '2%',
  },
  startButton: {
    width: '100%',
    height: '8%',
    borderRadius: 25,
    backgroundColor: '#FFA726', // Orange
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2%',
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  learnMoreText: {
    color: '#FFA726',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFF7ED', // Very light orange
    borderRadius: 10,
    padding: '5%',
    elevation: 5,
    borderColor: '#FFA726',
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA726',
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#FFA726',
    paddingBottom: 3,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
    color: '#FF9800',
    fontSize: 14,
  },
  modalDataText: {
    color: '#FFA726',
    fontSize: 14,
    marginBottom: 4,
  },
  exerciseContainerModal: {
    backgroundColor: '#FFE5B4', // Light orange
    borderRadius: 8,
    padding: '3%',
    marginBottom: '2%',
    borderColor: '#FFA726',
    borderWidth: 0.5,
  },
  exerciseTitleModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#FFA726',
    borderRadius: 5,
    padding: 10,
    width: '45%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#FF7043', // Deeper orange for close
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  selectedExercise: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)', // Light orange highlight
    borderColor: '#FFA726',
  },
  disabledButton: {
    opacity: 0.5,
  },
  creditCounterContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: '#fff', // White background
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    zIndex: 2,
    elevation: 6,
    shadowColor: '#FFA726', // Orange shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#FFA726', // Orange border
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditCounterText: {
    color: '#FF9800', // Orange text
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  analysisContainer: {
    backgroundColor: '#FFE5B4', // Light orange
    borderRadius: 8,
    padding: '3%',
    marginBottom: '2%',
    borderColor: '#FFA726',
    borderWidth: 0.5,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  analysisText: {
    color: '#FFA726',
    fontSize: 14,
    marginBottom: 4,
  },
  restartContainer: {
    backgroundColor: '#FFA726',
    borderRadius: 8,
    padding: '3%',
    marginTop: '3%',
    marginBottom: '2%',
  },
  restartText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // New styles for assessment info modal
  exerciseInfoContainer: {
    backgroundColor: '#FFE5B4', // Light orange
    borderRadius: 8,
    padding: '3%',
    marginBottom: '2%',
    borderColor: '#FFA726',
    borderWidth: 0.5,
  },
  exerciseInfoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  exerciseInfoDescription: {
    color: '#FFA726',
    fontSize: 14,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: '4%',
  },
  profileSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: '4%',
    marginTop: '2%',
  },
  profileButton: {
    width: '12%',
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#FFA726',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1.5%',
  },
  profileIcon: {
    color: 'white',
    fontSize: 24,
  },
  motivationalQuote: {
    color: '#000000',
    fontSize: 16,
    maxWidth: '60%',
    textAlign: 'left',
    marginBottom: '4%',
  },
  featureButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Center horizontally
    alignItems: 'center',
    marginTop: '2%',
    marginBottom: '1.5%',
    width: '100%',
    gap: 0,
  },
  featureButton: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 16,
    marginHorizontal: 3, // Reduced gap
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: '2%',
    paddingHorizontal: '1%',
  },
  featureButtonRanks: {
    backgroundColor: '#FFE5B4', // Light orange
    borderColor: '#FFA726', // Orange
    shadowColor: '#FFA726',
  },
  featureButtonProgress: {
    backgroundColor: '#FFEBEE', // Light red
    borderColor: '#E53935', // Red
    shadowColor: '#E53935',
  },
  featureButtonTracker: {
    backgroundColor: '#E8F5E9', // Light green
    borderColor: '#66BB6A', // Green
    shadowColor: '#66BB6A',
  },
  featureButtonCommunity: {
    backgroundColor: '#E3F2FD', // Light blue
    borderColor: '#1976D2', // Blue
    shadowColor: '#1976D2',
  },
  featureButtonSelected: {
    borderColor: '#FF9800', // Deeper orange accent for selected
    shadowColor: '#FF9800',
    shadowOpacity: 0.18,
    elevation: 4,
  },
  featureIcon: {
    fontSize: 24, // Slightly smaller
    marginBottom: 4,
    color: '#FF9800', // Orange accent
    textAlign: 'center',
  },
  featureLabel: {
    color: '#000000', // Orange text for theme
    fontSize: 12, // Slightly smaller
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15, // Adjusted for smaller font
  },
  carouselContainer: {
    marginTop: '2%',
    marginBottom: '2%',
    width: '100%',
    minHeight: '25%',
  },
  carouselContent: {
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 8,
  },
  bannerContainer: {
    backgroundColor: '#45B0A4',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#E08714',
    lineHeight: 22,
  },
  plansCarousel: {
    marginTop: 0, // Ensure no space above the carousel
    marginBottom: 0,
    paddingVertical: 0,
    marginVertical: 0,
  },
  plansCarouselContent: {
    flexDirection: 'row',
    // Removed paddingLeft: '5%', // Rely on mainContainer's padding
    paddingTop: 0,
    paddingBottom: 0,
  },
  planContainer: {
    backgroundColor: '#45B0A4',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'flex-start', // Align text to the left inside the card
    height: 170,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  planText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // White text for better contrast on the background
    marginBottom: 5, // Add some space below the title
  },
  // New styles for Burn Calories section
  burnCaloriesContainer: {
    marginBottom: 0, // Ensure no extra space below this container
    // Removed paddingHorizontal: '5%', // Rely on mainContainer's padding
  },
  burnCaloriesHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  burnCaloriesDescription: {
    fontSize: 14,
    color: '#333333', // Slightly lighter color for description
    lineHeight: 20,
    marginBottom: 32, // Further increase space below the description
    marginTop: 0,
    paddingVertical: 0,
    marginVertical: 0,
  },
  // New styles for Fitness Metrics section
  fitnessMetricsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  fitnessMetricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    // Padding will be handled by mainContainer
  },
  fitnessMetricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000', // Black text
  },
  fitnessMetricsSeeAll: {
    fontSize: 14,
    color: '#007BFF', // Blue color for link
  },
  metricsCarousel: {
    // No specific styles needed here, content styles handle layout
  },
  metricsCarouselContent: {
    flexDirection: 'row',
    // Padding will be handled by mainContainer for the first item alignment
  },
  metricCard: {
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 150, // Fixed width for cards
    height: 180, // Fixed height for cards
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  scoreCard: {
    backgroundColor: '#FFA726', // Orange background from image
  },
  hydrationCard: {
    backgroundColor: '#2196F3', // Blue background from image
  },
  caloriesCard: {
    backgroundColor: '#757575', // Grey background from image
  },
  metricCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff', // White text for contrast
  },
  chartPlaceholder: {
    flex: 1, // Take available space
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white placeholder
    borderRadius: 5,
    marginVertical: 5,
  },
   circlesPlaceholder: {
     width: 20,
     height: 60, // Adjust height to match circles in image
     // backgroundColor: 'rgba(255, 255, 255, 0.3)', // No background needed for the container
     borderRadius: 10, // Make it circular
     justifyContent: 'space-around', // Distribute circles vertically
     alignItems: 'center', // Center circles horizontally
     paddingVertical: 5, // Add some vertical padding inside
     flexDirection: 'column', // Stack circles vertically
  },
  // Removed: Style for the individual circle dots
  /*
  circleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // White dots
    marginBottom: 4, // Space between dots
  },
  */
  metricCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff', // White text
  },
  // New styles for chart visualizations
  barChartContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end', // Align bars to the bottom
    justifyContent: 'space-around', // Distribute space around bars
    paddingHorizontal: 5,
    marginVertical: 5,
  },
  bar: {
    width: 10, // Width of each bar
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // White bars
    borderRadius: 2,
  },
  lineGraphContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    position: 'relative', // Needed for absolute positioning of lines
  },
  // Removed: lineGraphLine style
  
  // New styles for the two lines
  goalLine: {
    position: 'absolute',
    width: '90%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white for goal
    transform: [{ rotate: '-5deg' }], // Example slight upward angle
    top: '30%', // Position the line higher
  },
  userInputLine: {
    position: 'absolute',
    width: '90%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 1)', // Opaque white for user input
    transform: [{ rotate: '5deg' }], // Example slight upward angle, different from goal
    top: '60%', // Position the line lower
  },
  // New styles for the progress bar visualization
  progressBarContainer: {
    width: '100%',
    height: 8, // Thickness of the progress bar
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Light track
    borderRadius: 4,
    marginVertical: 10,
    overflow: 'hidden', // Clip the fill to the rounded corners
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFA726', // Orange fill color (example)
    borderRadius: 4,
  },
  // New styles for the exercise selection modal
  selectionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectionModalCloseButton: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: '400',
  },
  selectionModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Lexend',
  },
  selectionModalStartButton: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    fontFamily: 'Lexend',
  },
  disabledButtonText: {
    color: '#8e8e93',
  },
  selectionModalInstructions: {
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    paddingTop: 20,
    paddingBottom: 12,
    fontFamily: 'Lexend',
  },
  selectionModalExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectionModalExerciseText: {
    fontSize: 17,
    marginLeft: 16,
    fontFamily: 'Lexend',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cecece',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Lexend',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  durationInput: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    fontFamily: 'Lexend',
  },
  listContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  planExerciseItem: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  planPlayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  planPlayIconText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    transform: [{ translateX: 1 }],
  },
  planExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Lexend',
  },
  planExerciseDuration: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Lexend',
  },
  planExerciseReps: {
    fontSize: 14,
    color: '#A076F9',
    fontWeight: '600',
    fontFamily: 'Lexend',
  },
  summaryStatBoxWhite: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 8,
    padding: 14,
    backgroundColor: '#f7f7fa',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryStatLabelWhite: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryStatValueWhite: {
    color: '#222',
    fontSize: 22,
    fontWeight: 'bold',
  },
  summaryAnalyticsTitleWhite: {
    color: '#222',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  summaryAnalyticsLabelWhite: {
    color: '#888',
    fontSize: 14,
  },
  summaryAnalyticsValueWhite: {
    color: '#222',
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryAnalyticsSubLabelWhite: {
    color: '#888',
    fontSize: 14,
  },
  summaryLineChartPlaceholderWhite: {
    width: '100%',
    height: 100,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    marginVertical: 16,
  },
  summaryBox: {
    backgroundColor: '#f7faff',
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b6c3e0',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minWidth: 120,
    maxWidth: 160,
    minHeight: 160,
    borderWidth: 1,
    borderColor: '#e6eaf3',
  },
  scoreBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minWidth: 90,
  },
});

App.propTypes = {
  isNightMode: PropTypes.bool.isRequired,
  setIsNightMode: PropTypes.func.isRequired,
  inFocusMode: PropTypes.bool.isRequired,
  setInFocusMode: PropTypes.func.isRequired,
};

export default App;