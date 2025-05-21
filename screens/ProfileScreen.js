import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { AntDesign } from '@expo/vector-icons';


const SPECIAL_MESSAGE = "The model could not confidently identify the disease. Your skin may be healthy or an unrecognized condition.";

const ProfileScreen = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDiagnoses = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(
        'https://skinwise.tech/detect/my-diagnoses/',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      console.log('Fetched diagnoses:', data);
      const sorted = data.diagnoses.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setDiagnoses(sorted);
    } catch (err) {
      console.error('Failed to fetch diagnoses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Diagnosis', 'Are you sure you want to delete this entry?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('accessToken');
            await fetch(
              `https://skinwise.tech/detect/delete-diagnosis/${id}/`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setDiagnoses((prev) => prev.filter((d) => d.id !== id));
          } catch (err) {
            console.error('Failed to delete:', err);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>
          Track your skin condition progression and improvement over time.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3E4A59" />
      ) : diagnoses.length > 0 ? (
        diagnoses.map((entry) => {
          const result = JSON.parse(entry.diagnosis_result);
          const message = result.message || `Condition: ${result.predicted_class}`;
          const probability = result.probability || 'N/A';
          return (
            <View key={entry.id} style={styles.card}>
              <Image source={{ uri: entry.image_url }} style={styles.image} />
              <TouchableOpacity
                style={styles.deleteIcon}
                onPress={() => handleDelete(entry.id)}
              >
                <AntDesign name="delete" size={20} color="#ff6b6b" />
              </TouchableOpacity>
              <Text style={styles.date}>
                {format(new Date(entry.created_at), 'MMM dd, yyyy - hh:mm a')}
              </Text>
              <Text style={styles.message}>{message}</Text>
              {message !== SPECIAL_MESSAGE && (
                <Text style={styles.probability}>Confidence: {probability}</Text>
              )}
            </View>
          );
        })
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
    fontSize: 26,
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    zIndex: 1,
  },
  date: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
    color: '#3E4A59',
    fontWeight: '500',
  },
  probability: {
    fontSize: 14,
    color: '#17a2b8',
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