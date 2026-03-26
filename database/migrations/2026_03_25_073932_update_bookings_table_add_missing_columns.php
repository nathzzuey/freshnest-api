<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'customer_name')) {
                $table->string('customer_name')->after('user_id');
            }

            if (!Schema::hasColumn('bookings', 'staff_id')) {
                $table->foreignId('staff_id')->nullable()->after('service_id')->constrained('users')->nullOnDelete();
            }

            if (!Schema::hasColumn('bookings', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('staff_id')->constrained('users')->nullOnDelete();
            }

            if (!Schema::hasColumn('bookings', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'approved_by')) {
                $table->dropConstrainedForeignId('approved_by');
            }

            if (Schema::hasColumn('bookings', 'staff_id')) {
                $table->dropConstrainedForeignId('staff_id');
            }

            if (Schema::hasColumn('bookings', 'customer_name')) {
                $table->dropColumn('customer_name');
            }

            if (Schema::hasColumn('bookings', 'approved_at')) {
                $table->dropColumn('approved_at');
            }
        });
    }
};