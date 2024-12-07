// app/(auth)/signin.tsx
import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, resendCode } = useContext(AuthContext);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const { isSignedIn, nextStep } = await login(email, password);

      // Handle different next steps
      switch (nextStep.signInStep) {
        case 'CONFIRM_SIGN_UP':
          // User needs to verify their email
          await resendCode(email, 'signup');
          router.replace({
            pathname: '/(auth)/verify',
            params: {
              email: email.trim(), // Ensure clean email
              password: password
            }
          });
          break;

        case 'RESET_PASSWORD':
          router.replace({
            pathname: '/(auth)/reset',
            params: { email }
          });
          break;

        case 'DONE':
          // Navigation is handled by RootNavigation in _layout.tsx
          break;

        default:
          setError(`Unsupported sign-in step: ${nextStep.signInStep}`);
          break;
      }
    } catch (error: any) {
      setError(error.message);
      Alert.alert('Sign In Failed', error.message, [
        {
          text: 'OK'
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled" // Changed here
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-4">
          {error ? (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          ) : null}

          <TextInput
            className="border p-2 rounded-lg mb-4"
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setError('');
              setEmail(text);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            className="border p-2 rounded-lg mb-4"
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setError('');
              setPassword(text);
            }}
            secureTextEntry
          />
          <TouchableOpacity
            className={`bg-blue-500 p-3 rounded-lg ${isSubmitting ? 'opacity-70' : ''}`}
            onPress={handleSignIn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white text-center font-semibold ml-2">Signing in...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold">Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4"
            onPress={() => router.replace('/(auth)/signup')}
          >
            <Text className="text-blue-500 text-center">Don't have an account? Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-2"
            onPress={() => router.replace('/(auth)/reset')}
          >
            <Text className="text-blue-500 text-center">Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}