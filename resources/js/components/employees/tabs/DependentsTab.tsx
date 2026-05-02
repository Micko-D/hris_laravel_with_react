import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
    DialogTrigger,
} from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import type { EmployeeDependent } from '@/types/employee'

const RELATIONSHIP_OPTIONS = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
]

interface DependentsTabProps {
    dependents: EmployeeDependent[]
    employeeId?: string
    readonly?: boolean
}

export function DependentsTab({
    dependents,
    employeeId,
    readonly = false,
}: DependentsTabProps) {
    const [open, setOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
        relationship: 'child' as 'spouse' | 'child' | 'parent' | 'sibling',
        birth_date: '',
        contact_number: '',
        is_dependent_for_tax: true,
    })

    const handleAdd = () => {
        reset()
        setEditingId(null)
        setOpen(true)
    }

    const handleEdit = (dep: EmployeeDependent) => {
        setData({
            name: dep.name,
            relationship: dep.relationship,
            birth_date: dep.birth_date ?? '',
            contact_number: dep.contact_number ?? '',
            is_dependent_for_tax: dep.is_dependent_for_tax,
        })
        setEditingId(dep.id)
        setOpen(true)
    }

    const handleSubmit = () => {
        if (!employeeId) return

        if (editingId) {
            put(`/api/v1/employees/${employeeId}/dependents/${editingId}`, {
                onSuccess: () => {
                    setOpen(false)
                    reset()
                    setEditingId(null)
                },
            })
        } else {
            post(`/api/v1/employees/${employeeId}/dependents`, {
                onSuccess: () => {
                    setOpen(false)
                    reset()
                },
            })
        }
    }

    const handleDelete = (id: string) => {
        if (!employeeId) return
        destroy(`/api/v1/employees/${employeeId}/dependents/${id}`)
    }

    return (
        <div className="space-y-4">
            {!readonly && (
                <div className="flex justify-end">
                    <Button onClick={handleAdd}>
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
                                                    onClick={() => handleEdit(dep)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(dep.id)}
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
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Relationship *</Label>
                            <Select
                                value={data.relationship}
                                onValueChange={(v) =>
                                    setData('relationship', v as typeof data.relationship)
                                }
                            >
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
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Contact Number</Label>
                                <Input
                                    value={data.contact_number}
                                    onChange={(e) => setData('contact_number', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_dependent_for_tax"
                                checked={data.is_dependent_for_tax}
                                onCheckedChange={(v) =>
                                    setData('is_dependent_for_tax', Boolean(v))
                                }
                            />
                            <Label
                                htmlFor="is_dependent_for_tax"
                                className="text-sm font-normal cursor-pointer"
                            >
                                Qualifies for tax exemption (TRAIN Law)
                            </Label>
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