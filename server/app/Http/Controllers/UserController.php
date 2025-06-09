<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Preferences;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Update the user's profile information
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'preferences.weight' => 'required|numeric|min:1',
            'preferences.height' => 'required|numeric|min:1',
            'preferences.age' => 'required|date',
            'preferences.goal_weight' => 'required|numeric|min:1',
            'preferences.activity_level' => 'required|string',
            'preferences.unit_preference' => 'required|string|in:metric,imperial',
        ]);

        Log::info('Updating user profile', [
            'user_id' => $user->id,
            'request' => $validated,
        ]);

        // Update user basic info
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Update or create preferences
        $preferences = $user->preferences;
        if (!$preferences) {
            $preferences = new Preferences();
            $preferences->user_id = $user->id;
        }

        $preferences->weight = $validated['preferences']['weight'];
        $preferences->height = $validated['preferences']['height'];
        $preferences->age = $validated['preferences']['age'];
        $preferences->goal_weight = $validated['preferences']['goal_weight'];
        $preferences->activity_level = $validated['preferences']['activity_level'];
        $preferences->unit_preference = $validated['preferences']['unit_preference'];
        $preferences->save();        // Return the updated user with preferences
        $user->load('preferences');
        return response()->json($user);
    }

    /**
     * Update the user's password
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updatePassword(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|different:current_password',
            'confirm_password' => 'required|string|same:new_password',
        ]);

        // Verify current password
        if (!password_verify($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        // Update the password
        $user->update([
            'password' => bcrypt($validated['new_password']),
        ]);

        Log::info('User password updated', [
            'user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }
}
