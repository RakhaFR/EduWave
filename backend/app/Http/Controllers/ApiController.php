<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

class ApiController extends Controller
{
    use AuthorizesRequests;
    /**
     * Return a successful response with data.
     */
    protected function success(mixed $data, string $message = '', int $status = 200, ?array $meta = null): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'error' => null,
            'meta' => $meta,
        ], $status);
    }

    /**
     * Return a paginated response.
     */
    protected function paginated(LengthAwarePaginator $paginator, $transformFn = null): JsonResponse
    {
        $items = $transformFn ? $paginator->getCollection()->map($transformFn) : $paginator->getCollection();

        return response()->json([
            'success' => true,
            'data' => $items,
            'error' => null,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Return an error response.
     */
    protected function error(string $code, string $message, int $status = 400, array $details = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'data' => null,
            'error' => array_merge([
                'code' => $code,
                'message' => $message,
            ], $details),
            'meta' => null,
        ], $status);
    }
}
