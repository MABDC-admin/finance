<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentRequirementController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LearnerController;
use App\Http\Controllers\ProfileController;
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
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/learners', [LearnerController::class, 'index'])->name('learners.index');
    Route::patch('/learners/{learner}/documents/{documentRequirement}', [DocumentRequirementController::class, 'update'])
        ->name('learners.documents.update');
    Route::get('/learners/{learner}', [LearnerController::class, 'show'])->name('learners.show');
    Route::get('/imports', [ImportController::class, 'index'])->name('imports.index');
    Route::post('/imports', [ImportController::class, 'store'])->name('imports.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
