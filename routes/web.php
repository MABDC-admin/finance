<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentRequirementController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LearnerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified', 'role:registrar,admin'])
    ->name('dashboard');

Route::middleware(['auth', 'role:registrar,admin'])->group(function () {
    Route::get('/learners', [LearnerController::class, 'index'])->name('learners.index');
    Route::patch('/learners/{learner}/documents/{documentRequirement}', [DocumentRequirementController::class, 'update'])
        ->name('learners.documents.update');
    Route::get('/learners/{learner}', [LearnerController::class, 'show'])->name('learners.show');
    Route::get('/exports/learners', [ExportController::class, 'learners'])->name('exports.learners');
    Route::get('/exports/missing-documents', [ExportController::class, 'missingDocuments'])->name('exports.missing-documents');
    Route::get('/imports', [ImportController::class, 'index'])->name('imports.index');
    Route::post('/imports', [ImportController::class, 'store'])->name('imports.store');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('users.role.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
