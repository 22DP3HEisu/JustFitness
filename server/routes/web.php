<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/csrf-token', function () {
    $token = csrf_token();
    Log::info('Generated CSRF Token: ' . $token);
    return Response::json(['csrf_token' => $token]);
});

Route::get('/api', function () {
    return "Welcome";
});

Route::get('/api/register', function () {
    return "Register";
});

Route::post("/api/register", [AuthController::class, "register"])->name("register");