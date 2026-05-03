import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PaginationProps {
    total: number
    page: number
    perPage: number
    onPageChange: (page: number) => void
    onPerPageChange: (perPage: number) => void
}

export function Pagination({ total, page, perPage, onPageChange, onPerPageChange }: PaginationProps) {
    const totalPages = Math.ceil(total / perPage)
    const start = total === 0 ? 0 : (page - 1) * perPage + 1
    const end = Math.min(page * perPage, total)

    const pages = (() => {
        const arr: (number | '...')[] = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) arr.push(i)
        } else {
            arr.push(1)
            if (page > 3) arr.push('...')
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i)
            if (page < totalPages - 2) arr.push('...')
            arr.push(totalPages)
        }
        return arr
    })()

    return (
        <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page</span>
                <Select
                    value={String(perPage)}
                    onValueChange={(v) => {
                        onPerPageChange(Number(v))
                        onPageChange(1)
                    }}
                >
                    <SelectTrigger className="h-7 w-16">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
                <span className="ml-2">
                    {start}–{end} of {total}
                </span>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Button>

                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === page ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 w-7 p-0 text-xs"
                            onClick={() => onPageChange(p as number)}
                        >
                            {p}
                        </Button>
                    )
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Button>
            </div>
        </div>
    )
}