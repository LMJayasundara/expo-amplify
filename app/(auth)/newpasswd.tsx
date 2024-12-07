import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

export default function NewPasswordScreen() {
  const { confirmResetPassword, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!params.email) {
      setError('Email is missing');
      return;
    }

    if (!code || code.length !== 6) {
      setError('Please enter a valid verification code');
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

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await confirmResetPassword(
        params.email.trim(),
        newPassword,
        code
      );
      Alert.alert(
        'Success',
        'Your password has been reset successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/signin')
          }
        ]
      );
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Error', err.message);
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
            disabled={isLoading}
            className={`p-4 rounded-lg mb-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            <Text className="text-white text-center font-semibold">
              {isLoading ? 'Updating...' : 'Update Password'}
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