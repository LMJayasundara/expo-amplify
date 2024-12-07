// app/(auth)/newpasswd.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

export default function NewPasswordScreen() {
  const { confirmResetPassword, resendCode } = useContext(AuthContext);
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const [email] = useState(params.email);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    try {
      setError('');
      setIsResending(true);
      await resendCode(email, 'reset');
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email'
      );
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Failed to Resend', err.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await confirmResetPassword(email, code, newPassword);
      Alert.alert(
        'Success',
        'Password has been reset successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/signin')
          }
        ]
      );
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Reset Failed', err.message);
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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      >
        <View className="flex-1 justify-center p-6 bg-white">
          <Text className="text-2xl font-bold mb-6 text-center">Reset Password</Text>

          {error ? <Text className="text-red-500 mb-4 text-center">{error}</Text> : null}

          <Text className="text-center mb-4 text-gray-600">
            Enter the verification code sent to your email
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

          <TextInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            className="mb-4 p-4 border border-gray-300 rounded-lg w-full bg-white"
            placeholderTextColor="#9CA3AF"
          />

          <TextInput
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="mb-6 p-4 border border-gray-300 rounded-lg w-full bg-white"
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`p-4 rounded-lg mb-4 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            {isSubmitting ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white text-center font-semibold ml-2">Resetting password...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold">Reset Password</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center gap-4">
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#3b82f6" size="small" />
                  <Text className="text-blue-500 ml-2">Sending code...</Text>
                </View>
              ) : (
                <Text className="text-blue-500">Resend code</Text>
              )}
            </TouchableOpacity>
            <Text className="text-gray-400">|</Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/signin')}
              disabled={isSubmitting || isResending}
            >
              <Text className="text-blue-500">Back to sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 