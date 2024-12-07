import { useState, useCallback } from 'react';

export function useErrorBanner() {
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const showError = useCallback((message: string) => {
    setError(message);
    setVisible(true);
  }, []);

  const clearError = useCallback(() => {
    setVisible(false);
    setError(null);
  }, []);

  return {
    error,
    visible,
    showError,
    clearError
  };
} 