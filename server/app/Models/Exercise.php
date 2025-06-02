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
        'media_url',
        'media_type',
        'is_public',
        'user_id',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Define the relationship to the Workout model through the pivot table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */    public function workouts()
    {
        return $this->belongsToMany(Workout::class, 'workout_exercises')
                    ->withPivot('sets', 'reps', 'duration')
                    ->withTimestamps();
    }

    /**
     * Define the relationship to the MuscleGroup model through the pivot table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */    
    public function muscleGroups()
    {
        return $this->belongsToMany(MuscleGroup::class, 'exercise_muscle_group')
            ->withTimestamps();
    }

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