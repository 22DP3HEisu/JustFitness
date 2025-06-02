<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workout extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'duration',
        'is_public',
        'user_id',
    ];

    public function exercises()
    {
        // Update the withPivot to include set_number instead of sets
        return $this->belongsToMany(Exercise::class, 'workout_exercises')
            ->withPivot('set_number', 'reps', 'weight', 'rest_time', 'created_at', 'updated_at')
            ->withTimestamps();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}