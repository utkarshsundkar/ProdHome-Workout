import React, { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import femaleImg from "../../assets/female.png"

const GenderScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState(null);
  const route = useRoute();
    const { userId } = route.params || {};

  const handleContinue = () => {
    if (selectedGender) {
      navigation.replace('Age', { gender: selectedGender });
    }
  };

  const handleSkip = () => {
    setSelectedGender('Other');
    navigation.navigate('Age', { gender: 'Other' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress & Header */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Text style={styles.backArrow}>{'<-'}</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.stepText}>1/10</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Select Your Gender</Text>
      <Text style={styles.subtitle}>Help us understand you better.</Text>

      {/* Gender Options */}
      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[
            styles.genderOption,
            selectedGender === 'Male' && styles.selectedCard,
          ]}
          onPress={() => setSelectedGender('Male')}
        >
          <Image source={require('../../assets/male.jpeg')} style={styles.genderImage} />
          <Text style={styles.label}>Man</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderOption,
            selectedGender === 'Female' && styles.selectedCard,
          ]}
          onPress={() => setSelectedGender('Female')}
        >
          <Image source={femaleImg} style={styles.genderImage} />
          <Text style={styles.label}>Woman</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GenderScreen;

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 22,
    marginRight: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  progressFill: {
    width: '10%',
    height: 6,
    backgroundColor: '#4e8cff',
    borderRadius: 10,
  },
  stepText: {
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  genderOption: {
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  selectedCard: {
    borderColor: '#4e8cff',
    backgroundColor: '#e6f0ff',
  },
  genderImage: {
    width: '100%',
    height: 500,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  skipButton: {
    backgroundColor: '#e6f0ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  continueButton: {
    backgroundColor: '#1f65ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  skipText: {
    color: '#1f65ff',
    fontWeight: '600',
    fontSize: 16,
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
