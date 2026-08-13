<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Achievement;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Mascot;
use App\Models\RoomMessage;
use App\Models\StudyRoom;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserMascot;

$user = User::factory()->create();
$course = Course::factory()->create(['instructor_id' => $user->id]);
$lesson = Lesson::factory()->create(['course_id' => $course->id]);
$enrollment = Enrollment::factory()->create(['user_id' => $user->id, 'course_id' => $course->id]);
$lessonProgress = LessonProgress::factory()->create(['user_id' => $user->id, 'lesson_id' => $lesson->id]);
$exam = Exam::factory()->create(['course_id' => $course->id, 'lesson_id' => $lesson->id]);
ExamQuestion::factory()->create(['exam_id' => $exam->id]);
$attempt = ExamAttempt::factory()->create(['user_id' => $user->id, 'exam_id' => $exam->id]);
$room = StudyRoom::factory()->create(['host_user_id' => $user->id]);
$message = RoomMessage::factory()->create(['room_id' => $room->id, 'user_id' => $user->id]);
$mascot = Mascot::factory()->create();
$achievement = Achievement::factory()->create();

$user->mascots()->attach($mascot->id, [
    'is_active' => true,
    'accessories' => json_encode(['hat' => 'red']),
    'unlocked_at' => now(),
]);

$user->achievements()->attach($achievement->id, ['earned_at' => now()]);

$userMascot = UserMascot::query()->where('user_id', $user->id)->where('mascot_id', $mascot->id)->first();
$userAchievement = UserAchievement::query()->where('user_id', $user->id)->where('achievement_id', $achievement->id)->first();

$checks = [
    'user->courses' => $user->courses()->count(),
    'user->enrollments' => $user->enrollments()->count(),
    'user->lessonProgress' => $user->lessonProgress()->count(),
    'user->attempts' => $user->attempts()->count(),
    'user->hostedRooms' => $user->hostedRooms()->count(),
    'course->lessons' => $course->lessons()->count(),
    'course->exams' => $course->exams()->count(),
    'course->instructor' => $course->instructor?->id,
    'lesson->course' => $lesson->course?->id,
    'enrollment->user' => $enrollment->user?->id,
    'lessonProgress->user' => $lessonProgress->user?->id,
    'exam->questions' => $exam->questions()->count(),
    'exam->attempts' => $exam->attempts()->count(),
    'attempt->user' => $attempt->user?->id,
    'studyRoom->host' => $room->host?->id,
    'studyRoom->messages' => $room->messages()->count(),
    'roomMessage->room' => $message->room?->id,
    'roomMessage->user' => $message->user?->id,
    'userMascot->user' => $userMascot?->user?->id,
    'userMascot->mascot' => $userMascot?->mascot?->id,
    'userAchievement->user' => $userAchievement?->user?->id,
    'userAchievement->achievement' => $userAchievement?->achievement?->id,
    'mascot->users' => $mascot->users()->count(),
    'achievement->users' => $achievement->users()->count(),
];

foreach ($checks as $label => $value) {
    echo $label . ': ' . json_encode($value) . PHP_EOL;
}

if ($user->courses()->count() === 0 || $user->hostedRooms()->count() === 0 || $course->instructor?->id !== $user->id || $room->host?->id !== $user->id || $message->user?->id !== $user->id || $userMascot?->user?->id !== $user->id || $userAchievement?->user?->id !== $user->id) {
    throw new RuntimeException('One or more relationships failed to resolve correctly.');
}
