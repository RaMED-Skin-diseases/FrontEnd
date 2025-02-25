import React, { useState, useEffect } from 'react';
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
import rashImage from '../assets/rash.avif';

export default function CommunityScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:8000/account/community/");
      const data = await response.json();

      if (data.status === "success") {
        const parsedPosts = JSON.parse(data.posts);
        const formattedPosts = parsedPosts.map((post) => ({
          id: post.pk.toString(),
          title: post.fields.title,
          text: post.fields.content,
          image: post.fields.image ? `http://localhost:8000${post.fields.image}` : null,
          createdAt: formatDate(post.fields.created_at),
          author: "User", // Placeholder for now
        }));

        // Add a static post with an image
        const staticPost = {
          id: "static-1",
          title: "Example Post with an Image",
          text: "This is a sample post with an image.",
          image: require("../assets/rash.avif"), // Ensure the path is correct
          createdAt: formatDate(new Date().toISOString()),
          author: "Admin",
        };
        

        setPosts([staticPost, ...formattedPosts]);
      } else {
        Alert.alert("Error", "Failed to fetch posts.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not load posts.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(isoString).toLocaleString('en-US', options);
  };

  const handleReplyChange = (postId, text) => {
    setReplies({ ...replies, [postId]: text });
  };

  const submitReply = (postId) => {
    if (replies[postId]?.trim()) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, replies: [...(post.replies || []), replies[postId]] }
            : post
        )
      );
      setReplies({ ...replies, [postId]: '' });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      {/* Header: User Icon + Name + Date */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <FontAwesome name="user-circle" size={32} color="#6C757D" style={styles.userIcon} />
          <Text style={styles.userName}>{item.author}</Text>
        </View>
        <Text style={styles.postDate}>{item.createdAt}</Text>
      </View>

      {/* Post Content */}
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postText}>{item.text}</Text>
      {item.image && (
  <Image source={item.image} style={styles.postImage} />
)}


      {/* Replies Section */}
      <FlatList
        data={item.replies || []}
        keyExtractor={(reply, index) => `${item.id}-reply-${index}`}
        renderItem={({ item: reply }) => <Text style={styles.replyText}>💬 {reply}</Text>}
      />

      {/* Reply Input with Send Button */}
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
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Forum</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#A0C4FF" />
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
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  replyText: {
    fontSize: 14,
    color: '#6C757D',
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
  // sendButton: {
  //   backgroundColor: '#A0C4FF',
  //   padding: 10,
  //   borderRadius: 6,
  //   marginLeft: 5,
  // },
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
});
