<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Service;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\MobileAuthController;
use App\Http\Controllers\Admin\StaffController;

Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API working',
    ], 200);
});

/*
|--------------------------------------------------------------------------
| Customer/User Sync
|--------------------------------------------------------------------------
*/
Route::post('/me', function (Request $request) {
    try {
        $validated = $request->validate([
            'firebase_uid' => ['required', 'string'],
            'email' => ['nullable', 'email'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $firebaseUid = trim($validated['firebase_uid']);
        $email = isset($validated['email']) ? trim($validated['email']) : null;
        $name = isset($validated['name']) && trim($validated['name']) !== ''
            ? trim($validated['name'])
            : 'User';

        $user = User::where('firebase_uid', $firebaseUid)->first();

        if (!$user && $email) {
            $user = User::where('email', $email)->first();

            if ($user) {
                $user->update([
                    'firebase_uid' => $firebaseUid,
                    'name' => $name ?: $user->name,
                ]);
            }
        }

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'firebase_uid' => $firebaseUid,
                'role' => 'user',
                'password' => bcrypt(Str::random(32)),
            ]);
        } else {
            $updateData = [];

            if (!empty($name) && $name !== $user->name) {
                $updateData['name'] = $name;
            }

            if (!empty($email) && $email !== $user->email) {
                $updateData['email'] = $email;
            }

            if (empty($user->firebase_uid)) {
                $updateData['firebase_uid'] = $firebaseUid;
            }

            if (!empty($updateData)) {
                $user->update($updateData);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'User synced successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'firebase_uid' => $user->firebase_uid,
                'role' => $user->role,
            ],
        ], 200);
    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed.',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Server error.',
            'error' => $e->getMessage(),
        ], 500);
    }
});

/*
|--------------------------------------------------------------------------
| Staff Mobile Login Verification
|--------------------------------------------------------------------------
*/
Route::post('/mobile/login', [MobileAuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Services
|--------------------------------------------------------------------------
*/
Route::get('/services', function () {
    try {
        $services = Service::where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'services' => $services,
        ], 200);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch services.',
            'error' => $e->getMessage(),
        ], 500);
    }
});

/*
|--------------------------------------------------------------------------
| Staff List
|--------------------------------------------------------------------------
*/
Route::get('/staffs', [StaffController::class, 'apiIndex']);

/*
|--------------------------------------------------------------------------
| Booking Routes
|--------------------------------------------------------------------------
*/
Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/my-bookings/{firebaseUid}', [BookingController::class, 'myBookings']);
Route::get('/bookings/date/{booking_date}', [BookingController::class, 'index']);

Route::put('/bookings/{id}', [BookingController::class, 'update']);
Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
Route::post('/bookings/{id}/assign-staff', [BookingController::class, 'assignStaff']);
Route::patch('/bookings/{id}/cancel', [BookingController::class, 'cancelBooking']);

/*
|--------------------------------------------------------------------------
| Staff Assigned Bookings
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/staff/bookings', [BookingController::class, 'assignedToStaff']);
});