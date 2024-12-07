import { useState, useCallback } from 'react';

export function useFormField(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  const onChange = useCallback((text: string) => {
    setValue(text);
    if (error) setError(''); // Clear error when user starts typing
  }, [error]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    value,
    error,
    onChange,
    setError,
    clearError,
  };
} 