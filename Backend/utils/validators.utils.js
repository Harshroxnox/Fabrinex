import { isValidPhoneNumber } from 'libphonenumber-js'

// This allows positive integer like 1, 2, 3, 4 ....... and so on
export const validID = (num) => {
  if (typeof num !== 'string' && typeof num !== 'number') {
    return null;
  }

  if (typeof num === 'string') {
    num = num.trim();

    // Only digits No decimals, no letters, no empty string, no whitespace
    if (!/^\d+$/.test(num)) {
      return null;
    }
  }

  num = Number(num);
  if (!Number.isInteger(num) || num <= 0) {
    return null;
  }

  return num;
}


// This allows whole numbers like 0, 1, 2, 3, 4 .............. and so on
export const validWholeNo = (num) => {
  if (typeof num !== 'string' && typeof num !== 'number') {
    return null;
  }

  if (typeof num === 'string') {
    num = num.trim();

    // Only digits No decimals, no letters, no empty string, no whitespace
    if (!/^\d+$/.test(num)) {
      return null;
    }
  }

  num = Number(num);
  if (!Number.isInteger(num) || num < 0) {
    return null;
  }

  return num;
}


// This allows even negative decimals like -1, -0.346 etc
// If there is a decimal digits should be there before and after (.5)(435.)(-.34) these get rejected  
// This also rounds the decimal to 2 decimal places. 
// Can be used for price, discount with external checks
export const validDecimal = (num) => {
  if (typeof num !== 'string' && typeof num !== 'number') {
    return null;
  }

  if (typeof num === 'string') {
    num = num.trim();

    // This can be negative, if it has a . then digits should be there before and after
    if (!/^-?\d+(\.\d+)?$/.test(num)) {
      return null
    }
  }

  num = Number(num);
  num = Math.round(num * 100) / 100;

  return num;
}


// Allows broader range of strings alphabets, numbers, space, . , ! ? ' " "" - : / ()
export const validReview = (str, minLen, maxLen) => {
  if (typeof str !== 'string'){
    return null;
  }

  str = str.trim();

  // Check for empty or too short/long
  if (str.length < minLen || str.length > maxLen){
    return null;
  }

  // Allow letters(any language), all numbers, spaces, sepecific punctuation and all emojis.
  if (!/^[\p{L}\p{N}\s.,!?'"“”\-:/()%₹\p{Emoji}]+$/u.test(str)){
    return null
  }
  return str;
}


// This can be used for size, promotion code
// Allow letters, numbers, spaces, and basic punctuation
export const validString = (str, minLen, maxLen) => {
  if (typeof str !== 'string') {
    return null;
  }

  str = str.trim();

  // Check for empty or too short/long
  if (str.length < minLen || str.length > maxLen) {
    return null;
  }

  // Allow letters, numbers, spaces, and basic punctuation
  if (!/^[a-zA-Z0-9\s\-_'".,/|()]+$/.test(str)){
    return null
  } 
  return str;
}


// This can be used for numbers that are strings like phone_no, whatsapp_no, pincode etc
export const validStringNum = (str, minLen, maxLen) => {
  if (typeof str !== 'string' && typeof str !== 'number') {
    return null;
  }

  if(typeof str === 'number'){
    str = String(str);
  }

  str = str.trim();

  // Check for empty or too short/long
  if (str.length < minLen || str.length > maxLen) {
    return null;
  }

  // Only digits No decimals, no letters, no empty string, no whitespace
  if (!/^\d+$/.test(str)) {
    return null;
  }
  return str;
}


// Allow letters (a-z, A-Z), spaces, hyphens, apostrophes
// Can be used for name, color
export const validStringChar = (str, minLen, maxLen) => {
  if (typeof str !== 'string') {
    return null;
  }

  str = str.trim();

  // Check for empty or too short/long
  if (str.length < minLen || str.length > maxLen) {
    return null;
  }

  // Allow letters (a-z, A-Z), spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(str)) {
    return null
  }
  return str;
}


export const validEmail = (str) => {
  if (typeof str !== "string") {
    return null;
  }
  str = str.trim();

  //check for empty or too short/long
  if (str.length < 6 || str.length > 100) {
    return null;
  }

  //basic regex for email validation
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //if it doesnot match the pattern ,it is invalid
  if (!regex.test(str)) {
    return null;
  }
  return str;
}


// validate passwords min 8 len, 1 lowercase, 1 uppercase, 1 digit and 1 special char
export const validPassword = (str) => {
  if (typeof str !== "string") {
    return null;
  }
  str = str.trim();

  //check for empty or too short/long
  if (str.length < 8 || str.length > 255) {
    return null;
  }

  // disallow spaces in between
  if (/\s/.test(str)) return null;

  //regex check
  const hasLowerCase = /[a-z]/.test(str);
  const hasUpperCase = /[A-Z]/.test(str);
  const hasDigit = /\d/.test(str);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(str);

  if (hasLowerCase && hasUpperCase && hasDigit && hasSpecialChar) {
    return str; //valid password
  }
  return null; //invalid password
}


export const validPhoneNumber = (str) => {
  if (typeof str !== "string") {
    return null;
  }

  str = str.trim();
  if(isValidPhoneNumber(str)){
    if(str.startsWith("+91")){
      return str;
    }
  }
  return null;
};


export const validBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    value = value.trim();
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return null; // Invalid boolean
};


export const validURL = (url) => {
  try {
    if(typeof url !== 'string'){
      return null;
    }
    url = url.trim();

    const parsed = new URL(url);
    if(parsed.protocol === "http:" || parsed.protocol === "https:"){
      return url;
    };

    return null;
  } catch (error) {
    return null;
  }
}


export const validDate = (str) => {
  if (typeof str !== "string") {
    return null;
  }
  str = str.trim();

  //basic regex for date validation
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  //if it doesnot match the pattern ,it is invalid
  if (!regex.test(str)) {
    return null;
  }
  return str;
}
