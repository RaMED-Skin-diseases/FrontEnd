import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
  Image,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';


import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

export default function SignupScreenPart1({ navigation, route }) {
  const userRole = route.params?.userRole || 'User';
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    userRole: userRole,
  });

  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  
  const defaultStyles = useDefaultStyles();

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleDateChange = ({ date }) => {
    if (date) {
      setTempDate(date);
    }
  };

  const handleDateConfirm = () => {
    // Format the date as YYYY-MM-DD
    const formattedDate = dayjs(tempDate).format('YYYY-MM-DD');
    handleInputChange('dateOfBirth', formattedDate);
    setShowDateModal(false);
  };

  const handleNext = () => {
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
        <Image source={require('../assets/Image.jpeg')} style={styles.image} />
        <Text style={styles.headerTitle}>SkinWise</Text>
      </View>

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
            style={[
              styles.radioButton,
              form.gender === 'Male' && styles.radioButtonSelected,
            ]}
            onPress={() => handleInputChange('gender', 'Male')}
          >
            <Text style={styles.radioText}>Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.radioButton,
              form.gender === 'Female' && styles.radioButtonSelected,
            ]}
            onPress={() => handleInputChange('gender', 'Female')}
          >
            <Text style={styles.radioText}>Female</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.dateOfBirthInput}
          onPress={() => setShowDateModal(true)}
        >
          <Text style={styles.dateText}>
            {form.dateOfBirth ? form.dateOfBirth : 'Select Date of Birth'}
          </Text>
        </TouchableOpacity>


        <Modal visible={showDateModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              {/* Apply default styles and ensure date is properly bound */}
              <DateTimePicker
                mode="single"
                date={tempDate}
                onChange={handleDateChange}
                styles={defaultStyles}
                minDate={new Date(1900, 0, 1)}
                maxDate={new Date()}
              />
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setShowDateModal(false)} />
                <Button title="Confirm" onPress={handleDateConfirm} />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

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
    flexGrow: 1, 
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
    marginTop: 'auto',
    marginBottom: 20, 
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
