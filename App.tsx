import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import FocusScreen from './screens/FocusScreen';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation, isNightMode }) => {
  return (
    <View style={[styles.tabBarContainer, { backgroundColor: isNightMode ? '#000' : '#fff' }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;
        const icon = route.name === 'Home' ? '🏠' : route.name === 'Workouts' ? '🎯' : '🧘';
        return (
            <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.tabButton}
          >
            <Text style={[
              styles.tabLabel,
              isFocused
                ? { color: isNightMode ? '#fff' : '#000', fontWeight: 'bold' }
                : { color: isNightMode ? '#fff' : '#000', opacity: 0.8 }
            ]}>{label}</Text>
            {isFocused && <View style={styles.tabUnderline} />}
                    </TouchableOpacity>
        );
      })}
                  </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#000',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 32,
    borderTopWidth: 0,
    elevation: 10,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tabLabelActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabLabelInactive: {
    color: '#fff',
    opacity: 0.8,
  },
  tabUnderline: {
    marginTop: 3,
    height: 3,
    width: 28,
    backgroundColor: '#FFA726',
    borderRadius: 2,
  },
});

const App = () => {
  const [isNightMode, setIsNightMode] = useState(false);
  const [inFocusMode, setInFocusMode] = useState(false);

  useEffect(() => {
    // ... existing code ...
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={props => (inFocusMode ? null : <CustomTabBar {...props} isNightMode={isNightMode} />)}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          children={() => <HomeScreen isNightMode={isNightMode} setIsNightMode={setIsNightMode} />}
        />
        <Tab.Screen
          name="Workouts"
          children={() => <WorkoutScreen isNightMode={isNightMode} setIsNightMode={setIsNightMode} />}
        />
        <Tab.Screen
          name="Focus"
          children={() => <FocusScreen isNightMode={isNightMode} setIsNightMode={setIsNightMode} inFocusMode={inFocusMode} setInFocusMode={setInFocusMode} />}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;