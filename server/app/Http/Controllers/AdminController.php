<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Log;

class AdminController extends Controller
{
    public function getUsers()
    {
        // Only admins should access this
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return User::all();
    }

    public function updateUser(Request $request, $id)
    {
        // Only admins should access this
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'role' => ['required', Rule::in(['user', 'admin'])],
        ]);

        Log::info('Updating user', [
            'user_id' => $user->id,
            'request' => $validated,
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function deleteUser($id)
    {
        // Only admins should access this
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Don't allow deleting yourself
        if (auth()->id() == $id) {
            return response()->json(['message' => 'Cannot delete your own account'], 400);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}