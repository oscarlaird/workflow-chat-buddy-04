
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export const validateInput = (value: any, type: string): ValidationResult => {
  // Default to valid if no validation is implemented for the type
  const defaultResult: ValidationResult = { isValid: true };

  switch (type) {
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'url':
      return validateUrl(value);
    case 'currency':
      return validateCurrency(value);
    case 'percentage':
      return validatePercentage(value);
    case 'zip_code':
      return validateZipCode(value);
    case 'year':
      return validateYear(value);
    case 'integer':
      return validateInteger(value);
    case 'number':
      return validateNumber(value);
    default:
      return defaultResult;
  }
};

const validateEmail = (value: string): ValidationResult => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return {
    isValid: emailRegex.test(String(value).toLowerCase()),
    message: 'Please enter a valid email address'
  };
};

const validatePhone = (value: string): ValidationResult => {
  // Simple phone validation - can be enhanced based on requirements
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  return {
    isValid: phoneRegex.test(String(value)),
    message: 'Please enter a valid phone number'
  };
};

const validateUrl = (value: string): ValidationResult => {
  try {
    // Using URL constructor for validation
    new URL(String(value));
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      message: 'Please enter a valid URL (include http:// or https://)'
    };
  }
};

const validateCurrency = (value: any): ValidationResult => {
  // Allow numbers with up to 2 decimal places and optional commas
  const currencyRegex = /^-?\d+(\,\d{3})*(\.\d{1,2})?$/;
  const stringValue = String(value).replace(/\$\s?|(,*)/g, '');
  return {
    isValid: currencyRegex.test(stringValue) || /^-?\d+(\.\d{1,2})?$/.test(stringValue),
    message: 'Please enter a valid currency amount'
  };
};

const validatePercentage = (value: any): ValidationResult => {
  // Allow numbers between 0 and 100 with up to 2 decimal places
  const numValue = parseFloat(String(value).replace('%', ''));
  return {
    isValid: !isNaN(numValue) && numValue >= 0 && numValue <= 100,
    message: 'Please enter a percentage between 0 and 100'
  };
};

const validateZipCode = (value: string): ValidationResult => {
  // US ZIP code validation - 5 digits or 5+4
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return {
    isValid: zipRegex.test(String(value)),
    message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
  };
};

const validateYear = (value: any): ValidationResult => {
  const year = parseInt(String(value));
  const currentYear = new Date().getFullYear();
  return {
    isValid: !isNaN(year) && year > 1900 && year <= currentYear + 100,
    message: `Please enter a valid year between 1900 and ${currentYear + 100}`
  };
};

const validateInteger = (value: any): ValidationResult => {
  return {
    isValid: Number.isInteger(Number(value)),
    message: 'Please enter a valid integer'
  };
};

const validateNumber = (value: any): ValidationResult => {
  return {
    isValid: !isNaN(Number(value)),
    message: 'Please enter a valid number'
  };
};
