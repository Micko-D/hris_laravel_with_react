import { useState, useEffect, useCallback } from 'react'
import { router } from '@inertiajs/react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PersonalInfoTab } from './tabs/PersonalInfoTab'
import { GovernmentIdsTab } from './tabs/GovernmentIdsTab'
import { EmploymentTab } from './tabs/EmploymentTab'
import { DocumentsTab } from './tabs/DocumentsTab'
import { DependentsTab } from './tabs/DependentsTab'
import { HistoryTab } from './tabs/HistoryTab'
import type { Employee, EmployeeFormData, Department, Position, GovernmentId, EmployeeDependent, EmployeeDocument, EmploymentHistory } from '@/types/employee'

type TabId = 'personal' | 'government-ids' | 'employment' | 'documents' | 'dependents' | 'history'

interface EmployeeFormProps {
    employee?: Employee
    departments: Department[]
    positions: Position[]
    governmentIds?: GovernmentId[]
    dependents?: EmployeeDependent[]
    documents?: EmployeeDocument[]
    employmentHistories?: EmploymentHistory[]
    mode: 'create' | 'edit' | 'view'
}

const TABS: { id: TabId; label: string }[] = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'government-ids', label: 'Government IDs' },
    { id: 'employment', label: 'Employment' },
    { id: 'documents', label: 'Documents' },
    { id: 'dependents', label: 'Dependents' },
    { id: 'history', label: 'History' },
]

function toDateValue(value: string | Date | null | undefined): string {
    if (!value) return ''
    if (value instanceof Date) return value.toISOString().split('T')[0]
    return value.split('T')[0]
}

const SESSION_TAB_KEY = 'hris_employee_active_tab'

const REQUIRED_FIELDS: { key: keyof EmployeeFormData; label: string }[] = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'birth_date', label: 'Birth Date' },
    { key: 'gender', label: 'Gender' },
    { key: 'civil_status', label: 'Civil Status' },
    { key: 'email', label: 'Email' },
    { key: 'department_id', label: 'Department' },
    { key: 'position_id', label: 'Position' },
    { key: 'employment_status', label: 'Employment Status' },
    { key: 'hire_date', label: 'Hire Date' },
    { key: 'salary', label: 'Salary' },
]

