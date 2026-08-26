<?php

namespace App\Http\Controllers;

use App\Models\PrivateConversation;
use App\Models\StudyRoom;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ChatAttachmentController extends ApiController
{
    private const MAX_FILE_SIZE_KB = 10240;

    private const ALLOWED_MIME_TYPES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
    ];

    public function studyRoom(Request $request, StudyRoom $room): JsonResponse
    {
        $user = $request->user();

        if (! $room->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('NOT_A_PARTICIPANT', 'Anda bukan peserta ruang belajar ini.', 403);
        }

        if ($room->status !== 'active') {
            return $this->error('ROOM_CLOSED', 'Ruang belajar ini sudah ditutup.', 403);
        }

        return $this->upload($request, "chat/study-rooms/{$room->id}");
    }

    public function privateChat(Request $request, PrivateConversation $conversation): JsonResponse
    {
        $user = $request->user();

        if ($conversation->user_one_id !== $user->id && $conversation->user_two_id !== $user->id) {
            return $this->error('UNAUTHORIZED_CONVERSATION', 'Anda tidak memiliki akses ke percakapan ini.', 403);
        }

        return $this->upload($request, "chat/private/{$conversation->id}");
    }

    private function upload(Request $request, string $folder): JsonResponse
    {
        try {
            $request->validate([
                'file' => [
                    'required',
                    'file',
                    'max:'.self::MAX_FILE_SIZE_KB,
                    'mimetypes:'.implode(',', self::ALLOWED_MIME_TYPES),
                ],
            ]);
        } catch (ValidationException $exception) {
            throw $exception;
        }

        if (! config('services.cloudinary.url')) {
            return $this->error('CLOUDINARY_NOT_CONFIGURED', 'Cloudinary belum dikonfigurasi di server.', 503);
        }

        $file = $request->file('file');
        $resourceType = str_starts_with($file->getMimeType(), 'image/')
            ? 'image'
            : (str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'raw');

        try {
            $result = (new UploadApi(config('services.cloudinary.url')))->upload($file->getRealPath(), [
                'folder' => $folder,
                'resource_type' => $resourceType,
                'use_filename' => true,
                'unique_filename' => true,
                'overwrite' => false,
            ]);
        } catch (\Throwable $exception) {
            Log::error('Cloudinary chat attachment upload failed.', [
                'exception' => $exception,
                'folder' => $folder,
            ]);

            return $this->error('UPLOAD_FAILED', 'File gagal diunggah ke penyimpanan.', 502);
        }

        return $this->success([
            'attachment' => [
                'url' => $result['secure_url'] ?? $result['url'],
                'public_id' => $result['public_id'],
                'resource_type' => $result['resource_type'] ?? $resourceType,
                'format' => $result['format'] ?? null,
                'mime_type' => $file->getMimeType(),
                'size' => (int) ($result['bytes'] ?? $file->getSize()),
                'original_name' => $file->getClientOriginalName(),
            ],
        ], 'File berhasil diunggah.', 201);
    }
}
