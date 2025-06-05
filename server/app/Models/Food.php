<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Food extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'foods';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'calories',
        'protein',
        'carbs',
        'fat',
        'serving_size',
        'serving_unit',
        'user_id',
        'is_public',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'calories' => 'integer',
        'protein' => 'float',
        'carbs' => 'float',
        'fat' => 'float',
        'serving_size' => 'float',
        'is_public' => 'boolean',
    ];

    /**
     * Get the user that created the food.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the meal log items that include this food.
     */
    public function mealLogItems(): HasMany
    {
        return $this->hasMany(MealLogItem::class);
    }
}
