import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import AnnouncementScreen from './screens/AnnouncementScreen';
import MessageScreen from './screens/MessageScreen';
import VirtualIDScreen from './screens/VirtualIDScreen';
import TimeTableScreen from './screens/TimeTableScreen';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Attendance: undefined;
  Announcement: undefined;
  Message: undefined;
  VirtualID: undefined;
  TimeTable: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: 'red',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'SIMS Dashboard' }}
        />
        <Stack.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{ title: 'Attendance' }}
        />
        <Stack.Screen
          name="Announcement"
          component={AnnouncementScreen}
          options={{ title: 'Announcements' }}
        />
        <Stack.Screen
          name="Message"
          component={MessageScreen}
          options={{ title: 'Messages' }}
        />
        <Stack.Screen
          name="VirtualID"
          component={VirtualIDScreen}
          options={{ title: 'Virtual ID' }}
        />
        <Stack.Screen
          name="TimeTable"
          component={TimeTableScreen}
          options={{ title: 'Time Table' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
