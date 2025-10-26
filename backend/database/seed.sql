-- Seed Data for EduCounsel
-- This script populates the database with initial test data

-- Note: All passwords are "password123"
-- Hash generated with bcrypt (salt rounds: 10)

-- First truncate all tables in correct order (to handle foreign keys)
TRUNCATE TABLE essays CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE calendar_events CASCADE;
TRUNCATE TABLE university_shortlist CASCADE;
TRUNCATE TABLE applications CASCADE;
TRUNCATE TABLE university_programs CASCADE;
TRUNCATE TABLE universities CASCADE;
TRUNCATE TABLE student_profiles CASCADE;
TRUNCATE TABLE counselor_profiles CASCADE;
TRUNCATE TABLE schools CASCADE;
TRUNCATE TABLE sessions CASCADE;
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE users CASCADE;

-- Insert Admin Users
INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active, updated_at) VALUES
('a1111111-1111-1111-1111-111111111111'::uuid, 'admin@educounsel.com', '$2b$10$biAXDd.JxhZLa2O.o3Xsz.IbUXJzFtiYFXnPX6oi3e.NowWf4AQBm', 'admin', 'Admin User', '+1234567890', true, NOW());

-- Insert Counselors
INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active, updated_at) VALUES
('c1111111-1111-1111-1111-111111111111'::uuid, 'sarah.khan@educounsel.com', '$2b$10$biAXDd.JxhZLa2O.o3Xsz.IbUXJzFtiYFXnPX6oi3e.NowWf4AQBm', 'counselor', 'Sarah Khan', '+1234567891', true, NOW()),
('c2222222-2222-2222-2222-222222222222'::uuid, 'michael.ali@educounsel.com', '$2b$10$biAXDd.JxhZLa2O.o3Xsz.IbUXJzFtiYFXnPX6oi3e.NowWf4AQBm', 'counselor', 'Michael Ali', '+1234567892', true, NOW());

-- Insert Counselor Profiles
INSERT INTO counselor_profiles (id, specialization, bio, years_experience, organization, updated_at) VALUES
('c1111111-1111-1111-1111-111111111111'::uuid, 'US Universities, STEM Programs', 'Experienced counselor specializing in US admissions with MA Education from Harvard', 10, 'EduCounsel', NOW()),
('c2222222-2222-2222-2222-222222222222'::uuid, 'UK Universities, Business Programs', 'Expert in UK university applications with MSc Counseling from Oxford', 8, 'EduCounsel', NOW());

-- Insert Students
INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active, updated_at) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'student1@example.com', '$2b$10$biAXDd.JxhZLa2O.o3Xsz.IbUXJzFtiYFXnPX6oi3e.NowWf4AQBm', 'student', 'Aisha Rahman', '+1234567893', true, NOW()),
('22222222-2222-2222-2222-222222222222'::uuid, 'student2@example.com', '$2b$10$biAXDd.JxhZLa2O.o3Xsz.IbUXJzFtiYFXnPX6oi3e.NowWf4AQBm', 'student', 'Omar Hassan', '+1234567894', true, NOW()),
('33333333-3333-3333-3333-333333333333'::uuid, 'student3@example.com', '$2b$10$biAXDd.JxhZLa2O.o3Xsz.IbUXJzFtiYFXnPX6oi3e.NowWf4AQBm', 'student', 'Sara Ahmed', '+1234567895', true, NOW());

-- Insert Student Profiles
INSERT INTO student_profiles (id, counselor_id, grade_level, gpa, sat_score, target_major, updated_at) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'c1111111-1111-1111-1111-111111111111'::uuid, '12th Grade', 3.85, 1450, 'Computer Science', NOW()),
('22222222-2222-2222-2222-222222222222'::uuid, 'c1111111-1111-1111-1111-111111111111'::uuid, '12th Grade', 3.92, 1520, 'Engineering', NOW()),
('33333333-3333-3333-3333-333333333333'::uuid, 'c2222222-2222-2222-2222-222222222222'::uuid, '12th Grade', 3.78, 1380, 'Business', NOW());

