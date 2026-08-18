# Phase 4.6 Implementation Notes — Study Rooms & Realtime

## ✅ Implementation Summary

Phase 4.6 has been fully implemented with real-time study room functionality ready for Laravel Reverb integration.

### Core Components Created

1. **Request Validation Classes**
   - `app/Http/Requests/StudyRoom/StoreStudyRoomRequest.php`
     - Validates: name (required, max 100), topic (optional), max_capacity (2-100), is_public (boolean)
   - `app/Http/Requests/StudyRoom/SendMessageRequest.php`
     - Validates: content (required, max 2000), type (text/file/ai)

2. **Controllers**
   - `app/Http/Controllers/StudyRoomController.php`
     - `index()` - List all active study rooms with filters (status, is_public)
     - `store()` - Create new room, auto-join host as first participant
     - `show()` - Get room details with participants list
     - `join()` - Join room (enforces capacity + status via StudyRoomPolicy)
     - `leave()` - Leave room (closes room if host leaves)
     - `destroy()` - Close room (host or admin only, soft-close to preserve message history)
   
   - `app/Http/Controllers/RoomMessageController.php`
     - `index()` - Get message history with pagination (cursor-based via `before` timestamp)
     - `store()` - Send message (HTTP fallback for WebSocket)

3. **Broadcasting Events**
   - `app/Events/StudyRoomMessageSent.php` - Broadcasts new messages (event: 'message')
   - `app/Events/StudyRoomUserJoined.php` - Broadcasts when user joins (event: 'user_joined')
   - `app/Events/StudyRoomUserLeft.php` - Broadcasts when user leaves (event: 'user_left')
   - `app/Events/StudyRoomClosed.php` - Broadcasts when room closes (event: 'room_closed')
   
   All events implement `ShouldBroadcast` and broadcast to `PrivateChannel('study-room.{room_id}')`

4. **Channel Authorization**
   - `routes/channels.php` created
   - Authorization callback for `study-room.{roomId}` channel
   - Checks if user is a participant before allowing WebSocket subscription

### API Endpoints

All endpoints under `auth:sanctum` middleware at `/api/v1/study-rooms`:

```
GET    /study-rooms                     - List all active rooms
POST   /study-rooms                     - Create new room
GET    /study-rooms/{room}              - Get room details + participants
POST   /study-rooms/{room}/join         - Join room
DELETE /study-rooms/{room}/leave        - Leave room
DELETE /study-rooms/{room}              - Close room (host/admin only)
GET    /study-rooms/{room}/messages     - Get message history
POST   /study-rooms/{room}/messages     - Send message (HTTP fallback)
```

### Routes Registered

**File:** `routes/api.php` (lines 77-84)
```php
Route::get('study-rooms', [StudyRoomController::class, 'index']);
Route::post('study-rooms', [StudyRoomController::class, 'store']);
Route::get('study-rooms/{room}', [StudyRoomController::class, 'show']);
Route::post('study-rooms/{room}/join', [StudyRoomController::class, 'join']);
Route::delete('study-rooms/{room}/leave', [StudyRoomController::class, 'leave']);
Route::delete('study-rooms/{room}', [StudyRoomController::class, 'destroy']);
Route::get('study-rooms/{room}/messages', [RoomMessageController::class, 'index']);
Route::post('study-rooms/{room}/messages', [RoomMessageController::class, 'store']);
```

### Business Logic Highlights

#### Room Creation
- Host user automatically joins as first participant
- Default capacity: 20 (configurable 2-100)
- Default visibility: public
- Status: 'active'

#### Join Room
- Checks if user already joined (409 if true)
- Policy authorization checks:
  - Room status must be 'active'
  - Current capacity < max_capacity
- Broadcasts `StudyRoomUserJoined` event to other participants

#### Leave Room
- Detaches user from participants
- If host leaves: room status → 'closed', broadcasts `StudyRoomClosed`
- Broadcasts `StudyRoomUserLeft` event to remaining participants

