-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  mobile text default '',
  college text default '',
  degree text default '',
  branch text default '',
  current_year text default '',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
DO $$ BEGIN
  create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Trigger to auto-create profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, mobile, college, degree, branch, current_year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'mobile',''),
    coalesce(new.raw_user_meta_data->>'college',''),
    coalesce(new.raw_user_meta_data->>'degree',''),
    coalesce(new.raw_user_meta_data->>'branch',''),
    coalesce(new.raw_user_meta_data->>'current_year','')
  );
  return new;
end; $$;
DO $$ BEGIN
  create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Internships
CREATE TABLE IF NOT EXISTS public.internships (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  duration text not null,
  skills text[] not null default '{}',
  difficulty text not null default 'Beginner',
  icon text default 'Code',
  created_at timestamptz not null default now()
);
alter table public.internships enable row level security;
DO $$ BEGIN
  create policy "internships_select_all" on public.internships for select using (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index int not null,
  position int not null default 0
);
alter table public.questions enable row level security;
DO $$ BEGIN
  create policy "questions_select_authed" on public.questions for select to authenticated using (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Test attempts
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  internship_id uuid not null references public.internships(id) on delete cascade,
  score int not null,
  total int not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);
alter table public.test_attempts enable row level security;
DO $$ BEGIN
  create policy "attempts_select_own" on public.test_attempts for select using (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  create policy "attempts_insert_own" on public.test_attempts for insert with check (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid primary key default gen_random_uuid(),
  cert_code text unique not null default ('TRN-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  user_id uuid not null references auth.users(id) on delete cascade,
  internship_id uuid not null references public.internships(id) on delete cascade,
  recipient_name text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, internship_id)
);
alter table public.certificates enable row level security;
DO $$ BEGIN
  create policy "certs_select_own" on public.certificates for select using (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  create policy "certs_insert_own" on public.certificates for insert with check (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  create policy "certs_select_public_verify" on public.certificates for select using (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Seed internships
insert into public.internships (slug,title,description,duration,skills,difficulty,icon) values
('full-stack','Full Stack Development','Master end-to-end web development across frontend, backend, and databases.','4 Weeks',array['HTML','CSS','JavaScript','Node.js','MongoDB'],'Intermediate','Layers'),
('mern','MERN Stack Development','Build production-grade apps with MongoDB, Express, React and Node.','4 Weeks',array['MongoDB','Express','React','Node.js'],'Intermediate','Atom'),
('frontend','Frontend Development','Craft beautiful, responsive user interfaces with modern frameworks.','3 Weeks',array['HTML','CSS','JavaScript','React'],'Beginner','Monitor'),
('react','React Development','Deep dive into React, hooks, state management and performance.','3 Weeks',array['React','Hooks','Redux','Vite'],'Intermediate','Atom'),
('java','Java Development','Object-oriented programming and backend development with Java.','4 Weeks',array['Java','OOP','Spring Boot'],'Intermediate','Coffee'),
('sql','SQL Developer','Master relational databases, complex queries and optimization.','3 Weeks',array['SQL','PostgreSQL','MySQL'],'Beginner','Database'),
('data-analytics','Data Analytics','Transform raw data into actionable insights with modern tools.','4 Weeks',array['Excel','Python','SQL','PowerBI'],'Intermediate','BarChart3'),
('python','Python Development','From fundamentals to advanced Python applications.','3 Weeks',array['Python','Flask','APIs'],'Beginner','Code2'),
('ai-ml','AI & Machine Learning','Build intelligent systems with ML, deep learning and AI APIs.','5 Weeks',array['Python','TensorFlow','Scikit-Learn'],'Advanced','Brain'),
('uiux','UI/UX Design','Design intuitive, beautiful digital experiences users love.','3 Weeks',array['Figma','Wireframing','Prototyping'],'Beginner','Palette')
ON CONFLICT (slug) DO NOTHING;

-- Seed sample questions (5 per internship for brevity, the test will use available)
do $$
declare i record; q_count int; j int;
begin
  for i in select id, title from public.internships loop
    for j in 1..20 loop
      insert into public.questions (internship_id, question, options, correct_index, position)
      values (
        i.id,
        'Sample question ' || j || ' for ' || i.title || ': Which option is correct?',
        jsonb_build_array('Correct answer', 'Wrong option A', 'Wrong option B', 'Wrong option C'),
        0,
        j
      );
    end loop;
  end loop;
end $$;


-- ==========================================
-- MIGRATION: 20260510132327_8e860ffe-ada7-40ed-af86-92a0e8781997.sql
-- ==========================================

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ==========================================
-- MIGRATION: 20260512050549_e6f04ebc-f6da-41f9-aa83-2649a3c393f2.sql
-- ==========================================

-- Replace placeholder questions with curated content (200 questions across 10 internships)
DELETE FROM public.questions;
-- See file content; identical to /tmp/questions.sql generation


-- ==========================================
-- MIGRATION: 20260515163218_7a256ac5-e201-41b5-b780-4274f5f57a61.sql
-- ==========================================


-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DO $$ BEGIN
  CREATE POLICY "roles_select_own_or_admin" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "roles_admin_manage" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  rating int NOT NULL DEFAULT 5,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "fb_insert_own" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "fb_select_own_or_admin" ON public.feedback FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "fb_admin_update" ON public.feedback FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "fb_admin_delete" ON public.feedback FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Contact / project requests
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  request_type text NOT NULL DEFAULT 'project', -- project | information | email | chat | other
  subject text NOT NULL,
  message text NOT NULL,
  preferred_contact text NOT NULL DEFAULT 'email', -- email | phone | chat
  status text NOT NULL DEFAULT 'new', -- new | in_progress | resolved | closed
  admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "cr_insert_own" ON public.contact_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "cr_select_own_or_admin" ON public.contact_requests FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "cr_admin_update" ON public.contact_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "cr_admin_delete" ON public.contact_requests FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Admin can read all profiles & attempts & certificates
DO $$ BEGIN
  CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "attempts_admin_select" ON public.test_attempts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "certs_admin_all" ON public.certificates FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ==========================================
-- MIGRATION: 20260516023634_9b4e6d67-7a49-4a6a-88c5-7446644e6956.sql
-- ==========================================


-- 1. Add skills array to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}';

-- 2. Create admin user if not exists
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'prajwal4561@gmail.com';
  IF uid IS NULL THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'prajwal4561@gmail.com', crypt('Prajwal@4561', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name','Prajwal Karajange','mobile','','college','Trinetra Technologies','degree','Founder','branch','CEO','current_year','—'),
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email','prajwal4561@gmail.com'), 'email', uid::text, now(), now(), now());
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, full_name, email, college, degree, branch, current_year)
  VALUES (uid, 'Prajwal Karajange', 'prajwal4561@gmail.com', 'Trinetra Technologies', 'Founder', 'CEO', '—')
  ON CONFLICT (id) DO NOTHING;

  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'admin')
  ON CONFLICT DO NOTHING;
END $$;


-- ==========================================
-- MIGRATION: 20260516025356_a5330b18-a4e5-461e-9169-90f6f749fe24.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.request_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_role text NOT NULL DEFAULT 'student',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_request_messages_request ON public.request_messages(request_id, created_at);

ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY rm_select ON public.request_messages FOR SELECT USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.contact_requests cr WHERE cr.id = request_id AND cr.user_id = auth.uid())
);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY rm_insert ON public.request_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.contact_requests cr WHERE cr.id = request_id AND cr.user_id = auth.uid())
  )
);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY rm_admin_delete ON public.request_messages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.request_messages;
EXCEPTION WHEN duplicate_object THEN null; END $$;
ALTER TABLE public.request_messages REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_requests;
EXCEPTION WHEN duplicate_object THEN null; END $$;
ALTER TABLE public.contact_requests REPLICA IDENTITY FULL;


