import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
    DialogTrigger,
} from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import type { GovernmentId } from '@/types/employee'

const ID_TYPES = [
    { value: 'tin', label: 'TIN (Tax Identification Number)' },
    { value: 'sss', label: 'SSS Number' },
    { value: 'philhealth', label: 'PhilHealth Number' },
    { value: 'pagibig', label: 'Pag-IBIG / HDMF Number' },
]

interface GovernmentIdsTabProps {
    governmentIds: GovernmentId[]
    employeeId?: string
    readonly?: boolean
}

export function GovernmentIdsTab({
    governmentIds,
    employeeId,
    readonly = false,
}: GovernmentIdsTabProps) {
    const [open, setOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        type: 'tin' as 'tin' | 'sss' | 'philhealth' | 'pagibig',
        number: '',
        remarks: '',
    })

    const handleAdd = () => {
        reset()
        setEditingId(null)
        setOpen(true)
    }

    const handleEdit = (id: GovernmentId) => {
        setData({
            type: id.type as 'tin' | 'sss' | 'philhealth' | 'pagibig',
            number: id.number,
            remarks: id.remarks ?? '',
        })
        setEditingId(id.id)
        setOpen(true)
    }

    const handleSubmit = () => {
        if (!employeeId) return

        if (editingId) {
            put(`/api/v1/employees/${employeeId}/government-ids/${editingId}`, {
                onSuccess: () => {
                    setOpen(false)
                    reset()
                    setEditingId(null)
                },
            })
        } else {
            post(`/api/v1/employees/${employeeId}/government-ids`, {
                onSuccess: () => {
                    setOpen(false)
                    reset()
                },
            })
        }
    }

    const handleDelete = (id: string) => {
        if (!employeeId) return
        destroy(`/api/v1/employees/${employeeId}/government-ids/${id}`)
    }

    return (
        <div className="space-y-4">
            {!readonly && (
                <div className="flex justify-end">
                    <Button onClick={handleAdd}>
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
                                                    onClick={() => handleEdit(gid)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(gid.id)}
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

            {/* Add/Edit Dialog */}
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
                            <Select
                                value={data.type}
                                onValueChange={(v) => setData('type', v as typeof data.type)}
                            >
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
                                value={data.number}
                                onChange={(e) => setData('number', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Remarks</Label>
                            <Input
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {editingId ? 'Update' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}