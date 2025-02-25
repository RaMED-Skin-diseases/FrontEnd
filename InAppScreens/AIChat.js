import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AIChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with AI Bot</Text>
      <Text style={styles.description}>
        This is where the AI chat functionality will go. You can ask the AI bot questions about your
        skin condition.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#6C757D',
  },
});
