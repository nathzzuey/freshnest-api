<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            // CUSTOMER (user)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // FIREBASE USER SUPPORT
            $table->string('firebase_uid')->nullable();
            $table->string('email')->nullable();
            $table->string('customer_name');

            // SERVICE
            $table->foreignId('service_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('service_title');

            // DATE & TIME
            $table->date('booking_date');
            $table->string('booking_time');

            // DETAILS
            $table->text('address');
            $table->text('notes')->nullable();

            // 🔥 STAFF ASSIGNMENT (IMPORTANT)
            $table->foreignId('staff_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // 🔥 ADMIN APPROVAL
            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('approved_at')->nullable();

            // STATUS FLOW
            $table->string('status')->default('pending');
            // pending → assigned → in_progress → completed → cancelled

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};