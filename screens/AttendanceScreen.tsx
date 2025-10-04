import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const dummyStudents = [
  'Aarav Sharma',
  'Meera Patel',
  'Rahul Gupta',
  'Sneha Reddy',
  'Vikram Singh',
  'Anaya Jain',
  'Rohit Mehta',
  'Priya Desai',
];

type AttendanceRecord = {
  date: string;
  present: string[];
  late: string[];
  earlyLeave: string[];
  absent: string[];
};

const STORAGE_KEY = '@attendance_records';

const AttendanceScreen = () => {
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showPreviousReport, setShowPreviousReport] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, 'present' | 'late' | 'earlyLeave' | 'absent'>
  >({});
  const [disabled, setDisabled] = useState(false);
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);
  const [previousRecords, setPreviousRecords] = useState<AttendanceRecord[]>([]);

  // Load previous attendance records on mount
  useEffect(() => {
    loadPreviousRecords();
  }, []);

  // Start 10-minute timer when form is opened
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAttendanceForm) {
      timer = setTimeout(() => {
        setDisabled(true);
        Alert.alert("⏰ Time's Up", "You can no longer mark attendance after 10 minutes.");
      }, 10 * 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [showAttendanceForm]);

  // Initialize attendanceStatus with absent for all students on form open
  useEffect(() => {
    if (showAttendanceForm) {
      const initialStatus: Record<string, 'absent'> = {};
      dummyStudents.forEach((student) => {
        initialStatus[student] = 'absent';
      });
      setAttendanceStatus(initialStatus);
      setDisabled(false);
      setAttendanceSubmitted(false);
    }
  }, [showAttendanceForm]);

  const toggleStatus = (name: string) => {
    if (disabled || attendanceSubmitted) return;
    // Cycle through statuses: absent -> present -> late -> earlyLeave -> absent
    setAttendanceStatus((prev) => {
      const current = prev[name];
      let next: 'present' | 'late' | 'earlyLeave' | 'absent' = 'absent';
      if (current === 'absent') next = 'present';
      else if (current === 'present') next = 'late';
      else if (current === 'late') next = 'earlyLeave';
      else if (current === 'earlyLeave') next = 'absent';
      return { ...prev, [name]: next };
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const saveRecord = async (record: AttendanceRecord) => {
    try {
      const existingRecordsJSON = await AsyncStorage.getItem(STORAGE_KEY);
      const existingRecords: AttendanceRecord[] = existingRecordsJSON
        ? JSON.parse(existingRecordsJSON)
        : [];

      // Remove record for today if exists, then add new one
      const filteredRecords = existingRecords.filter((r) => r.date !== record.date);
      const updatedRecords = [...filteredRecords, record];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
      setPreviousRecords(updatedRecords);
    } catch (e) {
      console.error('Failed to save attendance', e);
    }
  };

  const loadPreviousRecords = async () => {
    try {
      const recordsJSON = await AsyncStorage.getItem(STORAGE_KEY);
      const records: AttendanceRecord[] = recordsJSON ? JSON.parse(recordsJSON) : [];
      setPreviousRecords(records);
    } catch (e) {
      console.error('Failed to load attendance records', e);
    }
  };

  const handleSubmit = () => {
    if (attendanceSubmitted) return;

    const present: string[] = [];
    const late: string[] = [];
    const earlyLeave: string[] = [];
    const absent: string[] = [];

    for (const [student, status] of Object.entries(attendanceStatus)) {
      if (status === 'present') present.push(student);
      else if (status === 'late') late.push(student);
      else if (status === 'earlyLeave') earlyLeave.push(student);
      else absent.push(student);
    }

    const today = getTodayDate();

    const record: AttendanceRecord = {
      date: today,
      present,
      late,
      earlyLeave,
      absent,
    };

    saveRecord(record);

    setAttendanceSubmitted(true);
    Alert.alert(
      '✅ Attendance Submitted',
      `Present: ${present.length}\nLate: ${late.length}\nEarly Leave: ${earlyLeave.length}\nAbsent: ${absent.length}`
    );
  };

  const handleBack = () => {
    setShowAttendanceForm(false);
    setAttendanceStatus({});
    setDisabled(false);
    setAttendanceSubmitted(false);
  };

  const handleBackFromPrevious = () => {
    setShowPreviousReport(false);
  };

  const handleBackFromDashboard = () => {
    setShowDashboard(false);
  };

  // Calculate attendance summary for Dashboard
  const calculateSummary = () => {
    const totalClasses = previousRecords.length;
    const studentAttendanceCount: Record<string, number> = {};
    dummyStudents.forEach((student) => {
      studentAttendanceCount[student] = 0;
    });

    previousRecords.forEach((record) => {
      dummyStudents.forEach((student) => {
        if (
          record.present.includes(student) ||
          record.late.includes(student)
        ) {
          studentAttendanceCount[student]++;
        }
      });
    });

    return { totalClasses, studentAttendanceCount };
  };

  const summary = calculateSummary();

  const renderPreviousRecord = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.recordBox}>
      <Text style={styles.recordDate}>Date: {item.date}</Text>

      <Text style={styles.recordTitle}>Present:</Text>
      {item.present.length > 0 ? (
        item.present.map((student) => (
          <Text key={student} style={styles.recordStudent}>
            ✅ {student}
          </Text>
        ))
      ) : (
        <Text style={styles.recordStudent}>None</Text>
      )}

      <Text style={styles.recordTitle}>Late:</Text>
      {item.late.length > 0 ? (
        item.late.map((student) => (
          <Text key={student} style={styles.recordStudent}>
            ⏰ {student}
          </Text>
        ))
      ) : (
        <Text style={styles.recordStudent}>None</Text>
      )}

      <Text style={styles.recordTitle}>Early Leave:</Text>
      {item.earlyLeave.length > 0 ? (
        item.earlyLeave.map((student) => (
          <Text key={student} style={styles.recordStudent}>
            🏃 {student}
          </Text>
        ))
      ) : (
        <Text style={styles.recordStudent}>None</Text>
      )}

      <Text style={styles.recordTitle}>Absent:</Text>
      {item.absent.length > 0 ? (
        item.absent.map((student) => (
          <Text key={student} style={styles.recordStudent}>
            ❌ {student}
          </Text>
        ))
      ) : (
        <Text style={styles.recordStudent}>None</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Attendance</Text>

      {!showAttendanceForm && !showPreviousReport && !showDashboard && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowAttendanceForm(true)}
          >
            <Text style={styles.buttonText}>Mark Today's Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              loadPreviousRecords();
              setShowPreviousReport(true);
            }}
          >
            <Text style={styles.buttonText}>Check Previous Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              loadPreviousRecords();
              setShowDashboard(true);
            }}
          >
            <Text style={styles.buttonText}>View Attendance Dashboard</Text>
          </TouchableOpacity>
        </>
      )}

      {showAttendanceForm && (
        <>
          <Text style={styles.subtext}>
            Tap a student to cycle attendance status: Absent → Present → Late → Early Leave → Absent
          </Text>

          <FlatList
            data={dummyStudents}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const status = attendanceStatus[item] || 'absent';
              let bgColor = '#1a1a1a';
              let borderColor = 'red';
              let statusIcon = '';
              let statusTextColor = 'white';

              switch (status) {
                case 'present':
                  bgColor = '#262626';
                  borderColor = '#0f0';
                  statusIcon = '✅';
                  break;
                case 'late':
                  bgColor = '#262626';
                  borderColor = '#ffa500'; // orange
                  statusIcon = '⏰';
                  break;
                case 'earlyLeave':
                  bgColor = '#262626';
                  borderColor = '#00f';
                  statusIcon = '🏃';
                  break;
                case 'absent':
                default:
                  bgColor = '#1a1a1a';
                  borderColor = 'red';
                  statusIcon = '';
                  statusTextColor = '#999';
              }

              return (
                <TouchableOpacity
                  style={[styles.studentBox, { backgroundColor: bgColor, borderColor }]}
                  onPress={() => toggleStatus(item)}
                >
                  <Text style={[styles.studentName, { color: statusTextColor }]}>
                    {item} {statusIcon}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              (disabled || attendanceSubmitted) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={disabled || attendanceSubmitted}
          >
            <Text style={styles.submitText}>
              {attendanceSubmitted ? '✔️ Submitted' : 'Submit Attendance'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </>
      )}

      {showPreviousReport && (
        <>
          {previousRecords.length === 0 ? (
            <Text style={styles.noRecordsText}>No previous attendance records found.</Text>
          ) : (
            <ScrollView style={{ flex: 1, marginTop: 10 }}>
              {previousRecords
                .sort((a, b) => b.date.localeCompare(a.date)) // Latest first
                .map((record) => (
                  <View key={record.date} style={styles.recordBox}>
                    <Text style={styles.recordDate}>Date: {record.date}</Text>

                    <Text style={styles.recordTitle}>Present:</Text>
                    {record.present.length > 0 ? (
                      record.present.map((student) => (
                        <Text key={student} style={styles.recordStudent}>
                          ✅ {student}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.recordStudent}>None</Text>
                    )}

                    <Text style={styles.recordTitle}>Late:</Text>
                    {record.late.length > 0 ? (
                      record.late.map((student) => (
                        <Text key={student} style={styles.recordStudent}>
                          ⏰ {student}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.recordStudent}>None</Text>
                    )}

                    <Text style={styles.recordTitle}>Early Leave:</Text>
                    {record.earlyLeave.length > 0 ? (
                      record.earlyLeave.map((student) => (
                        <Text key={student} style={styles.recordStudent}>
                          🏃 {student}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.recordStudent}>None</Text>
                    )}

                    <Text style={styles.recordTitle}>Absent:</Text>
                    {record.absent.length > 0 ? (
                      record.absent.map((student) => (
                        <Text key={student} style={styles.recordStudent}>
                          ❌ {student}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.recordStudent}>None</Text>
                    )}
                  </View>
                ))}
            </ScrollView>
          )}

          <TouchableOpacity onPress={handleBackFromPrevious} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </>
      )}

      {showDashboard && (
        <>
          <Text style={styles.dashboardTitle}>📊 Attendance Dashboard</Text>
          <Text style={styles.dashboardText}>Total Classes Held: {summary.totalClasses}</Text>

          <ScrollView style={{ marginTop: 10 }}>
            {dummyStudents.map((student) => {
              const attended = summary.studentAttendanceCount[student] || 0;
              const attendancePercent =
                summary.totalClasses > 0
                  ? ((attended / summary.totalClasses) * 100).toFixed(1)
                  : '0.0';
              return (
                <View key={student} style={styles.dashboardStudentRow}>
                  <Text style={styles.dashboardStudentName}>{student}</Text>
                  <Text style={styles.dashboardStudentPercent}>{attendancePercent}%</Text>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity onPress={handleBackFromDashboard} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: 'red',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  dashboardTitle: {
    color: 'red',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  dashboardText: {
    color: '#aaa',
    fontSize: 18,
    textAlign: 'center',
  },
  dashboardStudentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  dashboardStudentName: {
    color: 'white',
    fontSize: 16,
  },
  dashboardStudentPercent: {
    color: '#0f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1a1a1a',
    borderColor: 'red',
    borderWidth: 2,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentBox: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  studentName: {
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: 'red',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  disabledButton: {
    backgroundColor: '#444',
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  backText: {
    color: '#999',
    fontSize: 16,
  },
  recordBox: {
    backgroundColor: '#1a1a1a',
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  recordDate: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  recordTitle: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 5,
  },
  recordStudent: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
  },
  noRecordsText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AttendanceScreen;
