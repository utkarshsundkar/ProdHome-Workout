import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import WorkoutScreen from './screens/WorkoutScreen';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;
        const icon = route.name === 'Home' ? '🏠' : '🎯';
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
            <Text style={[styles.tabLabel, isFocused ? styles.tabLabelActive : styles.tabLabelInactive]}>{label}</Text>
            {isFocused && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#000',
    height: 48,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 0,
    elevation: 10,
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
    color: '#FFA726',
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

export default function App() {
  const [isNightMode, setIsNightMode] = React.useState(false);

  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
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
      </Tab.Navigator>
    </NavigationContainer>
  );
}