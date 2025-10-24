CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "full_name" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL,
    "counselor_id" UUID,
    "school_id" UUID,
    "grade_level" TEXT,
    "gpa" DOUBLE PRECISION,
    "sat_score" INTEGER,
    "act_score" INTEGER,
    "extracurriculars" TEXT,
    "interests" TEXT,
    "target_major" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "schools" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "school_name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zip_code" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "counselor_profiles" (
    "id" UUID NOT NULL,
    "organization" TEXT,
    "bio" TEXT,
    "specialization" TEXT,
    "years_experience" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counselor_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "universities" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "location" TEXT,
    "country" TEXT,
    "ranking" INTEGER,
    "acceptance_rate" DOUBLE PRECISION,
    "tuition_fees" DOUBLE PRECISION,
    "website" TEXT,
    "description" TEXT,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "university_programs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "university_id" UUID NOT NULL,
    "program_name" TEXT NOT NULL,
    "degree_type" TEXT,
    "duration" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_programs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "applications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "student_id" UUID NOT NULL,
    "university_id" UUID,
    "program_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "deadline" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "decision" TEXT,
    "decision_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "student_id" UUID NOT NULL,
    "application_id" UUID,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" UUID,
    "reviewer_notes" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "essays" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "student_id" UUID NOT NULL,
    "application_id" UUID,
    "title" TEXT NOT NULL,
    "prompt" TEXT,
    "content" TEXT,
    "word_count" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "feedback" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "essays_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "essay_versions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "essay_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "word_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "essay_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "calendar_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "student_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "sender_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "parent_message_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "link_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "university_shortlist" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "student_id" UUID NOT NULL,
    "university_id" UUID NOT NULL,
    "notes" TEXT,
    "priority" INTEGER,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_shortlist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" UUID,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE INDEX "idx_student_profiles_counselor" ON "student_profiles"("counselor_id");

CREATE INDEX "idx_student_profiles_school" ON "student_profiles"("school_id");

CREATE UNIQUE INDEX "schools_user_id_key" ON "schools"("user_id");

CREATE INDEX "idx_applications_student" ON "applications"("student_id");

CREATE INDEX "idx_documents_student" ON "documents"("student_id");

CREATE INDEX "idx_essays_student" ON "essays"("student_id");

CREATE INDEX "idx_essay_versions_essay" ON "essay_versions"("essay_id");

CREATE INDEX "idx_calendar_student_date" ON "calendar_events"("student_id", "event_date");

CREATE INDEX "idx_messages_recipient" ON "messages"("recipient_id");

CREATE INDEX "idx_messages_sender" ON "messages"("sender_id");

CREATE INDEX "idx_notifications_user" ON "notifications"("user_id");

CREATE INDEX "idx_notifications_unread" ON "notifications"("user_id", "is_read");

CREATE INDEX "idx_university_shortlist_student" ON "university_shortlist"("student_id");

CREATE UNIQUE INDEX "university_shortlist_student_id_university_id_key" ON "university_shortlist"("student_id", "university_id");

CREATE INDEX "idx_activity_logs_user" ON "activity_logs"("user_id");

CREATE INDEX "idx_sessions_user" ON "sessions"("user_id");

ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_counselor_id_fkey" FOREIGN KEY ("counselor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "schools" ADD CONSTRAINT "schools_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "counselor_profiles" ADD CONSTRAINT "counselor_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "university_programs" ADD CONSTRAINT "university_programs_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "applications" ADD CONSTRAINT "applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "applications" ADD CONSTRAINT "applications_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "applications" ADD CONSTRAINT "applications_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "university_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "essays" ADD CONSTRAINT "essays_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "essays" ADD CONSTRAINT "essays_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "essays" ADD CONSTRAINT "essays_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "essay_versions" ADD CONSTRAINT "essay_versions_essay_id_fkey" FOREIGN KEY ("essay_id") REFERENCES "essays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "university_shortlist" ADD CONSTRAINT "university_shortlist_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "university_shortlist" ADD CONSTRAINT "university_shortlist_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
