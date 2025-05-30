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
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { AntDesign } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const SPECIAL_MESSAGE = "The model could not confidently identify the disease. Your skin may be healthy or an unrecognized condition.";

const ProfileScreen = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState(null);

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

  // Custom confirmation dialog that works on all platforms
  const ConfirmationModal = () => (
    <Modal
      visible={showConfirmModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Delete Diagnosis</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to delete this entry?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowConfirmModal(false);
                setSelectedDiagnosisId(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={() => {
                setShowConfirmModal(false);
                if (selectedDiagnosisId) {
                  performDelete(selectedDiagnosisId);
                }
              }}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const handleDelete = (id) => {
    // For web, use our custom modal
    if (Platform.OS === 'web') {
      setSelectedDiagnosisId(id);
      setShowConfirmModal(true);
    } else {
      // Alert.alert('Delete Diagnosis', 'Are you sure you want to delete this entry?', [
      //   {
      //     text: 'Cancel',
      //     style: 'cancel',
      //   },
      //   {
      //     text: 'Delete',
      //     style: 'destructive',
      //     onPress: () => performDelete(id),
      //   },
      // ]);
      Toast.show({
        type: 'info',
        text1: 'Delete Diagnosis',
        text2: 'Are you sure you want to delete this entry?',
        position: 'top',
        visibilityTime: 3000,
        onPress: () => {
          performDelete(id);
        },
        onHide: () => {
          setSelectedDiagnosisId(null);
        },
      });
      Toast.show({
        type: 'success',
        text1: 'Deleted Successfully',
        position: 'top',
        visibilityTime: 2000,
      });
      setSelectedDiagnosisId(id);
      setShowConfirmModal(true);
    }
  };

  // Separate the actual delete operation
  const performDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(
        `https://skinwise.tech/detect/delete-diagnosis/${id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        console.log('Successfully deleted diagnosis:', id);
        setDiagnoses((prev) => prev.filter((d) => d.id !== id));
      } else {
        console.error('Failed to delete diagnosis. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Show error message
        if (Platform.OS === 'web') {
          alert('Failed to delete. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to delete. Please try again.');
        }
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      
      // Show error message
      if (Platform.OS === 'web') {
        alert('An error occurred. Please try again.');
      } else {
        Alert.alert('Error', 'An error occurred. Please try again.');
      }
    }
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

      {/* Custom confirmation modal for web */}
      <ConfirmationModal />

      {loading ? (
        <ActivityIndicator size="large" color="#3E4A59" />
      ) : diagnoses.length > 0 ? (
        diagnoses.map((entry) => {
          const result = JSON.parse(entry.diagnosis_result);
          const message = result.message || `Condition: ${result.class}`;
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
