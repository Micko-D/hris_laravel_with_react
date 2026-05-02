<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = Employee::with(['department', 'position'])
            ->when($request->filled('search'), fn ($q) => $q->where('first_name', 'like', '%' . $request->search . '%')
                ->orWhere('last_name', 'like', '%' . $request->search . '%'))
            ->when($request->filled('department_id'), fn ($q) => $q->where('department_id', $request->department_id))
            ->when($request->filled('employment_status'), fn ($q) => $q->where('employment_status', $request->employment_status))
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $departments = Department::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'departments' => $departments,
        ]);
    }

    public function create()
    {
        $departments = Department::where('is_active', true)->orderBy('name')->get();
        $positions = Position::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('employees/create', [
            'departments' => $departments,
            'positions' => $positions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateEmployee($request);

        $employee = Employee::create($validated);

        \App\Models\EmploymentHistory::create([
            'employee_id' => $employee->id,
            'department_id' => $employee->department_id,
            'position_id' => $employee->position_id,
            'employment_status' => $employee->employment_status,
            'effective_date' => $employee->hire_date,
            'remarks' => 'Initial hiring',
        ]);

        return redirect("/employees/{$employee->id}/edit")->with('success', 'Employee created successfully.');
    }

    public function show(Employee $employee)
    {
        $employee->load(['department', 'position', 'governmentIds', 'documents', 'dependents', 'employmentHistories']);

        $departments = Department::where('is_active', true)->orderBy('name')->get();
        $positions = Position::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('employees/edit', [
            'employee' => $employee,
            'departments' => $departments,
            'positions' => $positions,
            'mode' => 'view',
        ]);
    }

    public function edit(Employee $employee)
    {
        $employee->load(['department', 'position', 'governmentIds', 'documents', 'dependents', 'employmentHistories']);

        $departments = Department::where('is_active', true)->orderBy('name')->get();
        $positions = Position::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('employees/edit', [
            'employee' => $employee,
            'departments' => $departments,
            'positions' => $positions,
            'mode' => 'edit',
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $this->validateEmployee($request, $employee->id);

        $oldDept = $employee->department_id;
        $oldPos = $employee->position_id;
        $oldStatus = $employee->employment_status;

        $employee->update($validated);

        if ($oldDept !== $employee->department_id
            || $oldPos !== $employee->position_id
            || $oldStatus !== $employee->employment_status
        ) {
            \App\Models\EmploymentHistory::create([
                'employee_id' => $employee->id,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
                'employment_status' => $employee->employment_status,
                'effective_date' => now(),
                'remarks' => 'Employment details updated via employee edit.',
            ]);
        }

        return back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return redirect('/employees')->with('success', 'Employee deleted successfully.');
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