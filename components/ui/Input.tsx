import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <TextInput
      className={`p-4 border border-gray-300 rounded-lg w-full bg-white ${className}`}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
} 