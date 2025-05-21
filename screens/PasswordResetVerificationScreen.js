import React, { useState, useRef, useEffect } from 'react';
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

export default function PasswordResetVerificationScreen({ route, navigation }) {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the full 6-digit code.');
      return;
    }

    try {
      const response = await fetch('https://skinwise.tech/account/verify-reset-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username_email=${encodeURIComponent(email)}&verification_code=${encodeURIComponent(verificationCode)}`
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', result.message || 'Code verified successfully!');
        navigation.navigate('ResetPassword', { email, verificationCode }); 
      } else {
        Alert.alert('Error', result.message || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setTimer(60); 

    try {
      const response = await fetch('https://skinwise.tech/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username_email=${encodeURIComponent(email)}`
      });

      const result = await response.json();
      Alert.alert(response.ok ? 'Success' : 'Error', result.message || 'Could not resend the code.');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setResendDisabled(false);
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
        <Text style={styles.title}>Password Reset Verification</Text>
        <Text style={styles.description}>
          Please enter the 6-digit code sent to {'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <View style={styles.codeContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.codeInput}
              maxLength={1}
              keyboardType="number-pad"
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              value={code[index]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
          <Text style={styles.buttonText}>Verify Code</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.resendContainer, resendDisabled && styles.disabledButton]} 
          disabled={resendDisabled}
          onPress={handleResendCode}
        >
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <Text style={styles.resendButton}>
            {resendDisabled ? `Resend in ${timer}s` : 'Resend'}
          </Text>
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
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, padding: 20, alignItems: 'center', marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  description: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  emailText: { color: '#A0C4FF', fontWeight: '600' },
  codeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#A0C4FF',
    borderRadius: 8,
    margin: 5,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  resendContainer: { flexDirection: 'row', alignItems: 'center' },
  resendText: { color: '#666', fontSize: 14 },
  resendButton: { color: '#A0C4FF', fontSize: 14, fontWeight: '600' },
  disabledButton: { opacity: 0.5 },
});
