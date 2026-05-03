<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDocument extends Model
{
    use HasFactory, HasUuids;

    public const TYPE_CONTRACT = 'contract';
    public const TYPE_ID = 'id';
    public const TYPE_OTHER = 'other';

    public const TYPES = [
        self::TYPE_CONTRACT,
        self::TYPE_ID,
        self::TYPE_OTHER,
    ];

    protected $fillable = [
        'employee_id',
        'name',
        'type',
        'version',
        'version_label',
        'parent_document_id',
        'filename',
        'file_path',
        'mime_type',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'version' => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function parentDocument(): BelongsTo
    {
        return $this->belongsTo(EmployeeDocument::class, 'parent_document_id');
    }

    public function versions(): BelongsTo
    {
        return $this->belongsTo(EmployeeDocument::class, 'id');
    }
}
