<?php
require_once '../dao/crudDao.php'; // Include your CRUD Data Access Object

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

$dao = new crudDao();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'];
    $newPassword = $_POST['newPassword'];

    $regex5 = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{6,20}$/';

    // Validate password against regex
    if (!preg_match($regex5, $newPassword)) {
        echo json_encode(['success' => false, 'message' => 'Password must be 6-20 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.']);
        exit; // Exit after showing error message
    }

    // Find token in the database
    $reset = $dao->findToken($token);
    if ($reset && $reset['expires'] >= date("U")) {
        // Token is valid, reset the password
        $email = $reset['email'];
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        if ($dao->updatePassword($email, $hashedPassword)) {
            // Delete the reset token after password reset
            $dao->deleteToken($email);

            echo json_encode(['success' => true, 'message' => 'Password has been reset.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to reset password.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token.']);
    }
}
?>
