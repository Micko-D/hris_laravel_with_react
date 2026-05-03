import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { GovernmentId } from '@/types/employee'

const ID_TYPES = [
    { value: 'tin', label: 'TIN (Tax Identification Number)' },
    { value: 'sss', label: 'SSS Number' },
    { value: 'philhealth', label: 'PhilHealth Number' },
    { value: 'pagibig', label: 'Pag-IBIG / HDMF Number' },
]

const MAX_ID_NUMBER_LENGTH = 50
const MAX_REMARKS_LENGTH = 255

interface DeleteTarget {
    id: string
    label: string
}

interface GovernmentIdsTabProps {
    governmentIds: GovernmentId[]
    employeeId?: string
    readonly?: boolean
    onMutate?: () => void
}

export function GovernmentIdsTab({
    governmentIds,
    employeeId,
    readonly = false,
    onMutate,
}: GovernmentIdsTabProps) {
    const [open, setOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

    const [type, setType] = useState<'tin' | 'sss' | 'philhealth' | 'pagibig'>('tin')
    const [number, setNumber] = useState('')
    const [remarks, setRemarks] = useState('')
    const [processing, setProcessing] = useState(false)

    const openAdd = () => {
        setType('tin')
        setNumber('')
        setRemarks('')
        setEditingId(null)
        setOpen(true)
    }

    const openEdit = (gid: GovernmentId) => {
        setType(gid.type as 'tin' | 'sss' | 'philhealth' | 'pagibig')
        setNumber(gid.number)
        setRemarks(gid.remarks ?? '')
        setEditingId(gid.id)
        setOpen(true)
    }

    const handleSubmit = async () => {
        if (!employeeId) return

        if (!number.trim()) {
            toast.error('ID number is required.')
            return
        }
        if (number.length > MAX_ID_NUMBER_LENGTH) {
            toast.error(`ID number must not exceed ${MAX_ID_NUMBER_LENGTH} characters.`)
            return
        }
        if (remarks.length > MAX_REMARKS_LENGTH) {
            toast.error(`Remarks must not exceed ${MAX_REMARKS_LENGTH} characters.`)
            return
        }

        setProcessing(true)

        try {
            const isEdit = !!editingId
            const url = isEdit
                ? `/api/v1/employees/${employeeId}/government-ids/${editingId}`
                : `/api/v1/employees/${employeeId}/government-ids`

            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ type, number, remarks }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(Object.values(data.errors ?? {}).flat()[0] as string || 'Something went wrong.')
                return
            }

            toast.success(isEdit ? 'Government ID updated.' : 'Government ID added.')
            setOpen(false)
            onMutate?.()
        } catch {
            toast.error('Network error. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async () => {
        if (!employeeId || !deleteTarget) return
        const id = deleteTarget.id

        try {
            const res = await fetch(
                `/api/v1/employees/${employeeId}/government-ids/${id}`,
                { method: 'DELETE', headers: { Accept: 'application/json' } }
            )

            const text = await res.text()
            let data: { errors?: unknown; message?: string } = {}
            try { data = JSON.parse(text) } catch {}

            if (!res.ok) {
                toast.error(Object.values(data.errors ?? {}).flat()[0] as string || `Delete failed (HTTP ${res.status})`)
                return
            }

            toast.success('Government ID deleted.')
            setDeleteTarget(null)
            onMutate?.()
        } catch {
            toast.error('Network error. Please try again.')
        }
    }

    return (
        <div className="space-y-4">
            {!readonly && (
                <div className="flex justify-end">
                    <Button onClick={openAdd} type="button">
                        <Plus className="size-4" />
                        Add ID
                    </Button>
                </div>
            )}

            {governmentIds.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                    No government IDs on record.
                </p>
            ) : (
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="h-10 px-4 text-left font-medium">ID Type</th>
                                <th className="h-10 px-4 text-left font-medium">Number</th>
                                <th className="h-10 px-4 text-left font-medium">Remarks</th>
                                {!readonly && (
                                    <th className="h-10 px-4 text-right font-medium">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {governmentIds.map((gid) => (
                                <tr key={gid.id} className="border-b">
                                    <td className="px-4 py-3">
                                        {ID_TYPES.find((t) => t.value === gid.type)?.label ?? gid.type}
                                    </td>
                                    <td className="px-4 py-3 font-mono">{gid.number}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{gid.remarks ?? '—'}</td>
                                    {!readonly && (
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(gid)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            id: gid.id,
                                                            label: `${ID_TYPES.find((t) => t.value === gid.type)?.label ?? gid.type} ${gid.number}`,
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Government ID?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove &quot;{deleteTarget?.label}&quot; from this employee. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} type="button">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} type="button">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Edit Government ID' : 'Add Government ID'}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the government-issued ID details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                            <Label>ID Type *</Label>
                            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ID_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>ID Number *</Label>
                            <Input
                                value={number}
                                maxLength={MAX_ID_NUMBER_LENGTH}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="e.g. 123-456-789-000"
                            />
                            <p className="text-xs text-muted-foreground">
                                Required. Max {MAX_ID_NUMBER_LENGTH} characters.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Remarks</Label>
                            <Input
                                value={remarks}
                                maxLength={MAX_REMARKS_LENGTH}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Optional notes about this ID"
                            />
                            <p className="text-xs text-muted-foreground">
                                Max {MAX_REMARKS_LENGTH} characters ({remarks.length}/{MAX_REMARKS_LENGTH})
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={(e) => { e.stopPropagation(); setOpen(false) }} type="button">
                            Cancel
                        </Button>
                        <Button onClick={(e) => { e.stopPropagation(); handleSubmit() }} disabled={processing} type="button">
                            {processing ? 'Saving...' : editingId ? 'Update' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
