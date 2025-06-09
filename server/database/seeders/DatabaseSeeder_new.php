<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MuscleGroup;
use App\Models\Exercise;
use App\Models\Workout;
use App\Models\Food;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create basic users
        $this->seedUsers();
        
        // Create muscle groups
        $this->seedMuscleGroups();
        
        // Create exercises and link to muscle groups
        $this->seedExercises();
        
        // Create workouts
        $this->seedWorkouts();
        
        // Create foods
        $this->seedFoods();
    }
    
    /**
     * Seed users.
     */
    private function seedUsers(): void
    {
        // Create test user
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }
    
    /**
     * Seed muscle groups.
     */
    private function seedMuscleGroups(): void
    {
        $muscleGroups = [
            ['name' => 'Chest', 'description' => 'Pectoral muscles including the pectoralis major and minor'],
            ['name' => 'Back', 'description' => 'Muscles of the back including the latissimus dorsi, trapezius, and rhomboids'],
            ['name' => 'Shoulders', 'description' => 'Deltoid muscles (anterior, lateral, and posterior)'],
            ['name' => 'Arms', 'description' => 'Biceps, triceps, and forearm muscles'],
            ['name' => 'Triceps', 'description' => 'The three-headed muscle at the back of the upper arm'],
            ['name' => 'Biceps', 'description' => 'The two-headed muscle at the front of the upper arm'],
            ['name' => 'Forearms', 'description' => 'Muscles of the forearm including flexors and extensors'],
            ['name' => 'Core', 'description' => 'Abdominal and lower back muscles'],
            ['name' => 'Legs', 'description' => 'Quadriceps, hamstrings, calves, and other leg muscles'],
            ['name' => 'Glutes', 'description' => 'Gluteal muscles including the gluteus maximus, medius, and minimus'],
        ];
        
        foreach ($muscleGroups as $muscleGroup) {
            MuscleGroup::create($muscleGroup);
        }
    }
    
    /**
     * Seed exercises.
     */
    private function seedExercises(): void
    {
        $user = User::where('email', 'test@example.com')->first();
        $admin = User::where('email', 'admin@example.com')->first();
        
        $exercises = [
            [
                'name' => 'Push-up',
                'description' => 'A classic bodyweight exercise for chest, shoulders, and triceps',
                'is_public' => true,
                'user_id' => $user->id,
                'muscle_groups' => [1, 3, 5]  // Chest, Shoulders, Triceps
            ],
            [
                'name' => 'Pull-up',
                'description' => 'An upper body exercise that targets the back and biceps',
                'is_public' => true,
                'user_id' => $admin->id,
                'muscle_groups' => [2, 6]  // Back, Biceps
            ],
            [
                'name' => 'Squat',
                'description' => 'A compound exercise for lower body strength',
                'is_public' => true,
                'user_id' => $user->id,
                'muscle_groups' => [9, 10]  // Legs, Glutes
            ],
            [
                'name' => 'Plank',
                'description' => 'A core strengthening exercise that works the entire body',
                'is_public' => true,
                'user_id' => $admin->id,
                'muscle_groups' => [8]  // Core
            ],
            [
                'name' => 'Bench Press',
                'description' => 'A compound exercise that targets the chest, shoulders, and triceps',
                'is_public' => true,
                'user_id' => $user->id,
                'muscle_groups' => [1, 3, 5]  // Chest, Shoulders, Triceps
            ],
            [
                'name' => 'Deadlift',
                'description' => 'A compound exercise that works the entire posterior chain',
                'is_public' => true,
                'user_id' => $admin->id,
                'muscle_groups' => [2, 9, 10]  // Back, Legs, Glutes
            ],
            [
                'name' => 'Bicep Curl',
                'description' => 'An isolation exercise for the biceps',
                'is_public' => true,
                'user_id' => $user->id,
                'muscle_groups' => [6]  // Biceps
            ],
            [
                'name' => 'Private Exercise',
                'description' => 'This exercise is only visible to its creator',
                'is_public' => false,
                'user_id' => $user->id,
                'muscle_groups' => [1, 2]  // Chest, Back
            ],
        ];

        foreach ($exercises as $exerciseData) {
            $muscleGroupIds = $exerciseData['muscle_groups'];
            unset($exerciseData['muscle_groups']);
            
            $exercise = Exercise::create($exerciseData);
            
            $exercise->muscleGroups()->attach($muscleGroupIds);
        }
    }
    
    /**
     * Seed workouts.
     */
    private function seedWorkouts(): void
    {
        $user = User::where('email', 'test@example.com')->first();
        $admin = User::where('email', 'admin@example.com')->first();
        
        // Create a chest workout
        $chestWorkout = Workout::create([
            'name' => 'Chest Day',
            'description' => 'A workout focused on chest development',
            'duration' => 45,
            'is_public' => true,
            'user_id' => $user->id,
        ]);
        
        // Add exercises to the chest workout
        $benchPress = Exercise::where('name', 'Bench Press')->first();
        $pushUp = Exercise::where('name', 'Push-up')->first();
        
        if ($benchPress && $pushUp) {
            $chestWorkout->exercises()->attach($benchPress->id, [
                'set_number' => 1,
                'reps' => 10,
                'weight' => 135,
                'rest_time' => 60,
            ]);
            
            $chestWorkout->exercises()->attach($benchPress->id, [
                'set_number' => 2,
                'reps' => 8,
                'weight' => 155,
                'rest_time' => 90,
            ]);
            
            $chestWorkout->exercises()->attach($pushUp->id, [
                'set_number' => 1,
                'reps' => 15,
                'weight' => 0,
                'rest_time' => 60,
            ]);
        }
        
        // Create a full body workout
        $fullBodyWorkout = Workout::create([
            'name' => 'Full Body Blast',
            'description' => 'A comprehensive full body workout',
            'duration' => 60,
            'is_public' => true,
            'user_id' => $admin->id,
        ]);
        
        // Add exercises to the full body workout
        $squat = Exercise::where('name', 'Squat')->first();
        $pullUp = Exercise::where('name', 'Pull-up')->first();
        $plank = Exercise::where('name', 'Plank')->first();
        
        if ($squat && $pullUp && $plank) {
            $fullBodyWorkout->exercises()->attach($squat->id, [
                'set_number' => 1,
                'reps' => 12,
                'weight' => 135,
                'rest_time' => 60,
            ]);
            
            $fullBodyWorkout->exercises()->attach($pullUp->id, [
                'set_number' => 1,
                'reps' => 8,
                'weight' => 0,
                'rest_time' => 60,
            ]);
            
            $fullBodyWorkout->exercises()->attach($plank->id, [
                'set_number' => 1,
                'reps' => 1,
                'weight' => 0,
                'rest_time' => 30,
            ]);
        }
    }
    
    /**
     * Seed foods.
     */
    private function seedFoods(): void
    {
        $user = User::where('email', 'test@example.com')->first();
        
        $foods = [
            [
                'name' => 'Chicken Breast',
                'description' => 'Skinless, boneless chicken breast',
                'calories' => 165,
                'protein' => 31,
                'carbs' => 0,
                'fat' => 3.6,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'user_id' => $user->id,
                'is_public' => true,
            ],
            [
                'name' => 'Brown Rice',
                'description' => 'Cooked brown rice',
                'calories' => 112,
                'protein' => 2.6,
                'carbs' => 23.5,
                'fat' => 0.9,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'user_id' => $user->id,
                'is_public' => true,
            ],
            [
                'name' => 'Broccoli',
                'description' => 'Raw broccoli florets',
                'calories' => 34,
                'protein' => 2.8,
                'carbs' => 6.6,
                'fat' => 0.4,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'user_id' => $user->id,
                'is_public' => true,
            ],
            [
                'name' => 'Egg',
                'description' => 'Whole egg, large',
                'calories' => 72,
                'protein' => 6.3,
                'carbs' => 0.4,
                'fat' => 5,
                'serving_size' => 50,
                'serving_unit' => 'g',
                'user_id' => $user->id,
                'is_public' => true,
            ],
            [
                'name' => 'Salmon',
                'description' => 'Atlantic salmon fillet',
                'calories' => 206,
                'protein' => 22,
                'carbs' => 0,
                'fat' => 13,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'user_id' => $user->id,
                'is_public' => true,
            ],
        ];
        
        foreach ($foods as $food) {
            Food::create($food);
        }
    }
}
