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
        Schema::create('meal_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack']);
            $table->text('notes')->nullable();
            $table->timestamps();

            // A user can only have one of each meal type per day
            $table->unique(['user_id', 'date', 'meal_type']);
        });

        Schema::create('meal_log_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meal_log_id')->constrained()->onDelete('cascade');
            $table->foreignId('food_id')->constrained('foods')->onDelete('cascade');
            $table->float('quantity')->default(1)->comment('Quantity of food');
            $table->string('measurement_unit')->default('g');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_log_items');
        Schema::dropIfExists('meal_logs');
    }
};
