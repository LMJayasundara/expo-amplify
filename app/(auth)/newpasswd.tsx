// app/(auth)/newpasswd.tsx
import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validatePassword, validateCode } from '@/utils/validation';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useFormField } from '@/hooks/useFormField';
import { useErrorBanner } from '@/hooks/useErrorBanner';

export default function NewPasswordScreen() {
  const { confirmResetPassword, resendCode } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const [email] = useState(params.email);
  const { value: code, onChange: setCode } = useFormField('');
  const { value: newPassword, onChange: setNewPassword } = useFormField('');
  const { value: confirmPassword, onChange: setConfirmPassword } = useFormField('');
  const { isLoading: isSubmitting, withLoading: withSubmitting } = useLoadingState();
  const { isLoading: isResending, withLoading: withResending } = useLoadingState();
  const { error, visible, showError, clearError } = useErrorBanner();

  const handleResend = async () => {
    await withResending(async () => {
      try {
        await resendCode(email, 'reset');
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

  const handleSubmit = async () => {
    const codeValidationError = validateCode(code);
    if (codeValidationError) {
      showError(codeValidationError);
      return;
    }

    if (!newPassword || !confirmPassword) {
      showError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showError(passwordError);
      return;
    }

    await withSubmitting(async () => {
      try {
        await confirmResetPassword(email, newPassword, code);
        Alert.alert(
          'Success',
          'Password has been reset successfully',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/signin')
            }
          ]
        );
      } catch (err: any) {
        showError(err.message);
        Alert.alert('Reset Failed', err.message);
      }
    });
  };

  const handleInputChange = (setter: (text: string) => void) => (text: string) => {
    setter(text);
    clearError();
  };

  return (
    <AuthLayout error={error} showError={visible}>
      <Text className="text-2xl font-bold mb-6 text-center">Reset Password</Text>

      <Text className="text-center mb-4 text-gray-600">
        Enter the verification code sent to your email
      </Text>

      <Input
        placeholder="000000"
        value={code}
        onChangeText={handleInputChange(setCode)}
        className="mb-4 text-center"
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        maxLength={6}
        style={{
          fontSize: 24,
          letterSpacing: 8,
        }}
      />

      <Input
        placeholder="New Password"
        value={newPassword}
        onChangeText={handleInputChange(setNewPassword)}
        secureTextEntry
        className="mb-4"
      />

      <Input
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={handleInputChange(setConfirmPassword)}
        secureTextEntry
        className="mb-4"
      />

      <Button
        onPress={handleSubmit}
        loading={isSubmitting}
        className="mb-4"
      >
        Reset Password
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