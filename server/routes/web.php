<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/api', function () {
    return "Welcome";
});

Route::post("/api/register", [AuthController::class, "register"])->name("register");