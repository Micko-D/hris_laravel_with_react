<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Position::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        if ($request->boolean('active')) {
            $query->where('is_active', true);
        }

        $positions = $query->orderBy('name')->get();

        return response()->json([
            'data' => $positions,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:positions,code',
            'description' => 'nullable|string',
            'basic_salary' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $position = Position::create($validated);

        return response()->json([
            'data' => $position,
            'message' => 'Position created successfully.',
        ], 201);
    }

    public function show(Position $position): JsonResponse
    {
        return response()->json([
            'data' => $position,
        ]);
    }

    public function update(Request $request, Position $position): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:positions,code,' . $position->id,
            'description' => 'nullable|string',
            'basic_salary' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $position->update($validated);

        return response()->json([
            'data' => $position,
            'message' => 'Position updated successfully.',
        ]);
    }

    public function destroy(Position $position): JsonResponse
    {
        if ($position->employees()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete position with existing employees.',
            ], 422);
        }

        $position->delete();

        return response()->json([
            'message' => 'Position deleted successfully.',
        ]);
    }
}