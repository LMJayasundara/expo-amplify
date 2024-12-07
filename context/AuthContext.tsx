// context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { type SignUpInput, signIn, signUp, signOut, getCurrentUser, confirmSignUp, resendSignUpCode, confirmResetPassword as amplifyConfirmResetPassword, resetPassword as amplifyResetPassword } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

type AuthError = {
  code?: string;
  message: string;
  originalError?: any;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (username: string, email: string, password: string) => Promise<any>;
  confirmRegistration: (username: string, code: string) => Promise<any>;
  logout: () => Promise<void>;
  confirmResetPassword: (username: string, newPassword: string, confirmationCode: string) => Promise<any>;
  resendCode: (username: string, type: 'reset' | 'signup') => Promise<any>;
};

export const AuthContext = createContext<AuthContextType>( {
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  confirmRegistration: async () => {},
  logout: async () => {},
  confirmResetPassword: async () => {},
  resendCode: async () => {},
});

// Helper function for error handling
const handleAuthError = (error: any, defaultCode: string, defaultMessage: string): AuthError => {
  console.log(`${defaultMessage} error: `, {
    code: error.name,
    message: error.message,
    error
  });
  return {
    code: error.code || defaultCode,
    message: error.message || defaultMessage
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          setIsAuthenticated(true);
          break;
        case 'signedOut':
          setIsAuthenticated(false);
          break;
      }
    });
    return unsubscribe;
  }, []);

  async function checkUser() {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ 
        username: email,
        password: password
      });
      return { isSignedIn, nextStep };
    } catch (error: any) {
      throw handleAuthError(error, 'DefaultSignInError', 'An error occurred during login');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            preferred_username: username
          }
        }
      });
      return { nextStep };
    } catch (error: any) {
      throw handleAuthError(error, 'DefaultSignUpError', 'An error occurred during registration');
    }
  };

  const confirmRegistration = async (username: string, code: string) => {
    try {
      const result = await confirmSignUp({
        username,
        confirmationCode: code
      });
      return result;
    } catch (error: any) {
      throw handleAuthError(error, 'DefaultConfirmError', 'An error occurred during verification');
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      throw handleAuthError(error, 'DefaultSignOutError', 'An error occurred during logout');
    }
  };

  const confirmResetPassword = async (username: string, newPassword: string, confirmationCode: string) => {
    try {
      await amplifyConfirmResetPassword({ username, newPassword, confirmationCode });
    } catch (error: any) {
      throw handleAuthError(error, 'DefaultConfirmResetPasswordError', 'An error occurred during password reset confirmation');
    }
  };

  const resendCode = async (username: string, type: 'reset' | 'signup') => {
    try {
      if (type === 'reset') {
        return await amplifyResetPassword({ username });
      } else {
        return await resendSignUpCode({ username });
      }
    } catch (error: any) {
      throw handleAuthError(error, 'DefaultResendCodeError', 'An error occurred while resending the code');
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      register,
      confirmRegistration,
      logout,
      confirmResetPassword,
      resendCode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}