<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        // Fixed Exam for Course 44444444-4444-4444-4444-444444444444
        $exam1 = Exam::create([
            'id' => '77777777-7777-7777-7777-777777777777',
            'course_id' => '44444444-4444-4444-4444-444444444444',
            'lesson_id' => null,
            'title' => 'Ujian Evaluasi Oceanografi & Navigasi Laut',
            'time_limit_sec' => 3600,
            'passing_score' => 70,
            'max_attempts' => 2,
            'pearls_reward' => 50,
        ]);

        ExamQuestion::create([
            'id' => '88888888-8888-8888-8888-888888888881',
            'exam_id' => $exam1->id,
            'question_text' => 'Zona laut terdalam yang berada di palung laut dinamakan zona...',
            'type' => 'multiple_choice',
            'options' => [
                ['key' => 'A', 'value' => 'Pelagis'],
                ['key' => 'B', 'value' => 'Hadapelagis'],
                ['key' => 'C', 'value' => 'Mesopelagis'],
                ['key' => 'D', 'value' => 'Abisal'],
            ],
            'correct_answer' => 'B',
            'explanation' => 'Zona Hadapelagis adalah zona laut paling dalam yang berada di palung laut (kedalaman >6.000 meter).',
            'points' => 25,
            'order' => 1,
        ]);

        ExamQuestion::create([
            'id' => '88888888-8888-8888-8888-888888888882',
            'exam_id' => $exam1->id,
            'question_text' => 'Terumbu karang membutuhkan cahaya matahari untuk melakukan fotosintesis bersama zooxanthellae.',
            'type' => 'true_false',
            'options' => [
                ['key' => 'A', 'value' => 'Benar'],
                ['key' => 'B', 'value' => 'Salah'],
            ],
            'correct_answer' => 'A',
            'explanation' => 'Benar, fotosintesis zooxanthellae yang bersimbiosis dengan karang membutuhkan sinar matahari pada zona Epipelagis.',
            'points' => 25,
            'order' => 2,
        ]);

        ExamQuestion::create([
            'id' => '88888888-8888-8888-8888-888888888883',
            'exam_id' => $exam1->id,
            'question_text' => 'Satu mil laut (1 Nautical Mile) internasional setara dengan berapa meter?',
            'type' => 'multiple_choice',
            'options' => [
                ['key' => 'A', 'value' => '1.000 meter'],
                ['key' => 'B', 'value' => '1.609 meter'],
                ['key' => 'C', 'value' => '1.852 meter'],
                ['key' => 'D', 'value' => '2.000 meter'],
            ],
            'correct_answer' => 'C',
            'explanation' => '1 Nautical Mile (NM) standar internasional disepakati bernilai tepat 1.852 meter.',
            'points' => 25,
            'order' => 3,
        ]);

        ExamQuestion::create([
            'id' => '88888888-8888-8888-8888-888888888884',
            'exam_id' => $exam1->id,
            'question_text' => 'Fenomena Upwelling menyebabkan suhu permukaan laut menjadi lebih panas dari biasanya.',
            'type' => 'true_false',
            'options' => [
                ['key' => 'A', 'value' => 'Benar'],
                ['key' => 'B', 'value' => 'Salah'],
            ],
            'correct_answer' => 'B',
            'explanation' => 'Salah. Upwelling membawa massa air dingin dari dasar laut ke permukaan sehingga suhu permukaan laut justru menurun.',
            'points' => 25,
            'order' => 4,
        ]);

        // Generate Exams for all other published courses
        $publishedCourses = Course::where('status', 'published')
            ->where('id', '!=', '44444444-4444-4444-4444-444444444444')
            ->get();

        foreach ($publishedCourses as $course) {
            $exam = Exam::create([
                'id' => (string) Str::uuid(),
                'course_id' => $course->id,
                'lesson_id' => null,
                'title' => "Ujian Akhir Sertifikasi: {$course->title}",
                'time_limit_sec' => rand(1800, 3600),
                'passing_score' => 70,
                'max_attempts' => 3,
                'pearls_reward' => rand(40, 100),
            ]);

            // Add 4 questions per exam
            $questionsData = [
                [
                    'text' => "Apa prinsip utama yang harus diperhatikan dalam penerapan {$course->title}?",
                    'type' => 'multiple_choice',
                    'options' => [
                        ['key' => 'A', 'value' => 'Standar Keselamatan & Integrasi Navigasi'],
                        ['key' => 'B', 'value' => 'Meminimalkan Kecepatan Kapal'],
                        ['key' => 'C', 'value' => 'Abaikan Sistem Sonar'],
                        ['key' => 'D', 'value' => 'Hanya Menggunakan Peta Kertas'],
                    ],
                    'correct' => 'A',
                    'exp' => 'Standar keselamatan dan integrasi navigasi merupakan prinsip paling mendasar.',
                ],
                [
                    'text' => 'Regulasi internasional mewajibkan setiap prosedur maritim mematuhi protokol baku.',
                    'type' => 'true_false',
                    'options' => [
                        ['key' => 'A', 'value' => 'Benar'],
                        ['key' => 'B', 'value' => 'Salah'],
                    ],
                    'correct' => 'A',
                    'exp' => 'Seluruh kapal komersial dan organisasi maritim wajib mematuhi regulasi baku IMO dan SOLAS.',
                ],
                [
                    'text' => 'Faktor manakah yang paling mempengaruhi akurasi penentuan posisi saat berlayar?',
                    'type' => 'multiple_choice',
                    'options' => [
                        ['key' => 'A', 'value' => 'Kalibrasi Instrumen & Kondisi Cuaca'],
                        ['key' => 'B', 'value' => 'Warna Cat Lambung Kapal'],
                        ['key' => 'C', 'value' => 'Jumlah Awak Kapal'],
                        ['key' => 'D', 'value' => 'Jenis Bahan Bakar Engine'],
                    ],
                    'correct' => 'A',
                    'exp' => 'Kalibrasi sensor/instrumen dan pemantauan kondisi cuaca sangat menentukan presisi koordinat.',
                ],
                [
                    'text' => 'Penggunaan sistem komunikasi otomatis hanya diperbolehkan dalam kondisi darurat.',
                    'type' => 'true_false',
                    'options' => [
                        ['key' => 'A', 'value' => 'Benar'],
                        ['key' => 'B', 'value' => 'Salah'],
                    ],
                    'correct' => 'B',
                    'exp' => 'Salah, sistem komunikasi seperti AIS dan VHF rutin digunakan dalam pelayaran sehari-hari.',
                ],
            ];

            foreach ($questionsData as $idx => $q) {
                ExamQuestion::create([
                    'id' => (string) Str::uuid(),
                    'exam_id' => $exam->id,
                    'question_text' => $q['text'],
                    'type' => $q['type'],
                    'options' => $q['options'],
                    'correct_answer' => $q['correct'],
                    'explanation' => $q['exp'],
                    'points' => 25,
                    'order' => $idx + 1,
                ]);
            }
        }
    }
}
