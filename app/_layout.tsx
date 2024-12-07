// app/_layout.tsx
import React, { useContext, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, AuthContext } from '@/context/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
Amplify.configure(outputs);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className='flex-1' style={{ paddingBottom: -15 }}>
        <StatusBar style="auto" />
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function RootNavigation() {
  const { isAuthenticated, isLoading, role } = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const shouldBeInGroup = role === 'driver' ? '(driver)' : '(passenger)';
    const currentGroup = segments[0];

    if (!isAuthenticated) {
      // Not authenticated -> go to sign in
      if (!inAuthGroup) {
        router.replace('/(auth)/signin');
      }
    } else if (currentGroup !== shouldBeInGroup) {
      // Authenticated but in wrong group -> redirect to correct group
      router.replace(`/${shouldBeInGroup}`);
    }
  }, [isAuthenticated, isLoading, segments, role]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}