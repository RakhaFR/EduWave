<?php

namespace App\Http\Controllers;

use App\Models\Mascot;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MascotController extends Controller
{
    public function __construct(
        protected GamificationService $gamificationService
    ) {}

    /**
     * GET /api/v1/mascots
     *
     * List all available mascots in the catalog.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Mascot::query();

        // Filter by rarity
        if ($request->has('rarity')) {
            $query->where('rarity', $request->rarity);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Sort by unlock cost (cheapest first by default)
        $sortOrder = $request->get('sort', 'asc'); // asc or desc
        $query->orderBy('unlock_cost', $sortOrder);

        $user = $request->user() ?? auth('sanctum')->user();

        $mascots = $query->get()->map(function ($mascot) use ($user) {
            $data = [
                'id' => $mascot->id,
                'name' => $mascot->name,
                'avatar_url' => $mascot->avatar_url,
                'description' => $mascot->description,
                'unlock_cost' => $mascot->unlock_cost,
                'rarity' => $mascot->rarity,
                'category' => $mascot->category,
            ];

            // If authenticated, include ownership status
            if ($user) {
                $data['is_owned'] = $user->mascots()->where('mascot_id', $mascot->id)->exists();
            }

            return $data;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'mascots' => $mascots,
                'count' => $mascots->count(),
            ],
            'error' => null,
            'meta' => null,
        ]);
    }

    /**
     * GET /api/v1/mascots/inventory
     *
     * Get authenticated user's owned mascots.
     */
    public function inventory(Request $request): JsonResponse
    {
        $user = $request->user();

        $mascots = $user->mascots()->get()->map(function ($mascot) {
            $accessories = $mascot->pivot->accessories;

            if (is_string($accessories)) {
                $accessories = json_decode($accessories, true);
            }

            return [
                'id' => $mascot->id,
                'name' => $mascot->name,
                'avatar_url' => $mascot->avatar_url,
                'description' => $mascot->description,
                'rarity' => $mascot->rarity,
                'category' => $mascot->category,
                'is_active' => (bool) $mascot->pivot->is_active,
                'accessories' => $accessories,
                'unlocked_at' => $mascot->pivot->unlocked_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'mascots' => $mascots,
                'count' => $mascots->count(),
            ],
            'error' => null,
            'meta' => null,
        ]);
    }

    /**
     * POST /api/v1/mascots/{mascot}/purchase
     *
     * Purchase a mascot using pearls.
     */
    public function purchase(Request $request, Mascot $mascot): JsonResponse
    {
        $user = $request->user();

        // Check if already owned
        if ($user->mascots()->where('mascot_id', $mascot->id)->exists()) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => [
                    'code' => 'MASCOT_ALREADY_OWNED',
                    'message' => 'Anda sudah memiliki maskot ini.',
                    'details' => null,
                ],
                'meta' => null,
            ], 409);
        }

        // Check if user has enough pearls
        if ($user->pearls < $mascot->unlock_cost) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => [
                    'code' => 'INSUFFICIENT_PEARLS',
                    'message' => 'Mutiara Anda tidak cukup untuk membeli maskot ini.',
                    'details' => [
                        'required' => $mascot->unlock_cost,
                        'available' => $user->pearls,
                        'shortage' => $mascot->unlock_cost - $user->pearls,
                    ],
                ],
                'meta' => null,
            ], 403);
        }

        try {
            // Deduct pearls
            $this->gamificationService->spendPearls($user, $mascot->unlock_cost, "Purchase mascot: {$mascot->name}");

            // Add mascot to user's inventory
            $user->mascots()->attach($mascot->id, [
                'is_active' => false,
                'accessories' => '{}',
                'unlocked_at' => now(),
            ]);

            $user->refresh();

            return response()->json([
                'success' => true,
                'data' => [
                    'mascot' => [
                        'id' => $mascot->id,
                        'name' => $mascot->name,
                        'avatar_url' => $mascot->avatar_url,
                        'description' => $mascot->description,
                        'rarity' => $mascot->rarity,
                        'category' => $mascot->category,
                        'unlocked_at' => now()->toISOString(),
                    ],
                    'pearls_spent' => $mascot->unlock_cost,
                    'pearls_remaining' => $user->pearls,
                ],
                'error' => null,
                'meta' => null,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => [
                    'code' => 'PURCHASE_FAILED',
                    'message' => 'Gagal membeli maskot.',
                    'details' => null,
                ],
                'meta' => null,
            ], 500);
        }
    }

    /**
     * PUT /api/v1/mascots/equip
     *
     * Equip a mascot and customize accessories.
     * This reuses the existing /api/v1/users/me/mascot endpoint logic.
     * Note: UserController already handles equip functionality at PUT /users/me/mascot.
     * This method provides an alternative endpoint under /mascots namespace for consistency.
     */
    public function equip(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'mascot_id' => 'required|uuid|exists:mascots,id',
            'accessories' => 'nullable|array',
        ], [
            'mascot_id.required' => 'ID maskot wajib diisi.',
            'mascot_id.uuid' => 'ID maskot harus berformat UUID yang valid.',
            'mascot_id.exists' => 'Maskot tidak ditemukan.',
            'accessories.array' => 'Aksesoris harus berupa objek JSON.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Data yang diberikan tidak valid.',
                    'details' => $validator->errors(),
                ],
                'meta' => null,
            ], 422);
        }

        $user = $request->user();
        $mascotId = $request->mascot_id;

        // Check if user owns the mascot
        $pivot = $user->mascots()->where('mascot_id', $mascotId)->first();

        if (! $pivot) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => [
                    'code' => 'MASCOT_NOT_OWNED',
                    'message' => 'Anda tidak memiliki maskot ini.',
                    'details' => null,
                ],
                'meta' => null,
            ], 403);
        }

        // Deactivate all other mascots in pivot table
        foreach ($user->mascots as $m) {
            $user->mascots()->updateExistingPivot($m->id, ['is_active' => false]);
        }

        // Activate and update accessories for the selected mascot
        $user->mascots()->updateExistingPivot($mascotId, [
            'is_active' => true,
            'accessories' => $request->accessories ? json_encode($request->accessories) : '{}',
        ]);

        $mascot = Mascot::find($mascotId);

        return response()->json([
            'success' => true,
            'data' => [
                'mascot_id' => $mascotId,
                'name' => $mascot->name,
                'avatar_url' => $mascot->avatar_url,
                'accessories' => $request->accessories,
                'is_active' => true,
            ],
            'error' => null,
            'meta' => null,
        ]);
    }
}
