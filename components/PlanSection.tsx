import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface PlanSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  isNightMode?: boolean;
}

const PlanSection: React.FC<PlanSectionProps> = ({ title, description, children, isNightMode }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.heading, isNightMode && { color: '#fff' }]}>{title}</Text>
      <Text style={[styles.description, isNightMode && { color: '#fff' }]}>{description}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        <View style={styles.carouselContent}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 0,
    marginTop: 0,
    paddingVertical: 0,
    marginVertical: 0,
  },
  carousel: {
    marginTop: 18,
    marginBottom: 0,
    paddingVertical: 0,
    marginVertical: 0,
  },
  carouselContent: {
    flexDirection: 'row',
    paddingTop: 0,
    paddingBottom: 0,
  },
});

export default PlanSection; 