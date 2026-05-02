import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { Pencil, Plus, Search, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import type { Employee } from '@/types/employee'

interface EmployeeTableProps {
    employees: Employee[]
    departments: { id: string; name: string }[]
    onDelete: (id: string) => void
    loading?: boolean
}

const STATUS_LABELS: Record<string, string> = {
    regular: 'Regular',
    probationary: 'Probationary',
    contractual: 'Contractual',
    resigned: 'Resigned',
    terminated: 'Terminated',
}

const STATUS_COLORS: Record<string, string> = {
    regular: 'bg-green-100 text-green-800',
    probationary: 'bg-yellow-100 text-yellow-800',
    contractual: 'bg-blue-100 text-blue-800',
    resigned: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800',
}

export function EmployeeTable({
    employees,
    departments,
    onDelete,
    loading = false,
}: EmployeeTableProps) {
    const [search, setSearch] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const filtered = employees.filter((emp) => {
        const matchSearch =
            !search ||
            `${emp.first_name} ${emp.last_name}`
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            emp.employee_number.toLowerCase().includes(search.toLowerCase()) ||
            emp.email.toLowerCase().includes(search.toLowerCase())

        const matchDept =
            !departmentFilter || emp.department_id === departmentFilter
        const matchStatus = !statusFilter || emp.employment_status === statusFilter

        return matchSearch && matchDept && matchStatus
    })

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search name or employee number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                                {d.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button asChild>
                    <Link href="/employees/create">
                        <Plus className="size-4" />
                        Add Employee
                    </Link>
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="h-10 px-4 text-left font-medium">Employee #</th>
                            <th className="h-10 px-4 text-left font-medium">Name</th>
                            <th className="h-10 px-4 text-left font-medium">Department</th>
                            <th className="h-10 px-4 text-left font-medium">Position</th>
                            <th className="h-10 px-4 text-left font-medium">Status</th>
                            <th className="h-10 px-4 text-left font-medium">Email</th>
                            <th className="h-10 px-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    Loading...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    No employees found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((emp) => (
                                <tr key={emp.id} className="border-b hover:bg-muted/30">
                                    <td className="px-4 py-3 font-mono text-xs">{emp.employee_number}</td>
                                    <td className="px-4 py-3">
                                        {emp.first_name} {emp.last_name}
                                        {emp.suffix && <span className="ml-1">{emp.suffix}</span>}
                                    </td>
                                    <td className="px-4 py-3">{emp.department?.name ?? '—'}</td>
                                    <td className="px-4 py-3">{emp.position?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                STATUS_COLORS[emp.employment_status] ?? ''
                                            }`}
                                        >
                                            {STATUS_LABELS[emp.employment_status] ?? emp.employment_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{emp.email}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" asChild title="View">
                                                <Link href={`/employees/${emp.id}`}>
                                                    <Eye className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild title="Edit">
                                                <Link href={`/employees/${emp.id}/edit`}>
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Delete"
                                                        onClick={() => setDeleteId(emp.id)}
                                                    >
                                                        <Trash2 className="size-4 text-destructive" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Delete Employee</DialogTitle>
                                                        <DialogDescription>
                                                            Are you sure you want to delete this employee? This action cannot be undone.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => {
                                                                if (deleteId) onDelete(deleteId)
                                                                setDeleteId(null)
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}