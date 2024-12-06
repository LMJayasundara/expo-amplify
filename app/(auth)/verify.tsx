// app/(auth)/verify.tsx
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

export default function VerifyScreen() {
  const { verifyEmail, resendCode, isLoading } = useContext(AuthContext);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    try {
      await verifyEmail(code);
    } catch (err) {
      setError('Invalid verification code');
    }
  };

  const handleResend = async () => {
    try {
      await resendCode('stored-email', 'signup');
    } catch (err) {
      setError('Failed to resend code');
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
          <Text className="text-2xl font-bold mb-6 text-center">Verify Email</Text>

          {error ? <Text className="text-red-500 mb-4 text-center">{error}</Text> : null}

          <Text className="text-center mb-4 text-gray-600">
            Please enter the 6-digit code sent to your email
          </Text>

          <TextInput
            placeholder="000000"
            value={code}
            onChangeText={setCode}
            className="mb-6 p-4 border border-gray-300 rounded-lg w-full bg-white text-center"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            style={{
              fontSize: 24,
              letterSpacing: 8,
            }}
          />

          <TouchableOpacity
            onPress={handleVerify}
            disabled={isLoading}
            className={`p-4 rounded-lg mb-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            <Text className="text-white text-center font-semibold">
              {isLoading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center gap-4">
            <TouchableOpacity onPress={handleResend} disabled={isLoading}>
              <Text className="text-blue-500">Resend code</Text>
            </TouchableOpacity>
            <Text className="text-gray-400">|</Text>
            <Link href="/(auth)/signin" replace className="text-blue-500">
              Back to sign in
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}