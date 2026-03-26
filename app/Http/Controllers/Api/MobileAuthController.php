<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;
use Throwable;

class MobileAuthController extends Controller
{
    public function login(Request $request, FirebaseAuth $firebaseAuth)
    {
        $request->validate([
            'idToken' => ['required', 'string'],
        ]);

        try {
            $verifiedIdToken = $firebaseAuth->verifyIdToken($request->idToken);
            $firebaseUid = $verifiedIdToken->claims()->get('sub');

            $user = User::where('firebase_uid', $firebaseUid)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User record not found.',
                ], 404);
            }

            if ($user->role !== 'staff') {
                return response()->json([
                    'success' => false,
                    'message' => 'This account is not allowed for staff access.',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'message' => 'Login successful.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'job_type' => $user->job_type,
                    'phone' => $user->phone,
                    'firebase_uid' => $user->firebase_uid,
                ],
            ], 200);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired Firebase token.',
                'error' => $e->getMessage(),
            ], 401);
        }
    }
}