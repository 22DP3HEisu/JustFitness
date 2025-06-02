<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the table if it exists
        Schema::dropIfExists('muscle_groups');
        
        // Create the muscle_groups table
        Schema::create('muscle_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });
        
        // Seed some default muscle groups
        $muscleGroups = [
            // Major muscle groups with simpler names
            ['name' => 'Chest', 'description' => 'Pectoral muscles including upper, middle, and lower chest'],
            ['name' => 'Back', 'description' => 'Upper and middle back including lats and traps'],
            ['name' => 'Shoulders', 'description' => 'All three shoulder heads (front, side, and rear)'],
            ['name' => 'Biceps', 'description' => 'Front of the upper arm - used for pulling movements'],
            ['name' => 'Triceps', 'description' => 'Back of the upper arm - used for pushing movements'],
            ['name' => 'Forearms', 'description' => 'Lower arm muscles - important for grip strength'],
            ['name' => 'Abs', 'description' => 'Abdominal muscles including rectus abdominis and obliques'],
            ['name' => 'Lower Back', 'description' => 'Muscles supporting the lower spine and posture'],
            ['name' => 'Quads', 'description' => 'Front of the thigh - used for squats and leg extensions'],
            ['name' => 'Hamstrings', 'description' => 'Back of the thigh - used for leg curls and deadlifts'],
            ['name' => 'Calves', 'description' => 'Lower leg muscles - used for ankle movement and jumping'],
            ['name' => 'Glutes', 'description' => 'Buttocks muscles - important for hip extension and power'],
        ];
        
        foreach ($muscleGroups as $group) {
            DB::table('muscle_groups')->insert([
                'name' => $group['name'],
                'description' => $group['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('muscle_groups');
    }
};
