// app/(auth)/signup.tsx
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '@/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

export default function SignUpScreen() {
  const { isLoading, register } = useContext(AuthContext);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('passenger'); // Default role
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !username || !confirmPassword || !role) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const { nextStep } = await register(username, email, password, role);

      console.log("nextStep: ", nextStep);
      
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
          setError(`Unsupported sign-up step: ${nextStep.signUpStep}`);
          break;
      }
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Registration Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      >
        <View className="flex-1 justify-center p-6 bg-white">
          <Text className="text-2xl font-bold mb-6 text-center">Create Account</Text>

          {error ? <Text className="text-red-500 mb-4 text-center">{error}</Text> : null}

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            className="mb-4 p-4 border border-gray-300 rounded-lg w-full bg-white"
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="mb-4 p-4 border border-gray-300 rounded-lg w-full bg-white"
          />

          {/* Role Selection */}
          <View className="mb-4">
            <Text className="mb-2 font-semibold">Select Role:</Text>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue: string) => setRole(itemValue)}
            >
              <Picker.Item label="Passenger" value="passenger" />
              <Picker.Item label="Driver" value="driver" />
            </Picker>
          </View>

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="mb-4 p-4 border border-gray-300 rounded-lg w-full bg-white"
          />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="mb-6 p-4 border border-gray-300 rounded-lg w-full bg-white"
          />

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isSubmitting}
            className={`p-4 rounded-lg mb-4 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            {isSubmitting ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white text-center font-semibold ml-2">Creating account...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold">Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center gap-4">
            <Text className="text-gray-600">Already have an account?</Text>
            <Link href="/(auth)/signin" replace className="text-blue-500">
              Sign in
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
