<?php

namespace App\Http\Controllers;

use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FoodController extends Controller
{
    /**
     * Display a listing of foods.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $query = Food::with(['user']);
        
        // Filter by name if provided
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        // If user is authenticated, get public foods and user's private foods
        if ($user) {
            $query->where(function($q) use ($user) {
                $q->where('is_public', true)
                  ->orWhere('user_id', $user->id);
            });
        } else {
            // If not authenticated, only get public foods
            $query->where('is_public', true);
        }
        
        $foods = $query->orderBy('name')->get();
        return response()->json($foods);
    }

    /**
     * Store a newly created food.
     */    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'calories' => 'nullable|integer|min:0',
            'protein' => 'nullable|numeric|min:0',
            'carbs' => 'nullable|numeric|min:0',
            'fat' => 'nullable|numeric|min:0',
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }        $food = Food::create([
            'name' => $request->name,
            'description' => $request->description,
            'calories' => $request->calories,
            'protein' => $request->protein,
            'carbs' => $request->carbs,
            'fat' => $request->fat,
            'serving_size' => 100, // Default to 100g
            'serving_unit' => 'g', // Default to grams
            'is_public' => $request->has('is_public') ? filter_var($request->is_public, FILTER_VALIDATE_BOOLEAN) : true,
            'user_id' => auth()->id(),
        ]);
        
        return response()->json($food, 201);
    }

    /**
     * Display the specified food.
     */
    public function show(string $id)
    {
        $food = Food::with(['user'])->findOrFail($id);
        
        // Check if the food is public or belongs to the authenticated user
        if (!$food->is_public && (!auth()->check() || $food->user_id !== auth()->id())) {
            return response()->json(['error' => 'Unauthorized to view this food'], 403);
        }
        
        return response()->json($food);
    }

    /**
     * Update the specified food.
     */
    public function update(Request $request, string $id)
    {
        $food = Food::findOrFail($id);
        
        // Check if user is allowed to update this food
        if ($food->user_id != auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized to update this food'], 403);
        }
          $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'calories' => 'nullable|integer|min:0',
            'protein' => 'nullable|numeric|min:0',
            'carbs' => 'nullable|numeric|min:0',
            'fat' => 'nullable|numeric|min:0',
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }        $food->update([
            'name' => $request->name,
            'description' => $request->description,
            'calories' => $request->calories,
            'protein' => $request->protein,
            'carbs' => $request->carbs,
            'fat' => $request->fat,
            'serving_size' => 100, // Always 100g
            'serving_unit' => 'g', // Always grams
            'is_public' => $request->has('is_public') ? filter_var($request->is_public, FILTER_VALIDATE_BOOLEAN) : $food->is_public,
        ]);
        
        return response()->json($food);
    }

    /**
     * Remove the specified food.
     */
    public function destroy(string $id)
    {
        $food = Food::findOrFail($id);
        
        // Check if user is allowed to delete this food
        if ($food->user_id != auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized to delete this food'], 403);
        }
        
        $food->delete();
        
        return response()->json(null, 204);
    }
}
