import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserContext } from '../UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AIPrediction({ navigation }) {
  const { addPrediction } = useContext(UserContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [usesSunscreen, setUsesSunscreen] = useState(null);
  const [sunlightDuration, setSunlightDuration] = useState('');
  const [skinCancerHistory, setSkinCancerHistory] = useState(null);
  const [areaGrowingShape, setAreaGrowingShape] = useState(null);
  const [experienceItching, setExperienceItching] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to continue.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setPrediction(null);
      setProbability(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please upload an image first.');
      return;
    }

    setModalVisible(true); // Open modal before the analysis
  };

  const goToChatBotWithSummary = () => {
    const summary = `As a dermatology assistant, I've analyzed an image and detected ${prediction} with ${probability} confidence.
  Based on this analysis, provide helpful, factual medical information about ${prediction}.
  IMPORTANT: Always advise the patient to consult with a healthcare professional for proper diagnosis and treatment.
  
  Additional Questionnaire Responses:
  - Daily Sunlight Exposure: ${sunlightDuration} hours
  - Uses Sunscreen: ${usesSunscreen ? 'Yes' : 'No'}
  - Experiences Bleeding/Itching: ${experienceItching ? 'Yes' : 'No'}
  - Area Growing or Changing Shape: ${areaGrowingShape ? 'Yes' : 'No'}
  - Family History of Skin Cancer: ${skinCancerHistory ? 'Yes' : 'No'}`;
  
    console.log(summary);
  
    navigation.navigate('AIChat', { initialMessage: summary });
  };
  
  const handleModalSubmit = async () => {
    console.log('Sunlight Duration:', sunlightDuration);
    console.log('Uses Sunscreen:', usesSunscreen ? 'Yes' : 'No');
    console.log('Skin Cancer History:', skinCancerHistory ? 'Yes' : 'No');
    console.log('Area Growing/Changing Shape:', areaGrowingShape ? 'Yes' : 'No');
    console.log('Experience Itching:', experienceItching ? 'Yes' : 'No');
  
    setModalVisible(false);
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        name: 'upload.jpg',
        type: 'file/jpeg',
      });

      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response:', response);
      console.log(formData);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Data:', data.predicted_class);
      setPrediction(data.predicted_class || data.message);
      setProbability(data.probability || "N/A");
  
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to analyze image.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const removeImage = () => {
    setSelectedImage(null);
    setPrediction(null);
    setProbability(null);
  };

  return (
    <LinearGradient colors={['#E6F0FA', '#FFFFFF']} style={styles.gradientBackground}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Skin Analysis</Text>
          <Text style={styles.headerSubtitle}>Upload a clear skin image for instant results</Text>
        </View>

        <View style={styles.uploadContainer}>
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeIcon}
                onPress={removeImage}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={30} color="#FF4D4D" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Tap below to upload an image</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#007BFF', '#0056D2']} style={styles.gradientButton}>
              <Text style={styles.uploadButtonText}>
                {selectedImage ? 'Change Image' : 'Upload Image'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={analyzeImage}
              activeOpacity={0.7}
            >
              <Text style={styles.analyzeButtonText}>Analyze</Text>
            </TouchableOpacity>
            
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Analyzing your image...</Text>
          </View>
        )}

        {prediction && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Analysis Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Condition:</Text>
              <Text style={styles.resultValue}>{prediction}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Confidence:</Text>
              <Text style={styles.resultValue}>{probability}</Text>
            </View>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={goToChatBotWithSummary}
            >
              <Text style={styles.chatButtonText}>Continue to your dermatology assistant</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal for Questionnaire */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Before we analyze...</Text>

              <Text style={styles.modalLabel}>How long are you subjected to sunlight daily?</Text>
              <Slider
                style={{ width:330, height: 40 }}
                minimumValue={0}
                maximumValue={15}
                minimumTrackTintColor="#0000FF"
                maximumTrackTintColor="#000000"
                step={0.5}
                value={sunlightDuration}
                onValueChange={setSunlightDuration}
              />
              <Text style={styles.valueText}>{sunlightDuration} hours</Text>

              <Text style={styles.modalLabel}>Do you use sunscreen regularly?</Text>
              <View style={styles.optionButtons}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    usesSunscreen === true && styles.optionSelected,
                  ]}
                  onPress={() => setUsesSunscreen(true)}
                >
                  <Text style={styles.optionText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    usesSunscreen === false && styles.optionSelected,
                  ]}
                  onPress={() => setUsesSunscreen(false)}
                >
                  <Text style={styles.optionText}>No</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Do you experience bleeding or itching?</Text>
              <View style={styles.optionButtons}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    experienceItching === true && styles.optionSelected,
                  ]}
                  onPress={() => setExperienceItching(true)}
                >
                  <Text style={styles.optionText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    experienceItching === false && styles.optionSelected,
                  ]}
                  onPress={() => setExperienceItching(false)}
                >
                  <Text style={styles.optionText}>No</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Is the affected area growing or changing shape?</Text>
              <View style={styles.optionButtons}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    areaGrowingShape === true && styles.optionSelected,
                  ]}
                  onPress={() => setAreaGrowingShape(true)}
                >
                  <Text style={styles.optionText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    areaGrowingShape === false && styles.optionSelected,
                  ]}
                  onPress={() => setAreaGrowingShape(false)}
                >
                  <Text style={styles.optionText}>No</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Any family history of skin cancer?</Text>
              <View style={styles.optionButtons}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    skinCancerHistory === true && styles.optionSelected,
                  ]}
                  onPress={() => setSkinCancerHistory(true)}
                >
                  <Text style={styles.optionText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    skinCancerHistory === false && styles.optionSelected,
                  ]}
                  onPress={() => setSkinCancerHistory(false)}
                >
                  <Text style={styles.optionText}>No</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleModalSubmit}
              >
                <Text style={styles.submitButtonText}>Submit & Analyze</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1E2A3C' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 5 },
  uploadContainer: { alignItems: 'center', marginBottom: 20 },
  placeholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#EDEFF2',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  placeholderText: { fontSize: 16, color: '#6B7280', fontStyle: 'italic' },
  imageContainer: { position: 'relative', width: '100%' },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  removeIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 2,
  },
  uploadButton: { borderRadius: 12, overflow: 'hidden' },
  gradientButton: { paddingVertical: 12, paddingHorizontal: 30 },
  uploadButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  loadingText: { fontSize: 16, color: '#007BFF', marginTop: 10 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  resultTitle: { fontSize: 20, fontWeight: '700', color: '#1E2A3C', marginBottom: 15 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resultLabel: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  resultValue: { fontSize: 16, color: '#007BFF', fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  optionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  optionButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  optionSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  optionText: {
    color: '#333',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },valueText: {
    fontSize: 16,
    color: '#000',
    marginTop: 10,
    textAlign: 'center',
  },
  chatButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
});
