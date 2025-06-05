<?php

namespace App\Http\Controllers;

use App\Models\MealLog;
use App\Models\MealLogItem;
use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class MealLogController extends Controller
{
    /**
     * Display a listing of the meal logs.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $query = MealLog::with(['items.food', 'user'])
                        ->where('user_id', $user->id);
        
        // Filter by date if provided
        if ($request->has('date')) {
            $query->where('date', $request->date);
        } else {
            // Default to today
            $query->where('date', now()->toDateString());
        }
        
        // Filter by meal type if provided
        if ($request->has('meal_type')) {
            $query->where('meal_type', $request->meal_type);
        }
        
        $mealLogs = $query->orderBy('meal_type')->get();
        
        // Add calculated totals
        $mealLogs->each(function ($mealLog) {
            $mealLog->total_calories = $mealLog->getTotalCaloriesAttribute();
            $mealLog->total_protein = $mealLog->getTotalProteinAttribute();
            $mealLog->total_carbs = $mealLog->getTotalCarbsAttribute();
            $mealLog->total_fat = $mealLog->getTotalFatAttribute();
        });
        
        return response()->json($mealLogs);
    }

    /**
     * Store a newly created meal log.
     */
    public function store(Request $request)
    {        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'meal_type' => 'required|in:breakfast,lunch,dinner,snack',
            'notes' => 'nullable|string',
            'items' => 'array',
            'items.*.food_id' => 'required|exists:foods,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.measurement_unit' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();
            
            // Check if a meal log already exists for this user, date, and meal type
            $existingMealLog = MealLog::where('user_id', auth()->id())
                                    ->where('date', $request->date)
                                    ->where('meal_type', $request->meal_type)
                                    ->first();
            
            if ($existingMealLog) {
                // Update existing meal log
                $existingMealLog->update([
                    'notes' => $request->notes,
                ]);
                
                // Delete existing items and create new ones
                $existingMealLog->items()->delete();
                
                $mealLog = $existingMealLog;
            } else {
                // Create new meal log
                $mealLog = MealLog::create([
                    'user_id' => auth()->id(),
                    'date' => $request->date,
                    'meal_type' => $request->meal_type,
                    'notes' => $request->notes,
                ]);
            }
            
            // Add meal log items
            if ($request->has('items') && is_array($request->items)) {
                foreach ($request->items as $item) {
                    // Verify food is accessible to user (public or user's own)
                    $food = Food::findOrFail($item['food_id']);
                    if (!$food->is_public && $food->user_id !== auth()->id()) {
                        throw new \Exception('Unauthorized access to food item');
                    }
                    
                    MealLogItem::create([
                        'meal_log_id' => $mealLog->id,
                        'food_id' => $item['food_id'],
                        'quantity' => $item['quantity'],
                        'measurement_unit' => $item['measurement_unit'] ?? 'g',
                    ]);
                }
            }
            
            DB::commit();
            
            // Load the meal log with its items and calculate totals
            $mealLog->load('items.food');
            $mealLog->total_calories = $mealLog->getTotalCaloriesAttribute();
            $mealLog->total_protein = $mealLog->getTotalProteinAttribute();
            $mealLog->total_carbs = $mealLog->getTotalCarbsAttribute();
            $mealLog->total_fat = $mealLog->getTotalFatAttribute();
            
            return response()->json($mealLog, 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified meal log.
     */
    public function show(string $id)
    {
        $mealLog = MealLog::with(['items.food', 'user'])->findOrFail($id);
        
        // Check if the meal log belongs to the authenticated user
        if ($mealLog->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized to view this meal log'], 403);
        }
        
        // Add calculated totals
        $mealLog->total_calories = $mealLog->getTotalCaloriesAttribute();
        $mealLog->total_protein = $mealLog->getTotalProteinAttribute();
        $mealLog->total_carbs = $mealLog->getTotalCarbsAttribute();
        $mealLog->total_fat = $mealLog->getTotalFatAttribute();
        
        return response()->json($mealLog);
    }

    /**
     * Update the specified meal log.
     */
    public function update(Request $request, string $id)
    {
        $mealLog = MealLog::findOrFail($id);
        
        // Check if user is allowed to update this meal log
        if ($mealLog->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized to update this meal log'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|required|date',
            'meal_type' => 'sometimes|required|in:breakfast,lunch,dinner,snack',
            'notes' => 'nullable|string',
            'items' => 'array',
            'items.*.food_id' => 'required|exists:foods,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.measurement_unit' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();
            
            // Check if changing date and meal_type would create a duplicate
            if (($request->has('date') || $request->has('meal_type')) && 
                MealLog::where('user_id', auth()->id())
                    ->where('date', $request->date ?? $mealLog->date)
                    ->where('meal_type', $request->meal_type ?? $mealLog->meal_type)
                    ->where('id', '!=', $mealLog->id)
                    ->exists()) {
                return response()->json(['error' => 'A meal log already exists for this date and meal type'], 422);
            }
            
            // Update meal log
            $mealLog->update([
                'date' => $request->date ?? $mealLog->date,
                'meal_type' => $request->meal_type ?? $mealLog->meal_type,
                'notes' => $request->notes,
            ]);                // Update meal log items if provided
            if ($request->has('items')) {
                // Delete existing items
                $mealLog->items()->delete();
                
                // If there are no items left, delete the meal log entirely
                if (empty($request->items)) {
                    $mealLog->delete();
                    DB::commit();
                    return response()->json(['message' => 'Meal log deleted']);
                }
                
                // Add new items
                foreach ($request->items as $item) {
                    // Verify food is accessible to user (public or user's own)
                    $food = Food::findOrFail($item['food_id']);
                    if (!$food->is_public && $food->user_id !== auth()->id()) {
                        throw new \Exception('Unauthorized access to food item');
                    }
                    
                    MealLogItem::create([
                        'meal_log_id' => $mealLog->id,
                        'food_id' => $item['food_id'],
                        'quantity' => $item['quantity'],
                        'measurement_unit' => $item['measurement_unit'] ?? 'g',
                    ]);
                }
            }
            
            DB::commit();
            
            // Load the meal log with its items and calculate totals
            $mealLog->load('items.food');
            $mealLog->total_calories = $mealLog->getTotalCaloriesAttribute();
            $mealLog->total_protein = $mealLog->getTotalProteinAttribute();
            $mealLog->total_carbs = $mealLog->getTotalCarbsAttribute();
            $mealLog->total_fat = $mealLog->getTotalFatAttribute();
            
            return response()->json($mealLog);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified meal log.
     */
    public function destroy(string $id)
    {
        $mealLog = MealLog::findOrFail($id);
        
        // Check if user is allowed to delete this meal log
        if ($mealLog->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized to delete this meal log'], 403);
        }
        
        $mealLog->delete();
        
        return response()->json(null, 204);
    }

    /**
     * Get a summary of nutrition totals for a date range.
     */
    public function summary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $userId = auth()->id();

        // Get all meal logs for the user in the date range
        $mealLogs = MealLog::with(['items.food'])
                           ->where('user_id', $userId)
                           ->whereBetween('date', [$startDate, $endDate])
                           ->orderBy('date')
                           ->get();        // Group by date
        $summary = $mealLogs->groupBy('date')->map(function ($dayLogs) {
            $totalCalories = 0;
            $totalProtein = 0;
            $totalCarbs = 0;
            $totalFat = 0;
            
            $mealBreakdown = [];
            
            foreach ($dayLogs as $log) {
                $mealCalories = $log->getTotalCaloriesAttribute();
                $mealProtein = $log->getTotalProteinAttribute();
                $mealCarbs = $log->getTotalCarbsAttribute();
                $mealFat = $log->getTotalFatAttribute();
                
                // Skip logs with no nutritional content
                if ($mealCalories <= 0 && $mealProtein <= 0 && $mealCarbs <= 0 && $mealFat <= 0) {
                    continue;
                }
                
                $totalCalories += $mealCalories;
                $totalProtein += $mealProtein;
                $totalCarbs += $mealCarbs;
                $totalFat += $mealFat;
                
                $mealBreakdown[$log->meal_type] = [
                    'calories' => $mealCalories,
                    'protein' => $mealProtein,
                    'carbs' => $mealCarbs,
                    'fat' => $mealFat,
                    'id' => $log->id
                ];
            }
            
            return [
                'total_calories' => $totalCalories,
                'total_protein' => $totalProtein,
                'total_carbs' => $totalCarbs,
                'total_fat' => $totalFat,
                'meals' => $mealBreakdown
            ];
        });
        
        // Filter out days with no nutrition data
        $summary = $summary->filter(function ($dayData) {
            return $dayData['total_calories'] > 0 || 
                   $dayData['total_protein'] > 0 || 
                   $dayData['total_carbs'] > 0 || 
                   $dayData['total_fat'] > 0;
        });
        
        return response()->json($summary);
    }
}
