# MABDC Registrar Deployment Runbook

This runbook covers production deployment and smoke verification for the MABDC Registrar app.

## 1. Server Baseline

Required runtime:

- PHP `^8.3`
- Composer 2
- Node.js 22 or compatible current LTS
- PostgreSQL 14+
- Web server pointing to Laravel `public/`
- Writable `storage/` and `bootstrap/cache/`
- PHP extensions required by Laravel and PhpSpreadsheet, including `ctype`, `curl`, `dom`, `fileinfo`, `filter`, `gd`, `hash`, `mbstring`, `openssl`, `pdo`, `pdo_pgsql`, `session`, `tokenizer`, `xml`, `xmlreader`, `xmlwriter`, and `zip`

Recommended process model:

- PHP-FPM behind Nginx or Apache
- `php artisan queue:work` only if queued jobs are later added
- Daily database backup before school-office hours

## 2. Environment

Create `.env` from `.env.example` and set production values.

Required registrar-specific values:

```dotenv
APP_NAME="MABDC Registrar"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-registrar-domain.example

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mabdc_registrar
DB_USERNAME=mabdc_registrar
DB_PASSWORD=replace-with-strong-password

REGISTRAR_ADMIN_NAME="MABDC Admin"
REGISTRAR_ADMIN_EMAIL=admin@example.com
REGISTRAR_ADMIN_PASSWORD=replace-with-one-time-strong-password
```

Do not commit `.env`. Rotate `REGISTRAR_ADMIN_PASSWORD` after first login by changing the admin password through the app profile flow or by issuing a password reset.

## 3. First Deploy

From the release directory:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
npm run build
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

The seed step creates:

- Active academic year `2026-2027`
- Registrar reference data
- Initial admin user only when `REGISTRAR_ADMIN_EMAIL` and `REGISTRAR_ADMIN_PASSWORD` are set

## 4. Routine Deploy

For subsequent releases:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
npm run build
php artisan down --render="errors::503" || true
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan up
```

If the web server uses a release symlink, switch the symlink only after `composer install`, `npm run build`, and `php artisan migrate --force` succeed.

## 5. Smoke Checklist

Run after every deploy:

1. Open `/login`; confirm the page loads over HTTPS.
2. Log in as an `admin` user.
3. Open `/dashboard`; confirm active year `2026-2027` and report cards render.
4. Open `/imports`; upload `MABDC 2026-2027.xlsx` on a staging copy before doing it in production.
5. Confirm latest import shows expected counts near the inspected baseline: `396` imported learners, `0` skipped rows, and warnings for known data cleanup items.
6. Open `/learners`; search by a known learner name or LRN.
7. Open a learner profile; update one document status and confirm the row saves.
8. Download `Export learners` and `Missing docs` CSV files from `/learners`.
9. Open `/users`; confirm only admins can view it and that registrar users cannot.
10. Log out and verify `/dashboard` redirects to login for guests.

## 6. Post-Import Checks

After importing the production workbook:

```bash
php artisan tinker
```

Then inspect:

```php
\App\Models\Learner::count();
\App\Models\Enrollment::count();
\App\Models\DocumentRequirement::count();
\App\Models\ImportBatch::latest()->first(['imported_rows', 'skipped_rows', 'warning_count', 'status']);
```

Expected workbook baseline from the inspected source:

- Learners: `396`
- Enrollments: `396`
- Document requirements: `1980`
- Known duplicate-LRN conflict warnings: `3`

## 7. Backups

Before importing a new workbook or deploying schema changes:

```bash
pg_dump --format=custom --file=mabdc_registrar_$(date +%Y%m%d_%H%M%S).dump mabdc_registrar
```

Restore drill:

```bash
createdb mabdc_registrar_restore_test
pg_restore --dbname=mabdc_registrar_restore_test path/to/backup.dump
```

Keep backups outside the web root.

## 8. Rollback

If a release fails before migrations:

```bash
php artisan up
```

Then switch back to the previous release directory or git commit.

If a release fails after migrations:

1. Put the app in maintenance mode.
2. Restore the database from the pre-deploy backup if the migration changed data or schema incompatibly.
3. Switch code back to the previous release.
4. Clear and rebuild caches:

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan up
```

## 9. Operational Notes

- Use `admin` only for account and role management.
- Use `registrar` for daily registrar workflows.
- New self-registered accounts default to `user` and cannot access registrar records until promoted by an admin.
- The import keeps duplicate conflicting LRNs as separate learners and reports them as warnings for manual review.
- `learners.lrn` is intentionally indexed, not unique, because the source workbook contains conflicting duplicate LRNs.
