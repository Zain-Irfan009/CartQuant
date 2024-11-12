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


Route::get('/privacy-policy', function () {
    return view('privacy_policy');
});

Route::group(['middleware' => ['shopify.auth']], function () {
    Route::get('products', [\App\Http\Controllers\ProductController::class, 'syncProducts']);

    Route::get('rules', [\App\Http\Controllers\RuleController::class, 'index']);
    Route::delete('delete-rule/{id}', [\App\Http\Controllers\RuleController::class, 'DeleteRule']);
    Route::post('save-rule', [\App\Http\Controllers\RuleController::class, 'SaveRule']);
    Route::get('edit-rule', [\App\Http\Controllers\RuleController::class, 'EditRule']);
    Route::post('update-rule', [\App\Http\Controllers\RuleController::class, 'UpdateRule']);

    Route::get('installation', [\App\Http\Controllers\SettingController::class, 'index']);


    Route::get('email', [\App\Http\Controllers\SettingController::class, 'Email']);
    Route::post('send-message', [\App\Http\Controllers\SettingController::class, 'SendMessage']);

});
Route::get('check-charge', [\App\Http\Controllers\PlanController::class, 'CheckCharge']);
Route::any('return-url', [\App\Http\Controllers\PlanController::class, 'ReturnUrl']);

Route::post('/webhooks/app-uninstall', function (Request $request) {
    try {
        $product=json_decode($request->getContent());
        $shop=$request->header('x-shopify-shop-domain');
        $shop=\App\Models\Session::where('shop',$shop)->first();
        \App\Models\Charge::where('shop_id',$shop->id)->delete();
        \App\Models\Rule::where('shop_id',$shop->id)->delete();

        $shop->forceDelete();

    } catch (\Exception $e) {
    }
});
