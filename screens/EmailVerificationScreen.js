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
import { useNavigation } from '@react-navigation/native';

//992866
export default function EmailVerificationScreen({ route, navigation }) {
  const { email , username } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0); // Timer starts at 0
  const inputRefs = useRef([]);
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
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
    const verificationCode = code.join('');

    console.log("Verification code:", verificationCode);
    if (!verificationCode || verificationCode.trim() === "") {
        console.log("Verification code is empty, returning early.");
        Alert.alert("Error", "Please enter the verification code.");
        return;
    }

    const payload = {
        email: email,
        verification_code: verificationCode
    };

    const queryString = Object.keys(payload)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`)
        .join('&');

    console.log("Query String:", queryString);

    try {
        console.log("Making API call...");
        const response = await fetch("http://new-env.eba-6dsh89vt.eu-north-1.elasticbeanstalk.com/account/verify_email", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            },
            body: queryString,
        });

        const textResponse = await response.text();
        console.log("Raw response:", textResponse);

        let jsonData = null;
        try {
            jsonData = JSON.parse(textResponse);
        } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
        }

        if (!response.ok || !jsonData || jsonData.message !== "Email verified successfully.") {
            console.log("Error response or verification failed:", jsonData);
            Alert.alert("Error", "Verification failed. Please check the code and try again.");
        } else {
            console.log("Email verified successfully.");
            Alert.alert("Success", "Your email has been verified!");
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            // You can add navigation or logic here after successful verification
        }

    } catch (error) {
        console.error("Network error:", error);
        Alert.alert("Error", "Network request failed. Please check your internet connection.");
    }
};





const resendCode = async () => {
  try {
    const response = await fetch(
      `http://new-env.eba-6dsh89vt.eu-north-1.elasticbeanstalk.com/account/resend_verification_code/${username}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log("Resend response:", data);

      Alert.alert('New Code Sent', 'A new verification code has been sent to your email.');
      setResendDisabled(true); 
      setTimer(60); 
    } else {
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    }
  } catch (error) {
    console.log("Network error:", error);
    Alert.alert('Error', 'An error occurred. Please check your connection and try again.');
  }
};

  

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Image
          source={require('../assets/Image.jpeg')}
          style={styles.image}
        />
        <Text style={styles.headerTitle}>SkinWise</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Email Verification</Text>
        
        <Text style={styles.description}>
          Please enter the 6-digit code sent to{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <View style={styles.codeContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
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
          <Text style={styles.buttonText}>Verify Email</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 350,
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  emailText: {
    color: '#A0C4FF',
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendButton: {
    color: '#A0C4FF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
