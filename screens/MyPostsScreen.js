import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


export default function MyPostsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState({});
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState(null); // Added state for username
  const [expandedComments, setExpandedComments] = useState([]);

  const fetchUserTypeAndName = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const userDataParsed = JSON.parse(userData);
        setUserType(userDataParsed?.user_type || 'null');
        setUserName(userDataParsed?.username || null); // Store username
      } else {

        Alert.alert("Error", "User data not found. Please log in again.");
        navigation.goBack(); 
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
      Alert.alert("Error", "Failed to load user data.");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString || isoString === "Unknown Date") return "Unknown Date";
    return new Date(isoString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
  };


  const fetchPosts = useCallback(async () => {
    if (!userName) return; 

    setLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found.");
        setLoading(false);
        return;
      }


      const url = `https://skinwise.tech/community/`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.posts) {
        throw new Error("Invalid API response format");
      }


      const userPosts = data.posts.filter(post => post.author === userName);

      const formattedPosts = userPosts.map(post => ({
        id: post.id?.toString() ?? "unknown",
        title: post.title ?? "No Title",
        content: post.content ?? "No Content",
        image: post.image ?? null,
        createdAt: formatDate(post.created_at ?? "Unknown Date"),
        author: post.author ?? "Anonymous",
        comments: null,
        saved: post.is_saved ?? false 
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", error.message || "Failed to fetch posts.");
    } finally {
      setLoading(false);
    }
  }, [userName]); 

  useFocusEffect(
    useCallback(() => {
      fetchUserTypeAndName(); 
    }, [])
  );

  useEffect(() => {
    if (userName) {
      fetchPosts(); 
    }
  }, [userName, fetchPosts]);

  const handleReplyChange = (postId, text) => {
    setReplies({ ...replies, [postId]: text });
  };

  const fetchDoctorComments = async (postId) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found.");
        return;
      }

      const response = await fetch(`https://skinwise.tech/community/post/${postId}/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        const updatedPost = {
          ...posts.find(p => p.id === postId),
          comments: data.comments || [],
        };
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? updatedPost : post
          )
        );
      } else {
        Alert.alert("Error", "Failed to fetch comments.");
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
      Alert.alert("Error", error.message || "Failed to fetch comments.");
    }
  };

  const submitReply = async (postId) => {
    if (replies[postId]?.trim()) {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          Alert.alert("Error", "Authentication token not found.");
          return;
        }

        const requestBody = {
          content: replies[postId],
        };

        const response = await fetch(`https://skinwise.tech/community/post/${postId}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
          await fetchDoctorComments(postId);
          setReplies({ ...replies, [postId]: '' });
        } else {
          Alert.alert("Error", "Failed to post reply.");
        }
      } catch (error) {
        console.error("Submit reply error:", error);
        Alert.alert("Error", error.message || "Failed to submit reply.");
      }
    } else {
      Alert.alert("Error", "Reply cannot be empty.");
    }
  };

  const toggleSavePost = async (postId) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found.");
        return;
      }

      const response = await fetch(`https://skinwise.tech/community/save-post/${postId}/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Save post response:", data);
      if (data.status === 'success') {
        const newSavedStatus = data.saved !== undefined ? data.saved : !posts.find(p => p.id === postId).saved;
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, saved: newSavedStatus } : post
          )
        );
      } else {
        Alert.alert("Error", "Failed to save post.");
      }
    } catch (error) {
      console.error("Save post error:", error);
      Alert.alert("Error", error.message || "Failed to save post.");
    }
  };

  const toggleCommentsVisibility = (postId) => {
    setExpandedComments((prev) => {
      if (prev.includes(postId)) {
        return prev.filter(id => id !== postId);
      } else {
        const post = posts.find(p => p.id === postId);
        if (post && post.comments === null) {
          fetchDoctorComments(postId);
        }
        return [...prev, postId];
      }
    });
  };


  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <FontAwesome name="user-circle" size={32} color="#6C757D" style={styles.userIcon} />
          <Text style={styles.userName}>{item.author}</Text>
        </View>
        <Text style={styles.postDate}>{item.createdAt}</Text>
        <TouchableOpacity onPress={() => toggleSavePost(item.id)}>
          <FontAwesome 
            name={item.saved ? "bookmark" : "bookmark-o"} 
            size={24} 
            color={item.saved ? "#A0C4FF" : "#6C757D"} 
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postText}>{item.content}</Text>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={{
            width: '100%',
            aspectRatio: 16 / 9,
            borderRadius: 8,
            marginTop: 10,
          }}
          resizeMode="cover"
        />
      )}
      {userType === 'Doctor' && (
        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            value={replies[item.id] || ''}
            onChangeText={(text) => handleReplyChange(item.id, text)}
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => submitReply(item.id)}>
            <FontAwesome name="send" size={18} />
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity 
        style={styles.commentsHeader}
        onPress={() => toggleCommentsVisibility(item.id)}
      >
        <Text style={styles.commentsTitle}>Doctor Comments</Text>
        <FontAwesome 
          name={expandedComments.includes(item.id) ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#6C757D" 
        />
      </TouchableOpacity>
      {expandedComments.includes(item.id) && (
        <View>
          {item.comments === null ? (
            <ActivityIndicator size="small" color="#A0C4FF" />
          ) : item.comments.length > 0 ? (
            item.comments.map((comment) => (
              <View key={comment.id} style={styles.doctorCommentContainer}>
                <View style={styles.doctorCommentHeader}>
                  <Text style={styles.doctorCommentAuthor}>{comment.author}</Text>
                  <Text style={styles.doctorCommentDate}>
                    {new Date(comment.created_at).toLocaleString('en-GB', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
                <Text style={styles.doctorCommentText}>{comment.content}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>No comments yet.</Text>
          )}
        </View>
      )}
      {userType !== 'Doctor' && (
        <Text style={{ fontStyle: 'italic', color: '#999', marginTop: 8 }}>
          Only doctors can reply to posts.
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Changed title */}
      <Text style={styles.title}>My Posts</Text>
      

      {loading ? (
        <ActivityIndicator size="large" color="#A0C4FF" />
      ) : posts.length === 0 ? (
        // Added empty state message
        <View style={styles.emptyContainer}>
          <FontAwesome name="pencil-square-o" size={60} color="#CED4DA" />
          <Text style={styles.noPostsText}>You haven't created any posts yet.</Text>
          <Text style={styles.encourageText}>Why not share something with the community?</Text>
          <TouchableOpacity 
            style={styles.createPostButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={styles.createPostButtonText}>Create Your First Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

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
    marginBottom: 20, 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C757D',
  },
  encourageText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 30,
  },
  createPostButton: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  createPostButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIcon: {
    marginRight: 8,
  },
  userName: {
    fontWeight: 'bold',
    color: '#3E4A59',
  },
  postDate: {
    fontSize: 12,
    color: '#6C757D',
    marginHorizontal: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginBottom: 5,
  },
  postText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    backgroundColor: '#A0C4FF',
    borderRadius: 20,
    padding: 10,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  commentsTitle: {
    fontWeight: 'bold',
    color: '#3E4A59',
  },
  doctorCommentContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
  },
  doctorCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  doctorCommentAuthor: {
    fontWeight: 'bold',
    color: '#495057',
  },
  doctorCommentDate: {
    fontSize: 10,
    color: '#6C757D',
  },
  doctorCommentText: {
    fontSize: 13,
    color: '#495057',
  },
  noCommentsText: {
    fontStyle: 'italic',
    color: '#6C757D',
    marginTop: 5,
  },

});

