import React, { useState, useContext   } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserContext } from '../UserContext';

export default function AIPrediction() {
  const { addPrediction } = useContext(UserContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [suggestedTreatment, setSuggestedTreatment] = useState(null);

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
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setPrediction(null); // Reset prediction for new image
      setSuggestedTreatment(null); // Reset suggested treatment
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please upload an image before analyzing.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPrediction('Eczema'); // Simulating prediction
      setSuggestedTreatment(
        '1. Use a hydrocortisone cream as directed.\n' +
        '2. Avoid scratching the affected area.\n' +
        '3. Keep skin moisturized with fragrance-free creams.\n' +
        '4. Wear soft, non-irritating fabrics.'
      ); // Simulating treatment suggestion
    }, 5000); // Simulating a delay of 5 seconds
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPrediction(null); // Reset prediction as well
    setSuggestedTreatment(null); // Reset treatment
  };

  const savePrediction = () => {
    if (!prediction) {
      Alert.alert('No Prediction', 'Please analyze an image before saving.');
      return;
    }

    // Save prediction to the history
    const newPrediction = {
      condition: prediction,
      date: new Date().toLocaleDateString(),
      suggestedTreatment: 'Apply moisturizer and consult a dermatologist.', // Example
    };

    addPrediction(newPrediction);
    Alert.alert('Saved', 'Your prediction has been saved!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Upload a clear image of your skin</Text>

      {/* Image Upload Section */}
      <View style={styles.uploadSection}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image Selected</Text>
          </View>
        )}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadButtonText}>
            {selectedImage ? 'Change Image' : 'Upload Image'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {selectedImage && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <Text style={styles.removeButtonText}>Remove Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
            <Text style={styles.analyzeButtonText}>Analyze Image</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />}

      {/* Prediction Result */}
      {prediction && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Result</Text>
          <Text style={styles.resultText}>
            Condition: <Text style={styles.predictionHighlight}>{prediction}</Text>
          </Text>
          <Text style={styles.resultDescription}>
            Eczema is a common skin condition causing redness and itching. It is manageable with
            proper care.
          </Text>
          <Text style={styles.resultSubTitle}>Suggested Treatment</Text>
          <Text style={styles.suggestedTreatment}>{suggestedTreatment}</Text>

          <TouchableOpacity style={styles.saveButton} onPress={savePrediction}>
        <Text style={styles.saveButtonText}>Save Prediction</Text>
      </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginBottom: 5,
  },
  uploadSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#E9ECEF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    color: '#6C757D',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  removeButton: {
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: '#FF4D4D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  analyzeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#28A745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 10,
  },
  predictionHighlight: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  resultSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginTop: 10,
    marginBottom: 5,
  },
  suggestedTreatment: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
