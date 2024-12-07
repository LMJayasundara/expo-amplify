import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Platform } from 'react-native';
import { Picker as RNPicker } from '@react-native-picker/picker';

interface PickerOption {
  label: string;
  value: string;
}

interface CustomPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  className?: string;
}

export function Picker({ 
  value, 
  onValueChange, 
  options,
  placeholder = 'Select an option',
  className = ''
}: CustomPickerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  // For iOS: Modal with picker
  const IOSPicker = () => (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className={`p-4 border border-gray-300 rounded-lg bg-white flex-row justify-between items-center ${className}`}
      >
        <Text className={`text-base ${value ? 'text-black' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text className="text-blue-500">▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-50">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text className="text-blue-500 text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setIsModalVisible(false);
                }}
              >
                <Text className="text-blue-500 font-semibold text-base">Done</Text>
              </TouchableOpacity>
            </View>

            <RNPicker
              selectedValue={value}
              onValueChange={(itemValue) => {
                onValueChange(itemValue);
              }}
            >
              {options.map((option) => (
                <RNPicker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </RNPicker>
          </View>
        </View>
      </Modal>
    </>
  );

  // For Android: Styled native picker
  const AndroidPicker = () => (
    <View className={`border border-gray-300 rounded-lg bg-white overflow-hidden ${className}`}>
      <RNPicker
        selectedValue={value}
        onValueChange={onValueChange}
        mode="dropdown"
        dropdownIconColor="#6B7280"
        style={{ height: 55, width: '100%' }}
      >
        {options.map((option) => (
          <RNPicker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </RNPicker>
    </View>
  );

  return Platform.OS === 'ios' ? <IOSPicker /> : <AndroidPicker />;
} 