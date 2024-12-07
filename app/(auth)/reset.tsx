// app/(auth)/reset.tsx
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateEmail } from '@/utils/validation';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useFormField } from '@/hooks/useFormField';
import { useErrorBanner } from '@/hooks/useErrorBanner';

export default function ResetScreen() {
  const { resendCode } = useAuth();
  const router = useRouter();
  const { value: email, onChange: setEmail } = useFormField('');
  const { isLoading, withLoading } = useLoadingState();
  const { error, visible, showError, clearError } = useErrorBanner();

  const handleReset = async () => {
    if (!validateEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    await withLoading(async () => {
      try {
        await resendCode(email, 'reset');
        router.replace({
          pathname: '/(auth)/newpasswd',
          params: { 
            email: email.trim()
          }
        });
      } catch (err: any) {
        showError(err.message || 'Failed to send reset code');
      }
    });
  };

  const handleChangeText = (text: string) => {
    setEmail(text);
    clearError();
  };

  return (
    <AuthLayout error={error} showError={visible}>
      <Text className="text-2xl font-bold mb-6 text-center">Reset Password</Text>

      <Text className="text-center mb-4 text-gray-600">
        Enter your email to receive a reset code
      </Text>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={handleChangeText}
        keyboardType="email-address"
        autoCapitalize="none"
        className="mb-4"
      />

      <Button
        onPress={handleReset}
        loading={isLoading}
        className="mb-4"
      >
        Send Reset Code
      </Button>

      <TouchableOpacity 
        onPress={() => router.replace('/(auth)/signin')}
        className="mt-4"
      >
        <Text className="text-blue-500 text-center">Back to sign in</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}