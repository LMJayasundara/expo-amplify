// context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, resendSignUpCode, confirmResetPassword as amplifyConfirmResetPassword, resetPassword as amplifyResetPassword, fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// Add role to AuthContextType
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (username: string, email: string, password: string, role: string) => Promise<any>;
  confirmRegistration: (username: string, code: string) => Promise<any>;
  logout: () => Promise<void>;
  confirmResetPassword: (username: string, newPassword: string, confirmationCode: string) => Promise<any>;
  resendCode: (username: string, type: 'reset' | 'signup') => Promise<any>;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  role: null,
  login: async () => {},
  register: async () => {},
  confirmRegistration: async () => {},
  logout: async () => {},
  confirmResetPassword: async () => {},
  resendCode: async () => {},
});

const handleAuthError = (error: any, defaultCode: string, defaultMessage: string) => {
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
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          setIsAuthenticated(true);
          loadUserRole(); // load role after sign in
          break;
        case 'signedOut':
          setIsAuthenticated(false);
          setRole(null);
          break;
      }
    });
    return unsubscribe;
  }, []);

  async function checkUser() {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
      console.log('User authenticated, loading role...');
      await loadUserRole();
    } catch (err) {
      console.log('No authenticated user found');
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadUserRole() {
    try {
      const attributes = await fetchUserAttributes();
      console.log('All user attributes:', attributes);
      
      const userRole = attributes['custom:role'];
      console.log('Loaded user role from attributes:', userRole);
      
      if (!userRole) {
        console.log('No role found in attributes, defaulting to passenger');
        setRole('passenger');
        return;
      }
      
      setRole(userRole);
    } catch (error) {
      console.log('Error loading user role:', error);
      console.log('Setting default role: passenger');
      setRole('passenger');
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ 
        username: email,
        password: password
      });
      // Get the user attributes
      const attributes = await fetchUserAttributes();
      const userRole = attributes['custom:role'] || 'passenger';
      setRole(userRole);
      return { isSignedIn, nextStep, role: userRole };
    } catch (error: any) {
      throw handleAuthError(error, 'DefaultSignInError', 'An error occurred during login');
    }
  };

  const register = async (username: string, email: string, password: string, role: string) => {
    try {
      console.log('Registering user with role:', role);
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            preferred_username: username,
            'custom:role': role
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
      const result = await confirmSignUp({ username, confirmationCode: code });
      return result;
    } catch (error: any) {
      throw handleAuthError(error, 'DefaultConfirmError', 'An error occurred during verification');
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setRole(null);
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
      role,
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
