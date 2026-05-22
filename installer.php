<?php
/**
 * oddtranslator Installer - Secure Backend Logic
 */

// oddt\installer.php

// 1. Immediate Hard Lock Check (Prevents any execution if already installed)
if (file_exists(__DIR__ . '/.installed')) {
    header('HTTP/1.1 403 Forbidden');
    header('Content-Type: text/plain');
    die("Error: Security restriction. Setup wizard has been terminated.");
}

// Prevent server timeouts during long table operations
set_time_limit(300);
ini_set('max_execution_time', 300);
ini_set('memory_limit', '256M');

require_once __DIR__ . '/boot.php';

// Start a session if it hasn't been started yet for CSRF protection
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ====================== AJAX HANDLERS ======================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');

    // 2. CSRF Security Token Validation
    $userToken = $_POST['install_token'] ?? '';
    if (empty($userToken) || !hash_equals($_SESSION['install_token'] ?? '', $userToken)) {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode(['status' => 'error', 'message' => 'Security token invalid. Re-auth requested.']);
        exit;
    }

    $action = $_POST['action'] ?? '';

    // Test Database (Strict existence verification)
    if ($action === 'test_db') {
        try {
            $db_host = trim($_POST['db_host'] ?? '');
            $db_user = trim($_POST['db_user'] ?? '');
            $db_pass = $_POST['db_pass'] ?? '';
            $db_name = trim($_POST['db_name'] ?? '');

            if (empty($db_name)) {
                echo json_encode(['status' => 'error', 'message' => 'Database name is required.']);
                exit;
            }

            // Connect strictly to server instance without pre-selecting any DB 
            $dsn = "mysql:host=$db_host;charset=utf8mb4";
            $pdo = new PDO($dsn, $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);

            // Query information schema directly to confirm real presence (Fixes false positives)
            $stmt = $pdo->prepare("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?");
            $stmt->execute([$db_name]);
            
            if (!$stmt->fetch()) {
                echo json_encode(['status' => 'error', 'message' => 'Database not found. Please create it first.']);
                exit;
            }

            echo json_encode(['status' => 'success', 'message' => 'Database connection successful!']);
            exit;

        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    // Final Installation Routine
    if ($action === 'install') {
        try {
            $db_host = trim($_POST['db_host'] ?? '');
            $db_user = trim($_POST['db_user'] ?? '');
            $db_pass = $_POST['db_pass'] ?? '';
            $db_name = trim($_POST['db_name'] ?? '');
            $admin_email = trim($_POST['admin_email'] ?? '');
            $admin_pass = $_POST['admin_pass'] ?? '';

            if (empty($db_name) || empty($admin_email) || empty($admin_pass)) {
                echo json_encode(['status' => 'error', 'message' => 'All structural fields are required.']);
                exit;
            }

            // 3. Dynamic absolute Base URL compilation
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
            $host = $_SERVER['HTTP_HOST'];
            $scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
            $detectedBaseUrl = $protocol . $host . $scriptDir;

            // 4. Secure Config Injection Mitigation using var_export()
            $configContent = "<?php\n" .
                "define('DB_HOST', " . var_export($db_host, true) . ");\n" .
                "define('DB_USER', " . var_export($db_user, true) . ");\n" .
                "define('DB_PASS', " . var_export($db_pass, true) . ");\n" .
                "define('DB_NAME', " . var_export($db_name, true) . ");\n" .
                "define('ODDT_SALT', " . var_export(bin2hex(random_bytes(32)), true) . ");\n" .
                "define('ODDT_BASE_URL', " . var_export($detectedBaseUrl, true) . ");\n";

            $written = file_put_contents(__DIR__ . '/config.php', $configContent);
            if ($written === false) {
                throw new Exception('Unable to write config.php. Please verify file permissions.');
            }

            require_once __DIR__ . '/config.php';

            $db = DatabaseConnection::getInstance();
            $pdo = $db->getPdo();

            $pdo->exec("CREATE TABLE IF NOT EXISTS `oddt_settings` (`key` VARCHAR(50) PRIMARY KEY, `value` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
            $pdo->exec("CREATE TABLE IF NOT EXISTS `oddt_cache` (`hash` CHAR(32) NOT NULL, `target_lang` VARCHAR(10) NOT NULL, `source_text` TEXT NOT NULL, `translated_text` TEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`hash`, `target_lang`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $db->setSetting('active_provider', 'mymemory');
            $db->setSetting('btn_type', 'floating');
            $db->setSetting('btn_position', 'bottom-right');
            $db->setSetting('skip_selectors', '.oddt-skip,[data-oddt-skip],.price,.no-translate');

            $hashed = password_hash($admin_pass, PASSWORD_DEFAULT);
            $db->setSetting('admin_email', $admin_email);
            $db->setSetting('admin_password', $hashed);

            // Create lock file at the absolute successful end
            file_put_contents(__DIR__ . '/.installed', date('Y-m-d H:i:s'));
            
            $session = new OddtSession();
            $session->login($admin_email);

            if (ob_get_length()) ob_end_clean();

            // 5. Self-Destruct / Secure File Renaming Routine
            @rename(__DIR__ . '/installer-form.php', __DIR__ . '/installer-form.bak.php');
            @rename(__DIR__ . '/installer.js', __DIR__ . '/installer.bak.js');
            // Rename core file last to prevent immediate thread termination
            @rename(__DIR__ . '/installer.php', __DIR__ . '/installer.bak.php');

            echo json_encode(['status' => 'success']);
            exit;

        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            exit;
        }
    }
}

// Generate secure anti-CSRF token for presentation markup injection
if (empty($_SESSION['install_token'])) {
    $_SESSION['install_token'] = bin2hex(random_bytes(32));
}

// Render presentation markup separately
require_once __DIR__ . '/installer-form.php';
