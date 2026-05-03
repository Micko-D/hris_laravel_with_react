<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employment_histories', function (Blueprint $table) {
            $table->string('salary_type', 20)->nullable()->after('salary');
        });
    }

    public function down(): void
    {
        Schema::table('employment_histories', function (Blueprint $table) {
            $table->dropColumn('salary_type');
        });
    }
};