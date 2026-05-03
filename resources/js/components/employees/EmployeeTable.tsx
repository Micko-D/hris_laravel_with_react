import { useState, useMemo } from 'react'
import { Link } from '@inertiajs/react'
import { Pencil, Plus, Search, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
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
} from '@/components/ui/dialog'
import { Pagination } from './tabs/TablePagination'
import type { Employee } from '@/types/employee'

interface EmployeeTableProps {
    employees: Employee[]
    departments: { id: string; name: string }[]
    positions: { id: string; name: string }[]
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

type SortColumn = 'employee_number' | 'name' | 'department' | 'position' | 'status' | 'hire_date'
type SortDir = 'asc' | 'desc'

export function EmployeeTable({ employees, departments, positions, onDelete, loading = false }: EmployeeTableProps) {
    const [searchNumber, setSearchNumber] = useState('')
    const [searchName, setSearchName] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [positionFilter, setPositionFilter] = useState('')
    const [search, setSearch] = useState('')
    const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
    const [sortCol, setSortCol] = useState<SortColumn>('hire_date')
    const [sortDir, setSortDir] = useState<SortDir>('desc')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const filtered = useMemo(() => {
        return employees.filter((emp) => {
            if (searchNumber && !emp.employee_number.toLowerCase().includes(searchNumber.toLowerCase())) return false
            if (searchName) {
                const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
                if (!fullName.includes(searchName.toLowerCase())) return false
            }
            if (departmentFilter && departmentFilter !== '__all__' && emp.department_id !== departmentFilter) return false
            if (positionFilter && positionFilter !== '__all__' && emp.position_id !== positionFilter) return false
            if (search) {
                const q = search.toLowerCase()
                const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
                const deptName = emp.department?.name?.toLowerCase() ?? ''
                const posName = emp.position?.name?.toLowerCase() ?? ''
                if (
                    !emp.employee_number.toLowerCase().includes(q) &&
                    !fullName.includes(q) &&
                    !deptName.includes(q) &&
                    !posName.includes(q)
                ) return false
            }
            return true
        })
    }, [employees, searchNumber, searchName, departmentFilter, positionFilter, search])

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            let diff = 0
            if (sortCol === 'employee_number') {
                diff = a.employee_number.localeCompare(b.employee_number)
            } else if (sortCol === 'name') {
                const aName = `${a.last_name} ${a.first_name}`.toLowerCase()
                const bName = `${b.last_name} ${b.first_name}`.toLowerCase()
                diff = aName.localeCompare(bName)
            } else if (sortCol === 'department') {
                diff = (a.department?.name ?? '').localeCompare(b.department?.name ?? '')
            } else if (sortCol === 'position') {
                diff = (a.position?.name ?? '').localeCompare(b.position?.name ?? '')
            } else if (sortCol === 'status') {
                diff = a.employment_status.localeCompare(b.employment_status)
            } else {
                diff = new Date(a.hire_date).getTime() - new Date(b.hire_date).getTime()
            }
            if (diff !== 0) return sortDir === 'asc' ? diff : -diff
            return sortDir === 'asc'
                ? a.employee_number.localeCompare(b.employee_number)
                : b.employee_number.localeCompare(a.employee_number)
        })
    }, [filtered, sortCol, sortDir])

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * perPage
        return sorted.slice(start, start + perPage)
    }, [sorted, page, perPage])

    const toggleSort = (col: SortColumn) => {
        if (sortCol === col) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortCol(col)
            setSortDir('desc')
        }
        setPage(1)
    }

    const SortIcon = ({ col }: { col: SortColumn }) => {
        if (sortCol !== col) return <ArrowUpDown className="size-3.5 ml-1 inline opacity-40" />
        return sortDir === 'asc'
            ? <ArrowUp className="size-3.5 ml-1 inline text-primary" />
            : <ArrowDown className="size-3.5 ml-1 inline text-primary" />
    }

    const th = (col: SortColumn, label: string) => (
        <th className="h-10 px-4 text-left font-medium">
            <button
                type="button"
                className="flex items-center cursor-pointer hover:text-primary"
                onClick={() => toggleSort(col)}
            >
                {label}<SortIcon col={col} />
            </button>
        </th>
    )

    return (
        <div className="space-y-4">
            {/* Row 1: Add — right aligned */}
            <div className="flex justify-end">
                <Button asChild>
                    <Link href="/employees/create"><Plus className="size-4" />Add Employee</Link>
                </Button>
            </div>

            {/* Row 2: Employee # | Department */}
            <div className="flex items-center gap-3">
                <Input
                    placeholder="Employee #"
                    value={searchNumber}
                    onChange={(e) => { setSearchNumber(e.target.value); setPage(1) }}
                    className="flex-1"
                />
                <Select value={departmentFilter} onValueChange={(v) => { setDepartmentFilter(v); setPage(1) }}>
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__all__">All Departments</SelectItem>
                        {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Row 3: Employee Name | Position */}
            <div className="flex items-center gap-3">
                <Input
                    placeholder="Employee Name"
                    value={searchName}
                    onChange={(e) => { setSearchName(e.target.value); setPage(1) }}
                    className="flex-1"
                />
                <Select value={positionFilter} onValueChange={(v) => { setPositionFilter(v); setPage(1) }}>
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__all__">All Positions</SelectItem>
                        {positions.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Row 4: Search — right aligned, same size as Documents/History search */}
            <div className="flex items-center justify-end gap-3">
                <div className="relative w-52">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-8 w-full"
                    />
                </div>
            </div>

            {loading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
            ) : employees.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No employees found.</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No results found.</p>
            ) : (
                <>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    {th('employee_number', 'Employee #')}
                                    {th('name', 'Name')}
                                    {th('department', 'Department')}
                                    {th('position', 'Position')}
                                    {th('status', 'Status')}
                                    {th('hire_date', 'Date Hired')}
                                    <th className="h-10 px-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRows.map((emp) => (
                                    <tr key={emp.id} className="border-b hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs">{emp.employee_number}</td>
                                        <td className="px-4 py-3 font-medium">
                                            {emp.last_name}, {emp.first_name}
                                            {emp.suffix && <span className="ml-1">{emp.suffix}</span>}
                                        </td>
                                        <td className="px-4 py-3">{emp.department?.name ?? '—'}</td>
                                        <td className="px-4 py-3">{emp.position?.name ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[emp.employment_status] ?? ''}`}>
                                                {STATUS_LABELS[emp.employment_status] ?? emp.employment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(emp.hire_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild title="View">
                                                    <Link href={`/employees/${emp.id}`}><Eye className="size-4" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild title="Edit">
                                                    <Link href={`/employees/${emp.id}/edit`}><Pencil className="size-4" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(emp)} title="Delete">
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        total={filtered.length}
                        page={page}
                        perPage={perPage}
                        onPageChange={setPage}
                        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
                    />
                </>
            )}

            <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Employee?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete{' '}
                            <strong>
                                {deleteTarget?.first_name} {deleteTarget?.last_name}
                                {deleteTarget?.suffix && ` ${deleteTarget.suffix}`}
                            </strong>{' '}
                            (<span className="font-mono">{deleteTarget?.employee_number}</span>) and all associated records. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deleteTarget) onDelete(deleteTarget.id)
                                setDeleteTarget(null)
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}