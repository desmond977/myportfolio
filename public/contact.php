<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Method not allowed.',
    ]);
    exit;
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody ?: '', true);

if (!is_array($payload)) {
    $payload = $_POST;
}

$name = trim((string) ($payload['name'] ?? ''));
$email = trim((string) ($payload['email'] ?? ''));
$subject = trim((string) ($payload['subject'] ?? ''));
$message = trim((string) ($payload['message'] ?? ''));
$company = trim((string) ($payload['company'] ?? ''));

if ($company !== '') {
    echo json_encode([
        'ok' => true,
        'message' => 'Message sent.',
    ]);
    exit;
}

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Please complete every field before sending.',
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Please enter a valid email address.',
    ]);
    exit;
}

$config = load_contact_config();

$missingConfig = [];
foreach (['to_email', 'from_email', 'smtp_username', 'smtp_password'] as $key) {
    if (empty($config[$key])) {
        $missingConfig[] = $key;
    }
}

if ($missingConfig !== []) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Email is not configured yet. Fill in public/contact-config.php on the server.',
    ]);
    exit;
}

$safeName = clean_header_value($name);
$safeSubject = clean_header_value($subject);
$replyTo = clean_header_value($email);
$toEmail = clean_header_value($config['to_email']);
$fromEmail = clean_header_value($config['from_email']);
$fromName = clean_header_value($config['from_name'] ?? 'Website Contact');

$bodyLines = [
    'New portfolio contact form submission',
    '',
    'Name: ' . $safeName,
    'Email: ' . $replyTo,
    'Subject: ' . $safeSubject,
    '',
    'Message:',
    $message,
];

$body = implode("\r\n", $bodyLines);

try {
    smtp_send_mail(
        $config,
        $toEmail,
        $fromEmail,
        $fromName,
        $replyTo,
        '[' . ($config['site_name'] ?? 'Website') . '] ' . $safeSubject,
        $body
    );

    echo json_encode([
        'ok' => true,
        'message' => 'Message sent successfully.',
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'The email could not be sent. Check your Hostinger SMTP settings.',
    ]);
}

function load_contact_config(): array
{
    $defaults = [
        'site_name' => 'Azubuike Desmond Portfolio',
        'to_email' => getenv('CONTACT_TO_EMAIL') ?: '',
        'from_email' => getenv('CONTACT_FROM_EMAIL') ?: '',
        'from_name' => getenv('CONTACT_FROM_NAME') ?: 'Website Contact',
        'smtp_host' => getenv('CONTACT_SMTP_HOST') ?: 'smtp.hostinger.com',
        'smtp_port' => (int) (getenv('CONTACT_SMTP_PORT') ?: 465),
        'smtp_username' => getenv('CONTACT_SMTP_USERNAME') ?: '',
        'smtp_password' => getenv('CONTACT_SMTP_PASSWORD') ?: '',
        'smtp_encryption' => getenv('CONTACT_SMTP_ENCRYPTION') ?: 'ssl',
    ];

    $configFile = __DIR__ . '/contact-config.php';
    if (!is_file($configFile)) {
        return $defaults;
    }

    $fileConfig = require $configFile;
    if (!is_array($fileConfig)) {
        return $defaults;
    }

    return array_merge($defaults, $fileConfig);
}

function smtp_send_mail(
    array $config,
    string $toEmail,
    string $fromEmail,
    string $fromName,
    string $replyTo,
    string $subject,
    string $body
): void {
    $host = (string) $config['smtp_host'];
    $port = (int) $config['smtp_port'];
    $encryption = strtolower((string) $config['smtp_encryption']);

    $remote = $host;
    if ($encryption === 'ssl') {
        $remote = 'ssl://' . $host;
    }

    $socket = stream_socket_client(
        $remote . ':' . $port,
        $errorCode,
        $errorMessage,
        20,
        STREAM_CLIENT_CONNECT
    );

    if (!is_resource($socket)) {
        throw new RuntimeException('Unable to connect to SMTP server: ' . $errorMessage . ' (' . $errorCode . ')');
    }

    stream_set_timeout($socket, 20);

    smtp_expect($socket, [220]);
    smtp_command($socket, 'EHLO ' . get_server_name(), [250]);

    if ($encryption === 'tls') {
        smtp_command($socket, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('Unable to start TLS encryption.');
        }
        smtp_command($socket, 'EHLO ' . get_server_name(), [250]);
    }

    smtp_command($socket, 'AUTH LOGIN', [334]);
    smtp_command($socket, base64_encode((string) $config['smtp_username']), [334]);
    smtp_command($socket, base64_encode((string) $config['smtp_password']), [235]);
    smtp_command($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
    smtp_command($socket, 'RCPT TO:<' . $toEmail . '>', [250, 251]);
    smtp_command($socket, 'DATA', [354]);

    $headers = [
        'Date: ' . date(DATE_RFC2822),
        'To: <' . $toEmail . '>',
        'From: ' . format_address($fromEmail, $fromName),
        'Reply-To: <' . $replyTo . '>',
        'Subject: ' . encode_header($subject),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];

    $data = implode("\r\n", $headers) . "\r\n\r\n" . dot_stuff(normalize_line_endings($body)) . "\r\n.";
    fwrite($socket, $data . "\r\n");
    smtp_expect($socket, [250]);
    smtp_command($socket, 'QUIT', [221]);
    fclose($socket);
}

function smtp_command($socket, string $command, array $expectedCodes): void
{
    fwrite($socket, $command . "\r\n");
    smtp_expect($socket, $expectedCodes);
}

function smtp_expect($socket, array $expectedCodes): void
{
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (preg_match('/^\d{3}\s/', $line) === 1) {
            break;
        }
    }

    $code = (int) substr($response, 0, 3);
    if (!in_array($code, $expectedCodes, true)) {
        throw new RuntimeException('Unexpected SMTP response: ' . trim($response));
    }
}

function encode_header(string $value): string
{
    $clean = clean_header_value($value);
    if ($clean === '') {
        return '';
    }

    if (function_exists('mb_encode_mimeheader')) {
        return mb_encode_mimeheader($clean, 'UTF-8', 'B', "\r\n");
    }

    return $clean;
}

function format_address(string $email, string $name): string
{
    $cleanName = clean_header_value($name);
    if ($cleanName === '') {
        return '<' . $email . '>';
    }

    return encode_header($cleanName) . ' <' . $email . '>';
}

function clean_header_value(string $value): string
{
    return trim(str_replace(["\r", "\n"], '', $value));
}

function normalize_line_endings(string $value): string
{
    return str_replace(["\r\n", "\r"], "\n", $value);
}

function dot_stuff(string $value): string
{
    $lines = explode("\n", $value);
    $safeLines = array_map(static function (string $line): string {
        if (isset($line[0]) && $line[0] === '.') {
            return '.' . $line;
        }

        return $line;
    }, $lines);

    return implode("\r\n", $safeLines);
}

function get_server_name(): string
{
    $serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';
    $cleanServerName = clean_header_value((string) $serverName);

    return $cleanServerName !== '' ? $cleanServerName : 'localhost';
}
