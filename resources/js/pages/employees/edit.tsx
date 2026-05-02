import { Head, usePage } from '@inertiajs/react'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import type { Employee, Department, Position, GovernmentId, EmployeeDependent, EmployeeDocument, EmploymentHistory } from '@/types/employee'

export default function EditEmployeePage() {
    const {
        employee,
        departments,
        positions,
        mode,
    } = usePage<{
        employee: Employee
        departments: Department[]
        positions: Position[]
        mode: 'edit' | 'view'
    }>().props

    return (
        <>
            <Head title={employee.first_name + ' ' + employee.last_name + ' — Employee'} />
            <div className="flex flex-col gap-4 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {employee.first_name} {employee.last_name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {mode === 'view' ? 'Viewing employee record.' : 'Editing employee record.'}
                    </p>
                </div>
                <EmployeeForm
                    employee={employee}
                    departments={departments}
                    positions={positions}
                    governmentIds={employee.government_ids}
                    dependents={employee.dependents}
                    documents={employee.documents}
                    employmentHistories={employee.employment_histories}
                    mode={mode}
                />
            </div>
        </>
    )
}

EditEmployeePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: 'Employee Details', href: '/employees' },
    ],
}