-- Insert Schools
INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active, updated_at) VALUES
('99999999-9999-9999-9999-999999999999'::uuid, 'school1@example.com', '$2b$10$biAXDd.JxhZLa2O.o3Xsz.IbUXJzFtiYFXnPX6oi3e.NowWf4AQBm', 'school', 'International School of Karachi', '+92123456789', true, NOW());

INSERT INTO schools (user_id, school_name, address, city, country, website, updated_at) VALUES
('99999999-9999-9999-9999-999999999999'::uuid, 'International School of Karachi', '123 Education St', 'Karachi', 'Pakistan', 'https://isk.edu.pk', NOW());

-- Insert Universities
INSERT INTO universities (id, name, country, location, ranking, acceptance_rate, tuition_fees, website, description, logo_url, updated_at) VALUES
('44444444-4444-4444-4444-444444444444'::uuid, 'Harvard University', 'USA', 'Cambridge, MA', 1, 3.5, 54002.00, 'https://harvard.edu', 'Top-ranked Ivy League university', 'https://example.com/harvard.png', NOW()),
('55555555-5555-5555-5555-555555555555'::uuid, 'Stanford University', 'USA', 'Stanford, CA', 2, 3.9, 56169.00, 'https://stanford.edu', 'Leading research university in Silicon Valley', 'https://example.com/stanford.png', NOW()),
('66666666-6666-6666-6666-666666666666'::uuid, 'MIT', 'USA', 'Cambridge, MA', 1, 4.1, 55878.00, 'https://mit.edu', 'Premier institute for science and technology', 'https://example.com/mit.png', NOW()),
('77777777-7777-7777-7777-777777777777'::uuid, 'Oxford University', 'UK', 'Oxford', 4, 17.5, 35000.00, 'https://ox.ac.uk', 'Historic university with global reputation', 'https://example.com/oxford.png', NOW()),
('88888888-8888-8888-8888-888888888888'::uuid, 'Cambridge University', 'UK', 'Cambridge', 3, 21.0, 33000.00, 'https://cam.ac.uk', 'World-renowned research university', 'https://example.com/cambridge.png', NOW());

-- Insert University Programs (no updated_at column)
INSERT INTO university_programs (university_id, program_name, degree_type, duration) VALUES
('44444444-4444-4444-4444-444444444444'::uuid, 'Computer Science', 'Bachelor''s', '4 years'),
('44444444-4444-4444-4444-444444444444'::uuid, 'Business Administration', 'Bachelor''s', '4 years'),
('55555555-5555-5555-5555-555555555555'::uuid, 'Computer Science', 'Bachelor''s', '4 years'),
('66666666-6666-6666-6666-666666666666'::uuid, 'Electrical Engineering', 'Bachelor''s', '4 years'),
('77777777-7777-7777-7777-777777777777'::uuid, 'Computer Science', 'Bachelor''s', '3 years'),
('88888888-8888-8888-8888-888888888888'::uuid, 'Engineering', 'Bachelor''s', '4 years');

-- Insert Applications
INSERT INTO applications (student_id, university_id, status, deadline, updated_at) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'in_progress', '2025-01-01', NOW()),
('11111111-1111-1111-1111-111111111111'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'not_started', '2025-01-15', NOW()),
('22222222-2222-2222-2222-222222222222'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'submitted', '2025-01-01', NOW()),
('33333333-3333-3333-3333-333333333333'::uuid, '77777777-7777-7777-7777-777777777777'::uuid, 'in_progress', '2025-10-15', NOW());

