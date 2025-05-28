import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './UserContext'; 
import { AuthProvider, AuthContext } from './AuthContext'; // Import AuthProvider and AuthContext
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
import { ActivityIndicator, View, StyleSheet } from 'react-native'; // Import for loading indicator
import { useContext, useEffect } from 'react';
import Toast from 'react-native-toast-message';


const Stack = createStackNavigator();

// Authentication Navigator - screens accessible when not logged in
const AuthStack = () => (
  <Stack.Navigator initialRouteName="Landing">
    <Stack.Screen 
      name="Landing" 
      component={LandingScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ title: 'Login' }} 
    />
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
    <Stack.Screen 
      name="EmailVerification" 
      component={EmailVerificationScreen} 
      options={{ title: 'Email Verification' }}
    />
    <Stack.Screen 
      name="ForgotPassword" 
      component={ForgotPasswordScreen} 
      options={{ title: 'Forgot Password' }} 
    />
    <Stack.Screen
      name="PasswordResetVerification"
      component={PasswordResetVerificationScreen}
      options={{ title: 'Reset Password' }}
    />
    <Stack.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
      options={{ title: 'Reset Password' }}
    />
  </Stack.Navigator>
);

// App Navigator - screens accessible when logged in
const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeTabs" 
      component={HomeTabs} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="AIPrediction" 
      component={AIPrediction} 
      options={{ title: 'Skin Analysis' }} 
    />
    <Stack.Screen 
      name="AIChat" 
      component={AIChatScreen} 
      options={{ title: 'Chat with AI Bot' }} 
    />
    <Stack.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={{ title: 'Create Post' }}  
    />
    <Stack.Screen
      name="MyPosts"
      component={MyPostsScreen}
      options={{ title: 'My Posts' }}
    />
    <Stack.Screen
      name="SavedPosts"
      component={SavedPostsScreen}
      options={{ title: 'Saved Posts' }}
    />
  </Stack.Navigator>
);

// Root Navigator that decides which stack to show based on authentication state
const RootNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A0C4FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <AppStack /> : <AuthStack />}
      <Toast />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <RootNavigator />
      </UserProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
