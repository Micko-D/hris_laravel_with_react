<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;

class HrisSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Human Resources', 'code' => 'HR'],
            ['name' => 'Information Technology', 'code' => 'IT'],
            ['name' => 'Finance & Accounting', 'code' => 'FIN'],
            ['name' => 'Operations', 'code' => 'OPS'],
            ['name' => 'Sales & Marketing', 'code' => 'SALES'],
            ['name' => 'Administration', 'code' => 'ADMIN'],
            ['name' => 'Legal & Compliance', 'code' => 'LEGAL'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(
                ['code' => $dept['code']],
                ['name' => $dept['name'], 'description' => $dept['name'] . ' Department', 'is_active' => true]
            );
        }

        $positions = [
            ['name' => 'Software Engineer', 'code' => 'SWE', 'basic_salary' => 45000],
            ['name' => 'Senior Software Engineer', 'code' => 'SSE', 'basic_salary' => 65000],
            ['name' => 'HR Manager', 'code' => 'HRMGR', 'basic_salary' => 60000],
            ['name' => 'HR Officer', 'code' => 'HROFF', 'basic_salary' => 35000],
            ['name' => 'Finance Manager', 'code' => 'FINMGR', 'basic_salary' => 70000],
            ['name' => 'Accountant', 'code' => 'ACCT', 'basic_salary' => 40000],
            ['name' => 'Operations Manager', 'code' => 'OPSMGR', 'basic_salary' => 65000],
            ['name' => 'Sales Executive', 'code' => 'SALEX', 'basic_salary' => 30000],
            ['name' => 'Marketing Specialist', 'code' => 'MKTG', 'basic_salary' => 38000],
            ['name' => 'Admin Clerk', 'code' => 'ADMINCLERK', 'basic_salary' => 22000],
            ['name' => 'Executive Assistant', 'code' => 'EXECASST', 'basic_salary' => 40000],
            ['name' => 'Intern', 'code' => 'INTERN', 'basic_salary' => 15000],
        ];

        foreach ($positions as $pos) {
            Position::firstOrCreate(
                ['code' => $pos['code']],
                ['name' => $pos['name'], 'description' => $pos['name'] . ' position', 'basic_salary' => $pos['basic_salary'], 'is_active' => true]
            );
        }

        $this->command->info('HRIS departments and positions seeded.');
    }
}