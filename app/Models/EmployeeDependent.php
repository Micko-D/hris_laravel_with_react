<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDependent extends Model
{
    use HasFactory, HasUuids;

    public const RELATION_SPOUSE = 'spouse';
    public const RELATION_CHILD = 'child';
    public const RELATION_PARENT = 'parent';
    public const RELATION_SIBLING = 'sibling';

    public const RELATIONSHIPS = [
        self::RELATION_SPOUSE,
        self::RELATION_CHILD,
        self::RELATION_PARENT,
        self::RELATION_SIBLING,
    ];

    protected $fillable = [
        'employee_id',
        'name',
        'relationship',
        'birth_date',
        'contact_number',
        'is_dependent_for_tax',
    ];

    protected $casts = [
        'birth_date' => 'datetime',
        'is_dependent_for_tax' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}