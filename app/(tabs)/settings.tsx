// app/(tabs)/settings.tsx
import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '@/context/AuthContext';

export default function SettingsScreen() {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}