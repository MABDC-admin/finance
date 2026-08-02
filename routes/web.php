<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\DocumentRequirementController;
use App\Http\Controllers\AcademicRecordController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LearnerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StudentManagementController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\TransferWithdrawalController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\LearnerAccountController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\FinanceReportController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route(\App\Support\RegistrarModules::landingRouteForRole(auth()->user()->role));
    }
    return redirect()->route('login');
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified', 'module:dashboard'])
    ->name('dashboard');

Route::middleware(['auth'])->group(function () {
    Route::get('/student-management', StudentManagementController::class)
        ->middleware('module:student_management')
        ->name('student-management.index');
    Route::get('/enrollments', EnrollmentController::class)
        ->middleware('module:enrollment')
        ->name('enrollments.index');
    Route::get('/academic-records', [AcademicRecordController::class, 'index'])
        ->middleware('module:academic_records')
        ->name('academic-records.index');
    Route::get('/academic-records/{learner}', [AcademicRecordController::class, 'show'])
        ->middleware('module:academic_records')
        ->name('academic-records.show');
    Route::post('/enrollments/{enrollment}/grades', [AcademicRecordController::class, 'store'])
        ->middleware('module:academic_records')
        ->name('grades.store');
    Route::get('/reports', ReportController::class)
        ->middleware('module:reports')
        ->name('reports.index');
    Route::get('/learners', [LearnerController::class, 'index'])
        ->middleware('module:student_management')
        ->name('learners.index');
    Route::get('/learners/{learner}/edit', [LearnerController::class, 'edit'])
        ->middleware('module:student_management')
        ->name('learners.edit');
    Route::patch('/learners/{learner}', [LearnerController::class, 'update'])
        ->middleware('module:student_management')
        ->name('learners.update');
    Route::patch('/learners/{learner}/disable', [LearnerController::class, 'disable'])
        ->middleware('module:student_management')
        ->name('learners.disable');
    Route::delete('/learners/{learner}', [LearnerController::class, 'destroy'])
        ->middleware('module:student_management')
        ->name('learners.destroy');
    Route::patch('/learners/{learner}/documents/{documentRequirement}', [DocumentRequirementController::class, 'update'])
        ->middleware('module:student_management')
        ->name('learners.documents.update');
    Route::post('/learners/{learner}/documents/{documentRequirement}/analyze', [DocumentRequirementController::class, 'analyze'])
        ->middleware('module:student_management')
        ->name('learners.documents.analyze');
    Route::post('/learners/{learner}/documents/{documentRequirement}/upload', [DocumentRequirementController::class, 'upload'])
        ->middleware('module:student_management')
        ->name('learners.documents.upload');
    Route::get('/learners/{learner}', [LearnerController::class, 'show'])
        ->middleware('module:student_management')
        ->name('learners.show');
    Route::get('/exports/learners', [ExportController::class, 'learners'])
        ->middleware('module:reports')
        ->name('exports.learners');
    Route::get('/exports/missing-documents', [ExportController::class, 'missingDocuments'])
        ->middleware('module:reports')
        ->name('exports.missing-documents');
    Route::get('/imports', [ImportController::class, 'index'])
        ->middleware('module:document_center')
        ->name('imports.index');
    Route::post('/imports', [ImportController::class, 'store'])
        ->middleware('module:document_center')
        ->name('imports.store');

    // Registrar Module Placeholders
    Route::get('/admissions', [AdmissionController::class, 'index'])->name('admissions.index');
    Route::patch('/admissions/{application}/status', [AdmissionController::class, 'updateStatus'])->name('admissions.update-status');
    Route::post('/admissions/{application}/enroll', [AdmissionController::class, 'enroll'])->name('admissions.enroll');

    Route::get('/classes', [SectionController::class, 'index'])->name('classes.index');
    Route::post('/classes', [SectionController::class, 'store'])->name('classes.store');
    Route::patch('/classes/{section}', [SectionController::class, 'update'])->name('classes.update');
    Route::get('/classes/{section}', [SectionController::class, 'show'])->name('classes.show');
    Route::post('/classes/{section}/assign', [SectionController::class, 'assign'])->name('classes.assign');
    Route::post('/classes/{section}/unassign', [SectionController::class, 'unassign'])->name('classes.unassign');
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::get('/transfers', [TransferWithdrawalController::class, 'index'])->name('transfers.index');
    Route::post('/transfers', [TransferWithdrawalController::class, 'store'])->name('transfers.store');
    
    Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('/certificates/generate', [CertificateController::class, 'generate'])->name('certificates.generate');

    // Finance Module (Dashboard & Configuration only)
    Route::middleware('module:finance')->group(function () {
        Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
        Route::get('/finance/settings', [FinanceController::class, 'settings'])->name('finance.settings');
        Route::post('/finance/settings', [FinanceController::class, 'storeSettings'])->name('finance.settings.store');
        Route::delete('/finance/settings/{fee}', [FinanceController::class, 'destroySettings'])->name('finance.settings.destroy');
        Route::post('/finance/batch-assess', [FinanceController::class, 'batchAssess'])->name('finance.batch-assess');
        Route::get('/finance/receipt/{receipt}', [FinanceController::class, 'showReceipt'])->name('finance.receipt');
        Route::resource('finance/fees', FeeStructureController::class)->names('finance.fees');
        Route::get('/finance/fees/{fee}/learners', [FeeStructureController::class, 'getLearners'])->name('finance.fees.learners');
        Route::post('/finance/fees/{fee}/assign', [FeeStructureController::class, 'assign'])->name('finance.fees.assign');
        Route::get('/finance/reports', [FinanceReportController::class, 'index'])->name('finance.reports.index');
        Route::get('/finance/reports/export-outstanding', [FinanceReportController::class, 'exportOutstandingPdf'])->name('finance.reports.export-outstanding');
        Route::get('/finance/reports/export-collections', [FinanceReportController::class, 'exportCollectionsPdf'])->name('finance.reports.export-collections');
    });

    // Learner Accounts Module (per-student ledger)
    Route::middleware('module:learner_accounts')->group(function () {
        Route::get('/learner-accounts', [LearnerAccountController::class, 'index'])->name('learner-accounts.index');
        Route::get('/learner-accounts/{enrollment}', [LearnerAccountController::class, 'show'])->name('learner-accounts.show');
        Route::post('/learner-accounts/{enrollment}/charge', [LearnerAccountController::class, 'storeCharge'])->name('learner-accounts.charge');
        Route::post('/learner-accounts/{enrollment}/payment', [LearnerAccountController::class, 'storePayment'])->name('learner-accounts.payment');
        Route::post('/learner-accounts/{enrollment}/discount', [LearnerAccountController::class, 'storeDiscount'])->name('learner-accounts.discount');
        Route::post('/learner-accounts/{enrollment}/installment', [LearnerAccountController::class, 'storeInstallmentPlan'])->name('learner-accounts.installment');
        Route::post('/learner-accounts/{enrollment}/refund', [LearnerAccountController::class, 'storeRefund'])->name('learner-accounts.refund');
        Route::post('/learner-accounts/{enrollment}/assess', [LearnerAccountController::class, 'assessTuition'])->name('learner-accounts.assess');
        Route::put('/learner-accounts/{enrollment}/ledgers/{ledger}', [LearnerAccountController::class, 'updateLedger'])->name('learner-accounts.ledgers.update');
        Route::delete('/learner-accounts/{enrollment}/ledgers/{ledger}', [LearnerAccountController::class, 'destroyLedger'])->name('learner-accounts.ledgers.destroy');
        Route::post('/learner-accounts/{enrollment}/email-statement', [LearnerAccountController::class, 'emailStatement'])->name('learner-accounts.email-statement');
        Route::post('/learner-accounts/receipt/{receipt}/email', [LearnerAccountController::class, 'emailReceipt'])->name('finance.receipt.email');
        Route::patch('/learner-accounts/{enrollment}/receipt-email', [LearnerAccountController::class, 'updateReceiptEmail'])->name('learner-accounts.update-receipt-email');
        Route::get('/learner-accounts/installment/{plan}', [LearnerAccountController::class, 'showInstallmentPlan'])->name('learner-accounts.installment.print');
        Route::post('/learner-accounts/installment/{plan}/email', [LearnerAccountController::class, 'emailInstallmentPlan'])->name('learner-accounts.installment.email');
    });
});

