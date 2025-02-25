import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try{
      const response = await fetch('http://localhost:8000/account/logout',{method:'GET',headers:{'Content-Type':'application/json'}}); 
      const data = await response.json(); 
      if(response.ok){
        navigation.navigate('Landing');
      }else{
        Alert.alert('Error', data.message || 'Failed to logout. Please try again.');}
      }
      catch(error){
        Alert.alert('Error', 'An error occurred. Please check your connection and try again.');
      }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>SkinWise</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
      </View>

      {/* AI Prediction Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Skin Prediction</Text>
        <Text style={styles.cardText}>
          Upload a clear image of your skin, and our AI will analyze it to predict any skin condition.
        </Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => navigation.navigate('AIPrediction')}
        >
          <Text style={styles.uploadButtonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>

      {/* Chat with AI Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Chat with AI Bot</Text>
        <Text style={styles.cardText}>
          Have questions about your skin condition? Start a conversation with our AI bot.
        </Text>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('AIChat')}
        >
          <Text style={styles.chatButtonText}>Chat Now</Text>
        </TouchableOpacity>
      </View>

      {/* Communications Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Communications</Text>
        <TouchableOpacity style={styles.contactButton} onPress={() => {}}>
          <Text style={styles.contactButtonText}>Contact a Doctor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3E4A59',
  },
  logoutButton: {
    backgroundColor: '#4184f2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  welcomeSection: {
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E4A59',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 10,
  },
  uploadButton: {
    backgroundColor: '#4184f2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatButton: {
    backgroundColor: '#4184f2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: '#4184f2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
