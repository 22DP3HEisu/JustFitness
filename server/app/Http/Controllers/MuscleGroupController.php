<?php

namespace App\Http\Controllers;

use App\Models\MuscleGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MuscleGroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $muscleGroups = MuscleGroup::all();
        return response()->json($muscleGroups);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $muscleGroup = MuscleGroup::findOrFail($id);
        return response()->json($muscleGroup);
    }
}
