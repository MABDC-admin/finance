# MABDC Registrar System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack registrar system for MABDC school year 2026-2027 using the current Excel workbook as the first production data source.

**Architecture:** Use a Laravel monolith with Inertia React pages so registrar workflows stay server-owned, auditable, and easy to deploy. Store normalized student, enrollment, document, roster, import, and audit data in PostgreSQL, while preserving the source workbook import as an auditable batch record.

**Tech Stack:** Laravel 13, PHP 8.4, Inertia.js, React, TypeScript, Tailwind CSS, PostgreSQL, PhpSpreadsheet, Spatie Laravel Permission, Pest/PHPUnit, Vite.

---

## Source Evidence

The current source workbook is `C:\Users\DENNIS\Downloads\MABDC 2026-2027.xlsx`.

Workbook structure inspected on 2026-07-31:
- Master sheet: `MABDC 2026-2027`
- Roster sheets: `L1`, `L2`, `G1`, `G2`, `G3`, `G4`, `G5`, `G6`, `G7`, `G8`, `G9`, `G10`, `G11`, `G12`
- Master columns: `LEVEL`, `LRN`, `STUDENT NAME`, `BIRTH DATE`, `AGE`, `GENDER`, `MOTHER CONTACT #`, `MOTHERS MAIDEN NAME`, `FATHER CONTACT #`, `FATHER`, `PHIL. ADDRESS`, `UAE ADDRESS`, `PREVIOUS SCHOOL`, `SCHOOL CREDENTIALS`, `BIRTH CERT`, `PASSPORT`, `VISA`, `EID`
- Usable master student rows: 396
- Master level counts: L1 18, L2 28, G1 35, G2 49, G3 51, G4 34, G5 33, G6 36, G7 27, G8 29, G9 21, G10 16, G11 10, G12 9
- Document gaps: Birth Cert missing 39, Passport missing 105, Visa missing 362, EID missing 164, School Credentials missing 396
- Data cleanup flags: blank LRN 51, blank father contact 43, blank mother contact 7, blank UAE address 12, one likely shifted/malformed gender value

## Product Boundaries

Build for the registrar/admin office first:
- Manage school year 2026-2027.
- Import the current workbook.
- Search and edit learner records.
- Track enrollment document clearance.
- Maintain level and section rosters.
- Export masterlists and missing-document reports.
- Preserve audit history for imports and manual edits.

Do not build parent/student portals in the MVP. Do not build attendance, LMS, finance accounting, or face-recognition features in this roadmap.

## Target File Structure

Create this project structure after bootstrapping Laravel:

```text
app/
  Actions/Registrar/ImportMabdcWorkbook.php
  Actions/Registrar/NormalizeStudentRow.php
  Enums/DocumentType.php
  Enums/DocumentStatus.php
  Http/Controllers/DashboardController.php
  Http/Controllers/ImportController.php
  Http/Controllers/LearnerController.php
  Http/Controllers/DocumentController.php
  Http/Controllers/RosterController.php
  Http/Requests/ImportWorkbookRequest.php
  Http/Requests/LearnerStoreRequest.php
  Http/Requests/LearnerUpdateRequest.php
  Imports/MabdcWorkbookImport.php
  Models/AcademicYear.php
  Models/AuditEvent.php
  Models/DocumentRequirement.php
  Models/Enrollment.php
  Models/ImportBatch.php
  Models/Learner.php
  Models/Section.php
  Policies/LearnerPolicy.php
database/
  migrations/
  seeders/RegistrarReferenceSeeder.php
resources/js/
  Layouts/RegistrarLayout.tsx
  Pages/Dashboard/Index.tsx
  Pages/Imports/Index.tsx
  Pages/Learners/Index.tsx
  Pages/Learners/Show.tsx
  Pages/Learners/Edit.tsx
  Pages/Documents/Missing.tsx
  Pages/Rosters/Index.tsx
  Components/Registrar/DataTable.tsx
  Components/Registrar/DocumentBadge.tsx
  Components/Registrar/LevelBadge.tsx
  Components/Registrar/MetricCard.tsx
routes/web.php
tests/Feature/Registrar/
tests/Unit/Registrar/
```

## Data Model

