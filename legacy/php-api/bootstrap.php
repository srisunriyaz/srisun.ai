<?php
declare(strict_types=1);

/**
 * Shared bootstrap: configuration, database, JSON helpers, auth and uploads.
 * Credentials are read from a .env file that lives outside this directory and
 * is never committed.
 */

const API_ROOT  = __DIR__;
const APP_ROOT  = __DIR__ . '/..';
const SESSION_LIFETIME = 60 * 60 * 8;   // 8 hours

// ---------------------------------------------------------------- config
function env_load(): array
{
    static $env = null;
    if ($env !== null) {
        return $env;
    }
    $env = [];
    $file = APP_ROOT . '/.env';
    if (is_readable($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$key, $value] = explode('=', $line, 2);
            $env[trim($key)] = trim(trim($value), "\"'");
        }
    }
    return $env;
}

function env(string $key, ?string $default = null): ?string
{
    $env = env_load();
    return $env[$key] ?? getenv($key) ?: $default;
}

function upload_dir(): string
{
    $dir = env('UPLOAD_PATH') ?: APP_ROOT . '/storage/uploads';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    return rtrim($dir, '/\\');
}

// -------------------------------------------------------------- database
function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        env('DB_HOST', '127.0.0.1'),
        env('DB_PORT', '3306'),
        env('DB_NAME', 'srisun_cases')
    );
    try {
        $pdo = new PDO($dsn, env('DB_USER', 'root'), env('DB_PASSWORD', ''), [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        // The driver message can contain the DSN and user, so it is logged and
        // never returned to the client.
        error_log('[srisun-api] database connection failed: ' . $e->getMessage());
        json_out(['error' => ['code' => 'db_unavailable', 'message' => 'The service is unavailable.']], 503);
    }
    return $pdo;
}

// ------------------------------------------------------------------ http
function json_out(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $code, string $message, int $status = 400, array $extra = []): never
{
    json_out(['error' => array_merge(['code' => $code, 'message' => $message], $extra)], $status);
}

function body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('invalid_json', 'The request body is not valid JSON.', 400);
    }
    return $data;
}

/** Whitelist the keys a request may set — blocks mass assignment. */
function only(array $data, array $keys): array
{
    return array_intersect_key($data, array_flip($keys));
}

function str_field(array $data, string $key, int $max, bool $required = false): ?string
{
    $value = trim((string)($data[$key] ?? ''));
    if ($value === '') {
        if ($required) {
            fail('validation_failed', "The field \"$key\" is required.", 422, ['field' => $key]);
        }
        return null;
    }
    if (mb_strlen($value) > $max) {
        fail('validation_failed', "The field \"$key\" is longer than $max characters.", 422, ['field' => $key]);
    }
    return $value;
}

function url_field(array $data, string $key): ?string
{
    $value = str_field($data, $key, 255);
    if ($value === null) {
        return null;
    }
    if (!filter_var($value, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $value)) {
        fail('validation_failed', 'The website URL must start with http:// or https://.', 422, ['field' => $key]);
    }
    return $value;
}

function string_list(array $data, string $key): array
{
    $value = $data[$key] ?? [];
    if (!is_array($value)) {
        return [];
    }
    $out = [];
    foreach ($value as $item) {
        $item = trim((string)$item);
        if ($item !== '' && mb_strlen($item) <= 120) {
            $out[] = $item;
        }
    }
    return array_values(array_unique($out));
}

function slugify(string $value): string
{
    $slug = strtolower(trim($value));
    $slug = str_replace('&', ' and ', $slug);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
    return trim($slug, '-') ?: 'client';
}

function unique_slug(string $base, ?int $ignoreId = null): string
{
    $slug = slugify($base);
    $suffix = 1;
    while (true) {
        $sql = 'SELECT id FROM clients WHERE slug = ?' . ($ignoreId ? ' AND id <> ?' : '');
        $stmt = db()->prepare($sql);
        $stmt->execute($ignoreId ? [$slug, $ignoreId] : [$slug]);
        if (!$stmt->fetch()) {
            return $slug;
        }
        $slug = slugify($base) . '-' . (++$suffix);
    }
}

// ------------------------------------------------------------------ auth
function session_cookie_name(): string
{
    return 'srisun_admin';
}

