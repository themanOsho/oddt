<?php
/**
 * oddtranslator - Authentication & Session Management
 * Lightweight native PHP session handler
 */

class OddtSession {
    private const SESSION_KEY = 'oddt_admin_logged_in';
    private const USER_KEY   = 'oddt_admin_user';

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function login(string $username): void {
        $_SESSION[self::SESSION_KEY] = true;
        $_SESSION[self::USER_KEY]    = $username;
    }

    public function logout(): void {
        $_SESSION = [];
        session_destroy();
    }

    public function isLoggedIn(): bool {
        return isset($_SESSION[self::SESSION_KEY]) && $_SESSION[self::SESSION_KEY] === true;
    }

    public function getCurrentUser(): ?string {
        return $_SESSION[self::USER_KEY] ?? null;
    }

    // Redirect if not authenticated
    public function requireAuth(): void {
        if (!$this->isLoggedIn()) {
            header('Location: login.php');
            exit;
        }
    }
}