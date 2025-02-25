import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './UserContext'; 
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreenPart1 from './screens/SignupScreen';
import SignupScreenPart2 from './screens/SignupScreen2';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeTabs from './HomeTabs';
import AIPrediction from './InAppScreens/AIPrediction';
import AIChatScreen from './InAppScreens/AIChat';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import PasswordResetVerificationScreen from './screens/PasswordResetVerificationScreen';
import CreatePostScreen, {CreatePost} from './screens/CreatePostScreen';

const Stack = createStackNavigator();

export default function App() {
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
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
