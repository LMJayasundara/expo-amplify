// app/(auth)/verify.tsx
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateCode } from '@/utils/validation';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useFormField } from '@/hooks/useFormField';
import { useErrorBanner } from '@/hooks/useErrorBanner';

export default function VerifyScreen() {
  const { confirmRegistration, login, resendCode } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string; password: string }>();
  const [email] = useState(params.email);
  const [password] = useState(params.password);
  const { value: code, onChange: setCode } = useFormField('');
  const { isLoading: isSubmitting, withLoading: withSubmitting } = useLoadingState();
  const { isLoading: isResending, withLoading: withResending } = useLoadingState();
  const { error, visible, showError, clearError } = useErrorBanner();

  useEffect(() => {
    if (!email || !password) {
      Alert.alert('Error', 'Missing registration information');
      router.replace('/(auth)/signup');
    }
  }, [email, password]);

  const handleVerify = async () => {
    const codeValidationError = validateCode(code);
    if (codeValidationError) {
      showError(codeValidationError);
      return;
    }

    await withSubmitting(async () => {
      try {
        const { isSignUpComplete } = await confirmRegistration(email, code);
        
        if (isSignUpComplete) {
          try {
            const { role } = await login(email, password);
            router.replace(role === 'driver' ? '/(driver)' : '/(passenger)');
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
        showError(err.message);
        Alert.alert('Verification Failed', err.message);
      }
    });
  };

  const handleResend = async () => {
    await withResending(async () => {
      try {
        await resendCode(email, 'signup');
        Alert.alert(
          'Code Sent',
          'A new verification code has been sent to your email'
        );
      } catch (err: any) {
        showError(err.message);
        Alert.alert('Failed to Resend', err.message);
      }
    });
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
    clearError();
  };

  return (
    <AuthLayout error={error} showError={visible}>
      <Text className="text-2xl font-bold mb-6 text-center">Verify Email</Text>

      <Text className="text-center mb-4 text-gray-600">
        Please enter the 6-digit code sent to your email
      </Text>

      <Input
        placeholder="000000"
        value={code}
        onChangeText={handleCodeChange}
        className="mb-4 text-center"
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        maxLength={6}
        style={{
          fontSize: 24,
          letterSpacing: 8,
        }}
      />

      <Button
        onPress={handleVerify}
        loading={isSubmitting}
        className="mb-4"
      >
        Verify
      </Button>

      <View className="flex-row justify-center items-center gap-4">
        <TouchableOpacity onPress={handleResend} disabled={isResending}>
          <Text className="text-blue-500">
            {isResending ? 'Sending code...' : 'Resend code'}
          </Text>
        </TouchableOpacity>
        <Text className="text-gray-400">|</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/signin')}
          disabled={isSubmitting || isResending}
        >
          <Text className="text-blue-500">Back to sign in</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}