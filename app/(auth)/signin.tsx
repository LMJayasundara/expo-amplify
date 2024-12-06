// app/(auth)/signin.tsx
import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await login(email, password);
      // Navigation is handled by RootNavigation in _layout.tsx
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center px-4">
      <TextInput
        className="border p-2 rounded-lg mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="border p-2 rounded-lg mb-4"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        className="bg-blue-500 p-3 rounded-lg"
        onPress={handleSignIn}
      >
        <Text className="text-white text-center font-semibold">Sign In</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="mt-4"
        onPress={() => router.push('/(auth)/signup')}
      >
        <Text className="text-blue-500 text-center">Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}