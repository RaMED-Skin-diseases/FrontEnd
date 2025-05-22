import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>SkinWise</Text>
      <Text style={styles.subtitle}>Predict skin diseases and interact with doctors.</Text>
      <Image
        source={require('../assets/landing2.webp')}
        style={styles.image}
      />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => navigation.navigate('SignupPart1', { userRole: 'Patient' })}
        >
          <Text style={styles.roleButtonText}>Patient</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => navigation.navigate('SignupPart1', { userRole: 'Doctor' })}
        >
          <Text style={styles.roleButtonText}>Doctor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 420,
    height: 410,
    borderRadius: 8,
    marginBottom: 30,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    gap: 20,
  },
  roleButton: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
