<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MealLogItem;
use Illuminate\Support\Facades\DB;

class UpdateMealLogItemsToGrams extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Start a transaction
        DB::beginTransaction();
        
        try {
            // Get all meal log items with 'serving' as measurement unit
            $mealLogItems = MealLogItem::where('measurement_unit', 'serving')->get();
            
            foreach ($mealLogItems as $item) {
                // Get the food associated with this item
                $food = $item->food;
                
                // If the food has a serving size, convert the quantity to grams
                if ($food && $food->serving_size) {
                    // Calculate quantity in grams: quantity * serving_size
                    // Since servings are now 100g, and we've updated all foods to per 100g
                    $quantityInGrams = $item->quantity * 100;
                    
                    // Update the meal log item
                    $item->update([
                        'quantity' => $quantityInGrams,
                        'measurement_unit' => 'g',
                    ]);
                } else {
                    // If no serving size, just update the unit
                    $item->update([
                        'measurement_unit' => 'g',
                    ]);
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            $this->command->info('Meal log items have been updated to use grams as the measurement unit.');
            
        } catch (\Exception $e) {
            // Rollback the transaction if an error occurs
            DB::rollBack();
            
            $this->command->error('An error occurred: ' . $e->getMessage());
        }
    }
}
