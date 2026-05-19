<?php
/**
 * oddtranslator - Translation AJAX Endpoint
 */

require_once __DIR__ . '/boot.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$text = $_POST['text'] ?? '';
$targetLang = $_POST['targetLang'] ?? 'en';

try {
    $translator = new Translator();
    $result = $translator->translate($text, $targetLang);

    echo json_encode([
        'success' => true,
        'translated' => $result
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}