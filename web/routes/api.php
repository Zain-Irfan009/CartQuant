<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});

Route::get('products',[\App\Http\Controllers\ProductController::class,'syncProducts']);

Route::get('rules',[\App\Http\Controllers\RuleController::class,'index']);
Route::delete('delete-rule/{id}',[\App\Http\Controllers\RuleController::class,'DeleteRule']);
Route::post('save-rule',[\App\Http\Controllers\RuleController::class,'SaveRule']);
Route::get('edit-rule',[\App\Http\Controllers\RuleController::class,'EditRule']);
Route::post('update-rule',[\App\Http\Controllers\RuleController::class,'UpdateRule']);
