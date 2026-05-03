<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'employee_number',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'birth_date',
        'gender',
        'civil_status',
        'nationality',
        'email',
        'phone',
        'address_region',
        'address_province',
        'address_city',
        'address_barangay',
        'address_street',
        'department_id',
        'position_id',
        'employment_status',
        'hire_date',
        'end_date',
        'tin',
        'sss_number',
        'philhealth_number',
        'pagibig_number',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hire_date' => 'date',
        'end_date' => 'date',
        'phone' => 'string',
        'address_region' => 'string',
        'address_province' => 'string',
        'address_city' => 'string',
        'address_barangay' => 'string',
        'address_street' => 'string',
        'suffix' => 'string',
        'tin' => 'string',
        'sss_number' => 'string',
        'philhealth_number' => 'string',
        'pagibig_number' => 'string',
    ];

    // Auto-generate employee number
    public static function boot()
    {
        parent::boot();

        static::creating(function ($employee) {
            if (empty($employee->employee_number)) {
                $year = date('Y');
                $last = static::whereYear('created_at', $year)->count();
                $employee->employee_number = sprintf('EMP-%s-%04d', $year, $last + 1);
            }
        });
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function governmentIds(): HasMany
    {
        return $this->hasMany(GovernmentId::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function dependents(): HasMany
    {
        return $this->hasMany(EmployeeDependent::class);
    }

    public function employmentHistories(): HasMany
    {
        return $this->hasMany(EmploymentHistory::class);
    }

    public function getFullNameAttribute(): string
    {
        $name = trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
        if ($this->suffix) {
            $name .= ', ' . $this->suffix;
        }
        return $name;
    }
}