import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './UserContext'; 
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreenPart1 from './screens/SignupScreen';
import SignupScreenPart2 from './screens/SignupScreen2';
import SignupScreenPart3 from './screens/SignupScreen3';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeTabs from './HomeTabs';
import AIPrediction from './InAppScreens/AIPrediction';
import AIChatScreen from './InAppScreens/AIChat';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import PasswordResetVerificationScreen from './screens/PasswordResetVerificationScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import CreatePostScreen, {CreatePost} from './screens/CreatePostScreen';
import MyPostsScreen from './screens/MyPostsScreen';
import SavedPostsScreen from './screens/SavedPosts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const Stack = createStackNavigator();


const refreshAuthToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    console.log("refresh token ",refreshToken);
    
    if (!refreshToken){return}; 

    const response = await fetch('https://skinwise.tech/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      await AsyncStorage.setItem('accessToken', data.access);
      console.log('🔄 Access token refreshed');
      console.log('New Access Token:', data.access);
    } else {
      console.error('Failed to refresh token:', data);
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
};

export default function App() {
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAuthToken();
    }, 120000);

    return () => clearInterval(interval); 
  }, []);

  return (
    <UserProvider> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">
          {/* Landing Screen */}
          <Stack.Screen 
            name="Landing" 
            component={LandingScreen} 
            options={{ headerShown: false }} 
          />
          {/* Login Screen */}
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Login' }} 
          />
          {/* Signup Screens */}
          <Stack.Screen 
            name="SignupPart1" 
            component={SignupScreenPart1} 
            options={{ title: 'Sign Up - Step 1' }} 
          />
          <Stack.Screen 
            name="SignupPart2" 
            component={SignupScreenPart2} 
            options={{ title: 'Sign Up - Step 2' }} 
          />
          <Stack.Screen
            name="SignupPart3"
            component={SignupScreenPart3}
            options={{ title: 'Sign Up - Step 3' }}
          />
          {/* Email Verification Screen*/}
          <Stack.Screen 
            name="EmailVerification" 
            component={EmailVerificationScreen} 
            options={{ title: 'Email Verification' }}
            />
          {/* Forgot Password Screen */}
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen} 
            options={{ title: 'Forgot Password' }} 
          />
          {/* Password Reset Verification Screen */}
          <Stack.Screen
            name="PasswordResetVerification"
            component={PasswordResetVerificationScreen}
            options={{ title: 'Reset Password' }}
          />

          {/* Reset Password Screen */}
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ title: 'Reset Password' }}
          />

          {/* Home Tabs (Main App after login) */}
          <Stack.Screen 
            name="HomeTabs" 
            component={HomeTabs} 
            options={{ headerShown: false }} 
          />
          {/* AI Prediction Screen */}
          <Stack.Screen 
            name="AIPrediction" 
            component={AIPrediction} 
            options={{ title: 'Skin Analysis' }} 
          />
          {/* AI Chat Screen */}
          <Stack.Screen 
            name="AIChat" 
            component={AIChatScreen} 
            options={{ title: 'Chat with AI Bot' }} 
          />
          {/* Create Post Screen */}
          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{ title: 'Create Post' }}  
          />

          {/* My Posts Screen */}
          <Stack.Screen
            name="MyPosts"
            component={MyPostsScreen}
            options={{ title: 'My Posts' }}
          />

          {/* Saved Posts Screen */}
          <Stack.Screen
            name="SavedPosts"
            component={SavedPostsScreen}
            options={{ title: 'Saved Posts' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
