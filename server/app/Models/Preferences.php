<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Preferences extends Model
{
    use HasFactory;

    protected $table = 'user_preferences';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'weight',
        'height', // Stored in centimeters
        'age',
        'goal_weight',
        'activity_level',
        'unit_preference',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weight' => 'integer',
        'height' => 'integer', // Stored in centimeters
        'age' => 'date', // This is actually a birth date
        'goal_weight' => 'integer',
        'activity_level' => 'string', // Enum values like 'light', etc.
        'unit_preference' => 'string', // Enum values like 'metric', 'imperial'
    ];

    /**
     * Define the relationship to the User model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}