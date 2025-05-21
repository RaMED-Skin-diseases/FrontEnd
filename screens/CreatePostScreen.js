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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

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
    });
  
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  
  const removeImage = () => {
    setSelectedImage(null);
  };

  const handlePost = async () => {
    if (!postText.trim()) {
      Alert.alert("Error", "Post content cannot be empty!");
      return;
    }
  
    setLoading(true);
  
    let formData = new FormData();
    formData.append("title", titleText); 
    formData.append("content", postText);
  
    if (selectedImage) {
      const fileName = selectedImage.split('/').pop();
      const fileType = fileName.split('.').pop();
      formData.append("image", {
        uri: selectedImage,
        name: fileName,
        type: `image/${fileType}`,
      });
    } else {
      formData.append("image", null);
    }
    console.log("FormData:", formData); // Debugging  
  
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch("https://skinwise.tech/community/create/", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${accessToken}`
        },
        body: formData,
      });
  
      if (response.ok) {
        // Alert.alert("Success", "Your post has been created!");
        setPostText('');
        setSelectedImage(null);
        navigation.goBack();
      } else {
        console.log('response', response);
        Alert.alert("Error", "Failed to create post. Try again!");
      }
    } catch (error) {
      console.error(error);
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
                <Image source={{ uri: selectedImage }} style={styles.image} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <FontAwesome name="times-circle" size={22} color="red" />
                </TouchableOpacity>
              </View>
            )}

<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
  <TouchableOpacity style={[styles.imageButton, { flex: 1, marginRight: 5 }]} onPress={pickImage}>
    <FontAwesome name="image" size={18} color="#fff" />
    <Text style={styles.imageButtonText}>Upload</Text>
  </TouchableOpacity>

  <TouchableOpacity style={[styles.imageButton, { flex: 1, marginLeft: 5 }]} onPress={takePhoto}>
    <FontAwesome name="camera" size={18} color="#fff" />
    <Text style={styles.imageButtonText}>Camera</Text>
  </TouchableOpacity>
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
