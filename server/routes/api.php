<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/', function () {
    return "Welcome";
});

Route::get('/register', function () {
    return "Register";
});

Route::post("/register", [AuthController::class, "register"])->name("register");