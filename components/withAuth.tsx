// components/withAuth.tsx
import React, { useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';

export function withAuth(Component: React.ComponentType, requiredRole?: string) {
  return function WrappedComponent(props: any) {
    const { role, isLoading, isAuthenticated } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.replace('/(auth)/signin');
        } else if (requiredRole && role !== requiredRole) {
          router.replace('/(auth)/signin');
        }
      }
    }, [isLoading, isAuthenticated, role]);

    if (isLoading || (requiredRole && role !== requiredRole)) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text>Verifying access...</Text>
        </View>
      );
    }

    return <Component {...props} />;
  };
}
