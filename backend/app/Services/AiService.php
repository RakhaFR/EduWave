<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiService
{
    /**
     * Send a chat completion request to the OpenAI-compatible Xkiro API.
     *
     * @return array{content: string, model: string|null, usage: array|null}
     */
    public function chat(string $message, ?Course $course = null, ?Lesson $lesson = null): array
    {
        $apiKey = config('services.xkiro.key');

        if (blank($apiKey)) {
            throw new RuntimeException('XKIRO_API_KEY belum dikonfigurasi.');
        }

        $messages = [
            [
                'role' => 'system',
                'content' => 'Anda adalah AI Study Assistant EduWave. Jawab dalam bahasa pengguna, jelas, akurat, dan bantu pengguna memahami materi tanpa mengerjakan ujian secara curang.',
            ],
        ];

        if ($course) {
            $messages[] = [
                'role' => 'system',
                'content' => "Konteks kursus: {$course->title}\n{$course->description}",
            ];
        }

        if ($lesson) {
            $messages[] = [
                'role' => 'system',
                'content' => "Konteks lesson: {$lesson->title}\n{$lesson->content}",
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        try {
            $response = Http::baseUrl(config('services.xkiro.base_url'))
                ->withToken($apiKey)
                ->acceptJson()
                ->asJson()
                ->retry([250, 750], function (\Throwable $exception, PendingRequest $request): bool {
                    return $exception instanceof ConnectionException;
                })
                ->timeout(config('services.xkiro.timeout'))
                ->connectTimeout(5)
                ->post('chat/completions', [
                    'model' => config('services.xkiro.model'),
                    'messages' => $messages,
                ]);
        } catch (ConnectionException|RequestException $exception) {
            throw new RuntimeException('Layanan AI sedang tidak tersedia.', previous: $exception);
        }

        if ($response->status() === 401) {
            throw new RuntimeException('Xkiro menolak kredensial API. Periksa XKIRO_API_KEY.');
        }

        if ($response->failed()) {
            throw new RuntimeException('Layanan AI sedang tidak tersedia.');
        }

        $content = data_get($response->json(), 'choices.0.message.content');

        if (! is_string($content) || trim($content) === '') {
            throw new RuntimeException('Layanan AI mengembalikan respons yang tidak valid.');
        }

        return [
            'content' => $content,
            'model' => data_get($response->json(), 'model'),
            'usage' => data_get($response->json(), 'usage'),
        ];
    }
}
