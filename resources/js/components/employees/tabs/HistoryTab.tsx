import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react'
import type { EmploymentHistory } from '@/types/employee'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination } from './TablePagination'

const STATUS_LABELS: Record<string, string> = {
    regular: 'Regular',
    probationary: 'Probationary',
    contractual: 'Contractual',
    resigned: 'Resigned',
    terminated: 'Terminated',
}

type SortColumn = 'effective_date' | 'salary'
type SortDir = 'asc' | 'desc'

interface ChangeInfo {
    field: 'department' | 'position' | 'status' | 'salary'
    from: string | null
    to: string | null
    salaryDelta?: number
}

function detectChanges(current: EmploymentHistory, previous: EmploymentHistory | null): ChangeInfo[] {
    const changes: ChangeInfo[] = []
    if (!previous) return changes

    if (current.department_id !== previous.department_id) {
        changes.push({ field: 'department', from: previous.department?.name ?? null, to: current.department?.name ?? null })
    }
    if (current.position_id !== previous.position_id) {
        changes.push({ field: 'position', from: previous.position?.name ?? null, to: current.position?.name ?? null })
    }
    if (current.employment_status !== previous.employment_status) {
        changes.push({
            field: 'status',
            from: STATUS_LABELS[previous.employment_status] ?? previous.employment_status,
            to: STATUS_LABELS[current.employment_status] ?? current.employment_status,
        })
    }

    const currentSalary = parseFloat(current.salary ?? '0')
    const previousSalary = parseFloat(previous.salary ?? '0')
    if (!isNaN(currentSalary) && !isNaN(previousSalary) && currentSalary !== previousSalary) {
        changes.push({ field: 'salary', from: previous.salary, to: current.salary, salaryDelta: currentSalary - previousSalary })
    }

    return changes
}

function getChange(changes: ChangeInfo[], field: ChangeInfo['field']) {
    return changes.find((c) => c.field === field)
}

function formatSalary(salary: string | null, salaryType: string | null): string {
    if (!salary) return '—'
    const num = parseFloat(salary)
    switch (salaryType) {
        case 'daily': return `PHP ${num.toLocaleString('en-PH', { minimumFractionDigits: 2 })}/day`
        case 'hourly': return `PHP ${num.toLocaleString('en-PH', { minimumFractionDigits: 2 })}/hr`
        default: return `PHP ${num.toLocaleString('en-PH', { minimumFractionDigits: 2 })}/mo`
    }
}

interface HistoryTabProps {
    histories: EmploymentHistory[]
    readonly?: boolean
}

