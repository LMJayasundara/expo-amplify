// app/(auth)/signin.tsx
import React from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useLoadingState } from '@/hooks/useLoadingState';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateEmail, validatePassword } from '@/utils/validation';
import { useFormField } from '@/hooks/useFormField';
import { useErrorBanner } from '@/hooks/useErrorBanner';

export default function SignIn() {
  const { value: email, onChange: setEmail } = useFormField('');
  const { value: password, onChange: setPassword } = useFormField('');
  const { login, resendCode } = useAuth();
  const router = useRouter();
  const { isLoading, withLoading } = useLoadingState();
  const { error, visible, showError, clearError } = useErrorBanner();

  const handleSignIn = async () => {
    if (!validateEmail(email)) {
      showError('Please enter a valid email');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showError(passwordError);
      return;
    }

    await withLoading(async () => {
      try {
        const { nextStep } = await login(email, password);

        switch (nextStep.signInStep) {
          case 'CONFIRM_SIGN_UP':
            await resendCode(email, 'signup');
            router.replace({
              pathname: '/(auth)/verify',
              params: { email: email.trim(), password }
            });
            break;
          // ... rest of the switch cases
        }
      } catch (error: any) {
        showError(error.message);
        Alert.alert('Sign In Failed', error.message);
      }
    });
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    clearError();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    clearError();
  };

  return (
    <AuthLayout error={error} showError={visible}>
      <Text className="text-2xl font-bold mb-6 text-center">Sign In</Text>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        className="mb-4"
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        className="mb-4"
      />

      <Button
        onPress={handleSignIn}
        loading={isLoading}
        className="mb-4"
      >
        Sign In
      </Button>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.replace('/(auth)/signup')}
      >
        <Text className="text-blue-500 text-center">Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-2"
        onPress={() => router.replace('/(auth)/reset')}
      >
        <Text className="text-blue-500 text-center">Forgot Password?</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}