Core tables:
- `academic_years`: one row for `2026-2027`, active by default.
- `learners`: stable learner identity, including LRN when present, full name, birth date, gender, parent contacts, Philippine address, UAE address, previous school.
- `enrollments`: learner membership in academic year, level, status, and optional section.
- `document_requirements`: one row per learner/enrollment/document type: school credentials, birth certificate, passport, visa, EID.
- `sections`: level, name/session/teacher fields. Initial roster tabs mostly imply `Morning`; teacher labels are inconsistent and should remain optional notes until normalized.
- `import_batches`: uploaded workbook name, checksum, row counts, warnings, imported-by user, timestamps.
- `audit_events`: before/after changes for imports and manual edits.

Uniqueness rules:
- `learners.lrn` is indexed but not unique because the inspected 2026-2027 workbook contains duplicate LRNs assigned to different learners.
- Duplicate detection uses LRN only when it matches the same learner identity; conflicting duplicate LRNs are preserved as separate learners and reported as import warnings. Blank-LRN fallback matching uses normalized name plus birth date.
- `enrollments` is unique by `learner_id` plus `academic_year_id`.
- `document_requirements` is unique by `enrollment_id` plus `document_type`.

## Phase 0: Bootstrap and Guardrails

### Task 1: Create Laravel/Inertia Project

**Files:**
- Create: Laravel app in workspace root
- Create: `.env.example`
- Create: `docs/superpowers/plans/2026-07-31-mabdc-registrar-roadmap.md`

- [ ] **Step 1: Bootstrap Laravel with React starter**

```bash
composer create-project laravel/laravel .
composer require laravel/breeze inertiajs/inertia-laravel spatie/laravel-permission phpoffice/phpspreadsheet
php artisan breeze:install react --typescript
npm install
```

- [ ] **Step 2: Configure PostgreSQL env**

```dotenv
APP_NAME="MABDC Registrar"
APP_ENV=local
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mabdc_registrar
DB_USERNAME=postgres
DB_PASSWORD=
```

- [ ] **Step 3: Verify empty app**

```bash
php artisan test
npm run build
```

