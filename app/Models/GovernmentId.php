<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GovernmentId extends Model
{
    use HasFactory, HasUuids;

    public const TYPE_TIN = 'tin';
    public const TYPE_SSS = 'sss';
    public const TYPE_PHILHEALTH = 'philhealth';
    public const TYPE_PAGIBIG = 'pagibig';

    public const TYPES = [
        self::TYPE_TIN,
        self::TYPE_SSS,
        self::TYPE_PHILHEALTH,
        self::TYPE_PAGIBIG,
    ];

    protected $fillable = [
        'employee_id',
        'type',
        'number',
        'remarks',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}