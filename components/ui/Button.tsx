import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  children: React.ReactNode;
}

export function Button({ 
  onPress, 
  disabled, 
  loading, 
  variant = 'primary', 
  className = '',
  children 
}: ButtonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`p-4 rounded-lg ${getVariantClass()} ${disabled ? 'opacity-70' : ''} ${className}`}
    >
      {loading ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator color="white" size="small" />
          <Text className="text-white text-center font-semibold ml-2">Loading...</Text>
        </View>
      ) : (
        <Text className="text-white text-center font-semibold">{children}</Text>
      )}
    </TouchableOpacity>
  );
} 