export function EmployeeForm({
    employee,
    departments,
    positions,
    governmentIds: initialGovernmentIds = [],
    dependents: initialDependents = [],
    documents: initialDocuments = [],
    employmentHistories: initialHistories = [],
    mode,
}: EmployeeFormProps) {
    const [activeTab, setActiveTab] = useState<TabId>('personal')

    // Sync active tab from sessionStorage AFTER hydration (avoids SSR mismatch)
    useEffect(() => {
        const stored = sessionStorage.getItem(SESSION_TAB_KEY) as TabId | null
        if (stored && stored !== activeTab) {
            setActiveTab(stored)
        }
    }, [])

    const [governmentIds, setGovernmentIds] = useState<GovernmentId[]>(initialGovernmentIds)
    const [dependents, setDependents] = useState<EmployeeDependent[]>(initialDependents)
    const [documents, setDocuments] = useState<EmployeeDocument[]>(initialDocuments)
    const [employmentHistories, setEmploymentHistories] = useState<EmploymentHistory[]>(initialHistories)

    const [data, setData] = useState<EmployeeFormData>({
        first_name: employee?.first_name ?? '',
        last_name: employee?.last_name ?? '',
        middle_name: employee?.middle_name ?? '',
        suffix: employee?.suffix ?? '',
        birth_date: toDateValue(employee?.birth_date),
        gender: employee?.gender ?? 'male',
        civil_status: employee?.civil_status ?? 'single',
        nationality: employee?.nationality ?? 'Filipino',
        email: employee?.email ?? '',
        phone: employee?.phone ?? '',
        address_region: employee?.address_region ?? '',
        address_province: employee?.address_province ?? '',
        address_city: employee?.address_city ?? '',
        address_barangay: employee?.address_barangay ?? '',
        address_street: employee?.address_street ?? '',
        department_id: employee?.department_id ?? '',
        position_id: employee?.position_id ?? '',
        employment_status: employee?.employment_status ?? 'probationary',
        hire_date: toDateValue(employee?.hire_date),
        end_date: toDateValue(employee?.end_date),
        salary: employee?.salary ?? '',
        salary_type: (employee?.salary_type as 'monthly' | 'daily' | 'hourly') ?? 'monthly',
        tin: employee?.tin ?? '',
        sss_number: employee?.sss_number ?? '',
        philhealth_number: employee?.philhealth_number ?? '',
        pagibig_number: employee?.pagibig_number ?? '',
    })

    const handleTabChange = useCallback((tabId: TabId) => {
        setActiveTab(tabId)
        sessionStorage.setItem(SESSION_TAB_KEY, tabId)
    }, [])

    const handleSubResourceChange = useCallback(() => {
        if (!employee?.id) return
        sessionStorage.setItem(SESSION_TAB_KEY, activeTab)
        router.get(`/employees/${employee.id}/edit`, {}, { preserveScroll: true })
    }, [employee?.id, activeTab])

    const handleSetData = (key: keyof EmployeeFormData, value: string) => {
        setData((prevData) => ({
            ...prevData,
            [key]: value,
        }))
    }

    const handleSubmit = () => {
        if (mode !== 'view') {
            const missing = REQUIRED_FIELDS
                .filter((f) => {
                    const val = data[f.key]
                    return !val || (typeof val === 'string' && val.trim() === '')
                })
                .map((f) => f.label)

            if (missing.length > 0) {
                toast.error(`Please fill in required fields: ${missing.join(', ')}`)
                return
            }
        }

        if (mode === 'create') {
            router.post('/employees', data, {
                onSuccess: () => {
                    toast.success('Employee created successfully.')
                    router.visit('/employees', { method: 'get' })
                },
            })
        } else {
            router.put(`/employees/${employee!.id}`, data, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Employee updated successfully.')
                },
            })
        }
    }

    const isReadonly = mode === 'view'

    return (
        <div className="flex flex-col gap-6">
            <div className="border-b">
                <nav className="flex gap-1 -mb-px overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'personal' && (
                    <PersonalInfoTab
                        data={data}
                        setData={handleSetData}
                        errors={{}}
                        readonly={isReadonly}
                    />
                )}
                {activeTab === 'government-ids' && (
                    <GovernmentIdsTab
                        governmentIds={governmentIds}
                        employeeId={employee?.id}
                        readonly={isReadonly}
                        onMutate={handleSubResourceChange}
                    />
                )}
                {activeTab === 'employment' && (
                    <EmploymentTab
                        data={data}
                        setData={handleSetData}
                        errors={{}}
                        departments={departments}
                        positions={positions}
                        governmentIds={governmentIds}
                        readonly={isReadonly}
                    />
                )}
                {activeTab === 'documents' && (
                    <DocumentsTab
                        documents={documents}
                        employeeId={employee?.id}
                        readonly={isReadonly}
                        onMutate={handleSubResourceChange}
                    />
                )}
                {activeTab === 'dependents' && (
                    <DependentsTab
                        dependents={dependents}
                        employeeId={employee?.id}
                        readonly={isReadonly}
                        onMutate={handleSubResourceChange}
                    />
                )}
                {activeTab === 'history' && (
                    <HistoryTab
                        histories={employmentHistories}
                        readonly={true}
                    />
                )}
            </div>

            {mode !== 'view' && (
                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button onClick={handleSubmit}>
                        <Save className="size-4" />
                        {mode === 'create' ? 'Create Employee' : 'Save Changes'}
                    </Button>
                </div>
            )}
        </div>
    )
}
