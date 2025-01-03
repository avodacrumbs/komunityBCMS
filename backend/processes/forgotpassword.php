<?php

header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow all origins or specify 'http://localhost:3000'
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Respond with a 200 status code for preflight requests
    exit;
}

require_once '../dao/crudDao.php';
require_once '../utils/utils.php'; // Include your SecurityUtils class
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Include PHPMailer
require '../vendor/autoload.php';

$crudDao = new crudDao();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $encryptedData = $_POST['data'] ?? null;

    if (!$encryptedData) {
        echo json_encode(['success' => false, 'message' => 'No data received.']);
        exit;
    }

    $secretKey = getenv('REACT_APP_SECRET_KEY') ?: 'E1FrJ8ZBfELRaR/DMjxtRlEtC/lou5swRoryBZ+YrH8=';
    $decryptedData = SecurityUtils::decryptData($encryptedData, $secretKey);

    if (!$decryptedData) {
        echo json_encode(['success' => false, 'message' => 'Decryption error.']);
        exit;
    }

    $credentials = json_decode($decryptedData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON format.']);
        exit;
    }

    $email = $credentials['recoveryInput'] ?? '';

    // Log decrypted email for debugging
    error_log("Decrypted email: " . $email);

    // Check if user exists
    $user = $crudDao->findUserByEmail($email);
    if ($user) {
        // Log if user was found
        error_log("User found: " . json_encode($user));

        // Generate token and proceed
        $token = random_int(100000, 999999);  // Generates a random 6-digit number
        $expires = time() + 1800; // 30 minutes from now

        // Convert it to the MySQL DATETIME format
        $expires = date("Y-m-d H:i:s", $expires);

        if ($crudDao->insertResetToken($email, $token, $expires)) {
            $resetLink = "http://localhost/backend/processes/resetpassword.php?token=" . $token;
            $subject = "Password Reset Code";
            $message = "Your password reset code is: " . $token;

            // Create PHPMailer instance
            $mail = new PHPMailer(true);

            try {
                // SMTP configuration
                $mail->isSMTP();                                            // Set mailer to use SMTP
                $mail->Host = 'smtp.gmail.com';                              // Set the SMTP server to send through (for Gmail)
                $mail->SMTPAuth = true;                                       // Enable SMTP authentication
                $mail->Username = 'villamorloryn04@gmail.com';               // SMTP username
                $mail->Password = 'rtsn jjnq zjcr icyg';                         // SMTP password or app password if 2FA is enabled
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;          // Enable TLS encryption
                $mail->Port = 587;                                           // TCP port to connect to (587 is for TLS)

                // Debugging output
                $mail->SMTPDebug = 2; // Enable detailed debug output
                $mail->Debugoutput = 'error_log'; // Log output to PHP error log

                // Recipients
                $mail->setFrom('villamorloryn04@gmail.com', 'komUNITY');
                $mail->addAddress($email);  // Add recipient email

                // Content
                $mail->isHTML(true);                                           // Set email format to HTML
                $mail->Subject = $subject;
                $mail->Body    = nl2br($message);

                // Send email
                $mail->send();
                error_log("Password reset code sent to: " . $email);
                echo json_encode(['success' => true, 'message' => 'Password reset code sent to your email.']);
            } catch (Exception $e) {
                // Log detailed error
                error_log("Mailer Error: " . $mail->ErrorInfo);
                echo json_encode(['success' => false, 'message' => 'Failed to send reset email.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to generate reset token.']);
        }
    } else {
        // Log if email not found
        error_log("Email not found: " . $email);
        echo json_encode(['success' => false, 'message' => 'Email not found.']);
    }
}
?>