function current_session(): ?array
{
    static $session = null;
    static $looked = false;
    if ($looked) {
        return $session;
    }
    $looked = true;

    $token = $_COOKIE[session_cookie_name()] ?? '';
    if ($token === '' || !preg_match('/^[a-f0-9]{64}$/', $token)) {
        return null;
    }
    $stmt = db()->prepare(
        'SELECT s.id, s.csrf_token, s.expires_at, u.id AS user_id, u.email, u.name, u.role, u.is_active
         FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > NOW()'
    );
    $stmt->execute([hash('sha256', $token)]);
    $row = $stmt->fetch();
    if (!$row || (int)$row['is_active'] !== 1) {
        return null;
    }
    $session = $row;
    return $session;
}

function require_auth(): array
{
    $session = current_session();
    if (!$session) {
        fail('unauthenticated', 'Sign in to continue.', 401);
    }
    return $session;
}

/** Every session-authenticated write must carry the CSRF token. */
function require_csrf(array $session): void
{
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sent) || $sent === '' || !hash_equals($session['csrf_token'], $sent)) {
        fail('csrf_failed', 'Your session has expired. Reload the page and try again.', 419);
    }
}

function start_session(int $userId): array
{
    $token = bin2hex(random_bytes(32));
    $csrf  = bin2hex(random_bytes(32));
    $stmt = db()->prepare(
        'INSERT INTO admin_sessions (id, user_id, csrf_token, ip, user_agent, expires_at)
         VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))'
    );
    $stmt->execute([
        hash('sha256', $token),
        $userId,
        $csrf,
        substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45),
        substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
        SESSION_LIFETIME,
    ]);

    setcookie(session_cookie_name(), $token, [
        'expires'  => time() + SESSION_LIFETIME,
        'path'     => '/',
        'secure'   => (env('APP_ENV') === 'production'),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);

    db()->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?')->execute([$userId]);
    db()->exec('DELETE FROM admin_sessions WHERE expires_at < NOW()');

    return ['csrf_token' => $csrf];
}

function end_session(): void
{
    $token = $_COOKIE[session_cookie_name()] ?? '';
    if ($token !== '' && preg_match('/^[a-f0-9]{64}$/', $token)) {
        db()->prepare('DELETE FROM admin_sessions WHERE id = ?')->execute([hash('sha256', $token)]);
    }
    setcookie(session_cookie_name(), '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'secure'   => (env('APP_ENV') === 'production'),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

// --------------------------------------------------------------- uploads
const ALLOWED_IMAGE = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    'image/svg+xml' => 'svg',
];
const ALLOWED_PDF = ['application/pdf' => 'pdf'];

function store_upload(array $file, int $userId): array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        fail('upload_failed', 'The file could not be uploaded.', 400);
    }
    if (!is_uploaded_file($file['tmp_name'])) {
        fail('upload_failed', 'The file could not be uploaded.', 400);
    }

    $maxBytes = (int)(env('UPLOAD_MAX_MB', '8')) * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        fail('upload_too_large', 'That file is larger than the ' . (int)(env('UPLOAD_MAX_MB', '8')) . ' MB limit.', 413);
    }

    // Trust the sniffed type, never the client-supplied one.
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = (string)$finfo->file($file['tmp_name']);
    $allowed = ALLOWED_IMAGE + ALLOWED_PDF;
    if (!isset($allowed[$mime])) {
        fail('upload_rejected', 'Only JPEG, PNG, WebP, GIF, SVG and PDF files are accepted.', 415);
    }
    $kind = isset(ALLOWED_PDF[$mime]) ? 'pdf' : 'image';

    // SVG can carry script, so it is stored but always served as a download
    // with a restrictive CSP (see media streaming below).
    $filename = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
    $target   = upload_dir() . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        fail('upload_failed', 'The file could not be saved.', 500);
    }
    @chmod($target, 0644);

    $stmt = db()->prepare(
        'INSERT INTO media (filename, original_name, mime_type, size_bytes, kind, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $filename,
        mb_substr((string)$file['name'], 0, 255),
        $mime,
        (int)$file['size'],
        $kind,
        $userId,
    ]);

    return [
        'id'   => (int)db()->lastInsertId(),
        'url'  => '/api/v1/media/' . $filename,
        'kind' => $kind,
        'name' => mb_substr((string)$file['name'], 0, 255),
    ];
}

function media_url(?string $filename): ?string
{
    return $filename ? '/api/v1/media/' . $filename : null;
}
