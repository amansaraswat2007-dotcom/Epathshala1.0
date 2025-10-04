import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type TimetableEntry = {
  day: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  subject: string;
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('Teacher');
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);

  useEffect(() => {
    checkCurrentSubject();
  }, []);

  const checkCurrentSubject = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@timetable');
      if (!jsonValue) return;

      const timetable: TimetableEntry[] = JSON.parse(jsonValue);
      const now = new Date();
      const currentDay = format(now, 'EEEE'); // e.g. "Monday"
      const currentTime = format(now, 'HH:mm');

      const match = timetable.find(
        (entry) =>
          entry.day === currentDay &&
          entry.startTime <= currentTime &&
          currentTime <= entry.endTime
      );

      if (match) {
        setCurrentSubject(match.subject);
      } else {
        setCurrentSubject(null);
      }
    } catch (err) {
      console.error('Failed to load timetable:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    else if (hour < 17) return 'Good Afternoon';
    else return 'Good Evening';
  };

  const todayDate = format(new Date(), 'dd MMMM yyyy');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.leftTop}>
          <Text style={styles.dateText}>{todayDate}</Text>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.usernameText}>Hi, {username}</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Profile')}>
          <Ionicons name="person-circle" size={40} color="red" />
        </TouchableOpacity>
      </View>

      {/* Subject from timetable */}
      {currentSubject && (
        <View style={styles.currentSubjectBox}>
          <Text style={styles.currentSubjectTitle}>Current Subject:</Text>
          <Text style={styles.currentSubjectText}>{currentSubject}</Text>
        </View>
      )}

      {/* Navigation buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('Attendance')}
        >
          <Text style={styles.cardText}>📝 Mark Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('Announcement')}
        >
          <Text style={styles.cardText}>📢 Announcements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('Message')}
        >
          <Text style={styles.cardText}>💬 Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('VirtualID')}
        >
          <Text style={styles.cardText}>🆔 Virtual ID</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('TimeTable')}
        >
          <Text style={styles.cardText}>📅 Time Table</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftTop: {
    flexDirection: 'column',
  },
  dateText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  greetingText: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
  },
  usernameText: {
    color: 'red',
    fontSize: 18,
  },
  currentSubjectBox: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'red',
  },
  currentSubjectTitle: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  currentSubjectText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop: 30,
  },
  cardButton: {
    backgroundColor: '#1a1a1a',
    borderColor: 'red',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardText: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
