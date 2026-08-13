# EduWave Backend TODO

## Migrations

- [x] Create and review the main `users` table with fields for id, username, email, password, full_name, role, avatar_url, pearls, xp, level, and timestamps.
- [x] Add the `personal_access_tokens` table support for Laravel Sanctum authentication if not already present.
- [x] Create the `courses` table with title, description, instructor_id, category, difficulty, thumbnail_url, trailer_url, duration_minutes, status, pearls_reward, and timestamps. No price/is_free fields — all courses are free.
- [x] Create the `lessons` table linked to courses with title, content/markdown, order_index, duration_minutes, and status.
- [x] Create the `enrollments` table linking users to courses with progress, completion status, and timestamps.
- [x] Create the `exams` table (`exam_id` FK on course_id, nullable lesson_id) with title, time_limit_sec, passing_score, max_attempts, pearls_reward.
- [x] Create the `exam_questions` table for exam questions with question_text, type, options (json), correct_answer, explanation, points, order.
- [x] Create the `exam_attempts` table to track user exam starts (started_at, expires_at), submission (submitted_at, answers json), score, and passed status.
- [x] Create the `study_rooms` table with name, topic, host_user_id, max_capacity, is_public, status.
- [x] Create the `room_messages` table to store chat messages, user references, room_id, type (text/file/ai), and timestamps.
- [x] Create the `mascots` table (name, avatar_url, description, unlock_cost, rarity, category) and `user_mascots` pivot (user_id, mascot_id, is_active, accessories json).
- [x] Create the `achievements` table (name, description, icon_url, condition_type, condition_value, pearls_reward) and `user_achievements` pivot (user_id, achievement_id, earned_at).
- [x] Create the `study_room_participants` pivot table (user_id, room_id, joined_at) for tracking study room membership and capacity checks.
- [x] Leaderboard has **no DB table** — ranking is Redis Sorted Sets (`leaderboard:global`, `leaderboard:weekly:{Y-W}`), updated on XP change. Do not create a `leaderboard` model/migration.
- [x] Add foreign keys, indexes, unique constraints, and soft deletes where needed for efficient querying and data integrity.
- [x] Run migrations and validate schema for all core LMS entities before API implementation.

## Models

- [x] Build the User model with role handling, Sanctum authentication, profile fields, and gamification attributes.
- [x] Add relationships on the User model for courses, enrollments, attempts, study rooms, achievements, and mascot data.
- [x] Build the Course model with instructor, lessons, enrollment, and category/difficulty attributes.
- [x] Build the Lesson model and link it to a course with ordering and completion logic.
- [x] Build the Enrollment model to calculate progress, completion state, and rewards status.
- [x] Build the Exam model and expose relationships to questions and attempts.
- [x] Build the Question model with answer metadata and validation logic for multiple-choice and text-based question types.
- [x] Build the Attempt model to calculate score, passed state, and reward data.
- [x] Build the StudyRoom model with owner, participants, and message relationships.
- [x] Build the RoomMessage model and map user/message ownership and room association.
- [x] Create or review the mascot and achievement-related models for user customization and progression.
- [x] Define scopes, accessors, and casts for role, status, xp, pearls, and date values.
- [x] Add model-level business methods for enrollment, progress tracking, leaderboard stats, and reward calculations.

## Controllers

### Phase 4.2 — Auth & Profile
- [ ] AuthController: register, login, logout, forgot password, reset password, me
- [ ] UserController (self-service): me, updateProfile, changePassword, stats, mascot, achievements

### Phase 4.3 — Courses, Lessons, Enrollment
- [ ] CourseController: index, show, store, update, destroy (public + admin/instructor)
- [ ] LessonController: show, complete, store, update, destroy
- [ ] EnrollmentController: enroll, unenroll, progress

### Phase 4.4 — Exams & Attempts
- [ ] ExamController: show, store, update, destroy
- [ ] AttemptController: start, submit, index, show
- [ ] ExamService: scoring, pass/fail determination, pearls/XP reward calculation

### Phase 4.5 — Leaderboard
- [ ] LeaderboardController: global, weekly, monthly, course-specific
- [ ] LeaderboardService: Redis sorted set read/write, triggered on XP change

### Phase 4.6 — Study Rooms & Realtime
- [ ] StudyRoomController: index, store, show, join, leave, destroy
- [ ] RoomMessageController: index (fetch history), store (send message)
- [ ] Broadcasting events + `routes/channels.php` auth for `private-study-room.{room_id}`
- [ ] Document `study_room_participants` schema back into web-analysis.md (added ad-hoc in Phase 4.1, not yet in the spec doc)

### Phase 4.7 — Mascot & Achievements
- [ ] MascotController: catalog, inventory, purchase, equip
- [ ] AchievementController: list, user achievements
- [ ] GamificationService: pearls earn/spend, XP award, achievement condition checks

### Phase 4.8 — AI Assistant
- [ ] AiController: chat, history, clearHistory, recommendations
- [ ] AiService wrapping `openai-php/laravel`
- [ ] ProcessAiResponse job

