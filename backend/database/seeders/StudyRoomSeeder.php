<?php

namespace Database\Seeders;

use App\Models\RoomMessage;
use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StudyRoomSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $instructors = User::where('role', 'instructor')->get();
        $students = User::where('role', 'student')->get();

        if ($users->isEmpty()) {
            return;
        }

        $roomTopics = [
            [
                'name' => 'Klub Diskusi Oceanografi & Navigasi',
                'topic' => 'Membahas bab 1-3 Dasar Oceanografi, zona laut, dan konversi mil laut.',
                'capacity' => 20,
                'is_public' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Persiapan Ujian Sertifikasi SOLAS',
                'topic' => 'Latihan soal dan bedah materi Prosedur Darurat Pelayaran SOLAS.',
                'capacity' => 15,
                'is_public' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Workshop GIS & Pemetaan Dasar Laut',
                'topic' => 'Sesi tanya jawab software GIS digital dan analisis data bathymetry.',
                'capacity' => 10,
                'is_public' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Belajar Bareng SMCP Marine English',
                'topic' => 'Roleplay percakapan radio VHF antar-kapal untuk latihan SMCP.',
                'capacity' => 8,
                'is_public' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Kelompok Studi Meteorologi & Badai',
                'topic' => 'Diskusi pembacaan peta Isobar, angin pasat, dan prediksi arah badai.',
                'capacity' => 25,
                'is_public' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Ruang Belajar Rahasia Kapten Ocean',
                'topic' => 'Diskusi terbatas bimbingan proyek riset samudra.',
                'capacity' => 5,
                'is_public' => false,
                'status' => 'active',
            ],
            [
                'name' => 'Sesi Diskusi Konservasi Terumbu Karang',
                'topic' => 'Tukar pikiran ide proyek pelestarian dan restorasi karang lokal.',
                'capacity' => 30,
                'is_public' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Arsip: Diskusi Ekologi Laut 2026',
                'topic' => 'Sesi ruang belajar lama (Selesai).',
                'capacity' => 10,
                'is_public' => true,
                'status' => 'closed',
            ],
        ];

        $sampleMessages = [
            'Halo semuanya! Selamat bergabung di ruang belajar EduWave 👋',
            'Ada yang bisa jelaskan kembali perbedaan zona Abisal dan Hadapelagis?',
            'Berdasarkan materi modul 2, Hadapelagis khusus untuk kedalaman palung >6000m.',
            'Terima kasih pencerahannya! Sangat membantu persiapan ujian besok.',
            'Jangan lupa cek bagian penjelasan soal latihan nomor 3 ya kawan-kawan.',
            'Apakah besok ada latihan soal bareng lagi jam 7 malam?',
            'Boleh banget, nanti saya buatkan agenda pengingatnya!',
            'Semangat belajar semuanya! Jangan lupa jaga streak belajar harian ⚡',
        ];

        foreach ($roomTopics as $index => $roomData) {
            $host = $instructors->random() ?? $users->random();

            $room = StudyRoom::create([
                'id' => (string) Str::uuid(),
                'name' => $roomData['name'],
                'topic' => $roomData['topic'],
                'host_user_id' => $host->id,
                'max_capacity' => $roomData['capacity'],
                'is_public' => $roomData['is_public'],
                'status' => $roomData['status'],
            ]);

            // Attach Host as participant
            $room->participants()->attach($host->id, ['joined_at' => now()->subHours(5)]);

            // Pick 3-8 student participants
            $participants = $students->random(min(count($students), rand(3, 8)));
            foreach ($participants as $p) {
                if ($p->id !== $host->id) {
                    $room->participants()->attach($p->id, ['joined_at' => now()->subMinutes(rand(10, 240))]);
                }
            }

            // Create message history for active rooms
            if ($room->status === 'active') {
                $allParticipants = $room->participants;
                $msgCount = rand(5, 12);

                for ($m = 0; $m < $msgCount; $m++) {
                    $sender = $allParticipants->random();
                    $content = $sampleMessages[$m % count($sampleMessages)];

                    RoomMessage::create([
                        'id' => (string) Str::uuid(),
                        'room_id' => $room->id,
                        'user_id' => $sender->id,
                        'content' => $content,
                        'type' => 'text',
                        'sent_at' => now()->subMinutes(($msgCount - $m) * 10),
                    ]);
                }
            }
        }
    }
}