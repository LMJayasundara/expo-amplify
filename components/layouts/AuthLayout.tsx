import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

interface AuthLayoutProps {
  children: React.ReactNode;
  error?: string | null;
  showError?: boolean;
}

export function AuthLayout({ children, error = null, showError = false }: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ErrorBanner message={error} visible={showError} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      >
        <View className="flex-1 justify-center p-6 bg-white">
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 