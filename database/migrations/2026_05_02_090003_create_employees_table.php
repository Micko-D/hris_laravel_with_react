<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('employee_number')->unique();

            // Personal info
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->date('birth_date');
            $table->string('gender'); // male, female
            $table->string('civil_status'); // single, married, widowed, separated
            $table->string('nationality')->default('Filipino');

            // Contact
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('address_region')->nullable();
            $table->string('address_province')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_barangay')->nullable();
            $table->text('address_street')->nullable();

            // Employment
            $table->foreignUuid('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('position_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employment_status'); // regular, probationary, contractual, resigned, terminated
            $table->date('hire_date');
            $table->date('end_date')->nullable();
            $table->string('tin')->nullable();
            $table->string('sss_number')->nullable();
            $table->string('philhealth_number')->nullable();
            $table->string('pagibig_number')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};