export function HistoryTab({ histories, readonly = true }: HistoryTabProps) {
    const [sortCol, setSortCol] = useState<SortColumn>('effective_date')
    const [sortDir, setSortDir] = useState<SortDir>('desc')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const toggleSort = (col: SortColumn) => {
        if (sortCol === col) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortCol(col)
            setSortDir('desc')
        }
    }

    const filtered = useMemo(() => {
        let rows = [...histories]

        if (sortCol === 'effective_date') {
            rows.sort((a, b) => {
                const diff = new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime()
                if (diff !== 0) return sortDir === 'asc' ? diff : -diff
                const aTime = new Date(a.created_at).getTime()
                const bTime = new Date(b.created_at).getTime()
                return sortDir === 'asc' ? aTime - bTime : bTime - aTime
            })
        } else {
            rows.sort((a, b) => {
                const diff = parseFloat(a.salary ?? '0') - parseFloat(b.salary ?? '0')
                if (diff !== 0) return sortDir === 'asc' ? diff : -diff
                const aTime = new Date(a.created_at).getTime()
                const bTime = new Date(b.created_at).getTime()
                return sortDir === 'asc' ? aTime - bTime : bTime - aTime
            })
        }

        if (!search.trim()) return rows
        const q = search.toLowerCase()
        return rows.filter(
            (h) =>
                h.remarks?.toLowerCase().includes(q) ||
                h.department?.name?.toLowerCase().includes(q) ||
                h.position?.name?.toLowerCase().includes(q) ||
                STATUS_LABELS[h.employment_status]?.toLowerCase().includes(q)
        )
    }, [histories, sortCol, sortDir, search])

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * perPage
        return filtered.slice(start, start + perPage)
    }, [filtered, page, perPage])

    const changeMap = useMemo(() => {
        const map = new Map<string, ChangeInfo[]>()
        const original = [...histories].sort(
            (a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime()
        )
        original.forEach((h, i) => {
            if (i === 0) return
            map.set(h.id, detectChanges(h, original[i - 1]))
        })
        return map
    }, [histories])

    const SortIcon = ({ col }: { col: SortColumn }) => {
        if (sortCol !== col) return <ArrowUpDown className="size-3.5 ml-1 inline" />
        return sortDir === 'asc' ? <ArrowUp className="size-3.5 ml-1 inline text-primary" /> : <ArrowDown className="size-3.5 ml-1 inline text-primary" />
    }

    return (
        <div className="space-y-4">
            {/* Desktop: opposite ends (sort/upload left, search right) | Mobile/tablet: search first, sort below */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Sort — left on desktop, second row on mobile */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground md:flex-none">
                    <span>Sort:</span>
                    <Button variant={sortDir === 'asc' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2 text-xs" onClick={() => setSortDir('asc')}>Oldest</Button>
                    <Button variant={sortDir === 'desc' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2 text-xs" onClick={() => setSortDir('desc')}>Newest</Button>
                </div>
                {/* Search — right on desktop, first row on mobile */}
                <div className="relative md:ml-auto">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search history..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-8 w-full md:w-52"
                    />
                </div>
            </div>

            {histories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No employment history on record.</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No results for &quot;{search}&quot;.</p>
            ) : (
                <>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-10 px-4 text-left font-medium">
                                        <Button variant="ghost" size="sm" className="-ml-2 h-auto p-1 px-1.5 cursor-pointer" onClick={() => toggleSort('effective_date')}>
                                            Effective Date<SortIcon col="effective_date" />
                                        </Button>
                                    </th>
                                    <th className="h-10 px-4 text-left font-medium">Department</th>
                                    <th className="h-10 px-4 text-left font-medium">Position</th>
                                    <th className="h-10 px-4 text-left font-medium">Status</th>
                                    <th className="h-10 px-4 text-left font-medium">
                                        <Button variant="ghost" size="sm" className="-ml-2 h-auto p-1 px-1.5 cursor-pointer" onClick={() => toggleSort('salary')}>
                                            Salary<SortIcon col="salary" />
                                        </Button>
                                    </th>
                                    <th className="h-10 px-4 text-left font-medium">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRows.map((h) => {
                                    const changes = changeMap.get(h.id) ?? []
                                    const deptChange = getChange(changes, 'department')
                                    const posChange = getChange(changes, 'position')
                                    const statusChange = getChange(changes, 'status')
                                    const salaryChange = getChange(changes, 'salary')
                                    const previous = histories.find((x) => x.id !== h.id && new Date(x.effective_date) < new Date(h.effective_date))

                                    return (
                                        <tr key={h.id} className="border-b">
                                            <td className="px-4 py-3">{new Date(h.effective_date).toLocaleDateString()}</td>
                                            <td className={`px-4 py-3 ${deptChange ? 'text-blue-600 font-medium' : 'text-muted-foreground'}`}>
                                                {deptChange ? (
                                                    <span>{deptChange.to}<span className="ml-1.5 text-xs text-blue-400">(was {deptChange.from})</span></span>
                                                ) : h.department?.name ?? '—'}
                                            </td>
                                            <td className={`px-4 py-3 ${posChange ? 'text-purple-600 font-medium' : 'text-muted-foreground'}`}>
                                                {posChange ? (
                                                    <span>{posChange.to}<span className="ml-1.5 text-xs text-purple-400">(was {posChange.from})</span></span>
                                                ) : h.position?.name ?? '—'}
                                            </td>
                                            <td className={`px-4 py-3 ${statusChange ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                                                {statusChange ? (
                                                    <span>{statusChange.to}<span className="ml-1.5 text-xs text-orange-400">(was {statusChange.from})</span></span>
                                                ) : STATUS_LABELS[h.employment_status] ?? h.employment_status}
                                            </td>
                                            <td className="px-4 py-3">
                                                {salaryChange ? (
                                                    <span className={salaryChange.salaryDelta && salaryChange.salaryDelta > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                        {formatSalary(salaryChange.to ?? null, h.salary_type)}
                                                        {salaryChange.salaryDelta && salaryChange.salaryDelta > 0 && <span className="ml-1">▲</span>}
                                                        {salaryChange.salaryDelta && salaryChange.salaryDelta < 0 && <span className="ml-1">▼</span>}
                                                        <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                                                            (was {formatSalary(salaryChange.from ?? null, previous?.salary_type ?? null)})
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">{formatSalary(h.salary, h.salary_type)}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{h.remarks ?? '—'}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Pagination total={filtered.length} page={page} perPage={perPage} onPageChange={setPage} onPerPageChange={(n) => { setPerPage(n); setPage(1) }} />
                </>
            )}
        </div>
    )
}