
export const validID = (num) => {
  if(typeof num !== 'string' && typeof num !== 'number'){
    return null;
  }

  if(typeof num === 'string'){
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


// This can be used for size, review, promotion code
// Allow letters, numbers, spaces, and basic punctuation
export const validString = (str, minLen, maxLen) => {
  if (typeof str !== 'string'){
    return null;
  }

  str = str.trim();

  // Check for empty or too short/long
  if (str.length < minLen || str.length > maxLen){
    return null;
  }

  // Reject strings with HTML tags
  if (/<[^>]*>/.test(str)){
    return null
  }

  // Allow letters, numbers, spaces, and basic punctuation
  if (!/^[a-zA-Z0-9\s\-_'.,()]+$/.test(str)){
    return null
  }
  return str;
}


// This can be used for numbers that are strings like phone_no, whatsapp_no, pincode etc
export const validStringNum = (str, minLen, maxLen) => {
  if (typeof str !== 'string'){
    return null;
  }

  str = str.trim();

  // Check for empty or too short/long
  if (str.length < minLen || str.length > maxLen){
    return null;
  }

  // Reject strings with HTML tags
  if (/<[^>]*>/.test(str)){
    return null
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
  if (typeof str !== 'string'){
    return null;
  }

  str = str.trim();

  // Check for empty or too short/long
  if (str.length < minLen || str.length > maxLen){
    return null;
  }

  // Reject strings with HTML tags
  if (/<[^>]*>/.test(str)){
    return null
  }

  // Allow letters (a-z, A-Z), spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(str)){
    return null
  }
  return str;
}
