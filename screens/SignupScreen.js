import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Button, Alert, Image, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignupScreenPart1({ navigation, route }) {
  const userRole = route.params?.userRole || 'User';
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    userRole: userRole,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format the date to YYYY-MM-DD before passing it
      const formattedDate = selectedDate.toISOString().split('T')[0]; 
      handleInputChange('dateOfBirth', formattedDate);
    }
  };
  

  const handleNext = () => {
    console.log('next pressed');
    const { firstName, lastName, gender, dateOfBirth } = form;
    if (!firstName || !lastName || !gender || !dateOfBirth) {
      Alert.alert('Error', 'Please fill in all fields');
    } else {
      navigation.navigate('SignupPart2', { form });
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

      {/* ScrollView for form content */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>{userRole} Sign Up - Step 1</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={form.firstName}
          onChangeText={(value) => handleInputChange('firstName', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={form.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
        />

        <View style={styles.radioContainer}>
          <TouchableOpacity 
            style={[styles.radioButton, form.gender === 'Male' && styles.radioButtonSelected]} 
            onPress={() => handleInputChange('gender', 'Male')}
          >
            <Text style={styles.radioText}>Male</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.radioButton, form.gender === 'Female' && styles.radioButtonSelected]} 
            onPress={() => handleInputChange('gender', 'Female')}
          >
            <Text style={styles.radioText}>Female</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dateOfBirthInput} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>
            {form.dateOfBirth ? form.dateOfBirth : 'Select Date of Birth'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            display="spinner"
            value={new Date()}
            onChange={handleDateChange}
          />
        )}
      </ScrollView>

      {/* View for Next Button - placed at the bottom */}
      <View style={styles.buttonContainer}>
        <Button title="Next" onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
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
    paddingHorizontal: 20,
    paddingTop: 20,
    flexGrow: 1,  // Makes the ScrollView take up available space
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
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  radioButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  radioButtonSelected: {
    backgroundColor: '#A0C4FF',
    borderColor: '#A0C4FF',
  },
  radioText: {
    color: '#333',
    fontSize: 16,
  },
  dateText: {
    color: '#333',
    fontSize: 16,
    padding: 10,
  },
  dateOfBirthInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 'auto', // Pushes the button to the bottom
    marginBottom: 20, // Adds some margin at the bottom for better UI
  },
});

