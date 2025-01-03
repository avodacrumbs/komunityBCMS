import CryptoJS from "crypto-js";

const encryptData = (data, secretKey) => {
    const key = CryptoJS.enc.Base64.parse(secretKey); // Decode base64 secret key
    const iv = CryptoJS.lib.WordArray.random(16); // Generate a random 16-byte IV
  
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
  
    // Combine the Base64-encoded IV and the encrypted data with a delimiter (e.g., ':')
    return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
  };
  
export default encryptData

// import CryptoJS from 'crypto-js';

// // Encryption function
// const encryptData = (data, secretKey) => {
//   const key = CryptoJS.enc.Base64.parse(secretKey); // Decode base64 secret key
//   const iv = CryptoJS.lib.WordArray.random(16); // Generate a random 16-byte IV

//   const encrypted = CryptoJS.AES.encrypt(data, key, {
//     iv: iv,
//     mode: CryptoJS.mode.CBC,
//     padding: CryptoJS.pad.Pkcs7,
//   });

//   // Combine the Base64-encoded IV and the encrypted data into a single string
//   return iv.toString(CryptoJS.enc.Base64) + encrypted.toString();
// };

// export default encryptData;