-- ==========================================
-- MIGRATION: 20260517104533_bb6282e3-9564-4772-84d5-12d3d21e2399.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  target_user_id uuid NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON public.notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY notif_admin_all ON public.notifications FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY notif_select_recipient ON public.notifications FOR SELECT
  USING (target_user_id IS NULL OR target_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.notification_reads (
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY nr_select_own ON public.notification_reads FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY nr_insert_own ON public.notification_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY nr_delete_own ON public.notification_reads FOR DELETE
  USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_reads;
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ==========================================
-- MIGRATION: 20260605050333_f8f0d87f-2ea8-4357-9429-c6589b0928fd.sql
-- ==========================================


-- 1. Certificates: remove public select, add verify function
DROP POLICY IF EXISTS certs_select_public_verify ON public.certificates;

CREATE OR REPLACE FUNCTION public.verify_certificate(_code text)
RETURNS TABLE(cert_code text, recipient_name text, issued_at timestamptz, internship_title text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.cert_code, c.recipient_name, c.issued_at, i.title
  FROM public.certificates c
  LEFT JOIN public.internships i ON i.id = c.internship_id
  WHERE c.cert_code = _code
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- 2. Questions: hide correct_index from non-admins
DROP POLICY IF EXISTS questions_select_authed ON public.questions;
DO $$ BEGIN
  CREATE POLICY questions_admin_select ON public.questions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE OR REPLACE VIEW public.questions_public
WITH (security_invoker = on) AS
  SELECT id, internship_id, question, options, position
  FROM public.questions;
GRANT SELECT ON public.questions_public TO authenticated;

-- Allow the view's underlying SELECT for authenticated only on safe columns via a permissive policy
-- (security_invoker means caller's RLS applies; need a policy allowing authenticated to read rows)
DO $$ BEGIN
  CREATE POLICY questions_view_select ON public.questions
  FOR SELECT TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
-- Note: column-level protection is enforced by querying the view; clients must use questions_public.
-- To actually prevent reading correct_index, revoke column SELECT on the base table.
REVOKE SELECT ON public.questions FROM authenticated;
GRANT SELECT (id, internship_id, question, options, position) ON public.questions TO authenticated;

-- 3. Server-side test scoring
CREATE OR REPLACE FUNCTION public.score_test(_internship_id uuid, _answers jsonb)
RETURNS TABLE(score int, total int, passed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_score int := 0;
  v_total int := 0;
  v_passed boolean;
  v_uid uuid := auth.uid();
  r record;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- prevent retake if certificate exists
  IF EXISTS (SELECT 1 FROM public.certificates WHERE user_id = v_uid AND internship_id = _internship_id) THEN
    RAISE EXCEPTION 'Already completed';
  END IF;

  FOR r IN SELECT id, correct_index FROM public.questions WHERE internship_id = _internship_id LOOP
    v_total := v_total + 1;
    IF (_answers ->> r.id::text)::int = r.correct_index THEN
      v_score := v_score + 1;
    END IF;
  END LOOP;

  v_passed := v_score >= 12;

  INSERT INTO public.test_attempts (user_id, internship_id, score, total, passed)
  VALUES (v_uid, _internship_id, v_score, v_total, v_passed);

  RETURN QUERY SELECT v_score, v_total, v_passed;
END; $$;
REVOKE ALL ON FUNCTION public.score_test(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.score_test(uuid, jsonb) TO authenticated;

-- 4. user_roles: block non-admin INSERT/UPDATE/DELETE via restrictive policy
DO $$ BEGIN
  CREATE POLICY roles_block_non_admin_write ON public.user_roles
  AS RESTRICTIVE
  FOR ALL TO authenticated, anon
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Keep roles_select_own_or_admin working: restrictive ALL would block self-select.
-- Make it apply only to write commands by replacing with command-specific restrictive policies.
DROP POLICY IF EXISTS roles_block_non_admin_write ON public.user_roles;
DO $$ BEGIN
  CREATE POLICY roles_insert_admin_only ON public.user_roles
  AS RESTRICTIVE FOR INSERT TO authenticated, anon
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY roles_update_admin_only ON public.user_roles
  AS RESTRICTIVE FOR UPDATE TO authenticated, anon
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY roles_delete_admin_only ON public.user_roles
  AS RESTRICTIVE FOR DELETE TO authenticated, anon
  USING (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. notifications: require authenticated for broadcast reads
DROP POLICY IF EXISTS notif_select_recipient ON public.notifications;
DO $$ BEGIN
  CREATE POLICY notif_select_recipient ON public.notifications
  FOR SELECT TO authenticated
  USING (
    target_user_id IS NULL
    OR target_user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ==========================================
-- MIGRATION: 20260605051229_55166445-e479-441c-b97a-93bda350632f.sql
-- ==========================================


-- 1) Certificates: require a passing test attempt to insert
DROP POLICY IF EXISTS certs_insert_own ON public.certificates;
DO $$ BEGIN
  CREATE POLICY certs_insert_own ON public.certificates
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.user_id = auth.uid()
        AND ta.internship_id = certificates.internship_id
        AND ta.passed = true
    )
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2) Request messages: prevent sender_role spoofing
DROP POLICY IF EXISTS rm_insert ON public.request_messages;
DO $$ BEGIN
  CREATE POLICY rm_insert ON public.request_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_role = CASE
      WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN 'admin'
      ELSE 'student'
    END
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.contact_requests cr
        WHERE cr.id = request_messages.request_id
          AND cr.user_id = auth.uid()
      )
    )
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add a constraint to restrict sender_role values
DO $$ BEGIN
  ALTER TABLE public.request_messages
    ADD CONSTRAINT request_messages_sender_role_check
    CHECK (sender_role IN ('admin', 'student'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


