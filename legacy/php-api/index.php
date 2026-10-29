<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

// The PHP built-in server uses this file as a router, so let it serve real
// files (none are public here, but this keeps behaviour predictable).
if (PHP_SAPI === 'cli-server') {
    $file = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($file !== __FILE__ && is_file($file)) {
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path   = '/' . trim(preg_replace('#^.*?/api/v1#', '', $path) ?? '', '/');
$parts  = $path === '/' ? [] : explode('/', trim($path, '/'));

// ===========================================================================
// mappers
// ===========================================================================

function decode_list(?string $json): array
{
    if (!$json) {
        return [];
    }
    $value = json_decode($json, true);
    return is_array($value) ? $value : [];
}

function client_relations(int $clientId): array
{
    $pdo = db();
    $get = function (string $sql) use ($pdo, $clientId): array {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$clientId]);
        return array_column($stmt->fetchAll(), 'name');
    };
    return [
        'industries' => $get('SELECT i.name FROM client_industries ci JOIN industries i ON i.id = ci.industry_id WHERE ci.client_id = ? ORDER BY i.sort_order'),
        'solutions'  => $get('SELECT s.name FROM client_solutions cs JOIN solutions s ON s.id = cs.solution_id WHERE cs.client_id = ? ORDER BY s.sort_order'),
        'tags'       => $get('SELECT t.name FROM client_tags ct JOIN service_tags t ON t.id = ct.tag_id WHERE ct.client_id = ? ORDER BY t.name'),
    ];
}

function case_study_payload(array $row): array
{
    $pdo = db();

    $timeline = $pdo->prepare('SELECT stage, title, detail FROM case_study_timeline WHERE case_study_id = ? ORDER BY sort_order, id');
    $timeline->execute([$row['id']]);

    $images = $pdo->prepare(
        'SELECT m.filename, i.alt_text, i.media_id FROM case_study_images i
         JOIN media m ON m.id = i.media_id WHERE i.case_study_id = ? ORDER BY i.sort_order, i.id'
    );
    $images->execute([$row['id']]);

    return [
        'status'           => $row['status'],
        'publishedAt'      => $row['published_at'],
        'title'            => (string)($row['title'] ?? ''),
        'seoTitle'         => (string)($row['seo_title'] ?? ''),
        'metaDescription'  => (string)($row['meta_description'] ?? ''),
        'keywords'         => (string)($row['keywords'] ?? ''),
        'ogTitle'          => (string)($row['og_title'] ?? ''),
        'ogDescription'    => (string)($row['og_description'] ?? ''),
        'summary'          => (string)($row['summary'] ?? ''),
        'heroImage'        => media_url($row['hero_filename'] ?? null) ?? '',
        'heroMediaId'      => $row['hero_media_id'] ? (int)$row['hero_media_id'] : null,
        'pdfMediaId'       => $row['pdf_media_id'] ? (int)$row['pdf_media_id'] : null,
        'executiveSummary' => (string)($row['executive_summary'] ?? ''),
        'aboutClient'      => (string)($row['about_client'] ?? ''),
        'challenge'        => (string)($row['challenge'] ?? ''),
        'solution'         => (string)($row['solution'] ?? ''),
        'services'         => decode_list($row['services']),
        'technologies'     => decode_list($row['technologies']),
        'metrics'          => decode_list($row['metrics']),
        'results'          => (string)($row['results'] ?? ''),
        'conclusion'       => (string)($row['conclusion'] ?? ''),
        'testimonial'      => $row['testimonial_quote']
            ? ['quote' => $row['testimonial_quote'], 'author' => (string)$row['testimonial_author'], 'role' => (string)$row['testimonial_role']]
            : null,
        'timeline'         => array_map(
            fn (array $t) => ['stage' => $t['stage'], 'title' => (string)$t['title'], 'detail' => (string)$t['detail']],
            $timeline->fetchAll()
        ),
        'images'           => array_map(
            fn (array $i) => ['src' => media_url($i['filename']), 'alt' => (string)$i['alt_text'], 'mediaId' => (int)$i['media_id']],
            $images->fetchAll()
        ),
        'pdf'              => ($row['pdf_filename'] ?? null)
            ? ['name' => (string)$row['pdf_original'], 'src' => media_url($row['pdf_filename'])]
            : null,
    ];
}

