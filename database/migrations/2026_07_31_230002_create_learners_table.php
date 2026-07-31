<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learners', function (Blueprint $table) {
            $table->id();
            $table->string('lrn')->nullable()->index();
            $table->string('full_name');
            $table->string('normalized_name')->index();
            $table->date('birth_date')->nullable();
            $table->string('gender', 32)->nullable();
            $table->string('mother_contact_number')->nullable();
            $table->string('mother_maiden_name')->nullable();
            $table->string('father_contact_number')->nullable();
            $table->string('father_name')->nullable();
            $table->text('philippine_address')->nullable();
            $table->text('uae_address')->nullable();
            $table->string('previous_school')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['normalized_name', 'birth_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learners');
    }
};
