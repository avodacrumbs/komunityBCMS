<?php
use PHPUnit\Framework\TestCase;

class LoginProcessTest extends TestCase
{
    protected function setUp(): void
    {

        // Custom error handler to log notices
        set_error_handler(function ($errno, $errstr, $errfile, $errline) {
            if ($errno === E_NOTICE || $errno === E_USER_NOTICE) {
                error_log("Notice: [$errno] $errstr in $errfile on line $errline\n", 3, __DIR__ . '/error_log.txt');
            }
            return true;
        });
        require_once __DIR__ . '/../../dao/crudDao.php';
        require_once __DIR__ . '/../../dao/config.php';

        $this->mockCrudDao = $this->getMockBuilder('crudDao')
                                  ->onlyMethods(['login', 'getPermissionsForRole'])
                                  ->getMock();

        $this->validEmail = 'test@example.com';
        $this->validPassword = 'password123';
        $this->invalidEmail = 'invalid@example.com';
        $this->invalidPassword = 'wrongpassword';

        putenv('REACT_APP_SECRET_KEY=E1FrJ8ZBfELRaR/DMjxtRlEtC/lou5swRoryBZ+YrH8=');
    }

    public function testLoginSuccess()
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_POST['data'] = $this->encryptData(json_encode([
            'email' => $this->validEmail,
            'password' => $this->validPassword,
        ]));

        $this->mockCrudDao->method('login')->willReturn([
            'id' => 1,
            'complete_name' => 'John Doe',
            'role_name' => 'User',
            'role_id' => 1
        ]);

        $this->mockCrudDao->method('getPermissionsForRole')->willReturn(['view_dashboard']);

        $GLOBALS['crudDao'] = $this->mockCrudDao;

        ob_start();
        require __DIR__ . '/../../processes/loginprocess.php';
        $response = ob_get_clean();

        $responseArray = json_decode($response, true);

        $this->assertNotNull($responseArray, 'Response is null');
        $this->assertTrue($responseArray['success']);
        $this->assertEquals('John Doe', $responseArray['complete_name']);
        $this->assertEquals('User', $responseArray['role_name']);
        $this->assertContains('view_dashboard', $responseArray['permissions']);
    }

    public function testLoginFailure()
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_POST['data'] = $this->encryptData(json_encode([
            'email' => $this->invalidEmail,
            'password' => $this->invalidPassword,
        ]));

        $this->mockCrudDao->method('login')->willReturn(null);

        $GLOBALS['crudDao'] = $this->mockCrudDao;

        ob_start();
        require __DIR__ . '/../../processes/loginprocess.php';
        $response = ob_get_clean();

        $responseArray = json_decode($response, true);

        $this->assertNotNull($responseArray, 'Response is null');
        $this->assertFalse($responseArray['success']);
        $this->assertEquals('Incorrect email or password.', $responseArray['message']);
    }

    private function encryptData($data)
    {
        $secretKey = 'E1FrJ8ZBfELRaR/DMjxtRlEtC/lou5swRoryBZ+YrH8=';
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt($data, 'AES-256-CBC', base64_decode($secretKey), OPENSSL_RAW_DATA, $iv);
        if ($encrypted === false) {
            $this->fail('Encryption failed: ' . openssl_error_string());
        }
        
        // Base64 encode IV and ciphertext separately, then concatenate with a colon
        return base64_encode($iv) . ':' . base64_encode($encrypted);
    }

    public function testInvalidJson()
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_POST['data'] = $this->encryptData('{"email": "test@example.com", "password": "password123", "extra": "field"}'); // JSON with extra field

        // Mock CRUD methods
        $this->mockCrudDao->method('login')->willReturn([
            'id' => 1,
            'complete_name' => 'John Doe',
            'role_name' => 'User',
            'role_id' => 1
        ]);
        $this->mockCrudDao->method('getPermissionsForRole')->willReturn(['view_dashboard']);

        $GLOBALS['crudDao'] = $this->mockCrudDao;

        ob_start();
        require __DIR__ . '/../../processes/loginprocess.php';
        $response = ob_get_clean();

        $responseArray = json_decode($response, true);

        // Ensure the response is as expected, including handling of the extra field
        $this->assertNotNull($responseArray, 'Response is null');
        $this->assertTrue($responseArray['success']);
        $this->assertEquals('John Doe', $responseArray['complete_name']);
        $this->assertEquals('User', $responseArray['role_name']);
        $this->assertContains('view_dashboard', $responseArray['permissions']);
    }


    public function testSessionHandling()
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_POST['data'] = $this->encryptData(json_encode([
            'email' => $this->validEmail,
            'password' => $this->validPassword,
        ]));

        $this->mockCrudDao->method('login')->willReturn([
            'id' => 1,
            'complete_name' => 'John Doe',
            'role_name' => 'User',
            'role_id' => 1
        ]);

        $this->mockCrudDao->method('getPermissionsForRole')->willReturn(['view_dashboard']);

        $GLOBALS['crudDao'] = $this->mockCrudDao;

        ob_start();
        require __DIR__ . '/../../processes/loginprocess.php';
        ob_get_clean();

        $this->assertArrayHasKey('user', $_SESSION);
        $this->assertEquals('John Doe', $_SESSION['user']['complete_name']);
        $this->assertEquals('User', $_SESSION['user']['role']);
        $this->assertContains('view_dashboard', $_SESSION['user']['permissions']);
    }

}
?>