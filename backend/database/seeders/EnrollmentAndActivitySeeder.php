<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EnrollmentAndActivitySeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role', 'student')->get();
        $publishedCourses = Course::where('status', 'published')->with(['lessons', 'exams'])->get();

        if ($students->isEmpty() || $publishedCourses->isEmpty()) {
            return;
        }

        foreach ($students as $student) {
            // Pick 2-5 courses for each student
            $enrolledCourses = $publishedCourses->random(min(count($publishedCourses), rand(2, 5)));

            foreach ($enrolledCourses as $course) {
                $isCompleted = rand(0, 100) > 60;
                $status = $isCompleted ? 'completed' : 'enrolled';
                $progressPct = $isCompleted ? 100.0 : rand(20, 80);

                $enrollment = Enrollment::create([
                    'id' => (string) Str::uuid(),
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'progress_pct' => $progressPct,
                    'status' => $status,
                    'enrolled_at' => now()->subDays(rand(5, 30)),
                    'completed_at' => $isCompleted ? now()->subDays(rand(1, 5)) : null,
                ]);

                // Create Lesson Progress records
                $lessons = $course->lessons;
                $completedLessonCount = $isCompleted
                    ? count($lessons)
                    : (int) round(($progressPct / 100) * count($lessons));

                foreach ($lessons as $idx => $lesson) {
                    if ($idx < $completedLessonCount) {
                        LessonProgress::create([
                            'id' => (string) Str::uuid(),
                            'user_id' => $student->id,
                            'lesson_id' => $lesson->id,
                            'completed_at' => now()->subDays(rand(1, 10)),
                        ]);
                    }
                }

                // Generate Exam Attempt if course has exams
                $exam = $course->exams->first();
                if ($exam && ($isCompleted || rand(0, 1) === 1)) {
                    $passed = $isCompleted || rand(0, 1) === 1;
                    $score = $passed ? rand(75, 100) : rand(30, 65);

                    ExamAttempt::create([
                        'id' => (string) Str::uuid(),
                        'exam_id' => $exam->id,
                        'user_id' => $student->id,
                        'started_at' => now()->subDays(rand(1, 5)),
                        'submitted_at' => now()->subDays(rand(1, 5))->addMinutes(rand(15, 45)),
                        'expires_at' => now()->subDays(rand(1, 5))->addHour(),
                        'answers' => [
                            '1' => 'B',
                            '2' => 'A',
                        ],
                        'score' => $score,
                        'passed' => $passed,
                    ]);
                }
            }
        }
    }
}