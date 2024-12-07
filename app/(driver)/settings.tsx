// app/(driver)/settings.tsx
import React, { useContext } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export default function DriverSettingsScreen() {
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/(auth)/signin');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Driver Settings</Text>
      <TouchableOpacity 
        onPress={handleSignOut}
        className="bg-red-500 p-3 rounded-lg mt-4"
      >
        <Text className="text-white font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}