import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { EmployeeDependent } from '@/types/employee'

const RELATIONSHIP_OPTIONS = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
]

const MAX_NAME_LENGTH = 255
const MAX_CONTACT_LENGTH = 30

interface DeleteTarget {
    id: string
    label: string
}

interface DependentsTabProps {
    dependents: EmployeeDependent[]
    employeeId?: string
    readonly?: boolean
    onMutate?: () => void
}

export function DependentsTab({
    dependents,
    employeeId,
    readonly = false,
    onMutate,
}: DependentsTabProps) {
    const [open, setOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

    const [name, setName] = useState('')
    const [relationship, setRelationship] = useState<'spouse' | 'child' | 'parent' | 'sibling'>('child')
    const [birthDate, setBirthDate] = useState('')
    const [contactNumber, setContactNumber] = useState('')
    const [isDependentForTax, setIsDependentForTax] = useState(true)
    const [processing, setProcessing] = useState(false)

    const openAdd = () => {
        setName('')
        setRelationship('child')
        setBirthDate('')
        setContactNumber('')
        setIsDependentForTax(true)
        setEditingId(null)
        setOpen(true)
    }

    const openEdit = (dep: EmployeeDependent) => {
        setName(dep.name)
        setRelationship(dep.relationship)
        setBirthDate(dep.birth_date ?? '')
        setContactNumber(dep.contact_number ?? '')
        setIsDependentForTax(dep.is_dependent_for_tax)
        setEditingId(dep.id)
        setOpen(true)
    }

    const handleSubmit = async () => {
        if (!employeeId) return

        if (!name.trim()) {
            toast.error('Full name is required.')
            return
        }
        if (name.length > MAX_NAME_LENGTH) {
            toast.error(`Full name must not exceed ${MAX_NAME_LENGTH} characters.`)
            return
        }

        setProcessing(true)

        try {
            const isEdit = !!editingId
            const url = isEdit
                ? `/api/v1/employees/${employeeId}/dependents/${editingId}`
                : `/api/v1/employees/${employeeId}/dependents`

            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name,
                    relationship,
                    birth_date: birthDate || null,
                    contact_number: contactNumber || null,
                    is_dependent_for_tax: isDependentForTax,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(Object.values(data.errors ?? {}).flat()[0] as string || 'Something went wrong.')
                return
            }

            toast.success(isEdit ? 'Dependent updated.' : 'Dependent added.')
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
                `/api/v1/employees/${employeeId}/dependents/${id}`,
                { method: 'DELETE', headers: { Accept: 'application/json' } }
            )

            const text = await res.text()
            let data: { errors?: unknown; message?: string } = {}
            try { data = JSON.parse(text) } catch {}

            if (!res.ok) {
                toast.error(Object.values(data.errors ?? {}).flat()[0] as string || `Delete failed (HTTP ${res.status})`)
                return
            }

            toast.success('Dependent removed.')
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
                        Add Dependent
                    </Button>
                </div>
            )}

            {dependents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                    No dependents on record. Dependents are used for tax exemption purposes.
                </p>
            ) : (
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="h-10 px-4 text-left font-medium">Name</th>
                                <th className="h-10 px-4 text-left font-medium">Relationship</th>
                                <th className="h-10 px-4 text-left font-medium">Birth Date</th>
                                <th className="h-10 px-4 text-left font-medium">Contact</th>
                                <th className="h-10 px-4 text-left font-medium">For Tax</th>
                                {!readonly && (
                                    <th className="h-10 px-4 text-right font-medium">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {dependents.map((dep) => (
                                <tr key={dep.id} className="border-b">
                                    <td className="px-4 py-3 font-medium">{dep.name}</td>
                                    <td className="px-4 py-3">
                                        {RELATIONSHIP_OPTIONS.find((r) => r.value === dep.relationship)
                                            ?.label ?? dep.relationship}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {dep.birth_date
                                            ? new Date(dep.birth_date).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {dep.contact_number ?? '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {dep.is_dependent_for_tax ? (
                                            <span className="text-xs text-green-700 font-medium">Yes</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No</span>
                                        )}
                                    </td>
                                    {!readonly && (
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(dep)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteTarget({ id: dep.id, label: dep.name })
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
                        <DialogTitle>Remove Dependent?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove &quot;{deleteTarget?.label}&quot; from this employee. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} type="button">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} type="button">
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Edit Dependent' : 'Add Dependent'}
                        </DialogTitle>
                        <DialogDescription>
                            Dependents are used for tax exemption under TRAIN Law.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                            <Label>Full Name *</Label>
                            <Input
                                value={name}
                                maxLength={MAX_NAME_LENGTH}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Juan P. Dela Cruz"
                            />
                            <p className="text-xs text-muted-foreground">
                                Required. Max {MAX_NAME_LENGTH} characters.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Relationship *</Label>
                            <Select value={relationship} onValueChange={(v) => setRelationship(v as typeof relationship)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {RELATIONSHIP_OPTIONS.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Birth Date</Label>
                                <Input
                                    type="date"
                                    max={new Date().toISOString().split('T')[0]}
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Contact Number</Label>
                                <Input
                                    value={contactNumber}
                                    maxLength={MAX_CONTACT_LENGTH}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    placeholder="e.g. 0917-123-4567"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_dependent_for_tax"
                                checked={isDependentForTax}
                                onCheckedChange={(v) => setIsDependentForTax(Boolean(v))}
                            />
                            <Label htmlFor="is_dependent_for_tax" className="text-sm font-normal cursor-pointer">
                                Qualifies for tax exemption (TRAIN Law)
                            </Label>
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
