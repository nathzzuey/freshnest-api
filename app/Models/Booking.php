<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'firebase_uid',
        'email',
        'customer_name',
        'service_id',
        'staff_id',
        'approved_by',
        'service_title',
        'booking_date',
        'booking_time',
        'address',
        'notes',
        'status',
        'approved_at',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'approved_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    // NEW: multiple assigned staff
    public function staffs(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'booking_staff', 'booking_id', 'staff_id')
            ->withTimestamps();
    }
}