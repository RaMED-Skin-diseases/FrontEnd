import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import Markdown from 'react-native-markdown-display';

export default function AIChatScreen({ route, navigation }) {
  const { initialMessage } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  // AnimatedLoader logic
  const loaderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loaderAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(loaderAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      loaderAnim.setValue(0);
    }
  }, [isLoading]);

  // Scroll to the end 
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const sendMessageToBot = async (messageText, errorMessageId = null) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://new-env.eba-6dsh89vt.eu-north-1.elasticbeanstalk.com/chatbot/reply/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      console.log('AI response:', data);
      setMessages((prev) => {
        let updatedMessages = errorMessageId
          ? prev.filter((msg) => msg.id !== errorMessageId)
          : prev;
        return [...updatedMessages, { id: Date.now() + 1, text: data.reply, isUser: false }];
      });
    } catch (error) {
      console.log(error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Error: Could not connect to the AI bot. Please try again.',
        isUser: false,
        isError: true,
        originalMessage: messageText,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // initial prompt
  useEffect(() => {
    const sendInitialMessage = async () => {
      if (!initialMessage) return;

      console.log("Initial Summary from chat bot:", initialMessage);
      await sendMessageToBot(initialMessage);
    };

    sendInitialMessage();
  }, [initialMessage]);

  // Handle user message from input
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now(), text: inputText, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    await sendMessageToBot(inputText);
  };

  // Handle retry for failed messages
  const retryMessage = async (originalMessage, errorMessageId) => {
    await sendMessageToBot(originalMessage, errorMessageId);
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-gray-100`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={tw`flex-1 p-4`}>
        {/* <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Chat with AI Bot</Text> */}
        {isLoading && (
          <View style={tw`justify-center items-center mb-4`}>
            <Animated.View
              style={{
                opacity: loaderAnim,
                transform: [
                  {
                    scale: loaderAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              }}
            >
              <ActivityIndicator size="large" color="#3B82F6" />
            </Animated.View>
            <Text style={tw`text-gray-500 mt-2`}>AI is thinking...</Text>
          </View>
        )}
        <ScrollView
          ref={scrollViewRef}
          style={tw`flex-1 mb-4`}
          contentContainerStyle={tw`pb-4`}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && !isLoading ? (
            <Text style={tw`text-gray-500 text-center mt-10`}>
              Start chatting with the AI bot about your skin condition or any topic!
            </Text>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={tw`mb-4 flex-row ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <View
                  style={tw`max-w-[80%] p-3 rounded-2xl ${
                    message.isUser ? 'bg-blue-500' : 'bg-white shadow'
                  }`}
                >
                  {message.isUser ? (
                    <Text style={tw`text-white text-base`}>{message.text}</Text>
                  ) : (
                    <Markdown
                      style={{
                        body: tw`text-gray-800 text-base`,
                        heading1: tw`text-xl font-bold text-gray-800`,
                        heading2: tw`text-lg font-semibold text-gray-800`,
                        bullet: tw`text-gray-800`,
                      }}
                    >
                      {message.text}
                    </Markdown>
                  )}
                  {message.isError && (
                    <TouchableOpacity
                      onPress={() => retryMessage(message.originalMessage, message.id)}
                      style={tw`mt-2`}
                    >
                      <Text style={tw`text-blue-500 text-base font-semibold`}>Retry</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
        <View style={tw`flex-row items-center bg-white rounded-full p-2 shadow`}>
          <TextInput
            style={tw`flex-1 text-base text-gray-800 px-4`}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={tw`bg-blue-500 p-3 rounded-full`}
            onPress={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? (
              <Animated.View
                style={{
                  opacity: loaderAnim,
                  transform: [
                    {
                      scale: loaderAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                }}
              >
                <ActivityIndicator size="small" color="white" />
              </Animated.View>
            ) : (
              <Text style={tw`text-white font-semibold`}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}