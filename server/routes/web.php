<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return "Welcome";
});

Route::get("/register", function() {
    return "Register";
});