<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'username' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'weight' => 'required|integer|min:0',
            'height' => 'required|integer|min:0',
            'dateOfBirth' => 'required|date|before:today',
            'goalWeight' => 'required|integer|min:0',
            'activityLevel' => 'required|in:light,moderate,active,very_active',
            'unitPreference' => 'required|in:metric,imperial',
        ];
    }
}