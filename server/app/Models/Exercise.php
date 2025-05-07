<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'calories_burned_per_minute',
    ];

    /**
     * Define the relationship to the Workout model through the pivot table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function workouts()
    {
        return $this->belongsToMany(Workout::class, 'workout_exercises')
                    ->withPivot('sets', 'reps', 'duration')
                    ->withTimestamps();
    }
}