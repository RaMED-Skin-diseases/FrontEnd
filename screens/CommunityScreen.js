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
        Alert.alert("Error", "Authentication token not found.");
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
      Alert.alert("Error", error.message || "Failed to fetch posts.");
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginBottom: 10,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  sortButtonActive: {
    backgroundColor: '#A0C4FF',
  },
  sortButtonText: {
    marginLeft: 5,
    color: '#3E4A59',
    fontSize: 14,
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#3E4A59',
  },
  clearIcon: {
    padding: 10,
  },
  searchButton: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6C757D',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3E4A59',
  },
  postDate: {
    fontSize: 12,
    color: '#6C757D',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E4A59',
    marginTop: 5,
  },
  postText: {
    fontSize: 16,
    color: '#3E4A59',
    marginTop: 5,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    paddingHorizontal: 10,
    backgroundColor: '#F1F3F5',
  },
  replyInput: {
    flex: 1,
    height: 40,
  },
  sendButton: {
    padding: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#A0C4FF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3E4A59',
  },
  doctorCommentContainer: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  doctorCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorCommentAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  doctorCommentDate: {
    fontSize: 12,
    color: '#666',
  },
  doctorCommentText: {
    fontSize: 14,
    color: '#333',
    marginTop: 3,
  },
});