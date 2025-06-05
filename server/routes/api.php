<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MuscleGroupController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\WorkoutController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\MealLogController;

// Authentication routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('preferences');
    });

    Route::post("/logout", [AuthController::class, "logout"])->name("logout");
    Route::apiResource('exercises', controller: ExerciseController::class);
    
    // Workout routes
    Route::apiResource('workouts', controller: WorkoutController::class);
    
    // Workout exercises routes
    Route::post('/workouts/{workoutId}/exercises', [WorkoutController::class, 'addExerciseToWorkout']);
    Route::put('/workouts/{workoutId}/exercises/{exerciseId}/sets/{setNumber}', [WorkoutController::class, 'updateWorkoutExercise']);
    Route::delete('/workouts/{workoutId}/exercises/{exerciseId}', [WorkoutController::class, 'removeExerciseFromWorkout']);
    
    // Food routes
    Route::apiResource('foods', controller: FoodController::class);
    
    // Meal Log routes
    Route::apiResource('meal-logs', controller: MealLogController::class);
    Route::get('/meal-summary', [MealLogController::class, 'summary']);
});

Route::post("/login", [AuthController::class, "login"])->name("login");
Route::post("/register", [AuthController::class, "register"])->name("register");

Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::get('/users', [App\Http\Controllers\AdminController::class, 'getUsers']);
    Route::put('/users/{id}', [App\Http\Controllers\AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [App\Http\Controllers\AdminController::class, 'deleteUser']);
});

// Muscle Group routes - read only
Route::get('muscle-groups', [MuscleGroupController::class, 'index']);
Route::get('muscle-groups/{id}', [MuscleGroupController::class, 'show']);

// Public Food routes - read only
Route::get('public-foods', [FoodController::class, 'index']);