const CLIENT_SELECT = <<<SQL
SELECT c.id, c.slug, c.name, c.website_url, c.description, c.logo_path, c.created_at,
       lm.filename AS logo_filename, c.logo_media_id,
       cs.id AS cs_id, cs.title, cs.summary, cs.executive_summary, cs.about_client, cs.challenge,
       cs.solution, cs.services, cs.technologies, cs.metrics, cs.results, cs.conclusion,
       cs.testimonial_quote, cs.testimonial_author, cs.testimonial_role,
       cs.status, cs.published_at, cs.hero_media_id, cs.pdf_media_id,
       cs.seo_title, cs.meta_description, cs.keywords, cs.og_title, cs.og_description,
       hm.filename AS hero_filename, pm.filename AS pdf_filename, pm.original_name AS pdf_original
FROM clients c
LEFT JOIN media lm        ON lm.id = c.logo_media_id
LEFT JOIN case_studies cs ON cs.client_id = c.id
LEFT JOIN media hm        ON hm.id = cs.hero_media_id
LEFT JOIN media pm        ON pm.id = cs.pdf_media_id
SQL;

function client_payload(array $row, bool $admin): array
{
    $relations = client_relations((int)$row['id']);
    $published = ($row['status'] ?? null) === 'published';

    $caseStudy = null;
    if ($row['cs_id'] !== null && ($admin || $published)) {
        $caseStudy = case_study_payload(['id' => $row['cs_id']] + $row);
    }

    return [
        'id'          => $row['slug'],
        'name'        => $row['name'],
        'website'     => (string)($row['website_url'] ?? ''),
        'logo'        => media_url($row['logo_filename'] ?? null) ?? (string)($row['logo_path'] ?? ''),
        'logoMediaId' => $row['logo_media_id'] ? (int)$row['logo_media_id'] : null,
        'description' => (string)($row['description'] ?? ''),
        'industry'    => $relations['industries'][0] ?? '',
        'industries'  => $relations['industries'],
        'solutions'   => $relations['solutions'],
        'tags'        => $relations['tags'],
        'published'   => $published,
        'caseStudy'   => $caseStudy,
    ];
}

/** Replaces a client's rows in a join table, creating lookup rows as needed. */
function sync_relation(int $clientId, array $names, string $table, string $column, string $lookup, bool $create = false): void
{
    $pdo = db();
    $pdo->prepare("DELETE FROM $table WHERE client_id = ?")->execute([$clientId]);
    foreach ($names as $name) {
        $stmt = $pdo->prepare("SELECT id FROM $lookup WHERE slug = ?");
        $stmt->execute([slugify($name)]);
        $id = $stmt->fetchColumn();
        if (!$id) {
            if (!$create) {
                continue;   // unknown industry/solution is ignored, not invented
            }
            $insert = $pdo->prepare("INSERT INTO $lookup (slug, name) VALUES (?, ?)");
            $insert->execute([slugify($name), $name]);
            $id = $pdo->lastInsertId();
        }
        $pdo->prepare("INSERT IGNORE INTO $table (client_id, $column) VALUES (?, ?)")->execute([$clientId, $id]);
    }
}

// ===========================================================================
// routes
// ===========================================================================

