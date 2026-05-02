<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeDependent;
use App\Models\EmployeeDocument;
use App\Models\EmploymentHistory;
use App\Models\GovernmentId;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Employee::with(['department', 'position']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('employee_number', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('employment_status')) {
            $query->where('employment_status', $request->employment_status);
        }

        $perPage = $request->integer('per_page', 15);
        $employees = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($employees);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateEmployee($request);

        $employee = Employee::create($validated);

        // Log initial employment history
        EmploymentHistory::create([
            'employee_id' => $employee->id,
            'department_id' => $employee->department_id,
            'position_id' => $employee->position_id,
            'employment_status' => $employee->employment_status,
            'effective_date' => $employee->hire_date,
            'remarks' => 'Initial hiring',
        ]);

        return response()->json([
            'data' => $employee->load(['department', 'position']),
            'message' => 'Employee created successfully.',
        ], 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load([
            'department',
            'position',
            'governmentIds',
            'documents',
            'dependents',
            'employmentHistories' => fn ($q) => $q->orderBy('effective_date', 'desc'),
        ]);

        return response()->json(['data' => $employee]);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validated = $this->validateEmployee($request, $employee->id);

        $oldDept = $employee->department_id;
        $oldPos = $employee->position_id;
        $oldStatus = $employee->employment_status;

        $employee->update($validated);

        // Log history if employment details changed
        if ($oldDept !== $employee->department_id
            || $oldPos !== $employee->position_id
            || $oldStatus !== $employee->employment_status
        ) {
            EmploymentHistory::create([
                'employee_id' => $employee->id,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
                'employment_status' => $employee->employment_status,
                'effective_date' => now(),
                'remarks' => 'Employment details updated via employee edit.',
            ]);
        }

        return response()->json([
            'data' => $employee->load(['department', 'position']),
            'message' => 'Employee updated successfully.',
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();

        return response()->json([
            'message' => 'Employee deleted successfully.',
        ]);
    }

    // Government IDs
    public function governmentIds(Employee $employee): JsonResponse
    {
        return response()->json([
            'data' => $employee->governmentIds,
        ]);
    }

    public function storeGovernmentId(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:tin,sss,philhealth,pagibig',
            'number' => 'required|string|max:50',
            'remarks' => 'nullable|string',
        ]);

        $validated['employee_id'] = $employee->id;
        $governmentId = GovernmentId::create($validated);

        return response()->json([
            'data' => $governmentId,
            'message' => 'Government ID added successfully.',
        ], 201);
    }

    public function updateGovernmentId(Request $request, Employee $employee, GovernmentId $governmentId): JsonResponse
    {
        abort_unless($governmentId->employee_id === $employee->id, 404);

        $validated = $request->validate([
            'type' => 'sometimes|required|in:tin,sss,philhealth,pagibig',
            'number' => 'sometimes|required|string|max:50',
            'remarks' => 'nullable|string',
        ]);

        $governmentId->update($validated);

        return response()->json([
            'data' => $governmentId,
            'message' => 'Government ID updated successfully.',
        ]);
    }

    public function destroyGovernmentId(Employee $employee, GovernmentId $governmentId): JsonResponse
    {
        abort_unless($governmentId->employee_id === $employee->id, 404);
        $governmentId->delete();

        return response()->json(['message' => 'Government ID deleted successfully.']);
    }

    // Documents
    public function documents(Employee $employee): JsonResponse
    {
        return response()->json(['data' => $employee->documents]);
    }

    public function storeDocument(Request $request, Employee $employee): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:contract,id,other',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $path = $file->store('employee-documents/' . $employee->id, 'public');

        $document = EmployeeDocument::create([
            'employee_id' => $employee->id,
            'type' => $request->type,
            'filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'data' => $document,
            'message' => 'Document uploaded successfully.',
        ], 201);
    }

    public function destroyDocument(Employee $employee, EmployeeDocument $document): JsonResponse
    {
        abort_unless($document->employee_id === $employee->id, 404);

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'Document deleted successfully.']);
    }

    // Dependents
    public function dependents(Employee $employee): JsonResponse
    {
        return response()->json(['data' => $employee->dependents]);
    }

    public function storeDependent(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'relationship' => 'required|in:spouse,child,parent,sibling',
            'birth_date' => 'nullable|date|before:today',
            'contact_number' => 'nullable|string|max:30',
            'is_dependent_for_tax' => 'boolean',
        ]);

        $validated['employee_id'] = $employee->id;
        $dependent = EmployeeDependent::create($validated);

        return response()->json([
            'data' => $dependent,
            'message' => 'Dependent added successfully.',
        ], 201);
    }

    public function updateDependent(Request $request, Employee $employee, EmployeeDependent $dependent): JsonResponse
    {
        abort_unless($dependent->employee_id === $employee->id, 404);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'relationship' => 'sometimes|required|in:spouse,child,parent,sibling',
            'birth_date' => 'nullable|date|before:today',
            'contact_number' => 'nullable|string|max:30',
            'is_dependent_for_tax' => 'boolean',
        ]);

        $dependent->update($validated);

        return response()->json([
            'data' => $dependent,
            'message' => 'Dependent updated successfully.',
        ]);
    }

    public function destroyDependent(Employee $employee, EmployeeDependent $dependent): JsonResponse
    {
        abort_unless($dependent->employee_id === $employee->id, 404);
        $dependent->delete();

        return response()->json(['message' => 'Dependent deleted successfully.']);
    }

    // Employment History
    public function history(Employee $employee): JsonResponse
    {
        return response()->json([
            'data' => $employee->employmentHistories()->with(['department', 'position'])->orderBy('effective_date', 'desc')->get(),
        ]);
    }

    public function storeHistory(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => 'nullable|uuid|exists:departments,id',
            'position_id' => 'nullable|uuid|exists:positions,id',
            'employment_status' => 'required|in:regular,probationary,contractual,resigned,terminated',
            'salary' => 'nullable|numeric|min:0',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:effective_date',
            'remarks' => 'nullable|string',
        ]);

        $validated['employee_id'] = $employee->id;
        $history = EmploymentHistory::create($validated);

        // Also update the employee's current status
        $employee->update([
            'department_id' => $validated['department_id'] ?? $employee->department_id,
            'position_id' => $validated['position_id'] ?? $employee->position_id,
            'employment_status' => $validated['employment_status'],
        ]);

        return response()->json([
            'data' => $history->load(['department', 'position']),
            'message' => 'Employment history added successfully.',
        ], 201);
    }

    protected function validateEmployee(Request $request, ?string $ignoreId = null): array
    {
        $rules = [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'suffix' => 'nullable|string|max:20',
            'birth_date' => 'required|date|before:today',
            'gender' => 'required|in:male,female',
            'civil_status' => 'required|in:single,married,widowed,separated',
            'nationality' => 'nullable|string|max:100',
            'email' => 'required|email|unique:employees,email' . ($ignoreId ? ",{$ignoreId}" : ''),
            'phone' => 'nullable|string|max:30',
            'address_region' => 'nullable|string|max:100',
            'address_province' => 'nullable|string|max:100',
            'address_city' => 'nullable|string|max:100',
            'address_barangay' => 'nullable|string|max:100',
            'address_street' => 'nullable|string',
            'department_id' => 'nullable|uuid|exists:departments,id',
            'position_id' => 'nullable|uuid|exists:positions,id',
            'employment_status' => 'required|in:regular,probationary,contractual,resigned,terminated',
            'hire_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:hire_date',
            'tin' => 'nullable|string|max:50',
            'sss_number' => 'nullable|string|max:50',
            'philhealth_number' => 'nullable|string|max:50',
            'pagibig_number' => 'nullable|string|max:50',
        ];

        return $request->validate($rules);
    }
}