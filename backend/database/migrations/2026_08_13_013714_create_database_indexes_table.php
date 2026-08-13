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
        Schema::table('users', function (Blueprint $table) {
            $table->index(['email']);
            $table->index(['xp']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->index(['category', 'status']);
            $table->index(['instructor_id']);
            $table->index(['created_at']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->index(['user_id']);
            $table->index(['course_id']);
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->index(['course_id', 'order']);
        });

        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->index(['user_id', 'exam_id']);
        });

        Schema::table('room_messages', function (Blueprint $table) {
            $table->index(['room_id', 'sent_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('room_messages', function (Blueprint $table) {
            $table->dropIndex(['room_id', 'sent_at']);
        });

        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'exam_id']);
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->dropIndex(['course_id', 'order']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex(['course_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['instructor_id']);
            $table->dropIndex(['category', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['xp']);
            $table->dropIndex(['email']);
        });
    }
};
