<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;

class ExerciseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $query = Exercise::with(['muscleGroups', 'user']);
        
        // If user is authenticated, get public exercises and user's private exercises
        if ($user) {
            $query->where(function($q) use ($user) {
                $q->where('is_public', true)
                  ->orWhere('user_id', $user->id);
            });
        } else {
            // If not authenticated, only get public exercises
            $query->where('is_public', true);
        }
        
        $exercises = $query->get();
        return response()->json($exercises);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4|max:5120', // 5MB max
            'muscle_group_ids' => 'array',
            'muscle_group_ids.*' => 'exists:muscle_groups,id',
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mediaUrl = null;
        $mediaType = null;

        // Handle file upload if present
        if ($request->hasFile('media') && $request->file('media')->isValid()) {
            $file = $request->file('media');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Get MIME type before moving the file
            $mimeType = $file->getMimeType();
            $mediaType = 'image'; // Default type
            
            // Determine media type based on MIME type
            if (strpos($mimeType, 'image') !== false) {
                $mediaType = 'image';
            } elseif (strpos($mimeType, 'video') !== false) {
                $mediaType = 'video';
            } elseif ($file->getClientOriginalExtension() === 'gif') {
                $mediaType = 'gif';
            }
            
            // Ensure uploads directory exists
            $uploadPath = public_path('uploads');
            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0755, true);
            }
            
            // Store file in public/uploads directory
            $file->move($uploadPath, $fileName);
            
            $mediaUrl = '/uploads/' . $fileName;
        }

        $exercise = Exercise::create([
            'name' => $request->name,
            'description' => $request->description,
            'media_url' => $mediaUrl,
            'media_type' => $mediaType,
            'is_public' => $request->has('is_public') ? filter_var($request->is_public, FILTER_VALIDATE_BOOLEAN) : true,
            'user_id' => auth()->id(),
        ]);

        if ($request->has('muscle_group_ids')) {
            $exercise->muscleGroups()->attach($request->muscle_group_ids);
        }
        
        return response()->json($exercise->load('muscleGroups'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $exercise = Exercise::with(['muscleGroups', 'user'])->findOrFail($id);
        
        // Check if the exercise is public or belongs to the authenticated user
        if (!$exercise->is_public && (!auth()->check() || $exercise->user_id !== auth()->id())) {
            return response()->json(['error' => 'Unauthorized to view this exercise'], 403);
        }
        
        return response()->json($exercise);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $exercise = Exercise::findOrFail($id);
        
        // Check if user is allowed to update this exercise
        if ($exercise->user_id != auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized to update this exercise'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4|max:5120', // 5MB max
            'muscle_group_ids' => 'array',
            'muscle_group_ids.*' => 'exists:muscle_groups,id',
            'is_public' => 'boolean',
            'remove_media' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = [
            'name' => $request->name,
            'description' => $request->description,
            'is_public' => $request->has('is_public') ? filter_var($request->is_public, FILTER_VALIDATE_BOOLEAN) : $exercise->is_public,
        ];

        // Handle remove media request
        if ($request->has('remove_media') && filter_var($request->remove_media, FILTER_VALIDATE_BOOLEAN)) {
            // Remove the file if it exists
            if ($exercise->media_url && file_exists(public_path($exercise->media_url))) {
                unlink(public_path($exercise->media_url));
            }
            
            $updateData['media_url'] = null;
            $updateData['media_type'] = null;
        }
        // Handle file upload if present
        elseif ($request->hasFile('media') && $request->file('media')->isValid()) {
            // Remove existing file if there is one
            if ($exercise->media_url && file_exists(public_path($exercise->media_url))) {
                unlink(public_path($exercise->media_url));
            }
            
            $file = $request->file('media');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Get MIME type before moving the file
            $mimeType = $file->getMimeType();
            $mediaType = 'image'; // Default type
            
            // Determine media type based on MIME type
            if (strpos($mimeType, 'image') !== false) {
                $updateData['media_type'] = 'image';
            } elseif (strpos($mimeType, 'video') !== false) {
                $updateData['media_type'] = 'video';
            } elseif ($file->getClientOriginalExtension() === 'gif') {
                $updateData['media_type'] = 'gif';
            }
            
            // Ensure uploads directory exists
            $uploadPath = public_path('uploads');
            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0755, true);
            }
            
            // Store file in public/uploads directory
            $file->move($uploadPath, $fileName);
            
            $updateData['media_url'] = '/uploads/' . $fileName;
        }

        $exercise->update($updateData);

        if ($request->has('muscle_group_ids')) {
            $exercise->muscleGroups()->sync($request->muscle_group_ids);
        }
        
        return response()->json($exercise->load('muscleGroups'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $exercise = Exercise::findOrFail($id);
        
        // Check if user is allowed to delete this exercise
        if ($exercise->user_id != auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized to delete this exercise'], 403);
        }
        
        $exercise->delete();
        
        return response()->json(null, 204);
    }
}
