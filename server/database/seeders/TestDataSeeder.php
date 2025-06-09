<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Exercise;
use App\Models\MuscleGroup;
use App\Models\Food;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test user
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create some exercises
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
                'muscle_groups' => [2, 4]  // Back, Arms
            ],
            [
                'name' => 'Squat',
                'description' => 'A compound exercise for lower body strength',
                'is_public' => true,
                'user_id' => $user->id,
                'muscle_groups' => [9]  // Legs
            ],
            [
                'name' => 'Private Exercise',
                'description' => 'This exercise is only visible to its creator',
                'is_public' => false,
                'user_id' => $user->id,
                'muscle_groups' => [1, 2]  // Chest, Back
            ],
        ];        foreach ($exercises as $exerciseData) {
            $muscleGroupIds = $exerciseData['muscle_groups'];
            unset($exerciseData['muscle_groups']);
            
            $exercise = Exercise::create($exerciseData);
            
            $exercise->muscleGroups()->attach($muscleGroupIds);
        }
        
        // Create some basic food data (standardized to 100g servings)
        $foods = [
            [
                'name' => 'Chicken Breast',
                'calories' => 165,
                'protein' => 31,
                'carbs' => 0,
                'fat' => 3.6,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'is_public' => true,
                'user_id' => $admin->id
            ],
            [
                'name' => 'Brown Rice',
                'calories' => 112,
                'protein' => 2.6,
                'carbs' => 24,
                'fat' => 0.9,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'is_public' => true,
                'user_id' => $admin->id
            ],
            [
                'name' => 'Broccoli',
                'calories' => 34,
                'protein' => 2.8,
                'carbs' => 7,
                'fat' => 0.4,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'is_public' => true,
                'user_id' => $admin->id
            ],
            [
                'name' => 'Salmon',
                'calories' => 208,
                'protein' => 20,
                'carbs' => 0,
                'fat' => 13,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'is_public' => true,
                'user_id' => $admin->id
            ],
            [
                'name' => 'Oatmeal',
                'calories' => 389,
                'protein' => 16.9,
                'carbs' => 66.3,
                'fat' => 6.9,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'is_public' => true,
                'user_id' => $admin->id
            ],
        ];
        
        foreach ($foods as $foodData) {
            Food::create($foodData);
        }
    }
}
