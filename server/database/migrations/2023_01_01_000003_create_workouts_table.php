<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the tables if they exist
        Schema::dropIfExists('workout_exercises');
        Schema::dropIfExists('workouts');
        
        // Create the workouts table
        Schema::create('workouts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(true);
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
        
        // Create the workout_exercises pivot table
        Schema::create('workout_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_id')->constrained()->onDelete('cascade'); // Links to the workouts table
            $table->foreignId('exercise_id')->constrained()->onDelete('cascade'); // Links to the exercises table
            $table->integer('set_number')->default(1); // Number of the set in the sequence
            $table->integer('reps')->nullable(); // Number of repetitions per set
            $table->double('weight')->nullable(); // Weight used for the exercise
            $table->integer('rest_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_exercises');
        Schema::dropIfExists('workouts');
    }
};
