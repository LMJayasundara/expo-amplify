// app/(auth)/signup.tsx
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

export default function SignUpScreen() {
  const { isLoading, register } = useContext(AuthContext);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !username || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setError('');
      const { nextStep } = await register(username, email, password);
      
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        Alert.alert(
          'Verification Required',
          'Please check your email for a verification code',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace({
                  pathname: '/(auth)/verify',
                  params: { email, password }
                });
              }
            }
          ]
        );
      }
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Registration Failed', err.message);
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
          <Text className="text-2xl font-bold mb-6 text-center">Create Account</Text>

          {error ? <Text className="text-red-500 mb-4 text-center">{error}</Text> : null}

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            className="mb-4 p-4 border border-gray-300 rounded-lg w-full bg-white"
            placeholderTextColor="#9CA3AF"
            style={{ letterSpacing: 0 }}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            className="mb-4 p-4 border border-gray-300 rounded-lg w-full bg-white"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
            style={{ letterSpacing: 0 }}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="mb-4 p-4 border border-gray-300 rounded-lg w-full bg-white"
            placeholderTextColor="#9CA3AF"
            style={{ letterSpacing: 0 }}
          />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="mb-6 p-4 border border-gray-300 rounded-lg w-full bg-white"
            placeholderTextColor="#9CA3AF"
            style={{ letterSpacing: 0 }}
          />

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isLoading}
            className={`p-4 rounded-lg mb-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            <Text className="text-white text-center font-semibold">
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center gap-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/(auth)/signin" replace className="text-blue-500">
              Sign in
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}