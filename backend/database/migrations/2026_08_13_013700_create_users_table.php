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
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('username', 50)->unique();
            $table->string('email', 255)->unique();
            $table->string('password');
            $table->string('full_name', 100)->nullable();
            $table->text('bio')->nullable();
            $table->text('avatar_url')->nullable();
            $table->enum('role', ['student', 'instructor', 'admin'])->default('student');
            $table->integer('pearls')->default(0);
            $table->integer('xp')->default(0);
            $table->integer('level')->default(1);
            $table->integer('streak_days')->default(0);
            $table->timestamp('last_active')->nullable();
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
