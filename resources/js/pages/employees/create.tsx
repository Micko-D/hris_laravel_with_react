import { Head, usePage } from '@inertiajs/react'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import type { Department, Position } from '@/types/employee'

export default function CreateEmployeePage() {
    const { departments, positions } = usePage<{
        departments: Department[]
        positions: Position[]
    }>().props

    return (
        <>
            <Head title="Add Employee" />
            <div className="flex flex-col gap-4 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Add Employee</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new employee record. All fields marked with * are required.
                    </p>
                </div>
                <EmployeeForm
                    departments={departments}
                    positions={positions}
                    mode="create"
                />
            </div>
        </>
    )
}

CreateEmployeePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: 'Add Employee', href: '/employees/create' },
    ],
}