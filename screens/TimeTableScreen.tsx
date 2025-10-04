import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type TimetableEntry = {
  id: string; // unique id for FlatList keys
  day: string;
  startTime: string; // format "HH:mm"
  endTime: string;
  subject: string;
};

const TimetableScreen = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState(new Date(0, 0, 0, 9, 0)); // default 9:00 AM
  const [endTime, setEndTime] = useState(new Date(0, 0, 0, 10, 0)); // default 10:00 AM
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@timetable');
      if (jsonValue != null) {
        setEntries(JSON.parse(jsonValue));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load timetable');
    }
  };

  const saveEntries = async (newEntries: TimetableEntry[]) => {
    try {
      await AsyncStorage.setItem('@timetable', JSON.stringify(newEntries));
    } catch (e) {
      Alert.alert('Error', 'Failed to save timetable');
    }
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5); // "HH:mm"
  };

  const addEntry = () => {
    if (!subject.trim()) {
      Alert.alert('Validation', 'Please enter a subject');
      return;
    }
    if (startTime >= endTime) {
      Alert.alert('Validation', 'End time must be after start time');
      return;
    }

    const newEntry: TimetableEntry = {
      id: Date.now().toString(),
      day: selectedDay,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      subject: subject.trim(),
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    saveEntries(updatedEntries);

    // reset form
    setSubject('');
  };

  const onChangeStartTime = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartTime(selectedDate);
  };

  const onChangeEndTime = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndTime(selectedDate);
  };

  const renderItem = ({ item }: { item: TimetableEntry }) => (
    <View style={styles.entry}>
      <Text style={styles.entryText}>
        {item.day}: {item.startTime} - {item.endTime} → {item.subject}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Custom Timetable</Text>

      {/* Day selector */}
      <View style={styles.row}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              day === selectedDay ? styles.dayButtonSelected : null,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayText,
                day === selectedDay ? styles.dayTextSelected : null,
              ]}
            >
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subject input */}
      <TextInput
        style={styles.input}
        placeholder="Subject"
        placeholderTextColor="#777"
        value={subject}
        onChangeText={setSubject}
      />

      {/* Start time picker */}
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowStartPicker(true)}
      >
        <Text style={styles.timeButtonText}>
          Start Time: {formatTime(startTime)}
        </Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeStartTime}
        />
      )}

      {/* End time picker */}
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowEndPicker(true)}
      >
        <Text style={styles.timeButtonText}>
          End Time: {formatTime(endTime)}
        </Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeEndTime}
        />
      )}

      {/* Add button */}
      <TouchableOpacity style={styles.addButton} onPress={addEntry}>
        <Text style={styles.addButtonText}>Add Subject</Text>
      </TouchableOpacity>

      {/* List of entries */}
      <FlatList
        style={{ marginTop: 20 }}
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ color: '#777', textAlign: 'center', marginTop: 30 }}>
            No timetable entries yet.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    color: 'red',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'red',
  },
  dayButtonSelected: {
    backgroundColor: 'red',
  },
  dayText: {
    color: 'red',
    fontWeight: 'bold',
  },
  dayTextSelected: {
    color: '#000',
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: 'red',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 18,
    borderWidth: 2,
    borderColor: 'red',
    marginBottom: 15,
  },
  timeButton: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'red',
    marginBottom: 10,
    alignItems: 'center',
  },
  timeButtonText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  addButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  entry: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  entryText: {
    color: 'red',
    fontSize: 16,
  },
});

export default TimetableScreen;
