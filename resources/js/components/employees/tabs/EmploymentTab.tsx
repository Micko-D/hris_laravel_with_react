import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { EmployeeFormData, Department, Position } from '@/types/employee'

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
    readonly?: boolean
}

export function EmploymentTab({
    data,
    setData,
    errors,
    departments,
    positions,
    readonly = false,
}: EmploymentTabProps) {
    return (
        <div className="grid gap-6">
            {/* Employment Status */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Employment Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="department_id">Department</Label>
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
                        <Label htmlFor="position_id">Position / Job Title</Label>
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

            {/* Dates */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Dates</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                </div>
            </div>

            {/* Government Numbers */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Government Numbers (Optional)</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="tin">TIN</Label>
                        <Input
                            id="tin"
                            value={data.tin}
                            onChange={(e) => setData('tin', e.target.value)}
                            disabled={readonly}
                            placeholder="XXX-XXX-XXX-XXX"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="sss_number">SSS Number</Label>
                        <Input
                            id="sss_number"
                            value={data.sss_number}
                            onChange={(e) => setData('sss_number', e.target.value)}
                            disabled={readonly}
                            placeholder="XX-XXXXXXX-X"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="philhealth_number">PhilHealth Number</Label>
                        <Input
                            id="philhealth_number"
                            value={data.philhealth_number}
                            onChange={(e) => setData('philhealth_number', e.target.value)}
                            disabled={readonly}
                            placeholder="XXXX-XXXX-XXXX"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="pagibig_number">Pag-IBIG Number</Label>
                        <Input
                            id="pagibig_number"
                            value={data.pagibig_number}
                            onChange={(e) => setData('pagibig_number', e.target.value)}
                            disabled={readonly}
                            placeholder="XXXX-XXXX-XXXX"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
