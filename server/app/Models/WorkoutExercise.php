<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkoutExercise extends Model
{
    use HasFactory;

    protected $table = 'workout_exercises';    protected $fillable = [
        'workout_id',
        'exercise_id',
        'set_number',
        'reps',
        'weight',
        'rest_time',
        'duration',
    ];

    /**
     * Define the relationship to the Workout model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function workout()
    {
        return $this->belongsTo(Workout::class);
    }

    /**
     * Define the relationship to the Exercise model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function exercise()
    {
        return $this->belongsTo(Exercise::class);
    }
}