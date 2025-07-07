
// This allows positive integer like 1, 2, 3, 4 ....... and so on
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


// This allows whole numbers like 0, 1, 2, 3, 4 .............. and so on
export const validWholeNo = (num) => {
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
  if(typeof num !== 'string' && typeof num !== 'number'){
    return null;
  }

  if(typeof num === 'string'){
    num = num.trim();

    // This can be negative, if it has a . then digits should be there before and after
    if(!/^-?\d+(\.\d+)?$/.test(num)){
      return null
    }
  }

  num = Number(num);
  num = Math.round(num * 100) / 100;

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
