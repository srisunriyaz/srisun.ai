<?php
declare(strict_types=1);

/**
 * One-off seed:  php database/seed.php [path/to/clients.json]
 *
 *  - inserts the seven industries and seven solutions
 *  - creates the first admin account from SEED_ADMIN_* in .env
 *  - imports verified client records (name, website, logo path) if a JSON file
 *    is given. No case study content is created: every case study starts empty
 *    and is written by a person in the admin panel.
 *
 * Re-running is safe; existing rows are left alone.
 */

require __DIR__ . '/../api/bootstrap.php';

if (PHP_SAPI !== 'cli') {
    exit("CLI only\n");
}

$pdo = db();

$industries = ['Education', 'Finance', 'Retail', 'Manufacturing', 'Healthcare', 'Professional Services', 'SMEs'];
$solutions  = ['Tech Consulting', 'Web & E-Commerce', 'Software & Apps', 'AI & Automation', 'Cybersecurity', 'Business Communication', 'Digital Growth'];

foreach ([['industries', $industries], ['solutions', $solutions]] as [$table, $names]) {
    $stmt = $pdo->prepare("INSERT IGNORE INTO $table (slug, name, sort_order) VALUES (?, ?, ?)");
    foreach ($names as $i => $name) {
        $stmt->execute([slugify($name), $name, $i]);
    }
    echo "seeded $table (" . count($names) . ")\n";
}

// ----------------------------------------------------------- admin account
$email    = env('SEED_ADMIN_EMAIL');
$password = env('SEED_ADMIN_PASSWORD');
if ($email && $password) {
    $exists = $pdo->prepare('SELECT id FROM admin_users WHERE email = ?');
    $exists->execute([$email]);
    if ($exists->fetch()) {
        echo "admin user already exists: $email\n";
    } elseif (strlen($password) < 12) {
        echo "SKIPPED admin user: SEED_ADMIN_PASSWORD must be at least 12 characters\n";
    } else {
        $pdo->prepare('INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)')
            ->execute([$email, password_hash($password, PASSWORD_DEFAULT), env('SEED_ADMIN_NAME', 'Srisun Admin'), 'admin']);
        echo "created admin user: $email\n";
    }
} else {
    echo "no SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env — skipping admin user\n";
}

// ---------------------------------------------------------- client records
$jsonPath = $argv[1] ?? null;
if (!$jsonPath) {
    echo "no clients JSON given — done\n";
    exit(0);
}
if (!is_readable($jsonPath)) {
    exit("cannot read $jsonPath\n");
}

$clients = json_decode((string)file_get_contents($jsonPath), true);
if (!is_array($clients)) {
    exit("clients JSON is not an array\n");
}

$imported = 0;
$skipped  = 0;
foreach ($clients as $entry) {
    $name = trim((string)($entry['name'] ?? ''));
    if ($name === '') {
        continue;
    }
    $check = $pdo->prepare('SELECT id FROM clients WHERE slug = ?');
    $check->execute([slugify($name)]);
    if ($check->fetch()) {
        $skipped++;
        continue;
    }

    // The logo files already live in public/assets/clients/. They are
    // registered as media rows pointing at those existing paths rather than
    // being copied, so nothing is duplicated.
    $pdo->prepare('INSERT INTO clients (slug, name, website_url, description, logo_path) VALUES (?, ?, ?, ?, ?)')
        ->execute([slugify($name), $name, $entry['url'] ?: null, $entry['blurb'] ?? null, $entry['logo'] ?: null]);
    $clientId = (int)$pdo->lastInsertId();

    sync_relation_seed($clientId, $entry['industry'] ? [$entry['industry']] : [], 'client_industries', 'industry_id', 'industries');
    sync_relation_seed($clientId, $entry['solutions'] ?? [], 'client_solutions', 'solution_id', 'solutions');
    sync_relation_seed($clientId, $entry['tags'] ?? [], 'client_tags', 'tag_id', 'service_tags', true);

    // empty draft case study — no narrative content is invented
    $pdo->prepare("INSERT INTO case_studies (client_id, status) VALUES (?, 'draft')")->execute([$clientId]);
    $imported++;
}

echo "imported $imported clients, skipped $skipped existing\n";

function sync_relation_seed(int $clientId, array $names, string $table, string $column, string $lookup, bool $create = false): void
{
    $pdo = db();
    foreach ($names as $name) {
        $name = trim((string)$name);
        if ($name === '') {
            continue;
        }
        $stmt = $pdo->prepare("SELECT id FROM $lookup WHERE slug = ?");
        $stmt->execute([slugify($name)]);
        $id = $stmt->fetchColumn();
        if (!$id && $create) {
            $pdo->prepare("INSERT INTO $lookup (slug, name) VALUES (?, ?)")->execute([slugify($name), $name]);
            $id = $pdo->lastInsertId();
        }
        if ($id) {
            $pdo->prepare("INSERT IGNORE INTO $table (client_id, $column) VALUES (?, ?)")->execute([$clientId, $id]);
        }
    }
}