#### Message History
- Cursor-based pagination using `before` timestamp
- Limit: 10-100 messages (default 50)
- Only accessible to room participants
- Returns messages in descending order (newest first)

#### Send Message
- Validates participant membership
- Checks room is still active
- Creates message record with `sent_at` timestamp
- Broadcasts `StudyRoomMessageSent` to all participants via WebSocket

### Authorization

**StudyRoomPolicy** (existing, from Phase 4.1):
- `destroy()` - Host or admin only
- `join()` - Room must be active AND not at capacity

**Participant Check** (controller-level):
- Message history access requires participant membership
- Sending messages requires participant membership
- Enforced in both controllers

### Database Schema

**study_rooms table:**
```php
id              uuid primary
name            string(100)
topic           text nullable
host_user_id    uuid nullable (FK → users.id)
max_capacity    integer default(20)
is_public       boolean default(true)
status          enum('active', 'closed') default('active')
created_at, updated_at
```

**room_messages table:**
```php
id         uuid primary
room_id    uuid (FK → study_rooms.id, cascadeOnDelete)
user_id    uuid nullable (FK → users.id, nullOnDelete)
content    text
type       enum('text', 'file', 'ai') default('text')
sent_at    timestamp
```

**study_room_participants pivot:**
```php
user_id    uuid (FK → users.id)
room_id    uuid (FK → study_rooms.id)
joined_at  timestamp
```

### Broadcasting Configuration

**Channel:** `private-study-room.{room_id}`

**Events Broadcast:**
- `message` - New message sent
- `user_joined` - User joined room
- `user_left` - User left room
- `room_closed` - Room closed by host or admin

**Authorization:**
User must be in `room.participants()` to subscribe to channel.

### WebSocket Integration (Ready for Reverb)

**Current Status:** Broadcasting code is in place and ready. To enable:

1. **Install Laravel Reverb:**
   ```bash
   composer require laravel/reverb
   php artisan reverb:install
   ```

2. **Configure `.env`:**
   ```env
   BROADCAST_CONNECTION=reverb
   REVERB_APP_ID=your-app-id
   REVERB_APP_KEY=your-app-key
   REVERB_APP_SECRET=your-app-secret
   REVERB_HOST=localhost
   REVERB_PORT=8080
   REVERB_SCHEME=http
   ```

3. **Start Reverb Server:**
   ```bash
   php artisan reverb:start
   ```

4. **Frontend Integration:**
   ```javascript
   import Echo from 'laravel-echo';
   import Pusher from 'pusher-js';
   
   window.Pusher = Pusher;
   window.Echo = new Echo({
       broadcaster: 'reverb',
       key: import.meta.env.VITE_REVERB_APP_KEY,
       wsHost: import.meta.env.VITE_REVERB_HOST,
       wsPort: import.meta.env.VITE_REVERB_PORT,
       forceTLS: false,
       enabledTransports: ['ws', 'wss'],
   });
   
   // Subscribe to room channel
   Echo.private(`study-room.${roomId}`)
       .listen('.message', (e) => {
           console.log('New message:', e);
       })
       .listen('.user_joined', (e) => {
           console.log('User joined:', e.user);
       })
       .listen('.user_left', (e) => {
           console.log('User left:', e.user);
       })
       .listen('.room_closed', (e) => {
           console.log('Room closed');
       });
   ```

### Client-Side Events (Future Implementation)

Per `web-analysis.md`, the following client-side events are planned but require frontend implementation:

```json
{ "event": "client-send-message", "data": { "content": "string" } }
{ "event": "client-ask-ai",       "data": { "prompt": "string", "context": "string" } }
```

These would be handled via Reverb's client events feature or additional backend endpoints.

### Testing

