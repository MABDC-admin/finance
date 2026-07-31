# MABDC Registrar

Full-stack registrar system for MABDC school year `2026-2027`.

The app is a Laravel 13 + Inertia React + TypeScript monolith backed by PostgreSQL. It imports the current MABDC workbook, normalizes learner records, tracks enrollment document compliance, preserves audit history, and exports registrar reports.

## Current Capabilities

- Workbook import for `MABDC 2026-2027.xlsx`
- Learner directory with search, level/status filters, and learner profiles
- Document compliance workflow with audit events
- Dashboard reporting for active-year totals, level counts, and duplicate-LRN warnings
- CSV exports for learner directory and missing documents
- Role access control for `user`, `registrar`, and `admin`
- Admin-only role management screen

## Requirements

- PHP `^8.3`
- Composer 2
- Node.js 22 or compatible current LTS
- PostgreSQL 14+
- PHP extensions required by Laravel and PhpSpreadsheet, including `zip`, `xml`, `mbstring`, and `gd`

## Local Setup

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate --seed
npm run build
```

Set database and initial admin values in `.env` before seeding:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mabdc_registrar
DB_USERNAME=postgres
DB_PASSWORD=

REGISTRAR_ADMIN_NAME="MABDC Admin"
REGISTRAR_ADMIN_EMAIL=admin@example.com
REGISTRAR_ADMIN_PASSWORD=change-this-password
```

Run locally:

```bash
php artisan serve
npm run dev
```

## Verification

```bash
php artisan test
npm run build
composer audit
```

In this workspace, Docker Composer has been used for PHP verification when the host PHP version is older than the app requirement:

```bash
docker run --rm -v "$PWD":/workspace -w /workspace composer:2.8 php artisan test
docker run --rm -e COMPOSER_IGNORE_PLATFORM_REQ=ext-gd -v "$PWD":/workspace -w /workspace composer:2.8 composer audit
```

## Deployment

See [docs/deployment-runbook.md](docs/deployment-runbook.md).
