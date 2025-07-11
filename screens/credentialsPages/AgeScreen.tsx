import React, { useRef, useState } from 'react';
import { useRoute } from '@react-navigation/native'; 
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextStyle,
} from 'react-native';

const { width } = Dimensions.get('window');
// Use AGES array for age selection, e.g., 10-100 years
const AGES = Array.from({ length: 91 }, (_, i) => 10 + i); // 10-100
const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

export default function AgeScreen({ navigation }: any) {
  const route = useRoute();
  const { gender } = route.params || {};
  // Default to age 20
  const defaultAge = 20;
  const defaultIndex = AGES.indexOf(defaultAge);
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setSelectedIndex(index);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: true });
  };

  React.useEffect(() => {
    scrollToIndex(selectedIndex);
  }, []);

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
        <Text style={styles.stepText}>5/10</Text>
      </View>
      {/* Title */}
      <Text style={styles.title}>Enter Your Age</Text>
      <Text style={styles.subtitle}>Please provide your Age.</Text>
      {/* Picker */}
      <View style={styles.pickerContainer}>
        <FlatList
          ref={flatListRef}
          data={AGES}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          bounces={false}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * CENTER_INDEX,
          }}
          getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          onScroll={onScroll}
          scrollEventThrottle={16}
          initialScrollIndex={selectedIndex}
          renderItem={({ item, index }) => {
            const distance = Math.abs(index - selectedIndex);
            const fontStyles: TextStyle[] = [
              { fontSize: 34, color: '#2563FF', fontWeight: 'bold' },
              { fontSize: 26, color: '#111827', fontWeight: '500' },
              { fontSize: 20, color: '#6B7280', fontWeight: '500' },
              { fontSize: 16, color: '#9CA3AF', fontWeight: '400' },
            ];
            const textStyle = fontStyles[Math.min(distance, fontStyles.length - 1)];

            return (
              <View style={styles.itemContainer}>
                <Text style={textStyle}>{item}</Text>
              </View>
            );
          }}
        />
        <View style={styles.overlay}>
          <Text style={styles.staticKgText}>years</Text>
          <View style={styles.overlayLineTop} />
          <View style={styles.overlayLineBottom} />
        </View>
      </View>
      {/* Bottom Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.replace('Weight', { gender, age: AGES[selectedIndex] })}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ...existing

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
    width: '50%',
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
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 32,
    marginLeft: 1,
    paddingLeft: -4,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staticKgText: {
    position: 'absolute',
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
    transform: [{ translateX: 45 }],
    marginRight: -30,
  },
  overlayLineTop: {
    position: 'absolute',
    width: '30%',
    height: 2,
    backgroundColor: '#E5E7EB',
    top: '50%',
    transform: [{ translateY: -ITEM_HEIGHT / 2 }],
  },
  overlayLineBottom: {
    position: 'absolute',
    width: '30%',
    height: 2,
    backgroundColor: '#E5E7EB',
    top: '50%',
    transform: [{ translateY: ITEM_HEIGHT / 2 }],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 'auto',
    marginBottom: 24,
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