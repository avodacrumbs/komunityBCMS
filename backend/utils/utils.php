<?php

class SecurityUtils {
    /**
     * Decrypts data encrypted with AES-256-CBC.
     *
     * @param string $encryptedData The encrypted data (base64 encoded).
     * @param string $secretKey The base64 encoded secret key.
     * @return string|null The decrypted data, or null if decryption fails.
     */
    public static function decryptData($encryptedData, $secretKey) {
        $ivLength = 16; // IV length is 16 bytes
    
        // Split the encrypted data into IV and ciphertext
        $parts = explode(':', $encryptedData);
        if (count($parts) !== 2) {
            error_log("Invalid encrypted data format");
            return null;
        }
    
        $iv = base64_decode($parts[0]);
        $ciphertext = base64_decode($parts[1]);
    
        if ($iv === false || strlen($iv) !== $ivLength) {
            error_log("Invalid IV");
            return null;
        }
    
        // Decode secret key
        $secretKey = base64_decode($secretKey);
        if (strlen($secretKey) !== 32) {
            error_log("Secret key length is not 32 bytes after decoding.");
            return null;
        }
    
        // Perform the decryption
        $decrypted = openssl_decrypt($ciphertext, 'AES-256-CBC', $secretKey, OPENSSL_RAW_DATA, $iv);
        if ($decrypted === false) {
            error_log("Decryption failed: " . openssl_error_string());
            return null;
        }
    
        return $decrypted;
    }
    
    
}

?>

    




    




