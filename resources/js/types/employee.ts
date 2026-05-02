export interface Employee {
    id: string;
    employee_number: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    birth_date: string;
    gender: 'male' | 'female';
    civil_status: 'single' | 'married' | 'widowed' | 'separated';
    nationality: string;
    email: string;
    phone: string | null;
    address_region: string | null;
    address_province: string | null;
    address_city: string | null;
    address_barangay: string | null;
    address_street: string | null;
    department_id: string | null;
    position_id: string | null;
    employment_status: 'regular' | 'probationary' | 'contractual' | 'resigned' | 'terminated';
    hire_date: string;
    end_date: string | null;
    tin: string | null;
    sss_number: string | null;
    philhealth_number: string | null;
    pagibig_number: string | null;
    department?: Department;
    position?: Position;
    government_ids?: GovernmentId[];
    documents?: EmployeeDocument[];
    dependents?: EmployeeDependent[];
    employment_histories?: EmploymentHistory[];
    created_at: string;
    updated_at: string;
}

export interface Department {
    id: string;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
}

export interface Position {
    id: string;
    name: string;
    code: string;
    description: string | null;
    basic_salary: string | null;
    is_active: boolean;
}

export interface GovernmentId {
    id: string;
    employee_id: string;
    type: 'tin' | 'sss' | 'philhealth' | 'pagibig';
    number: string;
    remarks: string | null;
}

export interface EmployeeDocument {
    id: string;
    employee_id: string;
    type: 'contract' | 'id' | 'other';
    filename: string;
    file_path: string;
    mime_type: string | null;
    file_size: number | null;
}

export interface EmployeeDependent {
    id: string;
    employee_id: string;
    name: string;
    relationship: 'spouse' | 'child' | 'parent' | 'sibling';
    birth_date: string | null;
    contact_number: string | null;
    is_dependent_for_tax: boolean;
}

export interface EmploymentHistory {
    id: string;
    employee_id: string;
    department_id: string | null;
    position_id: string | null;
    employment_status: string;
    salary: string | null;
    effective_date: string;
    end_date: string | null;
    remarks: string | null;
    department?: Department;
    position?: Position;
}

export type EmployeeFormData = Omit<Employee, 'id' | 'employee_number' | 'department' | 'position' | 'government_ids' | 'documents' | 'dependents' | 'employment_histories' | 'created_at' | 'updated_at'>;