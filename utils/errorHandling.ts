export const handleAuthError = (error: any, defaultCode: string, defaultMessage: string) => {
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