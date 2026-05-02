import { Upload, Trash2, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useForm } from '@inertiajs/react'
import type { EmployeeDocument } from '@/types/employee'

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

interface DocumentsTabProps {
    documents: EmployeeDocument[]
    employeeId?: string
    readonly?: boolean
}

export function DocumentsTab({
    documents,
    employeeId,
    readonly = false,
}: DocumentsTabProps) {
    const { post, delete: destroy, processing } = useForm()

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !employeeId) return

        const formData = new FormData()
        formData.append('type', 'other')
        formData.append('file', file)

        post(`/api/v1/employees/${employeeId}/documents`, {
            data: formData,
            onSuccess: () => {
                e.target.value = ''
            },
        })
    }

    const handleDelete = (id: string) => {
        if (!employeeId) return
        destroy(`/api/v1/employees/${employeeId}/documents/${id}`)
    }

    return (
        <div className="space-y-4">
            {!readonly && (
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="file"
                            className="sr-only"
                            onChange={handleUpload}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        <Button variant="outline" asChild disabled={processing}>
                            <span>
                                <Upload className="size-4" />
                                Upload Document
                            </span>
                        </Button>
                    </label>
                    <span className="text-xs text-muted-foreground">
                        PDF, JPG, PNG, DOC, DOCX — max 10MB
                    </span>
                </div>
            )}

            {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                    No documents uploaded.
                </p>
            ) : (
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="h-10 px-4 text-left font-medium">File Name</th>
                                <th className="h-10 px-4 text-left font-medium">Type</th>
                                <th className="h-10 px-4 text-left font-medium">Size</th>
                                <th className="h-10 px-4 text-left font-medium">Uploaded</th>
                                {!readonly && (
                                    <th className="h-10 px-4 text-right font-medium">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc.id} className="border-b">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="size-4 text-muted-foreground" />
                                            <span>{doc.filename}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                DOC_TYPE_COLORS[doc.type] ?? ''
                                            }`}
                                        >
                                            {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {doc.file_size
                                            ? `${(doc.file_size / 1024).toFixed(1)} KB`
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </td>
                                    {!readonly && (
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    title="Download"
                                                >
                                                    <a
                                                        href={`/storage/${doc.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Download className="size-4" />
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(doc.id)}
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
        </div>
    )
}