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

        $employees = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => $employees->items(),
            'meta' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateEmployee($request);

        $validated['employee_number'] = $this->generateEmployeeNumber();
        $employee = Employee::create($validated);

        // Sync government IDs
        if ($request->has('government_ids')) {
            foreach ($request->government_ids as $gid) {
                GovernmentId::create([
                    'employee_id' => $employee->id,
                    'type' => $gid['type'],
                    'number' => $gid['number'],
                    'remarks' => $gid['remarks'] ?? null,
                ]);
            }
        }

        return response()->json([
            'data' => $employee->load(['department', 'position', 'governmentIds']),
            'message' => 'Employee created successfully.',
        ], 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load(['department', 'position', 'governmentIds', 'documents', 'dependents', 'employmentHistories']);

        return response()->json(['data' => $employee]);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validated = $this->validateEmployee($request, $employee->id);

        $employee->update($validated);

        // Sync government IDs
        if ($request->has('government_ids')) {
            GovernmentId::where('employee_id', $employee->id)->delete();
            foreach ($request->government_ids as $gid) {
                GovernmentId::create([
                    'employee_id' => $employee->id,
                    'type' => $gid['type'],
                    'number' => $gid['number'],
                    'remarks' => $gid['remarks'] ?? null,
                ]);
            }
        }

        return response()->json([
            'data' => $employee->load(['department', 'position', 'governmentIds']),
            'message' => 'Employee updated successfully.',
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();

        return response()->json(['message' => 'Employee deleted successfully.']);
    }

    protected function validateEmployee(Request $request, ?string $excludeId = null): array
    {
        $rules = [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'birth_date' => 'required|date|before:today',
            'gender' => 'required|in:male,female',
            'civil_status' => 'required|in:single,married,widowed,separated',
            'nationality' => 'nullable|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'address_region' => 'nullable|string|max:100',
            'address_province' => 'nullable|string|max:100',
            'address_city' => 'nullable|string|max:100',
            'address_barangay' => 'nullable|string|max:100',
            'address_street' => 'nullable|string|max:255',
            'department_id' => 'nullable|uuid|exists:departments,id',
            'position_id' => 'nullable|uuid|exists:positions,id',
            'employment_status' => 'required|in:probationary,regular,contractual,resigned,terminated',
            'hire_date' => 'required|date|before:tomorrow',
            'end_date' => 'nullable|date|after:hire_date',
            'tin' => 'nullable|string|max:30',
            'sss_number' => 'nullable|string|max:30',
            'philhealth_number' => 'nullable|string|max:30',
            'pagibig_number' => 'nullable|string|max:30',
            'government_ids' => 'nullable|array',
            'government_ids.*.type' => 'required_with:government_ids|in:tin,sss,philhealth,pagibig',
            'government_ids.*.number' => 'required_with:government_ids|string|max:50',
            'government_ids.*.remarks' => 'nullable|string|max:255',
        ];

        $validated = $request->validate($rules);

        if ($excludeId) {
            $validated['email'] = $validated['email'] . '|unique:employees,email,' . $excludeId . ',id';
        }

        return $validated;
    }

    protected function generateEmployeeNumber(): string
    {
        $year = date('Y');
        $lastEmployee = Employee::whereYear('created_at', $year)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($lastEmployee && preg_match('/EMP-' . $year . '-(\d+)/', $lastEmployee->employee_number, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        return 'EMP-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    // Government IDs
    public function governmentIds(Employee $employee): JsonResponse
    {
        return response()->json(['data' => $employee->governmentIds]);
    }

    public function storeGovernmentId(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:tin,sss,philhealth,pagibig',
            'number' => 'required|string|max:50',
            'remarks' => 'nullable|string|max:255',
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
            'remarks' => 'nullable|string|max:255',
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
            'name' => 'nullable|string|max:255',
            'type' => 'required|in:contract,id,other',
            'version_label' => 'nullable|string|max:50',
            'parent_document_id' => 'nullable|uuid|exists:employee_documents,id',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $path = $file->store('employee-documents/' . $employee->id, 'public');

        // If adding a new version to an existing document
        if ($request->parent_document_id) {
            $parent = EmployeeDocument::find($request->parent_document_id);
            $version = ($parent->version ?? 1) + 1;
        } else {
            $version = 1;
        }

        $document = EmployeeDocument::create([
            'employee_id' => $employee->id,
            'name' => $request->name ?? $file->getClientOriginalName(),
            'type' => $request->type,
            'version' => $version,
            'version_label' => $request->version_label ?? ("v{$version}.0"),
            'parent_document_id' => $request->parent_document_id,
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

    // Employment Histories
    public function histories(Employee $employee): JsonResponse
    {
        return response()->json(['data' => $employee->employmentHistories->sortBy('effective_date')->values()]);
    }

    public function storeHistory(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => 'required|uuid|exists:departments,id',
            'position_id' => 'required|uuid|exists:positions,id',
            'employment_status' => 'required|in:probationary,regular,contractual,resigned,terminated',
            'salary' => 'nullable|numeric|min:0',
            'effective_date' => 'required|date|before:tomorrow',
            'end_date' => 'nullable|date|after:effective_date',
            'remarks' => 'nullable|string|max:255',
        ]);

        $validated['employee_id'] = $employee->id;
        $history = EmploymentHistory::create($validated);

        return response()->json([
            'data' => $history,
            'message' => 'Employment history entry added.',
        ], 201);
    }

    public function updateHistory(Request $request, Employee $employee, EmploymentHistory $history): JsonResponse
    {
        abort_unless($history->employee_id === $employee->id, 404);

        $validated = $request->validate([
            'department_id' => 'sometimes|required|uuid|exists:departments,id',
            'position_id' => 'sometimes|required|uuid|exists:positions,id',
            'employment_status' => 'sometimes|required|in:probationary,regular,contractual,resigned,terminated',
            'salary' => 'nullable|numeric|min:0',
            'effective_date' => 'sometimes|required|date|before:tomorrow',
            'end_date' => 'nullable|date|after:effective_date',
            'remarks' => 'nullable|string|max:255',
        ]);

        $history->update($validated);

        return response()->json([
            'data' => $history,
            'message' => 'Employment history entry updated.',
        ]);
    }

    public function destroyHistory(Employee $employee, EmploymentHistory $history): JsonResponse
    {
        abort_unless($history->employee_id === $employee->id, 404);
        $history->delete();

        return response()->json(['message' => 'Employment history entry deleted.']);
    }
}
