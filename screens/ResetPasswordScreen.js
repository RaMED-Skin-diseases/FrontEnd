import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function PasswordResetScreen({ route, navigation }) {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (password.length < 6) {
      //Alert.alert('Error', 'Password must be at least 6 characters long.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters long.'
      });

      return;
    }

    if (password !== confirmPassword) {
      //Alert.alert('Error', 'Passwords do not match.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match.'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://skinwise.tech/account/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&new_password=${encodeURIComponent(password)}`
      });

      const result = await response.json();
      setLoading(false);
      
      if (response.ok) {
        //Alert.alert('Success', result.message || 'Password reset successfully!');
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.message || 'Password reset successfully!'
        });
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
      } else {
        //Alert.alert('Error', result.message || 'Failed to reset password.');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.message || 'Failed to reset password.'
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      //Alert.alert('Error', 'Something went wrong. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.'
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Image source={require('../assets/Image.jpeg')} style={styles.image} />
        <Text style={styles.headerTitle}>SkinWise</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>Enter your new password below.</Text>

        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 350,
    backgroundColor: "#A0C4FF",
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, padding: 20, alignItems: 'center', marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  description: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#A0C4FF',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});