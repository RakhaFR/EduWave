<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

// Keep the root endpoint compatible with clients configured for the default
// Laravel broadcasting auth URL. The canonical API route is /api/broadcasting/auth.
Broadcast::routes([
    'middleware' => ['api', 'auth:sanctum'],
]);

Route::get('/', function () {
    return view('welcome');
});
