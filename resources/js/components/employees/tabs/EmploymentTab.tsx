import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { EmployeeFormData, Department, Position, GovernmentId } from '@/types/employee'

const SALARY_TYPE_OPTIONS = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'daily', label: 'Daily' },
    { value: 'hourly', label: 'Hourly' },
]

const STATUS_OPTIONS = [
    { value: 'regular', label: 'Regular' },
    { value: 'probationary', label: 'Probationary' },
    { value: 'contractual', label: 'Contractual' },
    { value: 'resigned', label: 'Resigned' },
    { value: 'terminated', label: 'Terminated' },
]

interface EmploymentTabProps {
    data: EmployeeFormData
    setData: (key: keyof EmployeeFormData, value: string) => void
    errors: Partial<Record<keyof EmployeeFormData, string>>
    departments: Department[]
    positions: Position[]
    governmentIds?: GovernmentId[]
    readonly?: boolean
}

export function EmploymentTab({
    data,
    setData,
    errors,
    departments,
    positions,
    governmentIds = [],
    readonly = false,
}: EmploymentTabProps) {
    const govIdMap = Object.fromEntries(
        governmentIds.map((g) => [g.type, g.number])
    )
    return (
        <div className="grid gap-6">
            {/* Employment Status */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Employment Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="department_id">Department *</Label>
                        <Select
                            value={data.department_id ?? undefined}
                            onValueChange={(v) => setData('department_id', v)}
                            disabled={readonly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="position_id">Position / Job Title *</Label>
                        <Select
                            value={data.position_id ?? undefined}
                            onValueChange={(v) => setData('position_id', v)}
                            disabled={readonly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {positions.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="employment_status">Employment Status *</Label>
                        <Select
                            value={data.employment_status}
                            onValueChange={(v) => setData('employment_status', v)}
                            disabled={readonly}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Dates & Salary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                    <Label htmlFor="hire_date">Hire Date *</Label>
                    <Input
                        id="hire_date"
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={data.hire_date}
                        onChange={(e) => setData('hire_date', e.target.value)}
                        disabled={readonly}
                        invalid={!!errors.hire_date}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={data.end_date}
                        onChange={(e) => setData('end_date', e.target.value)}
                        disabled={readonly}
                    />
                    <p className="text-xs text-muted-foreground">
                        Fill only if employment has ended.
                    </p>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="salary">Salary *</Label>
                    <Input
                        id="salary"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={data.salary ?? ''}
                        onChange={(e) => setData('salary', e.target.value)}
                        disabled={readonly}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="salary_type">Pay Type *</Label>
                    <Select
                        value={data.salary_type ?? 'monthly'}
                        onValueChange={(v) => setData('salary_type', v)}
                        disabled={readonly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SALARY_TYPE_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Government Numbers — sourced from Government IDs tab, displayed here for reference */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Government Numbers</h3>
                <p className="text-xs text-muted-foreground mb-3">
                    Manage government-issued ID numbers in the Government IDs tab.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="tin">TIN</Label>
                        <Input
                            id="tin"
                            value={govIdMap['tin'] ?? ''}
                            readOnly
                            placeholder="Added via Government IDs tab"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="sss_number">SSS Number</Label>
                        <Input
                            id="sss_number"
                            value={govIdMap['sss'] ?? ''}
                            readOnly
                            placeholder="Added via Government IDs tab"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="philhealth_number">PhilHealth Number</Label>
                        <Input
                            id="philhealth_number"
                            value={govIdMap['philhealth'] ?? ''}
                            readOnly
                            placeholder="Added via Government IDs tab"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="pagibig_number">Pag-IBIG Number</Label>
                        <Input
                            id="pagibig_number"
                            value={govIdMap['pagibig'] ?? ''}
                            readOnly
                            placeholder="Added via Government IDs tab"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
