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
        $positions = Position::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'departments' => $departments,
            'positions' => $positions,
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
            'salary' => $validated['salary'] ?? null,
            'salary_type' => $validated['salary_type'] ?? 'monthly',
            'effective_date' => $employee->hire_date,
            'remarks' => 'Initial hiring',
        ]);

        return redirect("/employees/{$employee->id}/edit")
            ->with('success', 'Employee created successfully.');
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
        $oldSalary = $employee->salary;
        $oldSalaryType = $employee->salary_type;

        $employee->update($validated);

        $changedFields = [];

        if ($oldDept !== $employee->department_id) $changedFields[] = 'department';
        if ($oldPos !== $employee->position_id) $changedFields[] = 'position';
        if ($oldStatus !== $employee->employment_status) $changedFields[] = 'status';
        if (array_key_exists('salary', $validated) && (string) $oldSalary !== (string) ($validated['salary'] ?? null)) $changedFields[] = 'salary';
        if (array_key_exists('salary_type', $validated) && $oldSalaryType !== $validated['salary_type']) $changedFields[] = 'salary type';
        if (array_key_exists('end_date', $validated) && $employee->end_date) $changedFields[] = 'end date';

        if (count($changedFields) > 0) {
            $last = array_slice($changedFields, -1)[0];
            $rest = array_slice($changedFields, 0, -1);
            if (count($rest) > 0) {
                $remarks = 'Updated ' . implode(', ', $rest) . ' and ' . $last . '.';
            } else {
                $remarks = 'Updated ' . $last . '.';
            }

            if (array_key_exists('end_date', $validated) && $employee->end_date) {
                $statusLabel = $employee->employment_status;
                $remarks = ucfirst($statusLabel) . " effective " . $employee->end_date->format('M j, Y') . ".";
            }

            \App\Models\EmploymentHistory::create([
                'employee_id' => $employee->id,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
                'employment_status' => $employee->employment_status,
                'salary' => $validated['salary'] ?? null,
                'salary_type' => $validated['salary_type'] ?? 'monthly',
                'effective_date' => now(),
                'end_date' => $employee->end_date,
                'remarks' => $remarks,
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
            'salary' => 'nullable|numeric|min:0',
            'salary_type' => 'nullable|in:monthly,daily,hourly',
            'tin' => 'nullable|string|max:50',
            'sss_number' => 'nullable|string|max:50',
            'philhealth_number' => 'nullable|string|max:50',
            'pagibig_number' => 'nullable|string|max:50',
        ];

        return $request->validate($rules);
    }
}