Route::middleware(['auth', 'module:audit_trail'])->group(function () {
    Route::get('/audit-trail', [\App\Http\Controllers\AuditTrailController::class, 'index'])->name('audit-trail.index');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
    Route::patch('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
    Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('users.role.update');
    Route::patch('/roles/{role}/modules/{module}', [UserManagementController::class, 'updateModulePermission'])->name('roles.modules.update');

    Route::post('/academic-years', [AcademicYearController::class, 'store'])->name('academic-years.store');
    Route::patch('/academic-years/{academicYear}', [AcademicYearController::class, 'update'])->name('academic-years.update');
    Route::post('/academic-years/{academicYear}/activate', [AcademicYearController::class, 'activate'])->name('academic-years.activate');
    Route::delete('/academic-years/{academicYear}', [AcademicYearController::class, 'destroy'])->name('academic-years.destroy');

    Route::get('/roles', [\App\Http\Controllers\RoleController::class, 'index'])->name('roles.index');
    Route::post('/roles', [\App\Http\Controllers\RoleController::class, 'store'])->name('roles.store');
    Route::put('/roles/{role}', [\App\Http\Controllers\RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [\App\Http\Controllers\RoleController::class, 'destroy'])->name('roles.destroy');
    Route::post('/users/{user}/roles', [\App\Http\Controllers\RoleController::class, 'assignUserRoles'])->name('users.roles.assign');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
