<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealLogItem extends Model
{
    use HasFactory;    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'meal_log_id',
        'food_id',
        'quantity',
        'measurement_unit',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'float',
    ];

    /**
     * Get the meal log that owns the meal log item.
     */
    public function mealLog(): BelongsTo
    {
        return $this->belongsTo(MealLog::class);
    }

    /**
     * Get the food that is referenced by the meal log item.
     */
    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }    /**
     * Convert the quantity to grams based on the measurement unit
     */
    protected function convertToGrams()
    {
        $quantity = $this->quantity;
        $unit = $this->measurement_unit ?? 'g';
        
        // If unit is already grams, just return the quantity
        if ($unit === 'g') {
            return $quantity;
        }
        
        // Convert other units to grams
        if ($unit === 'oz') {
            return $quantity * 28.35; // 1 oz = 28.35g
        }
        
        // For other units, we'll need to estimate or use standard conversions
        // These are approximations and may vary by food density
        if ($unit === 'cup') {
            return $quantity * 240; // ~240g per cup (very approximate)
        }
        
        if ($unit === 'tbsp') {
            return $quantity * 15; // ~15g per tablespoon
        }
        
        if ($unit === 'tsp') {
            return $quantity * 5; // ~5g per teaspoon
        }
        
        if ($unit === 'ml') {
            return $quantity; // 1ml water = ~1g
        }
        
        if ($unit === 'piece') {
            return $quantity * 100; // Assuming a piece is roughly 100g
        }
        
        // Default fallback
        return $quantity;
    }

    /**
     * Calculate the calories for this meal log item.
     */
    public function getCaloriesAttribute()
    {
        $grams = $this->convertToGrams();
        return $this->food->calories * ($grams / 100);
    }

    /**
     * Calculate the protein for this meal log item.
     */
    public function getProteinAttribute()
    {
        $grams = $this->convertToGrams();
        return $this->food->protein * ($grams / 100);
    }

    /**
     * Calculate the carbs for this meal log item.
     */
    public function getCarbsAttribute()
    {
        $grams = $this->convertToGrams();
        return $this->food->carbs * ($grams / 100);
    }

    /**
     * Calculate the fat for this meal log item.
     */
    public function getFatAttribute()
    {
        $grams = $this->convertToGrams();
        return $this->food->fat * ($grams / 100);
    }
}
