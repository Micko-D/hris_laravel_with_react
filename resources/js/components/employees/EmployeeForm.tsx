import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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

export function EmployeeForm({
    employee,
    departments,
    positions,
    governmentIds = [],
    dependents = [],
    documents = [],
    employmentHistories = [],
    mode,
}: EmployeeFormProps) {
    const [activeTab, setActiveTab] = useState<TabId>('personal')

    const { data, setData, post, put, processing, errors } = useForm<EmployeeFormData>({
        first_name: employee?.first_name ?? '',
        last_name: employee?.last_name ?? '',
        middle_name: employee?.middle_name ?? null,
        suffix: employee?.suffix ?? null,
        birth_date: employee?.birth_date ?? '',
        gender: employee?.gender ?? 'male',
        civil_status: employee?.civil_status ?? 'single',
        nationality: employee?.nationality ?? 'Filipino',
        email: employee?.email ?? '',
        phone: employee?.phone ?? null,
        address_region: employee?.address_region ?? null,
        address_province: employee?.address_province ?? null,
        address_city: employee?.address_city ?? null,
        address_barangay: employee?.address_barangay ?? null,
        address_street: employee?.address_street ?? null,
        department_id: employee?.department_id ?? null,
        position_id: employee?.position_id ?? null,
        employment_status: employee?.employment_status ?? 'probationary',
        hire_date: employee?.hire_date ?? '',
        end_date: employee?.end_date ?? null,
        tin: employee?.tin ?? null,
        sss_number: employee?.sss_number ?? null,
        philhealth_number: employee?.philhealth_number ?? null,
        pagibig_number: employee?.pagibig_number ?? null,
    })

    const handleSubmit = () => {
        if (mode === 'create') {
            post('/api/v1/employees')
        } else {
            put(`/api/v1/employees/${employee!.id}`)
        }
    }

    const isReadonly = mode === 'view'

    return (
        <div className="flex flex-col gap-6">
            {/* Tab Navigation */}
            <div className="border-b">
                <nav className="flex gap-1 -mb-px overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
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

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'personal' && (
                    <PersonalInfoTab
                        data={data}
                        setData={setData}
                        errors={errors}
                        readonly={isReadonly}
                    />
                )}
                {activeTab === 'government-ids' && (
                    <GovernmentIdsTab
                        governmentIds={governmentIds}
                        employeeId={employee?.id}
                        readonly={isReadonly}
                    />
                )}
                {activeTab === 'employment' && (
                    <EmploymentTab
                        data={data}
                        setData={setData}
                        errors={errors}
                        departments={departments}
                        positions={positions}
                        readonly={isReadonly}
                    />
                )}
                {activeTab === 'documents' && (
                    <DocumentsTab
                        documents={documents}
                        employeeId={employee?.id}
                        readonly={isReadonly}
                    />
                )}
                {activeTab === 'dependents' && (
                    <DependentsTab
                        dependents={dependents}
                        employeeId={employee?.id}
                        readonly={isReadonly}
                    />
                )}
                {activeTab === 'history' && (
                    <HistoryTab
                        histories={employmentHistories}
                        readonly={true}
                    />
                )}
            </div>

            {/* Form Actions */}
            {!isReadonly && (
                <div className="flex justify-end gap-3 border-t pt-4">
                    <Button variant="outline" asChild>
                        <a href="/employees">Cancel</a>
                    </Button>
                    <Button onClick={handleSubmit} disabled={processing}>
                        <Save className="size-4" />
                        {mode === 'create' ? 'Create Employee' : 'Save Changes'}
                    </Button>
                </div>
            )}
        </div>
    )
}