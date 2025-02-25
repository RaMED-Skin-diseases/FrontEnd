import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { UserContext } from '../UserContext';
const ProfileScreen = () => {
  // Access predictions from UserContext
  const { predictions } = useContext(UserContext);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>
          Track your skin condition progression and improvement over time.
        </Text>
      </View>

      {/* History Section */}
      {predictions.length > 0 ? (
        predictions.map((entry, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.date}>Date: {entry.date}</Text>
            <Text style={styles.condition}>Condition: {entry.condition}</Text>
            {entry.notes && <Text style={styles.notes}>Notes: {entry.notes}</Text>}
            <Text style={styles.treatment}>
              Suggested Treatment: {entry.suggestedTreatment}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.noData}>
          <Text style={styles.noDataText}>No history available. Start uploading images!</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E4A59',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginBottom: 5,
  },
  condition: {
    fontSize: 16,
    color: '#495057',
  },
  notes: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 5,
  },
  treatment: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 5,
  },
  noData: {
    marginTop: 50,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6C757D',
  },
});
