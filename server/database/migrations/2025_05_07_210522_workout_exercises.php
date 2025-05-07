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
        Schema::create('workout_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_id')->constrained()->onDelete('cascade'); // Links to the workouts table
            $table->foreignId('exercise_id')->constrained()->onDelete('cascade'); // Links to the exercises table
            $table->integer('sets')->nullable(); // Number of sets for the exercise
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
    }
};