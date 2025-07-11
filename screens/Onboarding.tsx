import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import On1 from './On1';
import On4 from './On4';
import On5 from './On5';
import On6 from './On6';
import FloatingBottom from './FloatingBottom';

const { width } = Dimensions.get('window');

type PageSelectedEvent = { nativeEvent: { position: number } };

export default function Onboarding({ navigation }: any) {
  const [page, setPage] = useState(0);
  const totalPages = 4;

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e: PageSelectedEvent) => setPage(e.nativeEvent.position)}
      >
        <View key="1" style={{ flex: 1 }}><On1 /></View>
        <View key="2" style={{ flex: 1 }}><On4 /></View>
        <View key="3" style={{ flex: 1 }}><On5 /></View>
        <View key="4" style={{ flex: 1 }}><On6 /></View>
      </PagerView>
      <FloatingBottom page={page} totalPages={totalPages} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  // ... keep for future use if needed
});