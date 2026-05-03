<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            if (!Schema::hasColumn('employee_documents', 'version')) {
                $table->unsignedInteger('version')->default(1)->after('type');
            }
            if (!Schema::hasColumn('employee_documents', 'version_label')) {
                $table->string('version_label')->nullable()->after('version');
            }
            if (!Schema::hasColumn('employee_documents', 'parent_document_id')) {
                $table->foreignUuid('parent_document_id')->nullable()->after('version_label');
            }
        });
    }

    public function down(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            $table->dropForeign(['parent_document_id']);
            $table->dropColumn(['version', 'version_label', 'parent_document_id']);
        });
    }
};
