// app/(auth)/signup.tsx
import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useLoadingState } from '@/hooks/useLoadingState';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateEmail, validatePassword } from '@/utils/validation';
import { Picker } from '@/components/ui/Picker';
import { useFormField } from '@/hooks/useFormField';
import { useErrorBanner } from '@/hooks/useErrorBanner';

export default function SignUpScreen() {
  const { value: username, onChange: setUsername } = useFormField('');
  const { value: email, onChange: setEmail } = useFormField('');
  const { value: password, onChange: setPassword } = useFormField('');
  const { value: confirmPassword, onChange: setConfirmPassword } = useFormField('');
  const [role, setRole] = useState('passenger');
  const { register } = useAuth();
  const router = useRouter();
  const { isLoading, withLoading } = useLoadingState();
  const { error, visible, showError, clearError } = useErrorBanner();

  const handleSignUp = async () => {
    if (!email || !password || !username || !confirmPassword || !role) {
      showError('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      showError('Please enter a valid email');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showError(passwordError);
      return;
    }

    await withLoading(async () => {
      try {
        const { nextStep } = await register(username, email, password, role);
        
        switch (nextStep.signUpStep) {
          case 'CONFIRM_SIGN_UP':
            Alert.alert('Verification Required', 'Check your email for a code', [
              {
                text: 'OK',
                onPress: () => {
                  router.replace({
                    pathname: '/(auth)/verify',
                    params: { email, password }
                  });
                }
              }
            ]);
            break;
          case 'DONE':
            // Handled by root navigation
            break;
          default:
            showError(`Unsupported sign-up step: ${nextStep.signUpStep}`);
            break;
        }
      } catch (err: any) {
        showError(err.message);
        Alert.alert('Registration Failed', err.message);
      }
    });
  };

  const handleInputChange = (setter: (text: string) => void) => (text: string) => {
    setter(text);
    clearError();
  };

  const roleOptions = [
    { label: 'Passenger', value: 'passenger' },
    { label: 'Driver', value: 'driver' }
  ];

  return (
    <AuthLayout error={error} showError={visible}>
      <Text className="text-2xl font-bold mb-6 text-center">Create Account</Text>

      <Input
        placeholder="Username"
        value={username}
        onChangeText={handleInputChange(setUsername)}
        className="mb-4"
      />

      <Input
        placeholder="Email"
        value={email}
        onChangeText={handleInputChange(setEmail)}
        keyboardType="email-address"
        autoCapitalize="none"
        className="mb-4"
      />

      <View className="mb-4">
        <Text className="mb-2 font-semibold">Select Role:</Text>
        <Picker
          value={role}
          onValueChange={(value) => {
            setRole(value);
            clearError();
          }}
          options={roleOptions}
          placeholder="Select a role"
        />
      </View>

      <Input
        placeholder="Password"
        value={password}
        onChangeText={handleInputChange(setPassword)}
        secureTextEntry
        className="mb-4"
      />

      <Input
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={handleInputChange(setConfirmPassword)}
        secureTextEntry
        className="mb-6"
      />

      <Button
        onPress={handleSignUp}
        loading={isLoading}
        className="mb-4"
      >
        Sign Up
      </Button>

      <View className="flex-row justify-center items-center gap-4">
        <Text className="text-gray-600">Already have an account?</Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/signin')}>
          <Text className="text-blue-500">Sign in</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}
