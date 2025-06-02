<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Workout;
use App\Models\Exercise;
use App\Models\WorkoutExercise;
use Illuminate\Support\Facades\Auth;

class WorkoutController extends Controller
{
    // Get all workouts for the authenticated user
    public function index()
    {
        $user = Auth::user();
        $workouts = Workout::where('user_id', $user->id)
            ->with('exercises.muscleGroups')
            ->get();
        
        return response()->json($workouts);
    }
    
    // Get a specific workout by ID
    public function show($id)
    {
        $user = Auth::user();
        $workout = Workout::where('id', $id)
            ->where('user_id', $user->id)
            ->with('exercises.muscleGroups')
            ->first();
            
        if (!$workout) {
            return response()->json(['message' => 'Workout not found'], 404);
        }
        
        return response()->json($workout);
    }
    
    // Create a new workout
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $workout = new Workout();
        $workout->name = $request->name;
        $workout->description = $request->description;
        $workout->user_id = $request->user_id;
        $workout->save();

        return response()->json(['message' => 'Workout created successfully', 'workout' => $workout], 201);
    }
    
    // Update an existing workout
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $user = Auth::user();
        $workout = Workout::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$workout) {
            return response()->json(['message' => 'Workout not found'], 404);
        }
        
        if (isset($request->name)) {
            $workout->name = $request->name;
        }
        
        if (isset($request->description)) {
            $workout->description = $request->description;
        }
        
        $workout->save();
        
        return response()->json(['message' => 'Workout updated successfully', 'workout' => $workout]);
    }
    
    // Delete a workout
    public function destroy($id)
    {
        $user = Auth::user();
        $workout = Workout::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$workout) {
            return response()->json(['message' => 'Workout not found'], 404);
        }
        
        // Delete associated workout exercises
        WorkoutExercise::where('workout_id', $workout->id)->delete();
        
        // Delete the workout
        $workout->delete();
        
        return response()->json(['message' => 'Workout deleted successfully']);
    }

    // Add an exercise to a workout
    public function addExerciseToWorkout(Request $request, $workoutId)
    {
        $request->validate([
            'exercise_id' => 'required|integer|exists:exercises,id',
            'set_number' => 'required|integer|min:1',
            'reps' => 'required|integer|min:1',
            'weight' => 'required|numeric|min:0',
            'rest_time' => 'required|integer|min:0',
        ]);

        $user = Auth::user();
        $workout = Workout::where('id', $workoutId)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$workout) {
            return response()->json(['message' => 'Workout not found'], 404);
        }
        
        $workoutExercise = new WorkoutExercise();
        $workoutExercise->workout_id = $workoutId;
        $workoutExercise->exercise_id = $request->exercise_id;
        $workoutExercise->set_number = $request->set_number;
        $workoutExercise->reps = $request->reps;
        $workoutExercise->weight = $request->weight;
        $workoutExercise->rest_time = $request->rest_time;
        $workoutExercise->save();

        return response()->json([
            'message' => 'Exercise added to workout successfully', 
            'workout_exercise' => $workoutExercise
        ], 201);
    }
    
    // Update an exercise in a workout
    public function updateWorkoutExercise(Request $request, $workoutId, $exerciseId, $setNumber)
    {
        $request->validate([
            'reps' => 'sometimes|required|integer|min:1',
            'weight' => 'sometimes|required|numeric|min:0',
            'rest_time' => 'sometimes|required|integer|min:0',
        ]);

        $user = Auth::user();
        $workout = Workout::where('id', $workoutId)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$workout) {
            return response()->json(['message' => 'Workout not found'], 404);
        }
        
        $workoutExercise = WorkoutExercise::where('workout_id', $workoutId)
            ->where('exercise_id', $exerciseId)
            ->where('set_number', $setNumber)
            ->first();
            
        if (!$workoutExercise) {
            return response()->json(['message' => 'Exercise set not found in this workout'], 404);
        }
        
        if (isset($request->reps)) {
            $workoutExercise->reps = $request->reps;
        }
        
        if (isset($request->weight)) {
            $workoutExercise->weight = $request->weight;
        }
        
        if (isset($request->rest_time)) {
            $workoutExercise->rest_time = $request->rest_time;
        }
        
        $workoutExercise->save();
        
        return response()->json([
            'message' => 'Workout exercise updated successfully', 
            'workout_exercise' => $workoutExercise
        ]);
    }
    
    // Remove an exercise from a workout
    public function removeExerciseFromWorkout($workoutId, $exerciseId)
    {
        $user = Auth::user();
        $workout = Workout::where('id', $workoutId)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$workout) {
            return response()->json(['message' => 'Workout not found'], 404);
        }
        
        $deleted = WorkoutExercise::where('workout_id', $workoutId)
            ->where('exercise_id', $exerciseId)
            ->delete();
            
        if (!$deleted) {
            return response()->json(['message' => 'Exercise not found in this workout'], 404);
        }
        
        return response()->json(['message' => 'Exercise removed from workout successfully']);
    }
}