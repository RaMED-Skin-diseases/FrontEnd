import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator , Platform } from 'react-native'; // Import ActivityIndicator
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
export default function SignupScreenPart3({ route, navigation }) {
  const { form } = route.params;

  const [doctorInfo, setDoctorInfo] = useState({
    bio: '',
    specialization: '',
    clinicDetails: '',
    verificationImage: null,
  });

  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const handleChange = (field, value) => {
    setDoctorInfo({ ...doctorInfo, [field]: value });
  };

  const pickImage = async () => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      //Alert.alert("Permission required", "Please allow access to photo library to upload verification image.");
      Toast.show({
        type: 'error',
        text1: 'Permission Required',
        text2: 'Please allow access to photo library to upload verification image.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setDoctorInfo({ ...doctorInfo, verificationImage: result.assets[0] });
    }
  };

  const handleSubmit = async () => {
    if (!doctorInfo.bio || !doctorInfo.specialization || !doctorInfo.clinicDetails || !doctorInfo.verificationImage) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please complete all fields and upload a verification image.',
      });
      return;
    }
  
    setIsLoading(true);
  
    const formData = new FormData();
    formData.append('f_name', form.firstName || '');
    formData.append('l_name', form.lastName || '');
    formData.append('date_of_birth', form.dateOfBirth || '');
    formData.append('email', form.email ? form.email.toLowerCase() : '');
    formData.append('gender', form.gender || '');
    formData.append('password', form.password || '');
    formData.append('username', form.username || '');
    formData.append('user_type', form.userRole || '');
    formData.append('info', doctorInfo.bio || '');
    formData.append('specialization', doctorInfo.specialization || '');
    formData.append('clinic_details', doctorInfo.clinicDetails || '');
  
    // Handle verification_image based on platform
    if (doctorInfo.verificationImage) {
      if (Platform.OS === 'web' && doctorInfo.verificationImage.file) {
        // On web, append the File object
        formData.append(
          'verification_image',
          doctorInfo.verificationImage.file,
          doctorInfo.verificationImage.file.name || 'verification.jpg'
        );
      } else {
        // On native, append the object with uri, type, and name
        formData.append('verification_image', {
          uri: doctorInfo.verificationImage.uri,
          type: doctorInfo.verificationImage.type || 'image/jpeg',
          name: doctorInfo.verificationImage.fileName || 'verification.jpg',
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Verification image is missing.',
      });
      setIsLoading(false);
      return;
    }
  
    // Debug FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData) {
      console.log(`${key}:`, value);
    }
  
    try {
      const response = await fetch('https://skinwise.tech/account/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
  
      const responseText = await response.text();
      console.log('Response Status:', response.status);
      console.log('Response Text:', responseText);
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }
  
      // Handle successful response
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Signup successful!',
      });
      navigation.navigate('EmailVerification', { email: form.email, username: form.username });
    } catch (error) {
      console.error('Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/Image.jpeg')} style={styles.image} />
        <Text style={styles.headerTitle}>SkinWise</Text>
      </View>

      {/* Scrollable Form Content */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Doctor Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Bio"
          value={doctorInfo.bio}
          onChangeText={(value) => handleChange('bio', value)}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Specialization"
          value={doctorInfo.specialization}
          onChangeText={(value) => handleChange('specialization', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Clinic Details"
          value={doctorInfo.clinicDetails}
          onChangeText={(value) => handleChange('clinicDetails', value)}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={pickImage} disabled={isLoading}>
          <Text style={styles.buttonText}>
            {doctorInfo.verificationImage ? "Change Verification Image" : "Upload Verification Image"}
          </Text>
        </TouchableOpacity>

        {doctorInfo.verificationImage && (
          <Image
            source={{ uri: doctorInfo.verificationImage.uri }}
            style={styles.verificationImage}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" /> // Show loading indicator
          ) : (
            <Text style={styles.buttonText}>Submit Doctor Info</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  header: {
    height: 250, // Reduced height for better space management
    backgroundColor: '#A0C4FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    padding: 20,
    paddingTop: 10, // Reduced padding to avoid excessive spacing
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  button: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verificationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
    resizeMode: 'contain', // Ensure image scales properly
  },
});