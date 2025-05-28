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
import Toast from 'react-native-toast-message';

export default function CommunityScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState({});
  const [userType, setUserType] = useState(null);
  const [sortBy, setSortBy] = useState('-created_at');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputSearch, setInputSearch] = useState('');
  const [expandedComments, setExpandedComments] = useState([]);

  const fetchUserType = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const userDataParsed = JSON.parse(userData);
      const userType = userDataParsed?.user_type || 'null';
      setUserType(userType);
    } catch (error) {
      console.error("Failed to fetch user type", error);
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
    setLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        //Alert.alert("Error", "Authentication token not found.");
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Authentication token not found.'
        });
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (sortBy) params.append('sort_by', sortBy);
      if (searchQuery) params.append('search', searchQuery);
      const url = `https://skinwise.tech/community/?${params.toString()}`;

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

      console.log("Response status:", data);
      const formattedPosts = data.posts.map(post => ({
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
      //Alert.alert("Error", error.message || "Failed to fetch posts.");
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch posts.'
      });
    } finally {
      setLoading(false);
    }
  }, [sortBy, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchUserType();
      fetchPosts();
    }, [fetchPosts])
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleReplyChange = (postId, text) => {
    setReplies({ ...replies, [postId]: text });
  };

  const fetchDoctorComments = async (postId) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        //Alert.alert("Error", "Authentication token not found.");
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Authentication token not found.'
        });
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
        //Alert.alert("Error", "Failed to fetch comments.");
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to fetch comments.'
        });
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
      //Alert.alert("Error", error.message || "Failed to fetch comments.");
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch comments.'
      });
    }
  };

  const submitReply = async (postId) => {
    if (replies[postId]?.trim()) {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          //Alert.alert("Error", "Authentication token not found.");
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Authentication token not found.'
          });
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
          //Alert.alert("Error", "Failed to post reply.");
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to post reply.'
          });
        }
      } catch (error) {
        console.error("Submit reply error:", error);
        //Alert.alert("Error", error.message || "Failed to submit reply.");
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to submit reply.'
        });
      }
    } else {
      //Alert.alert("Error", "Reply cannot be empty.");
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Reply cannot be empty.'
      });
    }
  };

  const toggleSavePost = async (postId) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        //Alert.alert("Error", "Authentication token not found.");
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Authentication token not found.'
        });
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
        //Alert.alert("Error", "Failed to save post.");
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to save post.'
        });
      }
    } catch (error) {
      console.error("Save post error:", error);
      //Alert.alert("Error", error.message || "Failed to save post.");
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save post.'
      });
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
      <Text style={styles.title}>Community Forum</Text>
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'created_at' && styles.sortButtonActive]}
          onPress={() => setSortBy('created_at')}
        >
          <FontAwesome
            name="sort-numeric-asc"
            size={16}
            color={sortBy === 'created_at' ? '#FFF' : '#3E4A59'}
          />
          <Text
            style={[styles.sortButtonText, sortBy === 'created_at' && styles.sortButtonTextActive]}
          >
            Old to New
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === '-created_at' && styles.sortButtonActive]}
          onPress={() => setSortBy('-created_at')}
        >
          <FontAwesome
            name="sort-numeric-desc"
            size={16}
            color={sortBy === '-created_at' ? '#FFF' : '#3E4A59'}
          />
          <Text
            style={[styles.sortButtonText, sortBy === '-created_at' && styles.sortButtonTextActive]}
          >
            New to Old
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'title' && styles.sortButtonActive]}
          onPress={() => setSortBy('title')}
        >
          <FontAwesome
            name="sort-alpha-asc"
            size={16}
            color={sortBy === 'title' ? '#FFF' : '#3E4A59'}
          />
          <Text
            style={[styles.sortButtonText, sortBy === 'title' && styles.sortButtonTextActive]}
          >
            A-Z
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#6C757D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          value={inputSearch}
          onChangeText={setInputSearch}
        />
        {inputSearch.length > 0 && (
          <TouchableOpacity
            style={styles.clearIcon}
            onPress={() => {
              setInputSearch('');
              setSearchQuery('');
            }}
          >
            <FontAwesome name="times" size={20} color="#6C757D" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchQuery(inputSearch)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#A0C4FF" />
      ) : posts.length === 0 ? (
        <Text style={styles.noPostsText}>No posts found.</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreatePost', { addPost: (post) => setPosts([post, ...posts]) })}
      >
        <FontAwesome name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 15, // Use horizontal padding
    paddingTop: 20,
  },
  title: {
    fontSize: 26, // Slightly larger title
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 15,
    paddingHorizontal: 5, // Align with container padding
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space out buttons
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    padding: 5,
    marginBottom: 15,
  },
  sortButton: {
    flex: 1, // Distribute space evenly
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 6,
    marginHorizontal: 3,
  },
  sortButtonActive: {
    backgroundColor: '#A0C4FF',
  },
  sortButtonText: {
    marginLeft: 6,
    color: '#495057',
    fontSize: 13, // Slightly smaller text
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45, // Slightly taller input
    fontSize: 16,
    color: '#495057',
  },
  clearIcon: {
    padding: 8, // Easier to tap
    marginLeft: 5,
  },
  searchButton: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noPostsText: {
    flex: 1, // Take remaining space
    textAlign: 'center',
    textAlignVertical: 'center', // Center vertically
    fontSize: 17,
    color: '#6C757D',
    marginTop: 50,
  },
  postContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allow shrinking if author name is long
  },
  userIcon: {
    marginRight: 8,
  },
  userName: {
    fontWeight: '600',
    color: '#343A40',
    fontSize: 15,
    marginRight: 5, // Space before date
  },
  postDate: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'right',
    marginLeft: 'auto', // Push date to the right before bookmark
    marginRight: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  postText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22, // Improve readability
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#E9ECEF', // Placeholder color
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 10,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
    maxHeight: 100, // Limit height for multiline
  },
  sendButton: {
    backgroundColor: '#A0C4FF',
    borderRadius: 20, // Make it circular
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    marginTop: 15,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  commentsSection: {
    marginTop: 5,
  },
  doctorCommentContainer: {
    backgroundColor: '#F1F3F5', // Slightly different background for comments
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  doctorCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  doctorCommentAuthor: {
    fontWeight: 'bold',
    color: '#007BFF', // Highlight doctor's name
    fontSize: 14,
  },
  doctorCommentDate: {
    fontSize: 11,
    color: '#6C757D',
  },
  doctorCommentText: {
    fontSize: 14,
    color: '#343A40',
    lineHeight: 20,
  },
  noCommentsText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#6C757D',
    fontStyle: 'italic',
  },
  nonDoctorNote: {
    fontStyle: 'italic',
    color: '#6C757D',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#A0C4FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});