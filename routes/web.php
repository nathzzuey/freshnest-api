<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Service;
use App\Models\Booking;
use App\Models\User;
use App\Http\Controllers\Admin\StaffController;
use Illuminate\Support\Facades\Storage;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;

Route::get('/firebase-test', function (FirebaseAuth $firebaseAuth) {
    return response()->json([
        'message' => 'Firebase connected',
    ]);
});

Route::get('/check-image', function () {
    $path = 'services/t7FWqKP2xyRpwTMJhP6ox0QX36siWoDB4I8vj1ia.jpg';

    return response()->json([
        'exists_public_disk' => Storage::disk('public')->exists($path),
        'php_file_exists' => file_exists(storage_path('app/public/' . $path)),
        'asset_url' => asset('storage/' . $path),
        'full_path' => storage_path('app/public/' . $path),
    ]);
});

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::post('/logout', function () {
    return redirect()->route('home');
})->name('logout');

Route::prefix('admin')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Admin/Login');
    })->name('admin.login');

    Route::post('/login', function (Request $request) {
        $email = $request->input('email');
        $password = $request->input('password');

        if ($email === 'admin@freshnest.com' && $password === 'password') {
            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors([
            'message' => 'Invalid login credentials.',
        ]);
    })->name('admin.login.submit');

    Route::get('/dashboard', function () {
        $totalBookings = Booking::count();
        $pendingAppointments = Booking::where('status', 'pending')->count();
        $completedServices = Booking::where('status', 'completed')->count();
        $activeStaff = User::where('role', 'staff')->count();

        $recentAppointments = Booking::leftJoin('services', 'bookings.service_id', '=', 'services.id')
            ->select(
                'bookings.id',
                'bookings.customer_name',
                'bookings.service_title',
                'bookings.booking_date',
                'bookings.booking_time',
                'bookings.status',
                'services.price as service_price'
            )
            ->latest('bookings.created_at')
            ->take(2)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'customer_name' => $booking->customer_name ?? 'Customer',
                    'service_title' => $booking->service_title ?? 'Service',
                    'booking_date' => $booking->booking_date ?? null,
                    'booking_time' => $booking->booking_time ?? null,
                    'price' => $booking->service_price ?? 0,
                    'status' => $booking->status ?? 'pending',
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalBookings' => $totalBookings,
                'pendingAppointments' => $pendingAppointments,
                'completedServices' => $completedServices,
                'activeStaff' => $activeStaff,
            ],
            'recentAppointments' => $recentAppointments,
        ]);
    })->name('admin.dashboard');

    Route::get('/appointments', function () {
        return Inertia::render('Admin/Appointments');
    })->name('admin.appointments');

    Route::get('/staff', [StaffController::class, 'index'])->name('admin.staff');
    Route::post('/staff', [StaffController::class, 'store'])->name('admin.staff.store');
    Route::put('/staff/{user}', [StaffController::class, 'update'])->name('admin.staff.update');
    Route::delete('/staff/{user}', [StaffController::class, 'destroy'])->name('admin.staff.destroy');

    Route::get('/analytics', function () {
        $monthMap = [
            '01' => 'Jan',
            '02' => 'Feb',
            '03' => 'Mar',
            '04' => 'Apr',
            '05' => 'May',
            '06' => 'Jun',
            '07' => 'Jul',
            '08' => 'Aug',
            '09' => 'Sep',
            '10' => 'Oct',
            '11' => 'Nov',
            '12' => 'Dec',
        ];

        $monthlyRaw = Booking::leftJoin('services', 'bookings.service_id', '=', 'services.id')
            ->selectRaw("
                strftime('%m', bookings.created_at) as month_num,
                SUM(COALESCE(services.price, 0)) as total_revenue
            ")
            ->groupBy('month_num')
            ->orderBy('month_num')
            ->get();

        $maxRevenue = max((float) ($monthlyRaw->max('total_revenue') ?? 0), 1);

        $monthlyRevenue = $monthlyRaw->map(function ($item) use ($monthMap, $maxRevenue) {
            $amount = (float) ($item->total_revenue ?? 0);
            $width = ($amount / $maxRevenue) * 100;

            return [
                'month' => $monthMap[$item->month_num] ?? $item->month_num,
                'amount' => round($amount, 2),
                'width' => round($width, 2) . '%',
            ];
        })->values();

        $topServicesRaw = Booking::leftJoin('services', 'bookings.service_id', '=', 'services.id')
            ->selectRaw("
                bookings.service_title as service_name,
                COUNT(bookings.id) as bookings_count,
                SUM(COALESCE(services.price, 0)) as total_revenue
            ")
            ->groupBy('bookings.service_title')
            ->orderByDesc('bookings_count')
            ->limit(5)
            ->get();

        $maxBookings = max((int) ($topServicesRaw->max('bookings_count') ?? 0), 1);

        $topServices = $topServicesRaw->map(function ($item) use ($maxBookings) {
            $count = (int) ($item->bookings_count ?? 0);
            $percent = ($count / $maxBookings) * 100;

            return [
                'name' => $item->service_name ?? 'Service',
                'bookings' => $count,
                'revenue' => round((float) ($item->total_revenue ?? 0), 2),
                'percent' => round($percent, 2) . '%',
            ];
        })->values();

        return Inertia::render('Admin/Analytics', [
            'monthlyRevenue' => $monthlyRevenue,
            'topServices' => $topServices,
        ]);
    })->name('admin.analytics');

    Route::get('/services', function () {
        $services = Service::latest()->get()->map(function ($service) {
            return [
                'id' => $service->id,
                'title' => $service->title,
                'category' => $service->category,
                'description' => $service->description,
                'price' => $service->price,
                'image' => $service->image,
                'image_url' => $service->image ? asset('storage/' . $service->image) : null,
                'is_active' => $service->is_active,
                'created_at' => $service->created_at,
                'updated_at' => $service->updated_at,
            ];
        });

        return Inertia::render('Admin/Services', [
            'services' => $services,
        ]);
    })->name('admin.services');

    Route::post('/services', function (Request $request) {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('services', 'public');
        }

        Service::create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'image' => $imagePath,
            'is_active' => true,
        ]);

        return redirect()
            ->route('admin.services')
            ->with('success', 'Service added successfully.');
    })->name('admin.services.store');

    Route::post('/services/{service}', function (Request $request, Service $service) {
        $method = strtoupper((string) $request->input('_method', ''));

        if ($method === 'PUT') {
            $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'category' => ['required', 'string', 'max:100'],
                'description' => ['required', 'string'],
                'price' => ['required', 'numeric', 'min:0'],
                'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            ]);

            $imagePath = $service->image;

            if ($request->hasFile('image')) {
                if ($service->image && Storage::disk('public')->exists($service->image)) {
                    Storage::disk('public')->delete($service->image);
                }

                $imagePath = $request->file('image')->store('services', 'public');
            }

            $service->update([
                'title' => $validated['title'],
                'category' => $validated['category'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'image' => $imagePath,
            ]);

            return redirect()
                ->route('admin.services')
                ->with('success', 'Service updated successfully.');
        }

        if ($method === 'DELETE') {
            if ($service->image && Storage::disk('public')->exists($service->image)) {
                Storage::disk('public')->delete($service->image);
            }

            $service->delete();

            return redirect()
                ->route('admin.services')
                ->with('success', 'Service deleted successfully.');
        }

        abort(405, 'Method not supported.');
    })->name('admin.services.handle');

    Route::put('/services/{service}', function (Request $request, Service $service) {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $imagePath = $service->image;

        if ($request->hasFile('image')) {
            if ($service->image && Storage::disk('public')->exists($service->image)) {
                Storage::disk('public')->delete($service->image);
            }

            $imagePath = $request->file('image')->store('services', 'public');
        }

        $service->update([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'image' => $imagePath,
        ]);

        return redirect()
            ->route('admin.services')
            ->with('success', 'Service updated successfully.');
    })->name('admin.services.update');

    Route::delete('/services/{service}', function (Service $service) {
        if ($service->image && Storage::disk('public')->exists($service->image)) {
            Storage::disk('public')->delete($service->image);
        }

        $service->delete();

        return redirect()
            ->route('admin.services')
            ->with('success', 'Service deleted successfully.');
    })->name('admin.services.destroy');
});