-- Insert University Shortlist (no updated_at column)
INSERT INTO university_shortlist (student_id, university_id, notes, priority) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'Dream school - strong CS program', 1),
('11111111-1111-1111-1111-111111111111'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'Excellent for tech and entrepreneurship', 2),
('11111111-1111-1111-1111-111111111111'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'Top engineering program', 3),
('22222222-2222-2222-2222-222222222222'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'Best for engineering', 1),
('33333333-3333-3333-3333-333333333333'::uuid, '77777777-7777-7777-7777-777777777777'::uuid, 'Top business school', 1);

-- Insert Calendar Events (no status or event_time columns)
INSERT INTO calendar_events (student_id, title, description, event_type, event_date, updated_at) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'SAT Test', 'SAT Subject Test - Math Level 2', 'test', '2025-12-05 08:00:00', NOW()),
('11111111-1111-1111-1111-111111111111'::uuid, 'Harvard Application Deadline', 'Submit Harvard application', 'deadline', '2025-01-01', NOW()),
('22222222-2222-2222-2222-222222222222'::uuid, 'Counselor Meeting', 'Discuss essay feedback', 'meeting', '2025-11-15 14:00:00', NOW()),
('33333333-3333-3333-3333-333333333333'::uuid, 'TOEFL Test', 'TOEFL iBT Test', 'test', '2025-12-20 09:00:00', NOW());

-- Insert Messages (no updated_at column)
INSERT INTO messages (sender_id, recipient_id, subject, content, is_read) VALUES
('c1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Essay Feedback', 'Great progress on your personal statement! I have some suggestions for the conclusion.', false),
('11111111-1111-1111-1111-111111111111'::uuid, 'c1111111-1111-1111-1111-111111111111'::uuid, 'Question about Recommendation Letters', 'Should I ask my math teacher or physics teacher for a recommendation?', true),
('c2222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Oxford Application Timeline', 'Let''s schedule a meeting to discuss your Oxford application strategy.', false);

-- Insert Notifications (no updated_at column)
INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'New Message', 'You have a new message from Sarah Khan', 'message', false),
('11111111-1111-1111-1111-111111111111'::uuid, 'Application Deadline', 'Harvard application deadline is in 45 days', 'deadline', false),
('22222222-2222-2222-2222-222222222222'::uuid, 'Document Approved', 'Your transcript has been approved', 'document', true),
('33333333-3333-3333-3333-333333333333'::uuid, 'Test Reminder', 'TOEFL test scheduled for December 20, 2025', 'test', false);

-- Insert Sample Essays
INSERT INTO essays (student_id, title, prompt, file_name, file_type, file_size, file_url, status, updated_at) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'Common App Personal Statement', 'Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time.', 'personal_statement_v3.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 25678, 'essays/11111111-1111-1111-1111-111111111111/personal_statement_v3.docx', 'in_review', NOW()),
('22222222-2222-2222-2222-222222222222'::uuid, 'Why Engineering Essay', 'Why do you want to study engineering?', 'why_engineering_v1.pdf', 'application/pdf', 12345, 'essays/22222222-2222-2222-2222-222222222222/why_engineering_v1.pdf', 'draft', NOW());

-- Insert Sample Documents (metadata only, actual files would be in Supabase Storage)
INSERT INTO documents (student_id, file_name, file_type, file_size, file_url, document_type) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'transcript_2024.pdf', 'application/pdf', 245678, 'https://storage.example.com/documents/transcript_2024.pdf', 'transcript'),
('11111111-1111-1111-1111-111111111111'::uuid, 'sat_scores.pdf', 'application/pdf', 123456, 'https://storage.example.com/documents/sat_scores.pdf', 'test_scores'),
('22222222-2222-2222-2222-222222222222'::uuid, 'passport.pdf', 'application/pdf', 345678, 'https://storage.example.com/documents/passport.pdf', 'other');

-- Update school student reference (get the school id from the schools table)
UPDATE student_profiles 
SET school_id = (SELECT id FROM schools WHERE user_id = '99999999-9999-9999-9999-999999999999'::uuid LIMIT 1) 
WHERE id IN ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid);
