import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username_email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });
  
      const contentType = response.headers.get('content-type');
      let responseText;
  
      if (contentType && contentType.includes('application/json')) {
        // Parse JSON response if content type is JSON
        const result = await response.json();
        responseText = result.message || 'Logged in successfully';
      } else {
        // Handle plain text response (like "Login successful.")
        responseText = await response.text();
      }
  
      if (response.ok) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTabs' }], // Navigate to HomeTabs
        });
      } else {
        console.log("response text : ",responseText)
        Alert.alert('Login Failed', responseText || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Request failed:', error);
      Alert.alert('Error', error.message);
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
        <TextInput
          style={styles.input}
          placeholder="Email or Username"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
          <Text style={styles.signupText}>Don’t have an account?<Text style={styles.signup}> Sign up </Text></Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
</TouchableOpacity>

      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between', // Space out items vertically
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
    justifyContent: 'center', // Center the inputs vertically in the space
    marginTop: 200, // Space down from the header
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },forgotPasswordText: {
    color: '#007BFF',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },signup: {
    color: '#007BFF',
  },  
  
});
