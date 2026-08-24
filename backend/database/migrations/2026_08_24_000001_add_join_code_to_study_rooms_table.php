<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('study_rooms', function (Blueprint $table) {
            $table->string('join_code', 12)->nullable()->unique()->after('is_public');
        });

        DB::table('study_rooms')
            ->where('is_public', false)
            ->whereNull('join_code')
            ->orderBy('id')
            ->eachById(function ($room): void {
                do {
                    $code = Str::upper(Str::random(8));
                } while (DB::table('study_rooms')->where('join_code', $code)->exists());

                DB::table('study_rooms')->where('id', $room->id)->update(['join_code' => $code]);
            });
    }

    public function down(): void
    {
        Schema::table('study_rooms', function (Blueprint $table) {
            $table->dropUnique(['join_code']);
            $table->dropColumn('join_code');
        });
    }
};
