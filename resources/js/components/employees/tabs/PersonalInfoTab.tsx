import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { EmployeeFormData } from '@/types/employee'
import { useFormErrors } from '@/hooks/use-form-errors'

interface PersonalInfoTabProps {
    data: EmployeeFormData
    setData: (key: keyof EmployeeFormData, value: string) => void
    errors: Partial<Record<keyof EmployeeFormData, string>>
    readonly?: boolean
}

const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
]

const CIVIL_STATUS_OPTIONS = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
]

export function PersonalInfoTab({
    data,
    setData,
    errors,
    readonly = false,
}: PersonalInfoTabProps) {
    return (
        <div className="grid gap-6">
            {/* Name Section */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Full Name</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                            id="first_name"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            disabled={readonly}
                            invalid={!!errors.first_name}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input
                            id="middle_name"
                            value={data.middle_name ?? ''}
                            onChange={(e) => setData('middle_name', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                            id="last_name"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            disabled={readonly}
                            invalid={!!errors.last_name}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="suffix">Suffix (e.g. Jr., Sr.)</Label>
                        <Input
                            id="suffix"
                            value={data.suffix ?? ''}
                            onChange={(e) => setData('suffix', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                </div>
            </div>

            {/* Personal Details Section */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Personal Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="birth_date">Birth Date *</Label>
                        <Input
                            id="birth_date"
                            type="date"
                            value={data.birth_date}
                            onChange={(e) => setData('birth_date', e.target.value)}
                            disabled={readonly}
                            invalid={!!errors.birth_date}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select
                            value={data.gender}
                            onValueChange={(v) => setData('gender', v)}
                            disabled={readonly}
                        >
                            <SelectTrigger invalid={!!errors.gender}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {GENDER_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="civil_status">Civil Status *</Label>
                        <Select
                            value={data.civil_status}
                            onValueChange={(v) => setData('civil_status', v)}
                            disabled={readonly}
                        >
                            <SelectTrigger invalid={!!errors.civil_status}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CIVIL_STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input
                            id="nationality"
                            value={data.nationality}
                            onChange={(e) => setData('nationality', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={readonly}
                            invalid={!!errors.email}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone ?? ''}
                            onChange={(e) => setData('phone', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                </div>
            </div>

            {/* Address Section */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Address</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5 lg:col-span-2">
                        <Label htmlFor="address_street">Street Address</Label>
                        <Input
                            id="address_street"
                            value={data.address_street ?? ''}
                            onChange={(e) => setData('address_street', e.target.value)}
                            disabled={readonly}
                            placeholder="House #, Street, Village"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="address_barangay">Barangay</Label>
                        <Input
                            id="address_barangay"
                            value={data.address_barangay ?? ''}
                            onChange={(e) => setData('address_barangay', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="address_city">City / Municipality</Label>
                        <Input
                            id="address_city"
                            value={data.address_city ?? ''}
                            onChange={(e) => setData('address_city', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="address_province">Province</Label>
                        <Input
                            id="address_province"
                            value={data.address_province ?? ''}
                            onChange={(e) => setData('address_province', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="address_region">Region</Label>
                        <Input
                            id="address_region"
                            value={data.address_region ?? ''}
                            onChange={(e) => setData('address_region', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}