### Phase 4.9 — Admin
- [ ] Admin/UserController: index, updateRole, destroy
- [ ] Admin/CourseController, Admin/ExamController: moderation views
- [ ] Admin/AnalyticsController: overview stats

### Cross-cutting (apply in every sub-phase above)
- [ ] Consistent API response formatting: success, data, error, meta
- [ ] Authorization via Policies (Phase 4.1) + role middleware — no ad-hoc checks in controllers
- [ ] Business logic lives in Services, not Controllers

## Request Validation

- [x] Create RegisterRequest with username, email, password, password_confirmation, and full_name rules.
- [x] Create LoginRequest with email/username and password validation rules.
- [x] Create ForgotPasswordRequest and ResetPasswordRequest for password recovery flows.
- [x] Create UpdateProfileRequest for user profile changes and validation.
- [x] Create ChangePasswordRequest with current password and confirmed new password validation.
- [x] Create StoreCourseRequest and UpdateCourseRequest for course content, category, difficulty, and publishing rules.
- [x] Create StoreLessonRequest and UpdateLessonRequest for lesson content and ordering validation.
- [x] Create EnrollmentRequest or equivalent validation for course enrollment actions.
- [x] Create StoreExamRequest and UpdateExamRequest with time limits, scoring, and metadata validation.
- [x] Create SubmitAttemptRequest for answer arrays and selected_key validation.
- [x] Create StudyRoomRequest and JoinRoomRequest for room metadata and member actions.
- [x] Create AiChatRequest for message, course_context_id, lesson_context_id, and conversation_id validation.
- [x] Add custom validation messages in Bahasa Indonesia where appropriate for user-facing API feedback.
- [x] Validate ownership, role checks, and uniqueness rules before persisting changes.

## API Routes

- [ ] Set up the v1 API route group and base middleware configuration.
- [ ] Add public authentication routes for register, login, forgot password, and reset password.
- [ ] Add protected authentication routes for logout and me under Sanctum middleware.
- [ ] Add protected user routes for me, update profile, change password, stats, mascot, achievements, and user detail endpoints.
- [ ] Add admin-only user management routes for listing users, updating roles, and deleting users.
- [ ] Add public course listing and detail routes.
- [ ] Add authenticated course enroll, progress, and lesson access routes.
- [ ] Add admin/instructor routes for course creation, update, and deletion.
- [ ] Add lesson show and complete routes for authenticated users.
- [ ] Add admin/instructor lesson create, update, and delete routes.
- [ ] Add exam show, attempt creation, submit, and attempt history routes for authenticated users.
- [ ] Add admin/instructor exam create, update, and delete routes.
- [ ] Add leaderboard endpoints for global, weekly, monthly, and course-specific rankings.
- [ ] Add study room routes for list, create, show, join, leave, destroy, and message retrieval.
- [ ] Register `routes/channels.php` authorization for the `private-study-room.{room_id}` Reverb channel — without this, WebSocket connections won't authorize.
- [ ] Add AI Assistant routes: chat, chat/history (get + delete), recommendations, rate-limited via the `ai` throttle.
- [ ] Ensure route names and controller mappings are consistent with the frontend API contract.
- [ ] Validate route middleware groups for guest, auth, and role-based access control.
- [ ] Document the final route list and response contracts in the backend API reference as implementation progresses.

## Implementation Order

- [x] Phase 1: Migrations and schema validation
- [x] Phase 2: Models and relationships
- [x] Phase 3: Request validation classes
- [x] Phase 4.1: Authorization Policies (RBAC)
- [ ] Phase 4.2: Controllers — Auth & Profile
- [ ] Phase 4.3: Controllers — Courses, Lessons, Enrollment
- [ ] Phase 4.4: Controllers — Exams & Attempts
- [ ] Phase 4.5: Controllers — Leaderboard
- [ ] Phase 4.6: Controllers — Study Rooms & Realtime
- [ ] Phase 4.7: Controllers — Mascot & Achievements
- [ ] Phase 4.8: Controllers — AI Assistant
- [ ] Phase 4.9: Controllers — Admin
- [ ] Phase 5: API routes and authentication boundaries
- [ ] Phase 6: Feature testing for key flows
- [ ] Phase 7: API documentation and frontend contract review

## Phase 4.1 — Authorization Policies (RBAC)

- [x] CoursePolicy: create (instructor/admin), update (admin or instructor owner), destroy (admin or instructor owner)
- [x] LessonPolicy: create (instructor/admin), update (admin or parent course instructor), destroy (admin or parent course instructor)
- [x] ExamPolicy: create (instructor/admin), update (admin or course instructor), destroy (admin or course instructor)
- [x] ExamAttemptPolicy: create (enforce max_attempts limit), view (own attempt or admin)
- [x] StudyRoomPolicy: destroy (host or admin), join (room.status === 'active' AND capacity check)
- [x] Policies registered in AppServiceProvider
- [x] Verification: All policies tested against Permission Matrix rules; CoursePolicy ownership checks, ExamAttemptPolicy attempt limits, and ExamAttemptPolicy view restrictions all pass
- [x] study_room_participants pivot table created and StudyRoom model updated with participants() relationship
