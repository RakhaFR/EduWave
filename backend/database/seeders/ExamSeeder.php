<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $exam = Exam::create([
            'id' => '77777777-7777-7777-7777-777777777777',
            'course_id' => '44444444-4444-4444-4444-444444444444',
            'lesson_id' => null,
            'title' => 'Ujian Evaluasi Oceanografi Dasar',
            'time_limit_sec' => 3600,
            'passing_score' => 70,
            'max_attempts' => 2,
            'pearls_reward' => 40,
        ]);

        ExamQuestion::create([
            'id' => '88888888-8888-8888-8888-888888888881',
            'exam_id' => $exam->id,
            'question_text' => 'Zona laut terdalam yang berada di palung laut dinamakan zona...',
            'type' => 'multiple_choice',
            'options' => [
                ['key' => 'A', 'value' => 'Pelagis'],
                ['key' => 'B', 'value' => 'Hadapelagis'],
                ['key' => 'C', 'value' => 'Mesopelagis'],
                ['key' => 'D', 'value' => 'Abisal'],
            ],
            'correct_answer' => 'B',
            'explanation' => 'Zona Hadapelagis adalah zona laut paling dalam di palung laut.',
            'points' => 10,
            'order' => 1,
        ]);

        ExamQuestion::create([
            'id' => '88888888-8888-8888-8888-888888888882',
            'exam_id' => $exam->id,
            'question_text' => 'Terumbu karang membutuhkan cahaya matahari untuk melakukan fotosintesis bersama zooxanthellae.',
            'type' => 'true_false',
            'options' => [
                ['key' => 'A', 'value' => 'Benar'],
                ['key' => 'B', 'value' => 'Salah'],
            ],
            'correct_answer' => 'A',
            'explanation' => 'Benar, fotosintesis zooxanthellae membutuhkan sinar matahari.',
            'points' => 10,
            'order' => 2,
        ]);
    }
}