**Test Suite Status:** 49/57 tests pass (86%)
- All non-Leaderboard tests pass
- Study room functionality not yet covered by feature tests (can be added in Phase 4.10)

**Manual Testing:**
```bash
# 1. Create room
POST /api/v1/study-rooms
{
  "name": "Laravel Study Group",
  "topic": "Building REST APIs",
  "max_capacity": 10,
  "is_public": true
}

# 2. List rooms
GET /api/v1/study-rooms

# 3. Join room
POST /api/v1/study-rooms/{room-id}/join

# 4. Send message
POST /api/v1/study-rooms/{room-id}/messages
{
  "content": "Hello everyone!",
  "type": "text"
}

# 5. Get message history
GET /api/v1/study-rooms/{room-id}/messages?limit=50

# 6. Leave room
DELETE /api/v1/study-rooms/{room-id}/leave
```

### Response Examples

**POST /study-rooms (Create Room):**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "uuid",
      "name": "Laravel Study Group",
      "topic": "Building REST APIs",
      "host": {
        "id": "uuid",
        "username": "john_doe",
        "avatar_url": "https://..."
      },
      "max_capacity": 10,
      "current_capacity": 1,
      "is_public": true,
      "status": "active",
      "created_at": "2026-08-18T04:57:00.000000Z"
    }
  },
  "error": null,
  "meta": {}
}
```

**GET /study-rooms/{room} (Show Room):**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "uuid",
      "name": "Laravel Study Group",
      "topic": "Building REST APIs",
      "host": {...},
      "max_capacity": 10,
      "current_capacity": 3,
      "is_public": true,
      "status": "active",
      "participants": [
        { "id": "uuid", "username": "john_doe", "avatar_url": "..." },
        { "id": "uuid", "username": "jane_smith", "avatar_url": "..." },
        { "id": "uuid", "username": "bob_jones", "avatar_url": "..." }
      ],
      "created_at": "...",
      "updated_at": "..."
    }
  }
}
```

**GET /study-rooms/{room}/messages (Message History):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "content": "Hello everyone!",
        "type": "text",
        "user": {
          "id": "uuid",
          "username": "john_doe",
          "avatar_url": "..."
        },
        "sent_at": "2026-08-18T04:58:00.000000Z"
      }
    ]
  }
}
```

### Error Handling

**403 Forbidden:**
- Joining full room: `ROOM_FULL`
- Joining closed room: `ROOM_CLOSED`
- Sending message to closed room: `ROOM_CLOSED`
- Destroying room without permission: `FORBIDDEN`
- Accessing messages without membership: `NOT_A_PARTICIPANT`

**404 Not Found:**
- Leaving room when not a participant: `NOT_A_PARTICIPANT`

**409 Conflict:**
- Joining room already joined: `ALREADY_JOINED`

### Files Modified/Created

**Created:**
- `app/Http/Controllers/StudyRoomController.php`
- `app/Http/Controllers/RoomMessageController.php`
- `app/Http/Requests/StudyRoom/StoreStudyRoomRequest.php`
- `app/Http/Requests/StudyRoom/SendMessageRequest.php`
- `app/Events/StudyRoomMessageSent.php`
- `app/Events/StudyRoomUserJoined.php`
- `app/Events/StudyRoomUserLeft.php`
- `app/Events/StudyRoomClosed.php`
- `routes/channels.php`

**Modified:**
- `routes/api.php` - Added 8 study room routes
- `TODO.md` - Marked Phase 4.6 as complete

### Next Steps (Phase 4.7 - Mascot & Achievements)

Phase 4.6 is complete and ready for frontend integration. Next phase will implement:
- MascotController: catalog, inventory, purchase, equip
- AchievementController: list, user achievements  
- GamificationService: pearls earn/spend, XP award, achievement condition checks

---

**Phase 4.6 Status:** ✅ **COMPLETE**

All study room CRUD operations, real-time messaging infrastructure, and WebSocket broadcasting configured.