Expected: Laravel tests pass and Vite builds without TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: bootstrap MABDC registrar app"
```

## Phase 1: Schema and Reference Data

### Task 2: Add Registrar Migrations and Models

**Files:**
- Create: `database/migrations/*_create_academic_years_table.php`
- Create: `database/migrations/*_create_learners_table.php`
- Create: `database/migrations/*_create_sections_table.php`
- Create: `database/migrations/*_create_enrollments_table.php`
- Create: `database/migrations/*_create_document_requirements_table.php`
- Create: `database/migrations/*_create_import_batches_table.php`
- Create: `database/migrations/*_create_audit_events_table.php`
- Create: `app/Models/AcademicYear.php`
- Create: `app/Models/Learner.php`
- Create: `app/Models/Enrollment.php`
- Create: `app/Models/DocumentRequirement.php`
- Create: `app/Models/Section.php`
- Create: `app/Models/ImportBatch.php`
- Create: `app/Models/AuditEvent.php`
- Create: `app/Enums/DocumentType.php`
- Create: `app/Enums/DocumentStatus.php`
- Test: `tests/Feature/Registrar/RegistrarSchemaTest.php`

- [ ] **Step 1: Write schema test**

```php
public function test_registrar_tables_exist(): void
{
    foreach (['academic_years', 'learners', 'sections', 'enrollments', 'document_requirements', 'import_batches', 'audit_events'] as $table) {
        $this->assertTrue(Schema::hasTable($table), "{$table} table is missing");
    }
}
```

- [ ] **Step 2: Add migrations**

Add typed columns for the workbook fields. Store LRN and phone numbers as strings, not integers. Store document statuses as enum strings: `ok`, `missing`, `expired`, `pending_review`.

- [ ] **Step 3: Add relationships**

Learner has many enrollments. Enrollment belongs to academic year, learner, and optional section. Enrollment has many document requirements.

- [ ] **Step 4: Run verification**

```bash
php artisan migrate:fresh --seed
php artisan test tests/Feature/Registrar/RegistrarSchemaTest.php
```

Expected: migration succeeds and schema test passes.

- [ ] **Step 5: Commit**

```bash
git add app database tests
git commit -m "feat: add registrar data model"
```

### Task 3: Seed Academic Year and Document Types

**Files:**
- Create: `database/seeders/RegistrarReferenceSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Test: `tests/Feature/Registrar/RegistrarReferenceSeederTest.php`

- [ ] **Step 1: Write seed test**

```php
public function test_active_school_year_is_seeded(): void
{
    $this->seed(RegistrarReferenceSeeder::class);

    $this->assertDatabaseHas('academic_years', [
        'name' => '2026-2027',
        'is_active' => true,
    ]);
}
```

- [ ] **Step 2: Implement seeder**

Seed `2026-2027` and document type labels: School Credentials, Birth Certificate, Passport, Visa, EID.

- [ ] **Step 3: Verify**

```bash
php artisan test tests/Feature/Registrar/RegistrarReferenceSeederTest.php
```

Expected: seeded school year exists.

- [ ] **Step 4: Commit**

```bash
git add database tests
git commit -m "feat: seed registrar reference data"
```

## Phase 2: Workbook Import

### Task 4: Import Master Sheet

**Files:**
- Create: `app/Actions/Registrar/NormalizeStudentRow.php`
- Create: `app/Actions/Registrar/ImportMabdcWorkbook.php`
- Create: `app/Imports/MabdcWorkbookImport.php`
- Create: `app/Http/Requests/ImportWorkbookRequest.php`
- Create: `app/Http/Controllers/ImportController.php`
- Modify: `routes/web.php`
- Test: `tests/Unit/Registrar/NormalizeStudentRowTest.php`
- Test: `tests/Feature/Registrar/MabdcWorkbookImportTest.php`

- [ ] **Step 1: Write normalization tests**

```php
public function test_level_is_carried_forward_when_blank(): void
{
    $normalizer = new NormalizeStudentRow();

    $first = $normalizer->handle(['LEVEL' => 'L1', 'STUDENT NAME' => 'YASAY, NATHANIEL'], null);
    $second = $normalizer->handle(['LEVEL' => null, 'STUDENT NAME' => 'BELGIRA, SIA'], $first['level']);

    $this->assertSame('L1', $first['level']);
    $this->assertSame('L1', $second['level']);
}
```

- [ ] **Step 2: Implement normalization**

Normalize headers by trimming spaces. Carry forward blank `LEVEL` cells. Trim names and contacts. Convert document `OK` to `ok`; blank cells to `missing`. Flag malformed gender values outside `M`, `F`, `MALE`, `FEMALE`.

- [ ] **Step 3: Write import test**

Use a small fixture workbook with two rows: one row with a level and one row with blank level. Assert two learners, two enrollments, and ten document requirement rows are created.

- [ ] **Step 4: Implement import action**

Create one `import_batches` row per upload. Import only `MABDC 2026-2027` master sheet for MVP. Skip completely blank rows. Store warnings for blank LRN, blank contacts, blank addresses, and malformed gender.

- [ ] **Step 5: Verify**

```bash
php artisan test tests/Unit/Registrar/NormalizeStudentRowTest.php tests/Feature/Registrar/MabdcWorkbookImportTest.php
```

Expected: normalization and import tests pass.

- [ ] **Step 6: Commit**

```bash
git add app routes tests
git commit -m "feat: import MABDC master workbook"
```

### Task 5: Add Import UI

**Files:**
- Create: `resources/js/Pages/Imports/Index.tsx`
- Modify: `resources/js/Layouts/RegistrarLayout.tsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/Registrar/ImportPageTest.php`

- [ ] **Step 1: Write access test**

```php
public function test_registrar_can_open_import_page(): void
{
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/imports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Imports/Index'));
}
```

- [ ] **Step 2: Build upload page**

Create a page with upload input, expected sheet/column checklist, last import summary, warning counts, and import result table.

- [ ] **Step 3: Verify**

```bash
php artisan test tests/Feature/Registrar/ImportPageTest.php
npm run build
```

Expected: import page renders and frontend builds.

- [ ] **Step 4: Commit**

```bash
git add resources routes tests
git commit -m "feat: add registrar workbook import UI"
```

## Phase 3: Learner Directory and Profile

### Task 6: Build Searchable Learner Directory

**Files:**
- Create: `app/Http/Controllers/LearnerController.php`
- Create: `resources/js/Pages/Learners/Index.tsx`
- Create: `resources/js/Components/Registrar/DataTable.tsx`
- Create: `resources/js/Components/Registrar/LevelBadge.tsx`
- Create: `resources/js/Components/Registrar/DocumentBadge.tsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/Registrar/LearnerDirectoryTest.php`

- [ ] **Step 1: Write directory test**

```php
public function test_directory_filters_by_level_and_missing_document(): void
{
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/learners?level=G2&missing_document=visa')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Learners/Index')
            ->has('learners.data')
        );
}
```

- [ ] **Step 2: Implement query**

Support search by LRN, student name, mother name, father name, phone, level, and missing document type. Paginate 25 rows by default.

- [ ] **Step 3: Build UI from mockup**

Port the Gemini learner list visual direction into React/Tailwind. Include metric strip, search, level filter, document filter, CSV export button, and row actions.

- [ ] **Step 4: Verify**

```bash
php artisan test tests/Feature/Registrar/LearnerDirectoryTest.php
npm run build
```

Expected: directory filters and frontend build pass.

- [ ] **Step 5: Commit**

```bash
git add app resources routes tests
git commit -m "feat: add learner directory"
```

### Task 7: Build Learner Profile and Edit Form

**Files:**
- Create: `resources/js/Pages/Learners/Show.tsx`
- Create: `resources/js/Pages/Learners/Edit.tsx`
- Create: `app/Http/Requests/LearnerUpdateRequest.php`
- Modify: `app/Http/Controllers/LearnerController.php`
- Test: `tests/Feature/Registrar/LearnerProfileTest.php`
- Test: `tests/Feature/Registrar/LearnerUpdateTest.php`

- [ ] **Step 1: Write profile test**

```php
public function test_profile_shows_documents_and_family_details(): void
{
    $user = User::factory()->create();
    $learner = Learner::factory()->has(Enrollment::factory())->create();

    $this->actingAs($user)
        ->get("/learners/{$learner->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Learners/Show')
            ->has('learner')
            ->has('documents')
        );
}
```

- [ ] **Step 2: Implement profile**

Show learner identity, LRN, active enrollment, level, parent contacts, addresses, previous school, and document clearance rows.

- [ ] **Step 3: Write update validation test**

Assert invalid dates and invalid gender fail validation. Assert duplicate LRN is allowed only with an explicit conflict warning path, and phone/contact strings are accepted without numeric conversion.

- [ ] **Step 4: Implement edit form**

Allow updating demographics, contacts, addresses, previous school, LRN, and active/inactive status.

- [ ] **Step 5: Verify**

```bash
php artisan test tests/Feature/Registrar/LearnerProfileTest.php tests/Feature/Registrar/LearnerUpdateTest.php
npm run build
```

Expected: profile and edit tests pass.

- [ ] **Step 6: Commit**

```bash
git add app resources tests
git commit -m "feat: add learner profile editing"
```

## Phase 4: Document Clearance

### Task 8: Manage Required Documents

**Files:**
- Create: `app/Http/Controllers/DocumentController.php`
- Create: `resources/js/Pages/Documents/Missing.tsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/Registrar/DocumentClearanceTest.php`

- [ ] **Step 1: Write clearance test**

```php
public function test_document_status_can_be_marked_ok(): void
{
    $user = User::factory()->create();
    $document = DocumentRequirement::factory()->create(['status' => 'missing']);

    $this->actingAs($user)
        ->patch("/documents/{$document->id}", ['status' => 'ok'])
        ->assertRedirect();

    $this->assertDatabaseHas('document_requirements', [
        'id' => $document->id,
        'status' => 'ok',
    ]);
}
```

- [ ] **Step 2: Implement status update**

Allow status values `ok`, `missing`, `expired`, `pending_review`. Add optional notes and verified date.

- [ ] **Step 3: Build missing documents page**

Show learners grouped by missing Passport, Visa, EID, Birth Certificate, and School Credentials. Default sort: level, learner name.

- [ ] **Step 4: Verify**

```bash
php artisan test tests/Feature/Registrar/DocumentClearanceTest.php
npm run build
```

Expected: document updates and missing document page work.

- [ ] **Step 5: Commit**

```bash
git add app resources routes tests
git commit -m "feat: add document clearance workflow"
```

## Phase 5: Rosters and Sections

### Task 9: Import and Manage Rosters

**Files:**
- Create: `app/Http/Controllers/RosterController.php`
- Create: `resources/js/Pages/Rosters/Index.tsx`
- Modify: `app/Actions/Registrar/ImportMabdcWorkbook.php`
- Test: `tests/Feature/Registrar/RosterImportTest.php`

- [ ] **Step 1: Write roster import test**

```php
public function test_roster_import_creates_sections_without_overwriting_master_records(): void
{
    $year = AcademicYear::factory()->create(['name' => '2026-2027', 'is_active' => true]);
    $learner = Learner::factory()->create(['full_name' => 'BANAY, KEZIAH T.']);
    Enrollment::factory()->create([
        'academic_year_id' => $year->id,
        'learner_id' => $learner->id,
        'level' => 'G1',
    ]);

    $importer = app(ImportMabdcWorkbook::class);
    $result = $importer->importRosters(base_path('tests/Fixtures/mabdc-roster-fixture.xlsx'), $year);

    $this->assertSame(1, $result->assigned_count);
    $this->assertDatabaseHas('sections', [
        'academic_year_id' => $year->id,
        'level' => 'G1',
        'session' => 'Morning',
    ]);
    $this->assertDatabaseHas('enrollments', [
        'academic_year_id' => $year->id,
        'learner_id' => $learner->id,
        'level' => 'G1',
    ]);
}
```

- [ ] **Step 2: Create roster fixture**

Create `tests/Fixtures/mabdc-roster-fixture.xlsx` with a `G1` sheet. Cell `A1` is `MORNING`, cell `A2` is `BANAY, KEZIAH T.`, and cell `A3` is `UNMATCHED, SAMPLE`. The test must assert one matched assignment and one warning for the unmatched name.

- [ ] **Step 3: Implement roster parsing**

Treat roster tabs as secondary assignment data. Preserve unmatched names as import warnings because the roster sheets contain notes and names in multiple columns.

- [ ] **Step 4: Build roster page**

Show sections by level with assigned count, unassigned learners, and manual assignment controls.

- [ ] **Step 5: Verify**

```bash
php artisan test tests/Feature/Registrar/RosterImportTest.php
npm run build
```

Expected: roster import is non-destructive and UI builds.

- [ ] **Step 6: Commit**

```bash
git add app resources tests
git commit -m "feat: add section roster management"
```

## Phase 6: Dashboard, Exports, and Audit

### Task 10: Dashboard Metrics

**Files:**
- Create: `app/Http/Controllers/DashboardController.php`
- Create: `resources/js/Pages/Dashboard/Index.tsx`
- Create: `resources/js/Components/Registrar/MetricCard.tsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/Registrar/DashboardMetricsTest.php`

- [ ] **Step 1: Write metrics test**

```php
public function test_dashboard_reports_enrollment_and_missing_document_counts(): void
{
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard/Index')
            ->has('metrics.totalEnrolled')
            ->has('metrics.missingVisa')
            ->has('metrics.missingEid')
        );
}
```

- [ ] **Step 2: Implement metrics**

Report total enrolled, cleared birth cert, missing passport, missing visa, missing EID, blank LRN count, unassigned learners, and active sections.

- [ ] **Step 3: Build dashboard UI**

Port the Gemini dashboard visual direction into React/Tailwind. Include quick actions, recent import summary, and recent audit events.

- [ ] **Step 4: Verify**

```bash
php artisan test tests/Feature/Registrar/DashboardMetricsTest.php
npm run build
```

Expected: metrics load and frontend builds.

- [ ] **Step 5: Commit**

```bash
git add app resources routes tests
git commit -m "feat: add registrar dashboard"
```

### Task 11: Export Reports

**Files:**
- Create: `app/Http/Controllers/ExportController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Registrar/ExportReportTest.php`

- [ ] **Step 1: Write export test**

```php
public function test_masterlist_export_downloads_csv(): void
{
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/exports/masterlist.csv')
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
}
```

- [ ] **Step 2: Implement exports**

Create CSV exports for masterlist, missing documents, blank LRN, and section rosters.

- [ ] **Step 3: Verify**

```bash
php artisan test tests/Feature/Registrar/ExportReportTest.php
```

Expected: export endpoints return valid CSV.

- [ ] **Step 4: Commit**

```bash
git add app routes tests
git commit -m "feat: add registrar exports"
```

### Task 12: Audit Trail

**Files:**
- Create: `app/Models/AuditEvent.php`
- Modify: `app/Actions/Registrar/ImportMabdcWorkbook.php`
- Modify: `app/Http/Controllers/LearnerController.php`
- Modify: `app/Http/Controllers/DocumentController.php`
- Test: `tests/Feature/Registrar/AuditEventTest.php`

- [ ] **Step 1: Write audit test**

```php
public function test_manual_document_change_creates_audit_event(): void
{
    $user = User::factory()->create();
    $document = DocumentRequirement::factory()->create(['status' => 'missing']);

    $this->actingAs($user)->patch("/documents/{$document->id}", ['status' => 'ok']);

    $this->assertDatabaseHas('audit_events', [
        'actor_id' => $user->id,
        'event_type' => 'document.updated',
    ]);
}
```

- [ ] **Step 2: Implement audit recording**

Record event type, actor, subject type/id, before JSON, after JSON, and import batch when relevant.

- [ ] **Step 3: Verify**

```bash
php artisan test tests/Feature/Registrar/AuditEventTest.php
```

Expected: import/manual edits generate audit rows.

- [ ] **Step 4: Commit**

```bash
git add app tests
git commit -m "feat: add registrar audit trail"
```

## Phase 7: Roles, Hardening, and Deployment Readiness

### Task 13: Registrar Roles and Authorization

**Files:**
- Create: `app/Policies/LearnerPolicy.php`
- Modify: `database/seeders/RegistrarReferenceSeeder.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Registrar/AuthorizationTest.php`

- [ ] **Step 1: Write authorization test**

```php
public function test_guest_cannot_access_learners(): void
{
    $this->get('/learners')->assertRedirect('/login');
}
```

- [ ] **Step 2: Add roles**

Seed `admin`, `registrar`, and `viewer`. Allow admin/registrar to import and edit. Allow viewer to read and export only.

- [ ] **Step 3: Verify**

```bash
php artisan test tests/Feature/Registrar/AuthorizationTest.php
```

Expected: route access matches role permissions.

- [ ] **Step 4: Commit**

```bash
git add app database routes tests
git commit -m "feat: add registrar role permissions"
```

### Task 14: Production Checklist

**Files:**
- Create: `docs/DEPLOYMENT.md`
- Modify: `.env.example`
- Test: deployment smoke commands

- [ ] **Step 1: Document deployment env**

```dotenv
APP_ENV=production
APP_DEBUG=false
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
SESSION_SECURE_COOKIE=true
```

- [ ] **Step 2: Add smoke commands**

```bash
php artisan migrate --force
php artisan queue:restart
npm run build
php artisan route:list
php artisan test
```

- [ ] **Step 3: Document backup policy**

Back up PostgreSQL daily. Back up uploaded document storage daily. Retain import workbooks or checksums for audit.

- [ ] **Step 4: Commit**

```bash
git add docs .env.example
git commit -m "docs: add registrar deployment checklist"
```

## MVP Acceptance Criteria

- A registrar can log in.
- A registrar can import `MABDC 2026-2027.xlsx`.
- Import creates 396 learner/enrollment records from the master sheet.
- Import warnings expose blank LRN, duplicate LRN conflicts, missing contacts, missing UAE address, and malformed gender rows.
- Dashboard shows total enrollment and missing document counts.
- Learner directory supports search, level filter, and missing-document filter.
- Learner profile shows demographics, contacts, addresses, enrollment, and document status.
- Registrar can edit learner data and document status.
- Missing-document report identifies Passport, Visa, EID, Birth Cert, and School Credentials gaps.
- CSV exports work for masterlist, missing documents, blank LRN, and rosters.
- All create/update/import operations write audit events.
- `php artisan test` and `npm run build` pass before deployment.

## Execution Order

1. Bootstrap Laravel/Inertia.
2. Build schema and seed school year.
3. Import master sheet.
4. Build learner directory.
5. Build learner profile/editing.
6. Build document clearance.
7. Build roster management.
8. Add dashboard and exports.
9. Add audit and roles.
10. Deploy only after import, tests, build, and export smoke checks pass.

## Risks and Decisions

- The workbook uses carried-forward `LEVEL` values; importer must preserve this behavior.
- The roster sheets are less structured than the master sheet; treat them as assignment hints with warnings, not authoritative identity records.
- Phone numbers and LRN must stay strings to preserve leading zeroes and non-numeric identifiers.
- The workbook contains encoding artifacts in names/addresses; the import UI should surface warnings but not silently rewrite personal data.
- Visa is missing for most learners; the system should support bulk filtering and follow-up, not force correction during import.
- School Credentials are blank for all inspected master records; confirm whether this column is still used before making it a blocker for enrollment.
