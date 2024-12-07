// app/(auth)/signin.tsx
import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, resendConfirmationCode } = useContext(AuthContext);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setError('');
      const { isSignedIn, nextStep } = await login(email, password);
      console.log("nextStep: ", isSignedIn, nextStep);

      // Handle different next steps
      switch (nextStep.signInStep) {
        case 'CONFIRM_SIGN_UP':
          // User needs to verify their email
          // console.log('Redirecting to verify with:', { email, password }); // Debug log          
          await resendConfirmationCode(email);
          router.replace({
            pathname: '/(auth)/verify',
            params: {
              email: email.trim(), // Ensure clean email
              password: password
            }
          });
          break;

        case 'RESET_PASSWORD':
          router.replace({
            pathname: '/(auth)/reset',
            params: { email }
          });
          break;

        // case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
        //   router.replace({
        //     pathname: '/(auth)/new-password',
        //     params: { email }
        //   });
        //   break;

        // case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
        // case 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE':
        // case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
        //   router.replace({
        //     pathname: '/(auth)/verify-mfa',
        //     params: { 
        //       email,
        //       type: nextStep.signInStep
        //     }
        //   });
        //   break;

        // case 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION':
        //   router.replace({
        //     pathname: '/(auth)/mfa-selection',
        //     params: { 
        //       email,
        //       options: JSON.stringify(nextStep.allowedMFATypes)
        //     }
        //   });
        //   break;

        case 'DONE':
          // Navigation is handled by RootNavigation in _layout.tsx
          break;

        default:
          setError(`Unsupported sign-in step: ${nextStep.signInStep}`);
          break;
      }
    } catch (error: any) {
      setError(error.message);
      Alert.alert('Sign In Failed', error.message, [
        {
          text: 'OK'
        }
      ]);
    }
  };

  return (
    <View className="flex-1 justify-center px-4">
      {error ? (
        <Text className="text-red-500 text-center mb-4">{error}</Text>
      ) : null}

      <TextInput
        className="border p-2 rounded-lg mb-4"
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setError('');
          setEmail(text);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="border p-2 rounded-lg mb-4"
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setError('');
          setPassword(text);
        }}
        secureTextEntry
      />
      <TouchableOpacity
        className="bg-blue-500 p-3 rounded-lg"
        onPress={handleSignIn}
      >
        <Text className="text-white text-center font-semibold">Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push('/(auth)/signup')}
      >
        <Text className="text-blue-500 text-center">Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-2"
        onPress={() => router.push('/(auth)/reset')}
      >
        <Text className="text-blue-500 text-center">Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}