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

  const verifyCode = async () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/account/verify_reset_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verification_code: enteredCode }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Code verified successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('ResetPassword', { email }) },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please check your connection and try again.');
    }
  };

  const resendCode = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/account/resend_reset_code/${email}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
  
      const data = await response.json();
      if (response.ok) {
        Alert.alert('New Code Sent', 'A new verification code has been sent to your email.');
        setResendDisabled(true);
        setTimer(60);
      } else {
        Alert.alert('Error', data.message || 'Failed to resend verification code.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please check your connection and try again.');
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

        <TouchableOpacity style={styles.verifyButton} onPress={verifyCode}>
          <Text style={styles.buttonText}>Verify Code</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.resendContainer, resendDisabled && styles.disabledButton]} 
          onPress={resendCode}
          disabled={resendDisabled}
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

