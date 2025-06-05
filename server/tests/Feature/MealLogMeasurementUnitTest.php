<?php

namespace Tests\Feature;

use App\Models\Food;
use App\Models\MealLog;
use App\Models\MealLogItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MealLogMeasurementUnitTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $food;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test user
        $this->user = User::factory()->create();

        // Create a test food
        $this->food = Food::create([
            'user_id' => $this->user->id,
            'name' => 'Test Food',
            'description' => 'Food for testing',
            'calories' => 100,
            'protein' => 10,
            'carbs' => 20,
            'fat' => 5,
            'serving_size' => 100,
            'serving_unit' => 'g',
            'is_public' => true,
        ]);
    }

    public function testCreatingMealLogItemWithMeasurementUnit()
    {
        $this->actingAs($this->user);

        // Create a meal log with a meal log item using grams
        $response = $this->postJson('/api/meal-logs', [
            'date' => '2025-06-05',
            'meal_type' => 'breakfast',
            'items' => [
                [
                    'food_id' => $this->food->id,
                    'quantity' => 200,
                    'measurement_unit' => 'g'
                ]
            ]
        ]);

        $response->assertStatus(201);
        
        // Check if the meal log item was created with the correct measurement unit
        $mealLogItem = MealLogItem::first();
        $this->assertEquals('g', $mealLogItem->measurement_unit);

        // Check if the calculated nutrition values are correct (2x serving size)
        $this->assertEquals(200, $mealLogItem->getCaloriesAttribute());
        $this->assertEquals(20, $mealLogItem->getProteinAttribute());
        $this->assertEquals(40, $mealLogItem->getCarbsAttribute());
        $this->assertEquals(10, $mealLogItem->getFatAttribute());
    }

    public function testConversionBetweenDifferentUnits()
    {
        $this->actingAs($this->user);

        // Create a meal log
        $mealLog = MealLog::create([
            'user_id' => $this->user->id,
            'date' => '2025-06-05',
            'meal_type' => 'lunch',
        ]);

        // Create a meal log item with ounces (1 oz = 28.35g)
        $mealLogItem = MealLogItem::create([
            'meal_log_id' => $mealLog->id,
            'food_id' => $this->food->id,
            'quantity' => 1,
            'measurement_unit' => 'oz',
        ]);

        // Calculate expected values (28.35g is 0.2835 of the 100g serving)
        $expectedCalories = 100 * (28.35 / 100);
        $expectedProtein = 10 * (28.35 / 100);
        $expectedCarbs = 20 * (28.35 / 100);
        $expectedFat = 5 * (28.35 / 100);

        // Check if the calculated nutrition values are correct
        $this->assertEqualsWithDelta($expectedCalories, $mealLogItem->getCaloriesAttribute(), 0.1);
        $this->assertEqualsWithDelta($expectedProtein, $mealLogItem->getProteinAttribute(), 0.1);
        $this->assertEqualsWithDelta($expectedCarbs, $mealLogItem->getCarbsAttribute(), 0.1);
        $this->assertEqualsWithDelta($expectedFat, $mealLogItem->getFatAttribute(), 0.1);
    }

    public function testDefaultMeasurementUnitIsServing()
    {
        $this->actingAs($this->user);

        // Create a meal log with a meal log item without specifying measurement unit
        $response = $this->postJson('/api/meal-logs', [
            'date' => '2025-06-05',
            'meal_type' => 'dinner',
            'items' => [
                [
                    'food_id' => $this->food->id,
                    'quantity' => 2
                ]
            ]
        ]);

        $response->assertStatus(201);
        
        // Check if the meal log item was created with the default 'serving' measurement unit
        $mealLogItem = MealLogItem::latest('id')->first();
        $this->assertEquals('serving', $mealLogItem->measurement_unit);

        // Since we're using 2 servings, the nutrition values should be 2x the food values
        $this->assertEquals(200, $mealLogItem->getCaloriesAttribute());
        $this->assertEquals(20, $mealLogItem->getProteinAttribute());
        $this->assertEquals(40, $mealLogItem->getCarbsAttribute());
        $this->assertEquals(10, $mealLogItem->getFatAttribute());
    }
}
