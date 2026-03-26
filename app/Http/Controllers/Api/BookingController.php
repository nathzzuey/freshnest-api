<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['customer', 'staff', 'staffs', 'approver', 'service'])
            ->latest();

        if ($request->filled('booking_date')) {
            $query->whereDate('booking_date', $request->booking_date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(
            $query->get()->map(function ($booking) {
                return [
                    ...$booking->toArray(),
                    'staff_name' => $booking->staff?->name,
                    'staff_names' => $booking->staffs->pluck('name')->values(),
                ];
            })
        );
    }

    public function myBookings($firebaseUid, Request $request)
    {
        $query = Booking::with(['customer', 'staff', 'staffs', 'approver', 'service'])
            ->where('firebase_uid', $firebaseUid)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'success' => true,
            'bookings' => $query->get()->map(function ($booking) {
                return [
                    ...$booking->toArray(),
                    'staff_name' => $booking->staff?->name,
                    'staff_names' => $booking->staffs->pluck('name')->values(),
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'firebase_uid'   => 'required|string|max:255',
            'email'          => 'nullable|email|max:255',
            'customer_name'  => 'required|string|max:255',
            'service_id'     => 'required|exists:services,id',
            'service_title'  => 'required|string|max:255',
            'booking_date'   => 'required|date',
            'booking_time'   => 'required|string|max:50',
            'address'        => 'required|string|max:500',
            'notes'          => 'nullable|string',
            'status'         => 'nullable|string|max:50',
        ]);

        $bookingDate = Carbon::parse($validated['booking_date'])->startOfDay();
        $today = Carbon::today();
        $maxBookingDate = Carbon::today()->addDays(16);

        if ($bookingDate->lt($today) || $bookingDate->gt($maxBookingDate)) {
            return response()->json([
                'message' => 'Booking is only allowed from ' .
                    $today->format('Y-m-d') .
                    ' up to ' .
                    $maxBookingDate->format('Y-m-d') .
                    '.',
            ], 422);
        }

        try {
            $selectedTime = Carbon::createFromFormat('g:i A', strtoupper(trim($validated['booking_time'])));
        } catch (\Throwable $e) {
            try {
                $selectedTime = Carbon::createFromFormat('g:iA', strtoupper(trim($validated['booking_time'])));
            } catch (\Throwable $e) {
                return response()->json([
                    'message' => 'Invalid booking time format. Use format like 8:00 AM.',
                ], 422);
            }
        }

        $selectedHour = (int) $selectedTime->format('H');
        $selectedMinute = (int) $selectedTime->format('i');

        $totalMinutes = ($selectedHour * 60) + $selectedMinute;
        $openingMinutes = 8 * 60;
        $closingMinutes = 17 * 60;

        if ($totalMinutes < $openingMinutes || $totalMinutes > $closingMinutes) {
            return response()->json([
                'message' => 'Booking is only available from 8:00 AM to 5:00 PM.',
            ], 422);
        }

        $sameDayBookings = Booking::whereDate('booking_date', $bookingDate->toDateString())->get();

        $existingUserBooking = Booking::whereDate('booking_date', $bookingDate->toDateString())
            ->where('firebase_uid', $validated['firebase_uid'])
            ->where('status', '!=', 'cancelled')
            ->exists();

        if ($existingUserBooking) {
            return response()->json([
                'message' => 'You already have a booking for this date. Cancel it before creating another booking for the same day.',
            ], 422);
        }

        if ($sameDayBookings->count() >= 5) {
            return response()->json([
                'message' => 'Only 5 bookings are allowed for this date. Please choose another date.',
            ], 422);
        }

        foreach ($sameDayBookings as $existingBooking) {
            if (!$existingBooking->booking_time) {
                continue;
            }

            try {
                $existingTime = Carbon::createFromFormat('g:i A', strtoupper(trim($existingBooking->booking_time)));
            } catch (\Throwable $e) {
                try {
                    $existingTime = Carbon::createFromFormat('g:iA', strtoupper(trim($existingBooking->booking_time)));
                } catch (\Throwable $e) {
                    continue;
                }
            }

            if ($selectedTime->format('H:i') === $existingTime->format('H:i')) {
                return response()->json([
                    'message' => 'This service is not available for this time and date. Try another time and date.',
                ], 422);
            }

            $diffInMinutes = abs($selectedTime->diffInMinutes($existingTime));

            if ($diffInMinutes < 180) {
                return response()->json([
                    'message' => 'This service is not available for this time and date. Same-day bookings must have at least 3 hours interval.',
                ], 422);
            }
        }

        $matchedUser = null;

        if (!empty($validated['email'])) {
            $matchedUser = User::where('email', $validated['email'])->first();
        }

        $booking = Booking::create([
            'user_id'       => $matchedUser?->id,
            'firebase_uid'  => $validated['firebase_uid'],
            'email'         => $validated['email'] ?? null,
            'customer_name' => $validated['customer_name'],
            'service_id'    => $validated['service_id'],
            'service_title' => $validated['service_title'],
            'booking_date'  => $bookingDate->toDateString(),
            'booking_time'  => strtoupper(trim($validated['booking_time'])),
            'address'       => $validated['address'],
            'notes'         => $validated['notes'] ?? null,
            'status'        => $validated['status'] ?? 'pending',
        ]);

        return response()->json([
            'message' => 'Booking created successfully.',
            'booking' => [
                ...$booking->load(['customer', 'staff', 'staffs', 'approver', 'service'])->toArray(),
                'staff_name' => $booking->staff?->name,
                'staff_names' => $booking->staffs->pluck('name')->values(),
            ],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string|max:50',
        ]);

        $allowedStatuses = [
            'pending',
            'assigned',
            'approved',
            'in_progress',
            'completed',
            'cancelled',
        ];

        if (!in_array($validated['status'], $allowedStatuses)) {
            return response()->json([
                'message' => 'Invalid booking status.',
            ], 422);
        }

        $updateData = [
            'status' => $validated['status'],
        ];

        if (in_array($validated['status'], ['assigned', 'approved']) && !$booking->approved_at) {
            $updateData['approved_at'] = now();
        }

        if (in_array($validated['status'], ['assigned', 'approved']) && auth()->check()) {
            $updateData['approved_by'] = auth()->id();
        }

        $booking->update($updateData);
        $booking->load(['customer', 'staff', 'staffs', 'approver', 'service']);

        return response()->json([
            'message' => 'Booking status updated successfully.',
            'booking' => [
                ...$booking->toArray(),
                'staff_name' => $booking->staff?->name,
                'staff_names' => $booking->staffs->pluck('name')->values(),
            ],
        ]);
    }

    public function destroy($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found.',
            ], 404);
        }

        $booking->staffs()->detach();
        $booking->delete();

        return response()->json([
            'message' => 'Booking deleted successfully.',
        ]);
    }

    public function assignStaff(Request $request, $id)
    {
        $validated = $request->validate([
            'staff_ids' => ['required', 'array', 'min:1'],
            'staff_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $booking = Booking::with(['staffs'])->find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found.',
            ], 404);
        }

        $staffUsers = User::whereIn('id', $validated['staff_ids'])
            ->where('role', 'staff')
            ->orderBy('name')
            ->get();

        if ($staffUsers->count() !== count($validated['staff_ids'])) {
            return response()->json([
                'message' => 'One or more selected users are not staff members.',
            ], 422);
        }

        $booking->staffs()->sync($validated['staff_ids']);

        $primaryStaffId = $staffUsers->first()?->id;

        $booking->update([
            'staff_id' => $primaryStaffId,
            'status' => $booking->status === 'pending' ? 'assigned' : $booking->status,
            'approved_at' => $booking->approved_at ?? now(),
            'approved_by' => auth()->check() ? auth()->id() : $booking->approved_by,
        ]);

        $booking->load(['customer', 'staff', 'staffs', 'approver', 'service']);

        return response()->json([
            'message' => 'Team assigned successfully.',
            'booking' => [
                ...$booking->toArray(),
                'staff_name' => $booking->staff?->name,
                'staff_names' => $booking->staffs->pluck('name')->values(),
            ],
        ]);
    }

    public function cancelBooking($id, Request $request)
    {
        $validated = $request->validate([
            'firebase_uid' => 'required|string|max:255',
        ]);

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        if ($booking->firebase_uid !== $validated['firebase_uid']) {
            return response()->json([
                'success' => false,
                'message' => 'You are not allowed to cancel this booking.',
            ], 403);
        }

        $currentStatus = strtolower((string) $booking->status);

        if (in_array($currentStatus, ['completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'This booking can no longer be cancelled.',
            ], 422);
        }

        $booking->update([
            'status' => 'cancelled',
        ]);

        $booking->load(['customer', 'staff', 'staffs', 'approver', 'service']);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully.',
            'booking' => [
                ...$booking->toArray(),
                'staff_name' => $booking->staff?->name,
                'staff_names' => $booking->staffs->pluck('name')->values(),
            ],
        ]);
    }

    public function approveAndAssign(Request $request, $id)
    {
        $validated = $request->validate([
            'staff_ids' => ['required', 'array', 'min:1'],
            'staff_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $booking = Booking::with(['staffs'])->find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found.',
            ], 404);
        }

        $staffUsers = User::whereIn('id', $validated['staff_ids'])
            ->where('role', 'staff')
            ->orderBy('name')
            ->get();

        if ($staffUsers->count() !== count($validated['staff_ids'])) {
            return response()->json([
                'message' => 'One or more selected users are not staff members.',
            ], 422);
        }

        $booking->staffs()->sync($validated['staff_ids']);

        $primaryStaffId = $staffUsers->first()?->id;

        $booking->update([
            'staff_id' => $primaryStaffId,
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->check() ? auth()->id() : $booking->approved_by,
        ]);

        $booking->load(['customer', 'staff', 'staffs', 'approver', 'service']);

        return response()->json([
            'message' => 'Booking approved and assigned successfully.',
            'booking' => [
                ...$booking->toArray(),
                'staff_name' => $booking->staff?->name,
                'staff_names' => $booking->staffs->pluck('name')->values(),
            ],
        ]);
    }

    public function assignedToStaff(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $bookings = Booking::with(['customer', 'staff', 'staffs', 'approver', 'service'])
            ->whereHas('staffs', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->whereIn('status', ['assigned', 'approved', 'in_progress', 'completed'])
            ->latest()
            ->get()
            ->map(function ($booking) {
                return [
                    ...$booking->toArray(),
                    'staff_name' => $booking->staff?->name,
                    'staff_names' => $booking->staffs->pluck('name')->values(),
                ];
            });

        return response()->json($bookings);
    }
}