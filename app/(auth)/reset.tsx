// app/(auth)/reset.tsx
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

export default function ResetScreen() {
  const { resendCode, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    try {
      setError(''); // Clear any previous errors
      
      // Basic email validation before making the API call
      if (!email || !email.trim()) {
        setError('Please enter your email address');
        return;
      }

      await resendCode(email, 'reset');
      router.replace({
        pathname: '/(auth)/newpasswd',
        params: { 
          email: email.trim()
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
      // Don't navigate if there's an error
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
        <View className="flex-1 justify-center p-6 bg-white">
          <Text className="text-2xl font-bold mb-6 text-center">Reset Password</Text>

          {error ? <Text className="text-red-500 mb-4 text-center">{error}</Text> : null}

          <Text className="text-center mb-4 text-gray-600">
            Enter your email to receive a reset code
          </Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            className="mb-6 p-4 border border-gray-300 rounded-lg w-full bg-white"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
            style={{ letterSpacing: 0 }}
          />

          <TouchableOpacity
            onPress={handleReset}
            disabled={isLoading}
            className={`p-4 rounded-lg mb-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            <Text className="text-white text-center font-semibold">
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center gap-4">
            <Link href="/(auth)/signin" replace className="text-blue-500">
              Back to sign in
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}