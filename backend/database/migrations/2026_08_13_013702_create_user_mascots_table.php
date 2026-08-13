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
        Schema::create('user_mascots', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('mascot_id');
            $table->boolean('is_active')->default(false);
            $table->json('accessories')->default('{}');
            $table->timestamp('unlocked_at')->useCurrent();
            $table->primary(['user_id', 'mascot_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('mascot_id')->references('id')->on('mascots')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_mascots');
    }
};
