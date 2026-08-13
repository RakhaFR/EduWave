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
        Schema::create('study_room_participants', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('room_id');
            $table->timestamp('joined_at')->useCurrent();
            $table->primary(['user_id', 'room_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('room_id')->references('id')->on('study_rooms')->cascadeOnDelete();
            $table->index(['room_id', 'joined_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_room_participants');
    }
};
