<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Workout;
use App\Models\Exercise;

class WorkoutController extends Controller
{
    // Add a new workout
    public function addWorkout(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $workout = new Workout();
        $workout->name = $request->name;
        $workout->description = $request->description;
        $workout->save();

        return response()->json(['message' => 'Workout added successfully', 'workout' => $workout], 201);
    }

    // Add a new exercise to a workout
    public function addExercise(Request $request, $workoutId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'reps' => 'required|integer',
            'sets' => 'required|integer',
        ]);

        $workout = Workout::find($workoutId);

        if (!$workout) {
            return response()->json(['message' => 'Workout not found'], 404);
        }

        $exercise = new Exercise();
        $exercise->name = $request->name;
        $exercise->reps = $request->reps;
        $exercise->sets = $request->sets;
        $exercise->workout_id = $workout->id;
        $exercise->save();

        return response()->json(['message' => 'Exercise added successfully', 'exercise' => $exercise], 201);
    }
}