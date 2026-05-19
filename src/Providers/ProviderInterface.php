<?php
/**
 * oddtranslator - Provider Interface
 * Every translation provider must implement this
 */

interface ProviderInterface {
    /**
     * Translate text to target language
     */
    public function translate(string $text, string $targetLang): string;

    /**
     * Human readable name for admin panel
     */
    public function getName(): string;

    /**
     * Whether this provider requires API credentials
     */
    public function requiresCredentials(): bool;
}