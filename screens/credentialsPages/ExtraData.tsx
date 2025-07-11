import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

const BUTTON_RADIUS = 12;
const BUTTON_HEIGHT = 48;
const BUTTON_FONT_SIZE = 16;
const PRIMARY_COLOR = '#189EFF';
const BORDER_COLOR = '#E5E5E5';
const SELECTED_TEXT_COLOR = '#fff';
const UNSELECTED_TEXT_COLOR = '#222';
const UNSELECTED_BG_COLOR = '#fff';
const SELECTED_BG_COLOR = PRIMARY_COLOR;
const SECTION_MARGIN = 24;
const BUTTON_MARGIN = 12;

const fitnessGoals = ['weight loss', 'muscle gain', 'maintain'];

const workoutFrequencies = ['1-2 times/week', '3-4 times/week', '5+ times/week'];
const activityLevels = ['beginner', 'intermediate', 'advanced'];
type RootStackParamList = {
  Home: undefined;
  // add other routes here if needed
};

export default function ExtraData() {
  const route = useRoute(); 
 const {gender,age,weight,height,activityLevel}=route.params;
  console.log(gender,age,weight,height,activityLevel)
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedGoal, setSelectedGoal] = useState('beginner');
  const [selectedGender, setSelectedGender] = useState('Male');
  const [selectedFrequency, setSelectedFrequency] = useState('1-2 times/week');
  const [selectedActivity, setSelectedActivity] = useState('Low');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const currentStep = 1;
  const totalSteps = 10;
  const progress = currentStep / totalSteps;



  

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.progressBarSection}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.arrowIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={styles.progressBarArea}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarIndicator, { width: `${progress * 100}%` }]} />
          </View>
        </View>
        <Text style={styles.progressStepText}>{`${currentStep}/${totalSteps}`}</Text>
      </View>
      <Text style={styles.sectionTitle}>Fitness Goal</Text>
      <View style={styles.buttonRow}>
        {fitnessGoals.map(goal => (
          <SelectableButton
            key={goal}
            label={goal}
            selected={selectedGoal === goal}
            onPress={() => setSelectedGoal(goal)}
          />
        ))}
      </View>

    

      <Text style={styles.sectionTitle}>Workout Frequency</Text>
      <View style={{ marginBottom: 24 }}>
        <TouchableOpacity
          style={styles.dropdown}
          activeOpacity={0.8}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={styles.dropdownText}>{selectedFrequency}</Text>
          <Text style={styles.dropdownArrow}>{dropdownVisible ? '\u25B2' : '\u25BC'}</Text>
        </TouchableOpacity>
        <Modal
          visible={dropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
            <View style={styles.dropdownListWrapper}>
              {workoutFrequencies.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.dropdownOption,
                    selectedFrequency === freq && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedFrequency(freq);
                    setDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selectedFrequency === freq && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>

      <Text style={styles.sectionTitle}>Current Fitness Level</Text>
      <View style={styles.buttonRow}>
        {activityLevels.map(level => (
          <SelectableButton
            key={level}
            label={level}
            selected={selectedActivity === level}
            onPress={() => setSelectedActivity(level)}
          />
        ))}
      </View>

      <View style={{ flex: 1 }} />
      <TouchableOpacity style={styles.nextButton} activeOpacity={0.8} onPress={() => navigation.replace('SecurityQuestions',{gender,age,weight,height,activityLevel,selectedGoal,selectedFrequency,selectedActivity})}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SelectableButton({ label, selected, onPress, style = {}, selectedTextStyle = {}, unselectedTextStyle = {} }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: any;
  selectedTextStyle?: any;
  unselectedTextStyle?: any;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        selected ? styles.buttonSelected : styles.buttonUnselected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.buttonText,
          selected ? styles.selectedText : styles.unselectedText,
          selected ? selectedTextStyle : unselectedTextStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: SECTION_MARGIN,
    color: '#111',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: SECTION_MARGIN,
    gap: BUTTON_MARGIN,
  },
  button: {
    borderRadius: BUTTON_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 18,
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UNSELECTED_BG_COLOR,
    minWidth: 110,
  },
  buttonSelected: {
    backgroundColor: SELECTED_BG_COLOR,
    borderColor: SELECTED_BG_COLOR,
  },
  buttonUnselected: {
    backgroundColor: UNSELECTED_BG_COLOR,
    borderColor: BORDER_COLOR,
  },
  buttonText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '500',
  },
  selectedText: {
    color: SELECTED_TEXT_COLOR,
  },
  unselectedText: {
    color: UNSELECTED_TEXT_COLOR,
  },
  frequencyRow: {
    backgroundColor: '#F5F7FA',
    borderRadius: BUTTON_RADIUS,
    padding: 4,
    gap: 0,
  },
  frequencyButton: {
    minWidth: 0,
    flex: 1,
    marginHorizontal: 0,
    borderRadius: BUTTON_RADIUS,
    marginRight: 0,
    marginLeft: 0,
  },
  selectedFrequencyText: {
    color: SELECTED_TEXT_COLOR,
  },
  unselectedFrequencyText: {
    color: '#189EFF',
  },
  nextButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: BUTTON_RADIUS,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 0,
    marginBottom: 40,
    marginTop: 19,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  arrowIcon: {
    fontSize: 22,
    color: '#222',
    fontWeight: '600',
  },
  progressBarArea: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E5EAF0',
    overflow: 'hidden',
    width: '100%',
  },
  progressBarIndicator: {
    height: 18,
    borderRadius: 9,
    backgroundColor: '#189EFF',
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    minWidth: 48,
    textAlign: 'right',
    marginLeft: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 18,
    height: 48,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 18,
    color: '#189EFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownListWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dropdownOptionSelected: {
    backgroundColor: '#E6F1FF',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#222',
  },
  dropdownOptionTextSelected: {
    color: '#189EFF',
    fontWeight: '700',
  },
});