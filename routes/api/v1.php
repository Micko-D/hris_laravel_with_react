<?php

use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\PositionController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(function () {
    // Departments
    Route::apiResource('departments', DepartmentController::class);

    // Positions
    Route::apiResource('positions', PositionController::class);

    // Employees
    Route::apiResource('employees', EmployeeController::class);

    // Employee sub-resources
    Route::get('/employees/{employee}/government-ids', [EmployeeController::class, 'governmentIds']);
    Route::post('/employees/{employee}/government-ids', [EmployeeController::class, 'storeGovernmentId']);
    Route::put('/employees/{employee}/government-ids/{governmentId}', [EmployeeController::class, 'updateGovernmentId']);
    Route::delete('/employees/{employee}/government-ids/{governmentId}', [EmployeeController::class, 'destroyGovernmentId']);

    Route::get('/employees/{employee}/documents', [EmployeeController::class, 'documents']);
    Route::post('/employees/{employee}/documents', [EmployeeController::class, 'storeDocument']);
    Route::delete('/employees/{employee}/documents/{document}', [EmployeeController::class, 'destroyDocument']);

    Route::get('/employees/{employee}/dependents', [EmployeeController::class, 'dependents']);
    Route::post('/employees/{employee}/dependents', [EmployeeController::class, 'storeDependent']);
    Route::put('/employees/{employee}/dependents/{dependent}', [EmployeeController::class, 'updateDependent']);
    Route::delete('/employees/{employee}/dependents/{dependent}', [EmployeeController::class, 'destroyDependent']);

    Route::get('/employees/{employee}/history', [EmployeeController::class, 'history']);
    Route::post('/employees/{employee}/history', [EmployeeController::class, 'storeHistory']);
});