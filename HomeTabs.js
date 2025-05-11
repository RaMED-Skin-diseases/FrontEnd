import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Import icons
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import CommunityScreen from './screens/CommunityScreen';

const Tab = createBottomTabNavigator();

export default function HomeTabs({ route }) {
  const identifier = route.params?.identifier || '';

  return (
    <Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ color, size }) => {
      let iconName;

      if (route.name === 'Home') {
        iconName = 'home';
      } else if (route.name === 'Profile') {
        iconName = 'person';
      } else if (route.name === 'Settings') {
        iconName = 'settings';
      } else if (route.name === 'Community') {
        iconName = 'people';
      }

      return <MaterialIcons name={iconName} size={22} color={color} />;
    },
    tabBarActiveTintColor: '#A0C4FF',
    tabBarInactiveTintColor: 'gray',
    tabBarStyle: {
      backgroundColor: '#FFFFFF',
      height: 60,               
      paddingBottom: 4,        
      paddingTop: 0,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      marginBottom: 12,          
    },
  })}
>

      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        initialParams={{ identifier }}
      />
    </Tab.Navigator>
  );
}
