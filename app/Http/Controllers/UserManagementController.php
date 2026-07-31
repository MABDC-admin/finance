<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    private const ROLES = ['user', 'registrar', 'admin'];

    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::query()
                ->orderBy('id')
                ->get(['id', 'name', 'email', 'role', 'created_at']),
            'roles' => self::ROLES,
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(self::ROLES)],
        ]);

        if ($user->role === 'admin' && $validated['role'] !== 'admin') {
            abort_if(User::query()->where('role', 'admin')->count() <= 1, 422, 'At least one admin account is required.');
        }

        $user->update(['role' => $validated['role']]);

        return redirect()->route('users.index');
    }
}
