<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;
use Throwable;

class StaffController extends Controller
{
    public function index()
    {
        $staff = User::where('role', 'staff')
            ->latest()
            ->get(['id', 'name', 'email', 'phone', 'job_type'])
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->job_type ?? 'Staff',
                    'email' => $user->email,
                    'phone' => $user->phone ?? '-',
                    'status' => 'Active',
                ];
            });

        return Inertia::render('Admin/Staff', [
            'staff' => $staff,
        ]);
    }

    // ✅ For /api/staffs dropdown
    public function apiIndex(): JsonResponse
    {
        $staffs = User::where('role', 'staff')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'job_type'])
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'job_type' => $user->job_type ?? 'Staff',
                ];
            });

        return response()->json($staffs);
    }

    public function store(Request $request, FirebaseAuth $firebaseAuth)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'in:Cleaner,Plumber,Repairer,Painter'],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        DB::beginTransaction();

        try {
            $firebaseUser = $firebaseAuth->createUser([
                'email' => $validated['email'],
                'password' => $validated['password'],
                'displayName' => $validated['name'],
                'disabled' => false,
            ]);

            User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => 'staff',
                'job_type' => $validated['role'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'firebase_uid' => $firebaseUser->uid,
            ]);

            DB::commit();

            return redirect()
                ->route('admin.staff')
                ->with('success', 'Staff added successfully.');
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Failed to create staff account', [
                'message' => $e->getMessage(),
            ]);

            return redirect()
                ->route('admin.staff')
                ->withErrors([
                    'message' => 'Failed to create staff account in Firebase.',
                ]);
        }
    }

    public function update(Request $request, User $user, FirebaseAuth $firebaseAuth)
    {
        if ($user->role !== 'staff') {
            return redirect()
                ->route('admin.staff')
                ->withErrors([
                    'message' => 'This account is not a staff account.',
                ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', 'in:Cleaner,Plumber,Repairer,Painter'],
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ]);

        DB::beginTransaction();

        try {
            if (!empty($user->firebase_uid)) {
                $firebasePayload = [
                    'email' => $validated['email'],
                    'displayName' => $validated['name'],
                ];

                if (!empty($validated['password'])) {
                    $firebasePayload['password'] = $validated['password'];
                }

                $firebaseAuth->updateUser($user->firebase_uid, $firebasePayload);
            }

            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'job_type' => $validated['role'],
                'phone' => $validated['phone'],
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            DB::commit();

            return redirect()
                ->route('admin.staff')
                ->with('success', 'Staff updated successfully.');
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Failed to update staff account', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return redirect()
                ->route('admin.staff')
                ->withErrors([
                    'message' => 'Failed to update staff account.',
                ]);
        }
    }

    public function destroy(User $user, FirebaseAuth $firebaseAuth)
    {
        if ($user->role !== 'staff') {
            return redirect()
                ->route('admin.staff')
                ->withErrors([
                    'message' => 'This account is not a staff account.',
                ]);
        }

        DB::beginTransaction();

        try {
            if (!empty($user->firebase_uid)) {
                $firebaseAuth->deleteUser($user->firebase_uid);
            }

            $user->delete();

            DB::commit();

            return redirect()
                ->route('admin.staff')
                ->with('success', 'Staff removed successfully.');
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('Failed to delete staff account', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return redirect()
                ->route('admin.staff')
                ->withErrors([
                    'message' => 'Failed to delete staff account.',
                ]);
        }
    }
}