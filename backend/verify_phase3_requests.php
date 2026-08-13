<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Requests\Admin\UpdateCourseStatusRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Requests\Ai\AiChatRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Course\StoreCourseRequest;
use App\Http\Requests\Course\UpdateCourseRequest;
use App\Http\Requests\Exam\StoreExamRequest;
use App\Http\Requests\Exam\SubmitAttemptRequest;
use App\Http\Requests\Exam\UpdateExamRequest;
use App\Http\Requests\Lesson\StoreLessonRequest;
use App\Http\Requests\Lesson\UpdateLessonRequest;
use App\Http\Requests\StudyRoom\StoreStudyRoomRequest;
use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\UpdateMascotRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use Illuminate\Support\Facades\Validator;

$cases = [
    RegisterRequest::class => [
        'valid' => [
            'username' => 'penjelajah_baru',
            'email' => 'user@email.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'full_name' => 'Budi Santoso',
        ],
        'invalid' => [
            'username' => '',
            'email' => 'user@email.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'full_name' => 'Budi Santoso',
        ],
        'fail_key' => 'username',
    ],
    LoginRequest::class => [
        'valid' => [
            'email' => 'user@email.com',
            'password' => 'password123',
        ],
        'invalid' => [
            'email' => 'user@email.com',
        ],
        'fail_key' => 'password',
    ],
    ForgotPasswordRequest::class => [
        'valid' => ['email' => 'user@email.com'],
        'invalid' => [],
        'fail_key' => 'email',
    ],
    ResetPasswordRequest::class => [
        'valid' => [
            'email' => 'user@email.com',
            'token' => 'reset-token-123',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ],
        'invalid' => [
            'email' => 'user@email.com',
            'token' => 'reset-token-123',
            'password' => 'newpassword123',
            'password_confirmation' => '',
        ],
        'fail_key' => 'password_confirmation',
    ],
    UpdateProfileRequest::class => [
        'valid' => [
            'full_name' => 'Budi Santoso Baru',
            'username' => 'budi_baru',
            'email' => 'new@email.com',
            'bio' => 'Bio baru',
            'avatar_url' => 'https://example.com/avatar.png',
        ],
        'invalid' => [
            'full_name' => 123,
            'username' => 'budi_baru',
            'email' => 'new@email.com',
        ],
        'fail_key' => 'full_name',
    ],
    ChangePasswordRequest::class => [
        'valid' => [
            'current_password' => 'oldpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ],
        'invalid' => [
            'current_password' => '',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ],
        'fail_key' => 'current_password',
    ],
    UpdateMascotRequest::class => [
        'valid' => [
            'mascot_id' => '11111111-1111-4111-8111-111111111111',
            'accessories' => [
                'hat' => 'hat-01',
                'glasses' => 'glasses-01',
                'outfit' => 'outfit-01',
                'background' => 'bg-01',
            ],
        ],
        'invalid' => [
            'accessories' => [
                'hat' => 'hat-01',
            ],
        ],
        'fail_key' => 'mascot_id',
    ],
    StoreCourseRequest::class => [
        'valid' => [
            'title' => 'JavaScript Dasar',
            'description' => 'Pelajari dasar JavaScript.',
            'category' => 'technology',
            'difficulty' => 'beginner',
            'thumbnail_url' => 'https://example.com/thumb.jpg',
            'trailer_url' => 'https://example.com/trailer.mp4',
            'status' => 'published',
            'pearls_reward' => 50,
            'duration_minutes' => 240,
        ],
        'invalid' => [
            'description' => 'Pelajari dasar JavaScript.',
            'category' => 'invalid-category',
            'difficulty' => 'beginner',
        ],
        'fail_key' => 'title',
    ],
    UpdateCourseRequest::class => [
        'valid' => [
            'title' => 'JavaScript Lanjutan',
            'category' => 'technology',
            'difficulty' => 'intermediate',
            'status' => 'published',
        ],
        'invalid' => [
            'category' => 'invalid-category',
        ],
        'fail_key' => 'category',
    ],
    StoreLessonRequest::class => [
        'valid' => [
            'course_id' => '22222222-2222-4222-8222-222222222222',
            'title' => 'Pengenalan JavaScript',
            'type' => 'video',
            'content' => '# Intro',
            'video_url' => 'https://example.com/lesson.mp4',
            'duration_minutes' => 12,
            'order' => 1,
            'xp_reward' => 10,
            'is_preview' => true,
        ],
        'invalid' => [
            'course_id' => '22222222-2222-4222-8222-222222222222',
            'type' => 'invalid-type',
            'order' => 1,
        ],
        'fail_key' => 'type',
    ],
    UpdateLessonRequest::class => [
        'valid' => [
            'title' => 'Pengenalan JavaScript Lanjutan',
            'type' => 'text',
            'order' => 2,
        ],
        'invalid' => [
            'type' => 'invalid-type',
        ],
        'fail_key' => 'type',
    ],
    StoreExamRequest::class => [
        'valid' => [
            'course_id' => '33333333-3333-4333-8333-333333333333',
            'lesson_id' => '44444444-4444-4444-8444-444444444444',
            'title' => 'Ujian JavaScript',
            'time_limit_sec' => 3600,
            'passing_score' => 70,
            'max_attempts' => 3,
            'pearls_reward' => 30,
        ],
        'invalid' => [
            'course_id' => 'not-a-uuid',
            'title' => 'Ujian JavaScript',
        ],
        'fail_key' => 'course_id',
    ],
    UpdateExamRequest::class => [
        'valid' => [
            'title' => 'Ujian JavaScript Baru',
            'passing_score' => 75,
        ],
        'invalid' => [
            'passing_score' => 200,
        ],
        'fail_key' => 'passing_score',
    ],
    SubmitAttemptRequest::class => [
        'valid' => [
            'answers' => [
                ['question_id' => '55555555-5555-4555-8555-555555555555', 'selected_key' => 'B'],
                ['question_id' => '66666666-6666-4666-8666-666666666666', 'selected_key' => 'A'],
            ],
        ],
        'invalid' => [
            'answers' => [
                ['question_id' => 'not-a-uuid'],
            ],
        ],
        'fail_key' => 'answers.0.selected_key',
    ],
    StoreStudyRoomRequest::class => [
        'valid' => [
            'name' => 'Belajar JavaScript',
            'topic' => 'Diskusi front-end',
            'max_capacity' => 12,
            'is_public' => true,
        ],
        'invalid' => [
            'topic' => 'Diskusi front-end',
            'max_capacity' => 0,
        ],
        'fail_key' => 'max_capacity',
    ],
    AiChatRequest::class => [
        'valid' => [
            'message' => 'Jelaskan perbedaan let, const, dan var di JavaScript',
            'course_context_id' => '77777777-7777-4777-8777-777777777777',
            'lesson_context_id' => '88888888-8888-4888-8888-888888888888',
            'conversation_id' => '99999999-9999-4999-8999-999999999999',
        ],
        'invalid' => [
            'course_context_id' => 'not-uuid',
        ],
        'fail_key' => 'course_context_id',
    ],
    UpdateUserRoleRequest::class => [
        'valid' => ['role' => 'instructor'],
        'invalid' => ['role' => 'owner'],
        'fail_key' => 'role',
    ],
    UpdateCourseStatusRequest::class => [
        'valid' => ['status' => 'published'],
        'invalid' => ['status' => 'pending'],
        'fail_key' => 'status',
    ],
];

$allOk = true;
foreach ($cases as $className => $payloads) {
    $instance = new $className();
    $valid = Validator::make($payloads['valid'], $instance->rules(), $instance->messages());
    if ($valid->fails()) {
        echo $className . ': VALIDATION FAILED on valid payload: ' . implode('; ', $valid->errors()->all()) . PHP_EOL;
        $allOk = false;
        continue;
    }

    $invalid = $payloads['invalid'];
    $invalidValidator = Validator::make($invalid, $instance->rules(), $instance->messages());
    if (! $invalidValidator->fails()) {
        echo $className . ': INVALID CASE DID NOT FAIL' . PHP_EOL;
        $allOk = false;
        continue;
    }

    $firstError = $invalidValidator->errors()->first($payloads['fail_key']);
    if ($firstError === null || $firstError !== 'Validasi gagal.') {
        $allMessages = implode('; ', $invalidValidator->errors()->all());
        echo $className . ': INVALID MESSAGE MISMATCH -> ' . $allMessages . PHP_EOL;
        $allOk = false;
        continue;
    }

    echo $className . ': OK' . PHP_EOL;
}

if (! $allOk) {
    exit(1);
}
