// app/(auth)/verify.tsx
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function VerifyScreen() {
  const { isLoading, confirmRegistration, login, resendConfirmationCode } = useContext(AuthContext);
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string; password: string }>();
  const [email] = useState(params.email);
  const [password] = useState(params.password);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email || !password) {
      Alert.alert('Error', 'Missing registration information');
      router.replace('/(auth)/signup');
    }
  }, [email, password]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setError('');
      const { isSignUpComplete } = await confirmRegistration(email, code);
      
      if (isSignUpComplete) {
        try {
          await login(email, password);
          router.replace('/(tabs)');
        } catch (loginError: any) {
          Alert.alert(
            'Verification Successful',
            'Your email has been verified. Please sign in.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(auth)/signin')
              }
            ]
          );
        }
      }
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Verification Failed', err.message);
    }
  };

  const handleResend = async () => {
    try {
      setError('');
      await resendConfirmationCode(email);
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email'
      );
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Failed to Resend', err.message);
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