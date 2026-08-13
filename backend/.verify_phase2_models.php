<?php

$user = \App\Models\User::factory()->create();
$course = \App\Models\Course::factory()->create(['instructor_id' => $user->id]);
$lesson = \App\Models\Lesson::factory()->create(['course_id' => $course->id]);
$enrollment = \App\Models\Enrollment::factory()->create(['user_id' => $user->id, 'course_id' => $course->id]);
$lessonProgress = \App\Models\LessonProgress::factory()->create(['user_id' => $user->id, 'lesson_id' => $lesson->id]);
$exam = \App\Models\Exam::factory()->create(['course_id' => $course->id, 'lesson_id' => $lesson->id]);
$question = \App\Models\ExamQuestion::factory()->create(['exam_id' => $exam->id]);
$attempt = \App\Models\ExamAttempt::factory()->create(['user_id' => $user->id, 'exam_id' => $exam->id]);
$room = \App\Models\StudyRoom::factory()->create(['host_user_id' => $user->id]);
$message = \App\Models\RoomMessage::factory()->create(['room_id' => $room->id, 'user_id' => $user->id]);
$mascot = \App\Models\Mascot::factory()->create();
$userMascot = \App\Models\UserMascot::factory()->create(['user_id' => $user->id, 'mascot_id' => $mascot->id]);
$achievement = \App\Models\Achievement::factory()->create();
$userAchievement = \App\Models\UserAchievement::factory()->create(['user_id' => $user->id, 'achievement_id' => $achievement->id]);

$user->courses()->create([
    'title' => 'Verification Course',
    'description' => 'Course created during verification',
    'category' => 'technology',
    'difficulty' => 'beginner',
    'duration_minutes' => 45,
    'pearls_reward' => 20,
    'status' => 'draft',
    'instructor_id' => $user->id,
]);

$user->hostedRooms()->create([
    'name' => 'Verification Room',
    'topic' => 'Verification topic',
    'host_user_id' => $user->id,
    'max_capacity' => 10,
    'is_public' => true,
    'status' => 'active',
]);

$user->mascots()->attach($mascot->id, ['is_active' => true, 'accessories' => ['hat' => 'red'], 'unlocked_at' => now()]);
$user->achievements()->attach($achievement->id, ['earned_at' => now()]);

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
    'userMascot->user' => $userMascot->user?->id,
    'userMascot->mascot' => $userMascot->mascot?->id,
    'userAchievement->user' => $userAchievement->user?->id,
    'userAchievement->achievement' => $userAchievement->achievement?->id,
    'mascot->users' => $mascot->users()->count(),
    'achievement->users' => $achievement->users()->count(),
];

foreach ($checks as $label => $value) {
    echo $label . ': ' . json_encode($value) . PHP_EOL;
}

if ($user->courses()->count() === 0 || $user->hostedRooms()->count() === 0 || $course->instructor?->id !== $user->id || $room->host?->id !== $user->id || $message->user?->id !== $user->id) {
    throw new RuntimeException('One or more relationships failed to resolve correctly.');
}
