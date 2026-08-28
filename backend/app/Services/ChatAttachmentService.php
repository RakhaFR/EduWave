<?php

namespace App\Services;

use App\Models\PrivateMessage;
use App\Models\RoomMessage;
use App\Models\StudyRoom;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Support\Facades\Log;

class ChatAttachmentService
{
    /**
     * Delete every Cloudinary asset referenced by a message.
     */
    public function deleteFromMessage(RoomMessage $message): void
    {
        $this->deleteAttachments($message->content);
    }

    /**
     * Delete every Cloudinary asset referenced by a private message.
     */
    public function deleteFromPrivateMessage(PrivateMessage $message): void
    {
        $this->deleteAttachments($message->content);
    }

    /**
     * Delete the messages and every referenced Cloudinary asset in a room.
     */
    public function deleteFromRoom(StudyRoom $room): void
    {
        $room->messages()->chunkById(100, function ($messages): void {
            foreach ($messages as $message) {
                $this->deleteFromMessage($message);
                $message->delete();
            }
        });
    }

    private function deleteAttachments(string $content): void
    {
        $payload = json_decode($content, true);

        if (! is_array($payload) || ! config('services.cloudinary.url')) {
            return;
        }

        $attachments = [];
        $this->findAttachments($payload, $attachments);

        foreach ($attachments as $attachment) {
            try {
                (new UploadApi(config('services.cloudinary.url')))->destroy(
                    $attachment['public_id'],
                    [
                        'resource_type' => $attachment['resource_type'],
                        'type' => 'upload',
                        'invalidate' => true,
                    ]
                );
            } catch (\Throwable $exception) {
                Log::warning('Cloudinary chat attachment cleanup failed.', [
                    'public_id' => $attachment['public_id'],
                    'resource_type' => $attachment['resource_type'],
                    'exception' => $exception,
                ]);
            }
        }
    }

    private function findAttachments(array $payload, array &$attachments, ?string $resourceType = null): void
    {
        $resourceType = $payload['resource_type'] ?? $resourceType ?? 'image';

        if (isset($payload['public_id']) && is_string($payload['public_id'])) {
            $key = $resourceType.':'.$payload['public_id'];
            $attachments[$key] = [
                'public_id' => $payload['public_id'],
                'resource_type' => $resourceType,
            ];
        }

        foreach ($payload as $value) {
            if (is_array($value)) {
                $this->findAttachments($value, $attachments, $resourceType);
            }
        }
    }
}
