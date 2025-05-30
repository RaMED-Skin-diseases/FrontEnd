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
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserContext } from '../UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

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

  // Function to pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      //Alert.alert('Permission Denied', 'We need access to your photos to continue.');
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'We need access to your photos to continue.'
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
      // Add base64 option for web compatibility
      base64: Platform.OS === 'web',
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setPrediction(null);
      setProbability(null);
    }
  };

  // New function to take a photo with camera
  const takePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      //Alert.alert('Permission Denied', 'We need access to your camera to continue.');
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'We need access to your camera to continue.'
      });
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
      // Add base64 option for web compatibility
      base64: Platform.OS === 'web',
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setPrediction(null);
      setProbability(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      //Alert.alert('No Image Selected', 'Please upload or take an image first.');
      Toast.show({
        type: 'error',
        text1: 'No Image Selected',
        text2: 'Please upload or take an image first.'
      });
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


  function combineResults(class1, conf1, class2, conf2) {
    // Known conflict cases
    const conflictPairs = {
        'Eczema|Psoriasis': 'Psoriasis',
        'Benign Keratosis|actinic keratosis': 'actinic keratosis',
        'Melanocytic Nevi|Melanoma': 'Melanoma',
        'Atopic Dermatitis|Eczema': 'Eczema'
    };

    const key1 = `${class1}|${class2}`;
    const key2 = `${class2}|${class1}`;
    
    console.log('confidence',Math.max(parseFloat(conf1), parseFloat(conf2)))
    if (conflictPairs.hasOwnProperty(key1)) {
        return {
            final_class: conflictPairs[key1],
            confidence: Math.max(parseFloat(conf1), parseFloat(conf2))
        };
    } else if (conflictPairs.hasOwnProperty(key2)) {
        return {
            final_class: conflictPairs[key2],
            confidence: Math.max(parseFloat(conf1), parseFloat(conf2))
        };
    }

    if (conf1 > conf2 + 0.15) {
        return {
            final_class: class1,
            confidence: conf1
        };
    } else {
        return {
            final_class: class2,
            confidence: conf2
        };
    }
}

  const handleModalSubmit = async () => {
    setModalVisible(false); 
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      
      // Handle image data differently based on platform
      if (Platform.OS === 'web') {
        // For web, handle base64 image
        if (selectedImage.base64) {
          // Convert base64 to blob for web
          const base64Response = await fetch(`data:image/jpeg;base64,${selectedImage.base64}`);
          const blob = await base64Response.blob();
          
          // Create a file from the blob
          const fileName = 'upload.jpg';
          const image = new File([blob], fileName, { type: 'image/jpeg' });
          
          formData.append('image', image);
        } else if (selectedImage.uri) {
          // If base64 is not available but URI is, try to fetch the image and create a blob
          try {
            const response = await fetch(selectedImage.uri);
            const blob = await response.blob();
            formData.append('image', blob, 'upload.jpg');
          } catch (error) {
            console.error("Error creating blob from URI:", error);
            //Alert.alert('Error', 'Failed to process the image. Please try again.');
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to process the image. Please try again.'
            });
            setIsLoading(false);
            return;
          }
        }
      } else {
        // For native platforms (iOS/Android)
        formData.append('image', {
          uri: selectedImage.uri,
          name: 'upload.jpg',
          type: 'image/jpeg',
        });
      }
  
      const token = await AsyncStorage.getItem('accessToken');
      console.log('formdata',formData)
      
      // Make the API request
      const response = await fetch('https://skinwise.tech/detect/upload-image/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(Platform.OS !== 'web' && { "Content-Type": "multipart/form-data" }),
        },
        body: formData,
      });
  
      console.log('Response:', response);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Data:', data);
      setPrediction(data.diagnosis_result.class)
      setProbability(data.diagnosis_result.probability);
      // let combined_results = combineResults(
      //   data.tensorflow_prediction.class,
      //   data.tensorflow_prediction.probability,
      //   data.torch_prediction.class,
      //   data.torch_prediction.probability
      // );
      
      // console.log('Combined Results:', combined_results);
      // setPrediction(combined_results.final_class);
      // console.log(combined_results.confidence);
      // setProbability(combined_results.confidence);
  
    } catch (error) {
      console.error("Analysis error:", error);
      //Alert.alert('Error', error.message || 'Failed to analyze image.');
      let message = 'Failed to analyze image.';
      if (error.message.includes('504')) {
      message = 'The server took too long. try again later.';
      } else if (error.message.includes('Network request failed')) {
      message = 'Please check your internet connection.';
     }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message || 'Failed to analyze image.'
      });
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
          <Text style={styles.headerSubtitle}>Upload or take a clear skin image for instant results</Text>
        </View>

        <View style={styles.uploadContainer}>
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
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
              <Text style={styles.placeholderText}>Tap below to upload or take an image</Text>
            </View>
          )}

          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity
              style={[styles.imageButton, { marginRight: 8 }]}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#007BFF', '#0056D2']} style={styles.gradientButton}>
                <Ionicons name="images-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Only show camera button if not on web or if web has camera support */}
            {(Platform.OS !== 'web' || (Platform.OS === 'web' && navigator?.mediaDevices?.getUserMedia)) && (
              <TouchableOpacity
                style={[styles.imageButton, { marginLeft: 8 }]}
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#28A745', '#218838']} style={styles.gradientButton}>
                  <Ionicons name="camera-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.imageButtonText}>Camera</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
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
              <Text style={styles.resultValue}>{probability} %</Text>
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
                style={{ width:'100%', height: 40 }}
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
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  imageButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 150,
  },
  gradientButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  imageButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#6B7280' },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  resultTitle: { fontSize: 20, fontWeight: '700', color: '#1E2A3C', marginBottom: 15 },
  resultRow: { flexDirection: 'row', marginBottom: 10 },
  resultLabel: { fontSize: 16, color: '#6B7280', width: 100 },
  resultValue: { fontSize: 16, fontWeight: '600', color: '#1E2A3C', flex: 1 },
  chatButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  chatButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E2A3C', marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 16, color: '#6B7280', marginBottom: 10 },
  valueText: { fontSize: 16, color: '#1E2A3C', textAlign: 'center', marginBottom: 15 },
  optionButtons: { flexDirection: 'row', marginBottom: 15 },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  optionSelected: { backgroundColor: '#A0C4FF', borderColor: '#007BFF' },
  optionText: { fontSize: 16, color: '#1E2A3C' },
  submitButton: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: '#1E2A3C', fontSize: 16, fontWeight: '600' },
});
