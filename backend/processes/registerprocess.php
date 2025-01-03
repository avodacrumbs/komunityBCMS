<?php
require_once '../dao/crudDao.php';
require_once '../dao/config.php';

session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents('php://input'), true);

if ($data === null) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data.']);
    exit;
}

// Retrieve and sanitize input data
$completeName = filter_var($data['complete_name'], FILTER_SANITIZE_SPECIAL_CHARS);
$userName = filter_var($data['username'], FILTER_SANITIZE_SPECIAL_CHARS);
$contactNumber = filter_var($data['contact_number'], FILTER_SANITIZE_SPECIAL_CHARS);
$email = filter_var($data['email'], FILTER_SANITIZE_SPECIAL_CHARS);
$role = filter_var($data['role'], FILTER_SANITIZE_SPECIAL_CHARS);
$password = filter_var($data['password'], FILTER_SANITIZE_SPECIAL_CHARS);
$confirmPassword = filter_var($data['cpassword'], FILTER_SANITIZE_SPECIAL_CHARS);

function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function checkCname($completeName) {
    $regex2 = '/^[a-zA-Z\s]+$/';
    return preg_match($regex2, $completeName) ? $completeName : false;
}

function checkUname($userName) {
    $regex = '/^[a-zA-Z0-9]+$/';
    return preg_match($regex, $userName) ? $userName : false;
}

function checkPassword($password) {
    $regex5 = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{6,20}$/';
    return preg_match($regex5, $password) ? $password : false;
}

function checkContact($contactNumber) {
    $regex = '/^(09\d{9}|\+639\d{9}|0\d{2}\d{7}|\d{7})$/';
    return preg_match($regex, $contactNumber) ? $contactNumber : false;
}

// Validation
if ($checkCname = checkCname($completeName)) {
    if ($checkUname = checkUname($userName)) {
        if (is_valid_email($email)) {
            if ($checkContact = checkContact($contactNumber)) {
                if ($checkPassword = checkPassword($password)) {
                    if ($password == $confirmPassword) {
                        $user = new crudDao();
                        $checkInfo = $user->checkUsernameOrEmail($userName, $email);

                        if ($checkInfo) {
                            echo json_encode(['success' => false, 'message' => 'Username or Email has already been used.']);
                        } else {
                            // Register the user
                            $result = $user->registerUser($userName, $password, $email, $contactNumber, $role, $completeName);
                            if ($result) {
                                echo json_encode(['success' => true, 'message' => 'Registration successful']);
                            } else {
                                echo json_encode(['success' => false, 'message' => 'Registration failed.']);
                            }
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Passwords do not match!']);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Invalid password format!']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid contact number!']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid email format!']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username!']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid complete name!']);
}
?>
