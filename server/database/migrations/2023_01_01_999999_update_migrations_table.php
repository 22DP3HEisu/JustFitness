<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {        // Clear out the existing migration records
        DB::table('migrations')->truncate();        // Insert our new consolidated migrations
        $migrations = [
            ['migration' => '2023_01_01_000000_create_users_table', 'batch' => 1],
            ['migration' => '2023_01_01_000001_create_muscle_groups_table', 'batch' => 1],
            ['migration' => '2023_01_01_000002_create_exercises_table', 'batch' => 1],
            ['migration' => '2023_01_01_000003_create_workouts_table', 'batch' => 1],
            ['migration' => '2023_01_01_000004_create_laravel_system_tables', 'batch' => 1],
            ['migration' => '2023_01_02_000000_add_media_url_to_exercises_table', 'batch' => 2],
            ['migration' => '2023_02_01_000000_create_foods_table', 'batch' => 3],
            ['migration' => '2023_02_01_000001_create_meal_logs_table', 'batch' => 3],
            ['migration' => '2023_02_01_000002_create_meal_log_items_table', 'batch' => 3],
        ];

        foreach ($migrations as $migration) {
            DB::table('migrations')->insert([
                'migration' => $migration['migration'],
                'batch' => $migration['batch']
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a one-way migration, no rollback functionality needed
    }
};
