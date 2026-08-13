<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('course_id');
            $table->string('title', 255);
            $table->enum('type', ['video', 'text', 'quiz'])->default('video');
            $table->longText('content')->nullable();
            $table->text('video_url')->nullable();
            $table->integer('duration_minutes')->default(0);
            $table->integer('order');
            $table->integer('xp_reward')->default(10);
            $table->boolean('is_preview')->default(false);
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
