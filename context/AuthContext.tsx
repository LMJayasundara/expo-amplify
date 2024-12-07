// context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { type SignUpInput, signIn, signUp, signOut, getCurrentUser, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
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
  resendConfirmationCode: (username: string) => Promise<any>;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  confirmRegistration: async () => {},
  logout: async () => {},
  resendConfirmationCode: async () => {},
});

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
        username: "s.s.shancoin@gmail.com",
        password: "ShaN@19960930"
      });
      return { isSignedIn, nextStep };
    } catch (error: any) {
      console.log("Login error: ", {
        code: error.name,
        message: error.message,
        error
      });
      
      const authError: AuthError = {
        code: error.name || 'DefaultSignInError',
        message: error.message || 'An error occurred during login'
      };

      throw authError;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            preferred_username: username
          }
        }
      });
      return result;
    } catch (error: any) {
      console.log("SignUp error: ", {
        code: error.name,
        message: error.message,
        error
      });

      const authError: AuthError = {
        code: error.code || 'DefaultSignUpError',
        message: error.message || 'An error occurred during registration'
      };

      throw authError;
    }
  };

  const confirmRegistration = async (username: string, code: string) => {
    try {
      console.log('Confirming registration for:', username); // Debug log
      const result = await confirmSignUp({
        username,
        confirmationCode: code
      });
      return result;
    } catch (error: any) {
      console.log("Confirm error: ", {
        code: error.name,
        message: error.message,
        error
      });

      const authError: AuthError = {
        code: error.code || 'DefaultConfirmError',
        message: error.message || 'An error occurred during verification'
      };

      throw authError;
    }
  };

  const resendConfirmationCode = async (username: string) => {
    try {
      const result = await resendSignUpCode({
        username
      });
      return result;

      // const { destination, deliveryMedium } = await resendSignUpCode({
      //   username: email,
      // });
      // console.log(`A confirmation code has been sent to ${destination}.`);
      // console.log(`Please check your ${deliveryMedium} for the code.`);
    } catch (error: any) {
      console.log("Resend code error: ", {
        code: error.name,
        message: error.message,
        error
      });
  
      const authError: AuthError = {
        code: error.code || 'DefaultResendCodeError',
        message: error.message || 'An error occurred while resending the code'
      };
  
      throw authError;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      console.log("SignOut error: ", {
        code: error.name,
        message: error.message,
        error
      });

      const authError: AuthError = {
        code: error.code || 'DefaultSignOutError',
        message: error.message || 'An error occurred during logout'
      };

      throw authError;
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
      resendConfirmationCode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}