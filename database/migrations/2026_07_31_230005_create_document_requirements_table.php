<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->enum('document_type', array_column(DocumentType::cases(), 'value'));
            $table->enum('status', array_column(DocumentStatus::cases(), 'value'))->default(DocumentStatus::Missing->value);
            $table->timestamp('verified_at')->nullable();
            $table->date('expires_on')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['enrollment_id', 'document_type']);
            $table->index(['document_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_requirements');
    }
};