try {
    // ----------------------------------------------------------- taxonomies
    if ($parts === ['taxonomies'] && $method === 'GET') {
        json_out(['data' => [
            'industries' => array_column(db()->query('SELECT name FROM industries ORDER BY sort_order, name')->fetchAll(), 'name'),
            'solutions'  => array_column(db()->query('SELECT name FROM solutions ORDER BY sort_order, name')->fetchAll(), 'name'),
        ]]);
    }

    // ------------------------------------------------------- media streaming
    if (count($parts) === 2 && $parts[0] === 'media' && $method === 'GET') {
        if (!preg_match('/^[a-f0-9]{32}\.[a-z]{3,4}$/', $parts[1])) {
            fail('not_found', 'File not found.', 404);
        }
        $stmt = db()->prepare('SELECT mime_type, original_name, kind FROM media WHERE filename = ?');
        $stmt->execute([$parts[1]]);
        $media = $stmt->fetch();
        $file  = upload_dir() . DIRECTORY_SEPARATOR . $parts[1];
        if (!$media || !is_file($file)) {
            fail('not_found', 'File not found.', 404);
        }
        header('Content-Type: ' . $media['mime_type']);
        header('Content-Length: ' . (string)filesize($file));
        header('X-Content-Type-Options: nosniff');
        header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox");
        header('Cache-Control: public, max-age=31536000, immutable');
        // SVG and PDF are never rendered inline from this origin.
        $inline = str_starts_with($media['mime_type'], 'image/') && $media['mime_type'] !== 'image/svg+xml';
        header('Content-Disposition: ' . ($inline ? 'inline' : 'attachment; filename="' . preg_replace('/[^\w.\- ]/', '_', $media['original_name']) . '"'));
        readfile($file);
        exit;
    }

    // ------------------------------------------------------------------ auth
    if ($parts === ['auth', 'login'] && $method === 'POST') {
        $data  = body();
        $email = str_field($data, 'email', 190, true);
        $password = (string)($data['password'] ?? '');

        $stmt = db()->prepare('SELECT id, password_hash, name, email, role, is_active FROM admin_users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Same response and timing shape whether the account exists or not.
        if (!$user || !$user['is_active'] || !password_verify($password, $user['password_hash'])) {
            usleep(random_int(150000, 300000));
            fail('invalid_credentials', 'That email and password did not match.', 401);
        }
        if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
            db()->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
                ->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
        }
        $session = start_session((int)$user['id']);
        json_out(['data' => [
            'user' => ['name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']],
            'csrfToken' => $session['csrf_token'],
        ]]);
    }

    if ($parts === ['auth', 'logout'] && $method === 'POST') {
        end_session();
        json_out(['data' => ['ok' => true]]);
    }

    if ($parts === ['auth', 'me'] && $method === 'GET') {
        $session = current_session();
        if (!$session) {
            json_out(['data' => null]);
        }
        json_out(['data' => [
            'user' => ['name' => $session['name'], 'email' => $session['email'], 'role' => $session['role']],
            'csrfToken' => $session['csrf_token'],
        ]]);
    }

    // ---------------------------------------------------------- public reads
    if ($parts === ['clients'] && $method === 'GET') {
        $query      = trim((string)($_GET['q'] ?? ''));
        $industries = array_filter(array_map('trim', explode(',', (string)($_GET['industries'] ?? ''))));
        $solutions  = array_filter(array_map('trim', explode(',', (string)($_GET['solutions'] ?? ''))));
        $perPage    = min(max((int)($_GET['per_page'] ?? 60), 1), 100);
        $page       = max((int)($_GET['page'] ?? 1), 1);

        $where = [];
        $args  = [];
        if ($query !== '') {
            $where[] = 'c.name LIKE ?';
            $args[]  = '%' . str_replace(['%', '_'], ['\%', '\_'], $query) . '%';
        }
        if ($industries) {
            $in = implode(',', array_fill(0, count($industries), '?'));
            $where[] = "EXISTS (SELECT 1 FROM client_industries ci JOIN industries i ON i.id = ci.industry_id WHERE ci.client_id = c.id AND i.name IN ($in))";
            array_push($args, ...$industries);
        }
        if ($solutions) {
            $in = implode(',', array_fill(0, count($solutions), '?'));
            $where[] = "EXISTS (SELECT 1 FROM client_solutions cs2 JOIN solutions s ON s.id = cs2.solution_id WHERE cs2.client_id = c.id AND s.name IN ($in))";
            array_push($args, ...$solutions);
        }
        $sql = CLIENT_SELECT . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY c.sort_order, c.name';

        $countStmt = db()->prepare('SELECT COUNT(*) FROM clients c' . ($where ? ' WHERE ' . implode(' AND ', $where) : ''));
        $countStmt->execute($args);
        $total = (int)$countStmt->fetchColumn();

        $stmt = db()->prepare($sql . ' LIMIT ' . $perPage . ' OFFSET ' . (($page - 1) * $perPage));
        $stmt->execute($args);
        $rows = array_map(fn (array $row) => client_payload($row, false), $stmt->fetchAll());

        json_out(['data' => $rows, 'meta' => ['total' => $total, 'page' => $page, 'perPage' => $perPage]]);
    }

    if (count($parts) === 2 && $parts[0] === 'clients' && $method === 'GET') {
        $stmt = db()->prepare(CLIENT_SELECT . ' WHERE c.slug = ?');
        $stmt->execute([$parts[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            fail('not_found', 'No client with that address.', 404);
        }
        json_out(['data' => client_payload($row, false)]);
    }

    // =======================================================================
    // admin — every route below requires a valid session
    // =======================================================================
    if (($parts[0] ?? '') === 'admin') {
        $session = require_auth();
        if ($method !== 'GET') {
            require_csrf($session);
        }
        $userId = (int)$session['user_id'];

        if ($parts === ['admin', 'stats'] && $method === 'GET') {
            json_out(['data' => [
                'clients'   => (int)db()->query('SELECT COUNT(*) FROM clients')->fetchColumn(),
                'published' => (int)db()->query("SELECT COUNT(*) FROM case_studies WHERE status = 'published'")->fetchColumn(),
                'drafts'    => (int)db()->query("SELECT COUNT(*) FROM clients c LEFT JOIN case_studies cs ON cs.client_id = c.id WHERE cs.id IS NULL OR cs.status = 'draft'")->fetchColumn(),
            ]]);
        }

        if ($parts === ['admin', 'clients'] && $method === 'GET') {
            $stmt = db()->query(CLIENT_SELECT . ' ORDER BY c.sort_order, c.name');
            json_out(['data' => array_map(fn (array $row) => client_payload($row, true), $stmt->fetchAll())]);
        }

        if ($parts === ['admin', 'uploads'] && $method === 'POST') {
            if (empty($_FILES['file'])) {
                fail('no_file', 'No file was received.', 400);
            }
            json_out(['data' => store_upload($_FILES['file'], $userId)], 201);
        }

        // ---- create / update -------------------------------------------------
        if (($parts === ['admin', 'clients'] && $method === 'POST')
            || (count($parts) === 3 && $parts[0] === 'admin' && $parts[1] === 'clients' && $method === 'PUT')) {

            $creating = $method === 'POST';
            $data = only(body(), [
                'name', 'website', 'description', 'logoMediaId', 'industry', 'industries', 'solutions', 'tags', 'caseStudy',
            ]);

            $pdo = db();
            $pdo->beginTransaction();
            try {
                if ($creating) {
                    $name = str_field($data, 'name', 190, true);
                    $slug = unique_slug($name);
                    $stmt = $pdo->prepare('INSERT INTO clients (slug, name, website_url, description, logo_media_id) VALUES (?, ?, ?, ?, ?)');
                    $stmt->execute([$slug, $name, url_field($data, 'website'), str_field($data, 'description', 1000), $data['logoMediaId'] ?? null]);
                    $clientId = (int)$pdo->lastInsertId();
                } else {
                    $stmt = $pdo->prepare('SELECT id, slug FROM clients WHERE slug = ?');
                    $stmt->execute([$parts[2]]);
                    $existing = $stmt->fetch();
                    if (!$existing) {
                        $pdo->rollBack();
                        fail('not_found', 'No client with that address.', 404);
                    }
                    $clientId = (int)$existing['id'];
                    $name = str_field($data, 'name', 190, true);
                    $slug = $existing['slug'];
                    $update = $pdo->prepare('UPDATE clients SET name = ?, website_url = ?, description = ?, logo_media_id = ? WHERE id = ?');
                    $update->execute([$name, url_field($data, 'website'), str_field($data, 'description', 1000), $data['logoMediaId'] ?? null, $clientId]);
                }

                $industries = $data['industries'] ?? (isset($data['industry']) && $data['industry'] !== '' ? [$data['industry']] : []);
                sync_relation($clientId, string_list(['v' => $industries], 'v'), 'client_industries', 'industry_id', 'industries');
                sync_relation($clientId, string_list($data, 'solutions'), 'client_solutions', 'solution_id', 'solutions');
                sync_relation($clientId, string_list($data, 'tags'), 'client_tags', 'tag_id', 'service_tags', true);

                if (isset($data['caseStudy']) && is_array($data['caseStudy'])) {
                    save_case_study($clientId, $data['caseStudy'], $userId);
                }

                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollBack();
                throw $e;
            }

            $stmt = $pdo->prepare(CLIENT_SELECT . ' WHERE c.id = ?');
            $stmt->execute([$clientId]);
            json_out(['data' => client_payload($stmt->fetch(), true)], $creating ? 201 : 200);
        }

        if (count($parts) === 3 && $parts[0] === 'admin' && $parts[1] === 'clients' && $method === 'GET') {
            $stmt = db()->prepare(CLIENT_SELECT . ' WHERE c.slug = ?');
            $stmt->execute([$parts[2]]);
            $row = $stmt->fetch();
            if (!$row) {
                fail('not_found', 'No client with that address.', 404);
            }
            json_out(['data' => client_payload($row, true)]);
        }

        if (count($parts) === 3 && $parts[0] === 'admin' && $parts[1] === 'clients' && $method === 'DELETE') {
            $stmt = db()->prepare('DELETE FROM clients WHERE slug = ?');
            $stmt->execute([$parts[2]]);
            if ($stmt->rowCount() === 0) {
                fail('not_found', 'No client with that address.', 404);
            }
            json_out(['data' => ['ok' => true]]);
        }

        // ---- publish / unpublish --------------------------------------------
        if (count($parts) === 4 && $parts[0] === 'admin' && $parts[1] === 'clients' && $parts[3] === 'status' && $method === 'POST') {
            $status = (string)(body()['status'] ?? '');
            if (!in_array($status, ['draft', 'published'], true)) {
                fail('validation_failed', 'Status must be draft or published.', 422);
            }
            $stmt = db()->prepare('SELECT c.id, cs.id AS cs_id FROM clients c LEFT JOIN case_studies cs ON cs.client_id = c.id WHERE c.slug = ?');
            $stmt->execute([$parts[2]]);
            $row = $stmt->fetch();
            if (!$row) {
                fail('not_found', 'No client with that address.', 404);
            }
            if (!$row['cs_id']) {
                db()->prepare('INSERT INTO case_studies (client_id, status, updated_by) VALUES (?, ?, ?)')
                    ->execute([$row['id'], $status, $userId]);
            } else {
                db()->prepare(
                    'UPDATE case_studies SET status = ?, published_at = IF(? = \'published\', COALESCE(published_at, NOW()), NULL), updated_by = ? WHERE id = ?'
                )->execute([$status, $status, $userId, $row['cs_id']]);
            }
            json_out(['data' => ['status' => $status]]);
        }

        fail('not_found', 'Unknown admin endpoint.', 404);
    }

    fail('not_found', 'Unknown endpoint.', 404);

} catch (Throwable $e) {
    // Never leak a driver message, query or path to the client.
    error_log('[srisun-api] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    fail('server_error', 'Something went wrong. Please try again.', 500);
}

// ===========================================================================

function save_case_study(int $clientId, array $input, int $userId): void
{
    $pdo = db();
    $data = only($input, [
        'title', 'seoTitle', 'metaDescription', 'keywords', 'ogTitle', 'ogDescription',
        'summary', 'executiveSummary', 'aboutClient', 'challenge', 'solution',
        'services', 'technologies', 'metrics', 'results', 'conclusion', 'testimonial',
        'timeline', 'images', 'heroMediaId', 'pdfMediaId', 'status',
    ]);

    $stmt = $pdo->prepare('SELECT id FROM case_studies WHERE client_id = ?');
    $stmt->execute([$clientId]);
    $caseId = $stmt->fetchColumn();

    $metrics = [];
    foreach (($data['metrics'] ?? []) as $metric) {
        $value = trim((string)($metric['value'] ?? ''));
        $label = trim((string)($metric['label'] ?? ''));
        if ($value !== '' || $label !== '') {
            $metrics[] = ['value' => $value, 'label' => $label, 'caption' => trim((string)($metric['caption'] ?? ''))];
        }
    }

    $testimonial = $data['testimonial'] ?? null;
    $quote = is_array($testimonial) ? trim((string)($testimonial['quote'] ?? '')) : '';

    $status = in_array($data['status'] ?? 'draft', ['draft', 'published'], true) ? $data['status'] : 'draft';

    $columns = [
        'title'              => str_field($data, 'title', 190),
        'seo_title'          => str_field($data, 'seoTitle', 190),
        'meta_description'   => str_field($data, 'metaDescription', 320),
        'keywords'           => str_field($data, 'keywords', 500),
        'og_title'           => str_field($data, 'ogTitle', 190),
        'og_description'     => str_field($data, 'ogDescription', 320),
        'summary'            => str_field($data, 'summary', 2000),
        'executive_summary'  => str_field($data, 'executiveSummary', 5000),
        'about_client'       => str_field($data, 'aboutClient', 5000),
        'challenge'          => str_field($data, 'challenge', 5000),
        'solution'           => str_field($data, 'solution', 5000),
        'services'           => json_encode(string_list($data, 'services')),
        'technologies'       => json_encode(string_list($data, 'technologies')),
        'metrics'            => json_encode($metrics),
        'results'            => str_field($data, 'results', 5000),
        'conclusion'         => str_field($data, 'conclusion', 5000),
        'testimonial_quote'  => $quote !== '' ? $quote : null,
        'testimonial_author' => $quote !== '' ? trim((string)($testimonial['author'] ?? '')) : null,
        'testimonial_role'   => $quote !== '' ? trim((string)($testimonial['role'] ?? '')) : null,
        'hero_media_id'      => $data['heroMediaId'] ?? null,
        'pdf_media_id'       => $data['pdfMediaId'] ?? null,
        'status'             => $status,
        'updated_by'         => $userId,
    ];

    if ($caseId) {
        $set = implode(', ', array_map(fn ($c) => "$c = ?", array_keys($columns)));
        $pdo->prepare("UPDATE case_studies SET $set, published_at = IF(? = 'published', COALESCE(published_at, NOW()), NULL) WHERE id = ?")
            ->execute([...array_values($columns), $status, $caseId]);
    } else {
        $cols = implode(', ', ['client_id', ...array_keys($columns)]);
        $marks = implode(', ', array_fill(0, count($columns) + 1, '?'));
        $pdo->prepare("INSERT INTO case_studies ($cols, published_at) VALUES ($marks, IF(? = 'published', NOW(), NULL))")
            ->execute([$clientId, ...array_values($columns), $status]);
        $caseId = $pdo->lastInsertId();
    }

    // timeline + images are replaced wholesale, which keeps ordering simple
    $pdo->prepare('DELETE FROM case_study_timeline WHERE case_study_id = ?')->execute([$caseId]);
    $insertStage = $pdo->prepare('INSERT INTO case_study_timeline (case_study_id, stage, title, detail, sort_order) VALUES (?, ?, ?, ?, ?)');
    foreach (($data['timeline'] ?? []) as $index => $step) {
        $stage = trim((string)($step['stage'] ?? ''));
        if ($stage === '') {
            continue;
        }
        $insertStage->execute([$caseId, mb_substr($stage, 0, 120), mb_substr(trim((string)($step['title'] ?? '')), 0, 190), trim((string)($step['detail'] ?? '')), $index]);
    }

    $pdo->prepare('DELETE FROM case_study_images WHERE case_study_id = ?')->execute([$caseId]);
    $insertImage = $pdo->prepare('INSERT INTO case_study_images (case_study_id, media_id, alt_text, sort_order) VALUES (?, ?, ?, ?)');
    foreach (($data['images'] ?? []) as $index => $image) {
        $mediaId = (int)($image['mediaId'] ?? 0);
        if ($mediaId > 0) {
            $insertImage->execute([$caseId, $mediaId, mb_substr(trim((string)($image['alt'] ?? '')), 0, 255), $index]);
        }
    }
}
