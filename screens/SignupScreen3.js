import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function SignupScreenPart3({ route, navigation }) {
  const { form } = route.params;

  const [doctorInfo, setDoctorInfo] = useState({
    bio: '',
    specialization: '',
    clinicDetails: '',
    verificationImage: null,
  });

  const handleChange = (field, value) => {
    setDoctorInfo({ ...doctorInfo, [field]: value });
  };

  const pickImage = async () => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to photo library to upload verification image.");
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
      Alert.alert("Missing Fields", "Please complete all the fields and upload your verification image.");
      return;
    }
  
    const formData = new FormData();
    formData.append('f_name', form.firstName);
    formData.append('l_name', form.lastName);
    formData.append('date_of_birth', form.dateOfBirth);
    formData.append('email', form.email);
    formData.append('gender', form.gender);
    formData.append('password', form.password);
    formData.append('username', form.username);
    formData.append('user_type', form.userRole);
    formData.append('info', doctorInfo.bio);
    formData.append('specialization', doctorInfo.specialization);
    formData.append('clinic_details', doctorInfo.clinicDetails);
  
    // ⚠️ Only works if image URI is a local file path (e.g., from ImagePicker)
    formData.append('verification_image', {
      uri: doctorInfo.verificationImage.uri,
      type: 'image/jpeg', // or 'image/png' based on your image type
      name: 'verification.jpg',
    });
  
    console.log('Sending FormData...');
  
    try {
      const response = await fetch('http://new-env.eba-6dsh89vt.eu-north-1.elasticbeanstalk.com/account/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      const responseText = await response.text();
      console.log("Response Text:", responseText);
  
      if (response.ok) {
        const result = JSON.parse(responseText);
        Alert.alert('Success', 'Account created successfully. Please verify your email.');
        navigation.navigate('EmailVerification', { email: form.email, username: form.username });
      } else {
        console.error("Error response from server:", responseText);
        Alert.alert('Error', 'Failed to create account. Please try again later.');
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      Alert.alert('Error', error.message || 'An unknown error occurred during the fetch operation.');
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/Image.jpeg')} style={styles.image} />
        <Text style={styles.headerTitle}>SkinWise</Text>
      </View>

      <View style={styles.formContainer}>
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

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>
            {doctorInfo.verificationImage ? "Change Verification Image" : "Upload Verification Image"}
          </Text>
        </TouchableOpacity>

        {doctorInfo.verificationImage && (
          <Image
            source={{ uri: doctorInfo.verificationImage.uri }}
            style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 10 }}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Doctor Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#FFFFFF' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 15 
  },
  button: { 
    backgroundColor: '#A0C4FF', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 20 
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: "#A0C4FF",
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
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100,
    marginTop: 50,
  },
});
