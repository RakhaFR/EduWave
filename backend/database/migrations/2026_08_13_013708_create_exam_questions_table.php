<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_id');
            $table->text('question_text');
            $table->string('type', 20)->default('multiple_choice');
            $table->json('options')->nullable();
            $table->string('correct_answer', 10);
            $table->text('explanation')->nullable();
            $table->integer('points')->default(5);
            $table->integer('order');
            $table->foreign('exam_id')->references('id')->on('exams')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_questions');
    }
};
