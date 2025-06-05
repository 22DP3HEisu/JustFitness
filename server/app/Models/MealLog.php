<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MealLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'date',
        'meal_type',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Get the user that owns the meal log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the meal log items for this meal log.
     */
    public function items(): HasMany
    {
        return $this->hasMany(MealLogItem::class);
    }

    /**
     * Get the foods for this meal log through items.
     */
    public function foods()
    {
        return $this->hasManyThrough(
            Food::class,
            MealLogItem::class,
            'meal_log_id',
            'id',
            'id',
            'food_id'
        );
    }    /**
     * Calculate the total calories for this meal log.
     */
    public function getTotalCaloriesAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->getCaloriesAttribute();
        });
    }

    /**
     * Calculate the total protein for this meal log.
     */
    public function getTotalProteinAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->getProteinAttribute();
        });
    }

    /**
     * Calculate the total carbs for this meal log.
     */
    public function getTotalCarbsAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->getCarbsAttribute();
        });
    }    /**
     * Calculate the total fat for this meal log.
     */
    public function getTotalFatAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->getFatAttribute();
        });
    }
}
