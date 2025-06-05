<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Food;
use Illuminate\Support\Facades\DB;

class UpdateFoodsTo100gStandard extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Start a transaction
        DB::beginTransaction();
        
        try {
            // Get all foods
            $foods = Food::all();
            
            foreach ($foods as $food) {
                // Skip foods that already have serving_size = 100 and serving_unit = 'g'
                if ($food->serving_size == 100 && $food->serving_unit == 'g') {
                    continue;
                }
                
                // Calculate the ratio to convert to 100g
                $ratio = 1;
                if ($food->serving_size && $food->serving_unit) {
                    if ($food->serving_unit == 'g') {
                        // Direct conversion: new value = old value * (100 / serving_size)
                        $ratio = 100 / $food->serving_size;
                    } elseif ($food->serving_unit == 'oz') {
                        // 1 oz = 28.35g, so convert to grams first, then scale to 100g
                        $gramsPerServing = $food->serving_size * 28.35;
                        $ratio = 100 / $gramsPerServing;
                    }
                    // For other units, we'll keep the original values as an approximation
                }
                
                // Update the food with scaled nutrition values
                $food->update([
                    'calories' => round($food->calories * $ratio),
                    'protein' => round($food->protein * $ratio, 1),
                    'carbs' => round($food->carbs * $ratio, 1),
                    'fat' => round($food->fat * $ratio, 1),
                    'serving_size' => 100,
                    'serving_unit' => 'g',
                ]);
            }
            
            // Commit the transaction
            DB::commit();
            
            $this->command->info('Foods have been updated to use the 100g standard for nutrition values.');
            
        } catch (\Exception $e) {
            // Rollback the transaction if an error occurs
            DB::rollBack();
            
            $this->command->error('An error occurred: ' . $e->getMessage());
        }
    }
}
