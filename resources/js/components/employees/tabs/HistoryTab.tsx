import type { EmploymentHistory } from '@/types/employee'

const STATUS_LABELS: Record<string, string> = {
    regular: 'Regular',
    probationary: 'Probationary',
    contractual: 'Contractual',
    resigned: 'Resigned',
    terminated: 'Terminated',
}

interface HistoryTabProps {
    histories: EmploymentHistory[]
    readonly?: boolean
}

export function HistoryTab({ histories, readonly = true }: HistoryTabProps) {
    return (
        <div className="space-y-4">
            {histories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                    No employment history on record.
                </p>
            ) : (
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="h-10 px-4 text-left font-medium">Effective Date</th>
                                <th className="h-10 px-4 text-left font-medium">Department</th>
                                <th className="h-10 px-4 text-left font-medium">Position</th>
                                <th className="h-10 px-4 text-left font-medium">Status</th>
                                <th className="h-10 px-4 text-left font-medium">Salary</th>
                                <th className="h-10 px-4 text-left font-medium">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {histories.map((h) => (
                                <tr key={h.id} className="border-b">
                                    <td className="px-4 py-3">
                                        {new Date(h.effective_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">{h.department?.name ?? '—'}</td>
                                    <td className="px-4 py-3">{h.position?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {STATUS_LABELS[h.employment_status] ?? h.employment_status}
                                    </td>
                                    <td className="px-4 py-3">
                                        {h.salary
                                            ? `PHP ${parseFloat(h.salary).toLocaleString('en-PH', {
                                                  minimumFractionDigits: 2,
                                              })}`
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {h.remarks ?? '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}