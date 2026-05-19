<?php
/**
 * oddtranslator - MyMemory Provider (Default)
 * Zero-config, generous free tier
 */

class MyMemoryProvider implements ProviderInterface {
    public function translate(string $text, string $targetLang): string {
        if (empty(trim($text))) {
            return $text;
        }

        $url = "https://api.mymemory.translated.net/get";
        
        $params = http_build_query([
            'q' => $text,
            'langpair' => 'en|' . $targetLang,
            'de' => 'your-email@example.com' // Optional - user can set later in Integrations
        ]);

        $ch = curl_init($url . '?' . $params);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            return $text; // Fallback to original text
        }

        $data = json_decode($response, true);
        
        return $data['responseData']['translatedText'] ?? $text;
    }

    public function getName(): string {
        return 'MyMemory (Free)';
    }

    public function requiresCredentials(): bool {
        return false;
    }
}