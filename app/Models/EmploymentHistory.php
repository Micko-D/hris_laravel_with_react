<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmploymentHistory extends Model
{
    use HasFactory, HasUuids;

    public const STATUS_REGULAR = 'regular';
    public const STATUS_PROBATIONARY = 'probationary';
    public const STATUS_CONTRACTUAL = 'contractual';
    public const STATUS_RESIGNED = 'resigned';
    public const STATUS_TERMINATED = 'terminated';

    public const STATUSES = [
        self::STATUS_REGULAR,
        self::STATUS_PROBATIONARY,
        self::STATUS_CONTRACTUAL,
        self::STATUS_RESIGNED,
        self::STATUS_TERMINATED,
    ];

    public const SALARY_MONTHLY = 'monthly';
    public const SALARY_DAILY = 'daily';
    public const SALARY_HOURLY = 'hourly';

    public const SALARY_TYPES = [
        self::SALARY_MONTHLY,
        self::SALARY_DAILY,
        self::SALARY_HOURLY,
    ];

    protected $fillable = [
        'employee_id',
        'department_id',
        'position_id',
        'employment_status',
        'salary',
        'salary_type',
        'effective_date',
        'end_date',
        'remarks',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'end_date' => 'date',
        'salary' => 'decimal:2',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }
}