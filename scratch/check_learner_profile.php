<?php

require __DIR__ . '/../vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client([
    'cookies' => true,
    'allow_redirects' => true,
]);

// 1. Get login page to extract CSRF token if needed
echo "Fetching login page...\n";
$response = $client->request('GET', 'http://localhost:8001/login');
$html = (string) $response->getBody();

// Extract CSRF token from HTML if present
preg_match('/name="_token" value="([^"]+)"/', $html, $matches);
$csrfToken = $matches[1] ?? '';
echo "CSRF Token: $csrfToken\n";

// 2. Log in
echo "Logging in...\n";
try {
    $response = $client->request('POST', 'http://localhost:8001/login', [
        'form_params' => [
            '_token' => $csrfToken,
            'email' => 'admin@mabdc.test',
            'password' => 'password',
        ]
    ]);
    echo "Login Status: " . $response->getStatusCode() . "\n";
} catch (\Exception $e) {
    echo "Login failed: " . $e->getMessage() . "\n";
    exit(1);
}

// 3. Request learner profile
echo "Fetching learner profile /learners/97...\n";
try {
    $response = $client->request('GET', 'http://localhost:8001/learners/97');
    $profileHtml = (string) $response->getBody();
    
    // Save to public directory so we can read it or inspect it
    $outputPath = __DIR__ . '/learner_profile_97.html';
    file_put_contents($outputPath, $profileHtml);
    echo "Saved rendered HTML to: $outputPath\n";
} catch (\Exception $e) {
    echo "Failed to fetch profile: " . $e->getMessage() . "\n";
}
