<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Models\Preferences;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(RegisterRequest $request) {
        
        $data = $request->validated();

        $user = User::create([
            'name' => $data['username'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);

        // Create a new Preferences record for the user
        $preferences = Preferences::create([
            'user_id' => $user->id,
            'weight' => $data['weight'],
            'height' => $data['height'],
            'age' => $data['age'],
            'goal_weight' => $data['goalWeight'],
            'activity_level' => $data['activityLevel'],
            'unit_preference' => $data['unitPreference'],
        ]);

        $token = $user->createToken('myapptoken')->plainTextToken;

        $response = [
            'user' => $user,
            'token' => $token
        ];

        return response()->json($response, 201);
    }

    public function login(Request $request) {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if (!auth()->attempt($data)) {
            return response(['message' => 'Invalid credentials'], 422);
        }

        $user = auth()->user();

        $token = $user->createToken('myapptoken')->plainTextToken;

        $response = [
            'user' => $user,
            'token' => $token
        ];

        return response($response, 201);
    }

}
