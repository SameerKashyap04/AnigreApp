import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/SupabaseService';

export default function SignupScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Create the account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: name.trim() }
        }
      });

      if (signUpError) throw signUpError;

      // Step 2: Immediately sign in (works even if email confirmation is off)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        // Account created but couldn't auto-login — ask user to verify email
        Alert.alert(
          'Account Created! ✅',
          'Your account was created successfully. Please check your email to verify, then login.'
        );
        navigation.goBack();
        return;
      }

      if (signInData.user) {
        await login({
          id: signInData.user.id,
          email: signInData.user.email ?? '',
          name: name.trim(),
        });
      }
    } catch (err: any) {
      const msg: string = err.message ?? '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already')) {
        Alert.alert('Account Exists', 'An account with this email already exists. Please login instead.');
      } else {
        Alert.alert('Signup Failed', msg || 'Could not create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.bgBody }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="person-add" size={40} color={colors.primaryGreen} style={{ marginLeft: 4 }} />
        </View>
        <Text style={[styles.title, { color: colors.textMain }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Join Anigre to save your farm data</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMain }]}>Full Name</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.bgCard, borderColor: colors.borderCard }]}>
            <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { color: colors.textMain }]}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMain }]}>Email</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.bgCard, borderColor: colors.borderCard }]}>
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { color: colors.textMain }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMain }]}>Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.bgCard, borderColor: colors.borderCard }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { color: colors.textMain }]}
              placeholder="Create a password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primaryGreen }]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{ color: colors.textMuted }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primaryGreen, fontWeight: '700' }}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40, paddingHorizontal: 20 },
  logoContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(74, 222, 128, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: '100%', fontSize: 16 },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 }
});
