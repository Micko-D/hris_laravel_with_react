import { useState, useMemo } from 'react'
import { Plus, Trash2, Download, FileText, Upload, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react'
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
import type { EmployeeDocument } from '@/types/employee'
import { Pagination } from './TablePagination'

const DOC_TYPE_LABELS: Record<string, string> = {
    contract: 'Employment Contract',
    id: 'Government ID',
    other: 'Other',
}

const DOC_TYPE_COLORS: Record<string, string> = {
    contract: 'bg-blue-100 text-blue-800',
    id: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
}

const MAX_NAME_LENGTH = 255
const MAX_VERSION_LABEL_LENGTH = 50

type SortColumn = 'name' | 'version' | 'created_at'
type SortDir = 'asc' | 'desc'

interface DocumentsTabProps {
    documents: EmployeeDocument[]
    employeeId?: string
    readonly?: boolean
    onMutate?: () => void
}

export function DocumentsTab({
    documents,
    employeeId,
    readonly = false,
    onMutate,
}: DocumentsTabProps) {
    const [open, setOpen] = useState(false)
    const [versionParent, setVersionParent] = useState<EmployeeDocument | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [formName, setFormName] = useState('')
    const [formType, setFormType] = useState<'contract' | 'id' | 'other'>('other')
    const [formVersionLabel, setFormVersionLabel] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [processing, setProcessing] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<EmployeeDocument | null>(null)
    const [sortCol, setSortCol] = useState<SortColumn>('created_at')
    const [sortDir, setSortDir] = useState<SortDir>('desc')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const toggleSort = (col: SortColumn) => {
        if (sortCol === col) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortCol(col)
            setSortDir('asc')
        }
    }

    const filtered = useMemo(() => {
        let rows = [...documents]

        rows.sort((a, b) => {
            let diff = 0
            if (sortCol === 'name') {
                diff = (a.name ?? a.filename).toLowerCase().localeCompare((b.name ?? b.filename).toLowerCase())
            } else if (sortCol === 'version') {
                diff = a.version - b.version
            } else {
                diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            }
            if (diff !== 0) return sortDir === 'asc' ? diff : -diff
            const aTime = new Date(a.created_at).getTime()
            const bTime = new Date(b.created_at).getTime()
            return sortDir === 'asc' ? aTime - bTime : bTime - aTime
        })

        if (!search.trim()) return rows
        const q = search.toLowerCase()
        return rows.filter(
            (doc) =>
                (doc.name ?? doc.filename).toLowerCase().includes(q) ||
                doc.type.toLowerCase().includes(q) ||
                DOC_TYPE_LABELS[doc.type]?.toLowerCase().includes(q)
        )
    }, [documents, sortCol, sortDir, search])

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * perPage
        return filtered.slice(start, start + perPage)
    }, [filtered, page, perPage])

    const handleUploadNew = () => {
        setVersionParent(null)
        setFormName('')
        setFormType('other')
        setFormVersionLabel('')
        setSelectedFile(null)
        setFileError(null)
        setOpen(true)
    }

    const handleAddVersion = (doc: EmployeeDocument) => {
        setVersionParent(doc)
        setFormName(doc.name ?? doc.filename)
        setFormType(doc.type as 'contract' | 'id' | 'other')
        setFormVersionLabel('')
        setSelectedFile(null)
        setFileError(null)
        setOpen(true)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null)
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 10 * 1024 * 1024) {
            setFileError('File must be smaller than 10MB.')
            setSelectedFile(null)
            return
        }
        setSelectedFile(file)
    }

    const handleSubmit = async () => {
        if (!employeeId) return
        if (!selectedFile) { toast.error('Please select a file to upload.'); return }
        if (!formName.trim()) { toast.error('Document name is required.'); return }

        setProcessing(true)
        try {
            const formData = new FormData()
            formData.append('name', formName.trim())
            formData.append('type', formType)
            formData.append('file', selectedFile)
            if (versionParent) formData.append('parent_document_id', versionParent.id)
            if (formVersionLabel.trim()) formData.append('version_label', formVersionLabel.trim())

            const res = await fetch(`/api/v1/employees/${employeeId}/documents`, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: formData,
            })

            const data = await res.json()
            if (!res.ok) {
                toast.error(Object.values(data.errors ?? {}).flat()[0] as string || 'Upload failed.')
                return
            }

            toast.success(versionParent ? 'New version uploaded.' : 'Document uploaded.')
            setOpen(false)
            setVersionParent(null)
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
            const res = await fetch(`/api/v1/employees/${employeeId}/documents/${id}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
            })
            const text = await res.text()
            let data: { errors?: unknown; message?: string } = {}
            try { data = JSON.parse(text) } catch {}
            if (!res.ok) {
                toast.error(Object.values(data.errors ?? {}).flat()[0] as string || `Delete failed (HTTP ${res.status})`)
                return
            }
            toast.success('Document deleted.')
            setDeleteTarget(null)
            onMutate?.()
        } catch {
            toast.error('Network error. Please try again.')
        }
    }

    const SortIcon = ({ col }: { col: SortColumn }) => {
        if (sortCol !== col) return <ArrowUpDown className="size-3.5 ml-1 inline" />
        return sortDir === 'asc' ? <ArrowUp className="size-3.5 ml-1 inline text-primary" /> : <ArrowDown className="size-3.5 ml-1 inline text-primary" />
    }

    return (
        <div className="space-y-4">
            <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Document?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete &quot;{deleteTarget?.name ?? deleteTarget?.filename}&quot; and all its versions. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} type="button">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} type="button">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {versionParent ? `Upload New Version — ${versionParent.name ?? versionParent.filename}` : 'Upload Document'}
                        </DialogTitle>
                        <DialogDescription>
                            {versionParent ? `Adding a new version to &quot;${versionParent.name ?? versionParent.filename}&quot;.` : 'Name your document and select a file.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                            <Label>Document Name *</Label>
                            <Input value={formName} onChange={(e) => setFormName(e.target.value)} maxLength={MAX_NAME_LENGTH} placeholder="e.g. Employment Contract — Juan Dela Cruz" />
                            <p className="text-xs text-muted-foreground">Max {MAX_NAME_LENGTH} characters.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Document Type *</Label>
                            <Select value={formType} onValueChange={(v) => setFormType(v as typeof formType)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="contract">Employment Contract</SelectItem>
                                    <SelectItem value="id">Government ID</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Version Label</Label>
                            <Input value={formVersionLabel} onChange={(e) => setFormVersionLabel(e.target.value)} maxLength={MAX_VERSION_LABEL_LENGTH} placeholder="e.g. v2.0, Revised 2026" />
                            <p className="text-xs text-muted-foreground">Optional. Auto-assigned as v1.0, v2.0, etc.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label>File *</Label>
                            <Input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                            {fileError && <p className="text-xs text-destructive">{fileError}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={(e) => { e.stopPropagation(); setOpen(false); setVersionParent(null) }} type="button">Cancel</Button>
                        <Button onClick={(e) => { e.stopPropagation(); handleSubmit() }} disabled={processing} type="button">
                            {processing ? 'Uploading...' : versionParent ? 'Upload Version' : 'Upload'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Desktop: opposite ends (upload left, search right) | Mobile/tablet: search first, upload below */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Upload — left on desktop, second row on mobile */}
                {!readonly && (
                    <div className="flex items-center gap-4 md:flex-none">
                        <Button onClick={handleUploadNew} type="button"><Upload className="size-4" />Upload Document</Button>
                        <span className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC, DOCX — max 10MB</span>
                    </div>
                )}
                {/* Search — right on desktop, first row on mobile */}
                <div className="relative md:ml-auto">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search name, type..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-8 w-full md:w-52"
                    />
                </div>
            </div>

            {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No documents uploaded.</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No results for &quot;{search}&quot;.</p>
            ) : (
                <>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-10 px-4 text-left font-medium">
                                        <Button variant="ghost" size="sm" className="-ml-2 h-auto p-1 px-1.5 cursor-pointer" onClick={() => toggleSort('name')}>
                                            Name<SortIcon col="name" />
                                        </Button>
                                    </th>
                                    <th className="h-10 px-4 text-left font-medium">Type</th>
                                    <th className="h-10 px-4 text-left font-medium">
                                        <Button variant="ghost" size="sm" className="-ml-2 h-auto p-1 px-1.5 cursor-pointer" onClick={() => toggleSort('version')}>
                                            Version<SortIcon col="version" />
                                        </Button>
                                    </th>
                                    <th className="h-10 px-4 text-left font-medium">Size</th>
                                    <th className="h-10 px-4 text-left font-medium">
                                        <Button variant="ghost" size="sm" className="-ml-2 h-auto p-1 px-1.5 cursor-pointer" onClick={() => toggleSort('created_at')}>
                                            Uploaded<SortIcon col="created_at" />
                                        </Button>
                                    </th>
                                    {!readonly && <th className="h-10 px-4 text-right font-medium">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRows.map((doc) => (
                                    <tr key={doc.id} className="border-b">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="size-4 text-muted-foreground" />
                                                <span className="font-medium">{doc.name ?? doc.filename}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DOC_TYPE_COLORS[doc.type] ?? ''}`}>
                                                {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{doc.version_label ?? `v${doc.version}.0`}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</td>
                                        {!readonly && (
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleAddVersion(doc)} title="Upload new version">
                                                        <Plus className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" asChild title="Download">
                                                        <a href={`/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer">
                                                            <Download className="size-4" />
                                                        </a>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(doc)}>
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
                    <Pagination
                        total={filtered.length}
                        page={page}
                        perPage={perPage}
                        onPageChange={setPage}
                        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
                    />
                </>
            )}
        </div>
    )
}