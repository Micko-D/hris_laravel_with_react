import { Head, usePage } from '@inertiajs/react'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { employeesCreate } from '@/routes/employees'
import type { Employee, Department } from '@/types/employee'

export default function EmployeesIndexPage() {
    const { employees, departments } = usePage<{
        employees: { data: Employee[]; links: unknown[] }
        departments: Department[]
    }>().props

    return (
        <>
            <Head title="Employees" />
            <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage employee records, profiles, and documents.
                        </p>
                    </div>
                </div>
                <EmployeeTable
                    employees={employees.data}
                    departments={departments}
                    onDelete={(id) => {
                        if (confirm('Are you sure you want to delete this employee?')) {
                            fetch(`/api/v1/employees/${id}`, { method: 'DELETE' }).then(() => {
                                window.location.reload()
                            })
                        }
                    }}
                />
            </div>
        </>
    )
}

EmployeesIndexPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
    ],
}