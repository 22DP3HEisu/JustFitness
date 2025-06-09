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
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('weight')->nullable()->comment('in kilograms');
            $table->integer('height')->nullable()->comment('in centimeters');
            $table->date('age')->nullable()->comment('stored as birth date');
            $table->integer('goal_weight')->nullable()->comment('in kilograms');
            $table->enum('activity_level', ['light', 'moderate', 'active', 'very_active'])->default('moderate');
            $table->enum('unit_preference', ['metric', 'imperial'])->default('metric');
            $table->timestamps();
            
            // Each user can only have one preferences record
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
