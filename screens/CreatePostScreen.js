import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreatePostScreen({ navigation }) {
  const [postText, setPostText] = useState('');
  const [titleText, setTitleText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to handle image selection from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      // Add base64 option for web compatibility
      base64: Platform.OS === 'web',
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Function to handle taking a photo with camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "Camera access is required to take photos.");
      return;
    }
  
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      // Add base64 option for web compatibility
      base64: Platform.OS === 'web',
    });
  
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Function to remove selected image
  const removeImage = () => {
    setSelectedImage(null);
  };

  // Function to handle post creation
  const handlePost = async () => {
    if (!postText.trim()) {
      Alert.alert("Error", "Post content cannot be empty!");
      return;
    }
  
    setLoading(true);
  
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      // Create FormData differently based on platform
      let formData = new FormData();
      
      // Always add text fields
      formData.append("title", titleText); 
      formData.append("content", postText);
  
      // Handle image upload differently based on platform
      if (selectedImage) {
        if (Platform.OS === 'web') {
          // For web, we need to handle the image differently
          if (selectedImage.base64) {
            // Convert base64 to blob for web
            const base64Response = await fetch(`data:image/jpeg;base64,${selectedImage.base64}`);
            const blob = await base64Response.blob();
            
            // Create a file from the blob with a proper name and type
            const fileName = 'image.jpg';
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            
            // Append the file to FormData with the exact field name expected by the server
            formData.append("image", file);
          } else if (selectedImage.uri) {
            // If base64 is not available but URI is, try to fetch the image and create a blob
            try {
              const response = await fetch(selectedImage.uri);
              const blob = await response.blob();
              formData.append("image", blob, 'image.jpg');
            } catch (error) {
              console.error("Error creating blob from URI:", error);
              // If we can't create a blob, try a different approach or skip the image
              formData.append("image", null);
            }
          } else {
            // If no valid image data is available
            formData.append("image", null);
          }
        } else {
          // For native platforms (iOS/Android)
          const fileName = selectedImage.uri.split('/').pop();
          const fileType = fileName.split('.').pop();
          
          formData.append("image", {
            uri: selectedImage.uri,
            name: fileName || 'image.jpg',
            type: `image/${fileType || 'jpeg'}`,
          });
        }
      } else {
        // No image selected
        formData.append("image", null);
      }
      
      console.log("FormData prepared for platform:", Platform.OS);
      
      // Log request details for debugging
      if (Platform.OS === 'web') {
        console.log("Request headers:", {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${accessToken}`
        });
        
        // On web, we can't directly log FormData content, but we can log its entries
        for (let pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }
      }
  
      // Make the API request
      const response = await fetch("https://skinwise.tech/community/create/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          // Don't set Content-Type on web for multipart/form-data
          // The browser will set it automatically with the correct boundary
          ...(Platform.OS !== 'web' && { "Content-Type": "multipart/form-data" }),
        },
        body: formData,
      });
  
      if (response.ok) {
        setPostText('');
        setTitleText('');
        setSelectedImage(null);
        navigation.goBack();
      } else {
        console.log('Response status:', response.status);
        try {
          // Try to parse JSON response
          const errorData = await response.json();
          console.log('Error response:', errorData);
          Alert.alert("Error", errorData.message || "Failed to create post. Try again!");
        } catch (e) {
          // If not JSON, get text
          const errorText = await response.text();
          console.log('Error response text:', errorText);
          Alert.alert("Error", "Failed to create post. Try again!");
        }
      }
    } catch (error) {
      console.error("Post creation error:", error);
      Alert.alert("Error", "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LinearGradient colors={['#A0C4FF', '#D8E3FF']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Wanna Ask?</Text>

          <View style={styles.card}>
            <TextInput
              style={styles.Titleinput}
              placeholder="Write a Title here..."
              value={titleText}
              onChangeText={setTitleText}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Write your question or description here..."
              value={postText}
              onChangeText={setPostText}
              multiline
            />

            {selectedImage && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  style={styles.image} 
                />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <FontAwesome name="times-circle" size={22} color="red" />
                </TouchableOpacity>
              </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                style={[
                  styles.imageButton, 
                  { flex: 1, marginRight: Platform.OS !== 'web' ? 5 : 0 }
                ]} 
                onPress={pickImage}
              >
                <FontAwesome name="image" size={18} color="#fff" />
                <Text style={styles.imageButtonText}>Upload</Text>
              </TouchableOpacity>

              {/* Only show camera button on native platforms */}
              {Platform.OS !== 'web' && (
                <TouchableOpacity style={[styles.imageButton, { flex: 1, marginLeft: 5 }]} onPress={takePhoto}>
                  <FontAwesome name="camera" size={18} color="#fff" />
                  <Text style={styles.imageButtonText}>Camera</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <FontAwesome name="send" size={18} color="#fff" />
                  <Text style={styles.postButtonText}>Post</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  Titleinput: {
    minHeight:50,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
    fontSize:16,
    marginBottom: 10,

  },
  input: {
    minHeight: 120,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
  },
  imageButton: {
    flexDirection: 'row',
    backgroundColor: '#6C63FF',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  postButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
