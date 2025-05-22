import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

export default function SignupScreenPart2({ route, navigation }) {
  const { form: formData } = route.params;

  const [form, setForm] = useState({
    firstName: formData.firstName,
    lastName: formData.lastName,
    dateOfBirth: formData.dateOfBirth,
    userRole: formData.userRole,
    gender: formData.gender,
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validateAndSubmit = async () => {
    const { username, email, password, confirmPassword, firstName, lastName, dateOfBirth, userRole , gender } = form;

    const missingFields = [];
    if (!username) missingFields.push('Username');
    if (!email) missingFields.push('Email');
    if (!password) missingFields.push('Password');
    if (!confirmPassword) missingFields.push('Confirm Password');
    if (!gender) missingFields.push('Gender');

    if (missingFields.length > 0) {
      Alert.alert('Missing Fields', `Please fill in the following fields:\n${missingFields.join(', ')}`);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate that passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    console.log('userRole', userRole);
    if(userRole==='Doctor'){
      navigation.navigate('SignupPart3', { form });
      return;
    }

    const requestBody = `f_name=${encodeURIComponent(firstName)}&l_name=${encodeURIComponent(lastName)}&date_of_birth=${encodeURIComponent(dateOfBirth)}&email=${encodeURIComponent(email)}&gender=${encodeURIComponent(gender)}&password=${encodeURIComponent(password)}&username=${encodeURIComponent(username)}&user_type=${encodeURIComponent(userRole)}`;

    try {
      const response = await fetch('https://skinwise.tech/account/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody,
      });

      // Log the response text for debugging
      const responseText = await response.text();
      console.log("Body:", requestBody);
      console.log("Response Text:", responseText);

      // Check if response is successful
      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          Alert.alert('Success', 'Account created successfully. Please verify your email.');
          console.log(form.email, form.username);
          navigation.navigate('EmailVerification', { email: form.email, username: form.username });
        } catch (jsonError) {
          console.error("Error parsing JSON", jsonError);
          Alert.alert('Error', 'Failed to parse response from the server.');
        }
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
        <Image
          source={require('../assets/Image.jpeg')}
          style={styles.image}
        />
        <Text style={styles.headerTitle}>SkinWise</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign Up - Step 2</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChangeText={(value) => handleInputChange('username', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          keyboardType="email-address"
          onChangeText={(value) => handleInputChange('email', value)}
        />

        {/* Password Input with Eye Icon */}
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={form.password}
            secureTextEntry={!showPassword}
            textContentType="oneTimeCode"
            autoComplete="off"
            onChangeText={(value) => handleInputChange('password', value)}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input with Eye Icon */}
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            textContentType="oneTimeCode"
            autoComplete="off"
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>


        <TouchableOpacity style={styles.button} onPress={validateAndSubmit}>
          <Text style={styles.buttonText}>Register</Text>
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
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15
  },
  passwordInputContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 15, 
  },
  passwordInput: { 
    flex: 1, 
    padding: 10,
    fontSize: 16,
  },
  eyeIcon: { 
    padding: 10,
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