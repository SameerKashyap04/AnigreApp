import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';
import { generateGeminiResponse, ChatMessage } from '../services/GeminiService';

export default function ChatScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'model',
    text: "Hello! I am Anigre.ai, your personal farming assistant. How can I help you with your crops today?"
  }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{uri: string, base64: string} | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setSelectedImage({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
    }
  };

  const sendMessage = async (text: string, base64?: string, uri?: string, currentMessages: ChatMessage[] = messages) => {
    if (!text && !base64) return;
    
    const newUserMsg: ChatMessage = { 
      id: `user-${Date.now()}`, 
      role: 'user', 
      text: text,
      imageUri: uri,
      imageBase64: base64
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    const botResponseText = await generateGeminiResponse(currentMessages, text, base64);
    
    const newBotMsg: ChatMessage = { id: `bot-${Date.now()}`, role: 'model', text: botResponseText };
    setMessages(prev => [...prev, newBotMsg]);
    setIsTyping(false);
  };

  const handleSend = () => {
    if ((!inputText.trim() && !selectedImage) || isTyping) return;

    const textToSend = inputText.trim() || (selectedImage ? "Uploaded an image." : "");
    const base64ToSend = selectedImage?.base64;
    const uriToSend = selectedImage?.uri;
    
    setInputText('');
    setSelectedImage(null);
    sendMessage(textToSend, base64ToSend, uriToSend, messages);
  };

  useEffect(() => {
    if (route.params?.initialMessage && messages.length === 1 && !isTyping) {
      sendMessage(route.params.initialMessage, route.params?.initialImageBase64, route.params?.initialImageUri, messages);
    }
  }, [route.params?.initialMessage]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.bgHome }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.header, { backgroundColor: colors.bgNav }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
        <Ionicons name="sparkles" size={20} color={colors.primaryGreen} style={{ marginRight: 6 }} />
        <Text style={[styles.title, { color: colors.textMain }]}>Anigre.ai</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperBot]}>
              {!isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.primaryGreen }]}>
                  <Ionicons name="leaf" size={14} color="#fff" />
                </View>
              )}
              <View style={[
                styles.messageBubble, 
                isUser ? [styles.messageUser, { backgroundColor: colors.primaryGreen }] : [styles.messageBot, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard, borderWidth: 1 }]
              ]}>
                {msg.imageUri && (
                  <Image source={{ uri: msg.imageUri }} style={{ width: 150, height: 150, borderRadius: 8, marginBottom: 8 }} />
                )}
                {msg.text ? <Text style={[styles.messageText, { color: isUser ? '#fff' : colors.textMain }]}>{msg.text}</Text> : null}
              </View>
            </View>
          );
        })}
        {isTyping && (
          <View style={[styles.messageWrapper, styles.messageWrapperBot]}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryGreen }]}>
              <Ionicons name="leaf" size={14} color="#fff" />
            </View>
            <View style={[styles.messageBubble, styles.messageBot, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard, borderWidth: 1, paddingVertical: 12 }]}>
              <ActivityIndicator size="small" color={colors.primaryGreen} />
            </View>
          </View>
        )}
      </ScrollView>

      {selectedImage && (
        <View style={{ padding: 12, backgroundColor: colors.bgCardAlt, borderTopColor: colors.borderCard, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: selectedImage.uri }} style={{ width: 50, height: 50, borderRadius: 8 }} />
          <TouchableOpacity style={{ marginLeft: 12, padding: 8 }} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-circle" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.inputContainer, { backgroundColor: colors.bgCard, borderTopColor: colors.borderCard }]}>
        <TouchableOpacity style={styles.attachBtn} onPress={pickImage} disabled={isTyping}>
          <Ionicons name="image-outline" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: colors.textMain, backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}
          placeholder="Ask about crops, diseases..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: (inputText.trim() || selectedImage) ? colors.primaryGreen : colors.borderCard }]} 
          onPress={handleSend}
          disabled={(!inputText.trim() && !selectedImage) || isTyping}
        >
          <Ionicons name="send" size={18} color={(inputText.trim() || selectedImage) ? '#fff' : colors.textMuted} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50 },
  backBtn: { padding: 8, marginRight: 8 },
  title: { fontSize: 18, fontWeight: '700', flex: 1 },
  chatContent: { padding: 16, paddingBottom: 20, gap: 16 },
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  messageWrapperUser: { justifyContent: 'flex-end' },
  messageWrapperBot: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  messageUser: { borderBottomRightRadius: 4 },
  messageBot: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 30, borderTopWidth: 1 },
  attachBtn: { padding: 10, marginRight: 4, paddingBottom: 12 },
  input: { flex: 1, minHeight: 48, maxHeight: 120, borderRadius: 24, borderWidth: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, fontSize: 15, marginRight: 10 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 2 }
});
