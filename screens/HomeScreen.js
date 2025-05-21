import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Animated, 
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('User');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [cardScales] = useState({
    prediction: new Animated.Value(1),
    chat: new Animated.Value(1),
    community: new Animated.Value(1),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        console.log('User data:', userData);
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserName(parsedData.username || 'User');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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
        console.error("Logout failed:", data);
        Alert.alert('Error', data.message || 'Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout request failed:', error);
      Alert.alert('Error', 'An error occurred. Please check your connection and try again.');
    }
  };

  const animateCard = (card, scaleTo) => {
    Animated.spring(cardScales[card], {
      toValue: scaleTo,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient
      colors={['#E6F0FA', '#D1E4F5']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <FontAwesome5 name="diagnoses" size={30} color="#1E88E5" />
              <Text style={styles.appName}>SkinWise</Text>
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <FontAwesome5 name="sign-out-alt" size={24} color="#1E88E5" />
            </TouchableOpacity>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Hello, {userName} !</Text>
            <Text style={styles.welcomeSubText}>Your skin health journey starts here.</Text>
          </View>

          {/* Cards */}
          <Animated.View
            style={[styles.card, { transform: [{ scale: cardScales.prediction }] }]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => animateCard('prediction', 1.05)}
            onResponderRelease={() => {
              animateCard('prediction', 1);
              navigation.navigate('AIPrediction');
            }}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F5F9FF']}
              style={styles.cardGradient}
            >
              <FontAwesome5 name="camera-retro" size={28} color="#1E88E5" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>AI Skin Analysis</Text>
              <Text style={styles.cardText}>Upload a skin image for instant AI-powered diagnosis.</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText} onPress={() => navigation.navigate('AIPrediction')}>Scan Now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[styles.card, { transform: [{ scale: cardScales.chat }] }]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => animateCard('chat', 1.05)}
            onResponderRelease={() => {
              animateCard('chat', 1);
              navigation.navigate('AIChat');
            }}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F5F9FF']}
              style={styles.cardGradient}
            >
              <FontAwesome5 name="robot" size={28} color="#1E88E5" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>AI Assistant</Text>
              <Text style={styles.cardText}>Chat with our AI to get answers about skin health.</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText} onPress={() => navigation.navigate('AIChat')}>Ask Away</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[styles.card, { transform: [{ scale: cardScales.community }] }]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => animateCard('community', 1.05)}
            onResponderRelease={() => {
              animateCard('community', 1);
              navigation.navigate('Community');
            }}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F5F9FF']}
              style={styles.cardGradient}
            >
              <FontAwesome5 name="users" size={28} color="#1E88E5" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Community Hub</Text>
              <Text style={styles.cardText}>Connect with others and share your experiences.</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText} onPress={() => navigation.navigate('Community')} >Join Community</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E88E5',
    marginLeft: 12,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3E4A59',
  },
  welcomeSubText: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 5,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
  },
  cardGradient: {
    padding: 20,
  },
  cardIcon: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3E4A59',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 20,
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '50%',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});