<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->setupRailwaySqlite();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Setup SQLite database automatically for Railway production.
     */
    protected function setupRailwaySqlite(): void
    {
        if (! app()->isProduction()) {
            return;
        }

        if (env('DB_CONNECTION') !== 'sqlite') {
            return;
        }

        $databasePath = env('DB_DATABASE', '/data/database.sqlite');

        try {
            if (! File::exists('/data')) {
                File::ensureDirectoryExists('/data');
            }

            if (! File::exists($databasePath)) {
                File::put($databasePath, '');
            }

            if (! app()->runningInConsole()) {
                Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Throwable $e) {
            logger()->error('Railway SQLite setup failed: ' . $e->getMessage());
        }
    }
}