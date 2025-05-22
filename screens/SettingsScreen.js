import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated,
  Modal,
  Button,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native';

// Import the cross-platform date picker and dayjs
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

const SettingsScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  
  // Get default styles for the date picker
  const defaultStyles = useDefaultStyles();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (!userData || !accessToken) {
          Alert.alert('Error', 'User not authenticated');
          setLoading(false);
          return;
        }

        const { username } = JSON.parse(userData);

        const response = await fetch(
          `https://skinwise.tech/account/profile/${encodeURIComponent(username)}`,
          {
            method: 'GET',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
          }
        );

        console.log('Response status:', response.status);
        console.log(accessToken);
        const data = await response.json();
        console.log('User data:', data);
        if (response.ok && data.user) {
          const formattedUserInfo = {
            firstName: data.user.f_name || 'N/A',
            lastName: data.user.l_name || 'N/A',
            birthDate: data.user.date_of_birth || 'N/A',
            gender: data.user.gender || 'N/A',
            username: data.user.username || 'N/A',
            email: data.user.email || 'N/A',
            userType: data.user.user_type || 'N/A',
            isVerified: !!data.user.is_verified,
            specialization: data.user.specialization || null,
            clinicDetails: data.user.clinic_details || null,
            info: data.user.info || null,
            verificationStatus: data.user.verification_status || null,
          };

          setUserInfo(formattedUserInfo);
          setEditedInfo(formattedUserInfo);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        } else {
          Alert.alert('Error', 'Failed to retrieve user data');
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditedInfo(userInfo); // Reset to original values if cancelling
    }
  };

  const handleInputChange = (field, value) => {
    setEditedInfo(prev => ({ ...prev, [field]: value }));
  };

  // Handle date change from the date picker
  const handleDateChange = ({ date }) => {
    if (date) {
      setTempDate(date);
    }
  };

  const handleSave = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const changes = {};

      Object.keys(editedInfo).forEach((key) => {
        const original = userInfo[key];
        const edited = editedInfo[key];

        if (['userType', 'isVerified', 'email'].includes(key)) return;

        if (edited !== original && (original !== null && original !== 'N/A')) {
          const backendKey =
            key === 'firstName' ? 'f_name' :
            key === 'lastName' ? 'l_name' :
            key === 'birthDate' ? 'date_of_birth' :
            key;

          changes[backendKey] = edited;
        }
      });

      if (Object.keys(changes).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await fetch(
        'https://skinwise.tech/account/edit_profile',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(changes),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUserInfo(editedInfo);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');

        if (changes.username) {
          const userData = await AsyncStorage.getItem('userData');
          const parsedData = JSON.parse(userData);
          parsedData.username = changes.username;
          await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while updating');
    }
  };

  const handleLogout = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const bodyToSend = {
      access: accessToken,
      refresh: refreshToken,
    };

    try {
      const response = await fetch('https://skinwise.tech/account/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('userData');

        navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
      } else {
        Alert.alert('Error', data.message || 'Logout failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please check your connection and try again.');
    }
  };

  function renderInfoRow(label, field, icon) {
    if (field === 'email') {
      return (
        <View style={styles.infoRow}>
          <MaterialIcons name={icon} size={22} color="#555" />
          <Text style={styles.label}>{label}:</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {userInfo[field]}
          </Text>
        </View>
      );
    }
  
    if (field === 'birthDate' && isEditing) {
      return (
        <View style={styles.infoRow}>
          <MaterialIcons name={icon} size={22} color="#555" />
          <Text style={styles.label}>{label}:</Text>
          <TouchableOpacity
            onPress={() => {
              // Parse the date if it exists, otherwise use current date
              if (editedInfo.birthDate && editedInfo.birthDate !== 'N/A') {
                setTempDate(new Date(editedInfo.birthDate));
              } else {
                setTempDate(new Date());
              }
              setShowDatePicker(true);
            }}
            style={styles.dateInput}
          >
            <Text style={styles.dateText}>{editedInfo.birthDate || 'Select Date'}</Text>
            <MaterialIcons name="calendar-today" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      );
    }
  
    if (field === 'gender' && isEditing) {
      return (
        <View style={styles.infoRow}>
          <MaterialIcons name={icon} size={22} color="#555" />
          <Text style={styles.label}>{label}:</Text>
          <View style={styles.genderToggle}>
            <TouchableOpacity
              style={[styles.genderButton, editedInfo.gender === 'Male' && styles.selectedGender]}
              onPress={() => handleInputChange('gender', 'Male')}
            >
              <Text>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, editedInfo.gender === 'Female' && styles.selectedGender]}
              onPress={() => handleInputChange('gender', 'Female')}
            >
              <Text>Female</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  
    return (
      <View style={styles.infoRow}>
        <MaterialIcons name={icon} size={22} color="#555" />
        <Text style={styles.label}>{label}:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedInfo[field]}
            onChangeText={(text) => handleInputChange(field, text)}
            placeholder={label}
          />
        ) : (
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {userInfo[field]}
          </Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={handleEditToggle} style={styles.editButton}>
              <MaterialIcons name={isEditing ? "cancel" : "edit"} size={24} color="white" />
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <MaterialIcons name="save" size={24} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <MaterialIcons name="exit-to-app" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* My Posts Navigation Button */}
        {userInfo && (
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigation.navigate("MyPosts")}
          >
            <MaterialIcons name="article" size={24} color="#4A90E2" />
            <Text style={styles.navButtonText}>My Posts</Text>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        )}

        {/* Saved Posts Navigation Button */}
        {userInfo && (
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigation.navigate("SavedPosts")}
          >
            <MaterialIcons name="bookmark" size={24} color="#4A90E2" />
            <Text style={styles.navButtonText}>Saved Posts</Text>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#A0C4FF" style={styles.loader} />
        ) : userInfo ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.card}>
              <View style={styles.profileHeader}>
                <MaterialIcons name="account-circle" size={100} color="#4A90E2" />
                <Text style={styles.userName}>
                  {isEditing ? (
                    <>
                      <TextInput
                        style={styles.input}
                        value={editedInfo.firstName}
                        onChangeText={(text) => handleInputChange('firstName', text)}
                        placeholder="First Name"
                      />
                      <TextInput
                        style={styles.input}
                        value={editedInfo.lastName}
                        onChangeText={(text) => handleInputChange('lastName', text)}
                        placeholder="Last Name"
                      />
                    </>
                  ) : (
                    `${userInfo.firstName} ${userInfo.lastName}`
                  )}
                </Text>
                <Text style={styles.userRole}>{userInfo.userType}</Text>
                <View style={styles.verificationBadge}>
                  {userInfo.isVerified ? (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="green" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={20} color="red" />
                      <Text style={styles.notVerifiedText}>Not Verified</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.infoSection}>
                {renderInfoRow('Username', 'username', 'person')}
                {renderInfoRow('Email', 'email', 'alternate-email')}
                {renderInfoRow('Birth Date', 'birthDate', 'cake')}
                {renderInfoRow('Gender', 'gender', 'wc')}
                {userInfo.specialization && renderInfoRow('Specialization', 'specialization', 'medical-services')}
                {userInfo.clinicDetails && renderInfoRow('Clinic Details', 'clinicDetails', 'location-on')}
                {userInfo.info && renderInfoRow('Info', 'info', 'info')}
              </View>
            </View>
          </Animated.View>
        ) : (
          <Text style={styles.errorText}>Failed to load user data</Text>
        )}

        {/* Cross-platform Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>

              <DateTimePicker
                mode="single"
                date={tempDate}
                onChange={handleDateChange}
                styles={defaultStyles}
                minDate={new Date('1900-01-01')}
                maxDate={new Date()}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    // Format the date using dayjs for consistency
                    const formattedDate = dayjs(tempDate).format('YYYY-MM-DD');
                    handleInputChange('birthDate', formattedDate);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 30,
    marginRight: 15,
  },
  saveButton: {
    backgroundColor: '#2ECC71',
    padding: 12,
    borderRadius: 30,
    marginRight: 15,
  },
  logoutButton: {
    backgroundColor: '#FF5A5F',
    padding: 12,
    borderRadius: 30,
  },
  loader: {
    marginTop: 50,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  userRole: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  verifiedText: {
    color: 'green',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  notVerifiedText: {
    color: 'red',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  infoSection: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
  },
  value: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  genderToggle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
  genderButton: {
    padding: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
  },
  selectedGender: {
    backgroundColor: '#A0C4FF',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  button: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingsScreen;
