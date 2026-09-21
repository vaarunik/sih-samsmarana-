-- ============================================================
-- SAMSMARANA — demo seed data (run AFTER 0001_init.sql)
-- ============================================================
-- Creates two demo profiles (Lakshmi — Karnataka/Kannada, and
-- Anima — Assam/NER/English) plus warm family messages, gentle
-- reminders and a couple of sample activity attempts.
--
-- In production these profiles would be created through Supabase
-- Auth + the app's onboarding flow; this seed is for local demos
-- and judging.
-- ============================================================

-- Demo profile 1: Lakshmi (Karnataka / Kannada)
insert into public.profiles (id, role, name, age, language, region_group, region_state, interests, preferred_activities, caregiver_name, caregiver_relation, family_name)
values (
  '11111111-1111-1111-1111-111111111111',
  'ELDER', 'Lakshmi', 72, 'kn', 'South India', 'Karnataka',
  '["Gardening","Cooking","Music"]'::jsonb,
  '["recognition","recall","counting"]'::jsonb,
  'Arjun', 'Grandson', 'Arjun'
) on conflict (id) do nothing;

-- Demo profile 2: Anima (Assam / NER / English)
insert into public.profiles (id, role, name, age, language, region_group, region_state, interests, preferred_activities, caregiver_name, caregiver_relation, family_name)
values (
  '22222222-2222-2222-2222-222222222222',
  'ELDER', 'Anima', 70, 'en', 'North Eastern Region', 'Assam',
  '["Gardening","Stories","Music"]'::jsonb,
  '["recognition","attention","spatial"]'::jsonb,
  'Rohan', 'Son', 'Rohan'
) on conflict (id) do nothing;

-- Family messages for Lakshmi --------------------------------
insert into public.family_messages (profile_id, from_name, type, content, caption)
values
  ('11111111-1111-1111-1111-111111111111','Arjun','text','Good morning Amma! Hope you have a calm and happy day.','Message from family'),
  ('11111111-1111-1111-1111-111111111111','Meera','voice','A short voice message: Amma, we made your favourite sweets.','Voice message · 0:18'),
  ('11111111-1111-1111-1111-111111111111','Family','photo','A photo from last weekend''s garden lunch together.','Garden lunch · Last Sunday'),
  ('11111111-1111-1111-1111-111111111111','Arjun','occasion','Happy birthday, Amma! Wishing you health and many more memories.','Birthday wish'),
  ('11111111-1111-1111-1111-111111111111','Family','note','We''re so proud of you for keeping up with your daily activities.','Family note')
on conflict do nothing;

-- Reminders for Lakshmi --------------------------------------
insert into public.reminders (profile_id, type, title, time, days, enabled)
values
  ('11111111-1111-1111-1111-111111111111','medication','Morning medication','08:30','["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb,true),
  ('11111111-1111-1111-1111-111111111111','hydration','Drink a glass of water','11:00','["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb,true),
  ('11111111-1111-1111-1111-111111111111','meal','Lunch','12:30','["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb,true),
  ('11111111-1111-1111-1111-111111111111','activity','Cognitive activity','16:00','["Mon","Wed","Fri"]'::jsonb,true),
  ('11111111-1111-1111-1111-111111111111','appointment','Walk in the garden','17:30','["Tue","Thu","Sat"]'::jsonb,true)
on conflict do nothing;

-- Sample activity attempts -----------------------------------
insert into public.activity_attempts (profile_id, activity_id, category, title, difficulty, accuracy, response_ms, completed, skipped, score, sync_state, sync_id)
values
  ('11111111-1111-1111-1111-111111111111','act-recognition-market','recognition','What Did You See?',2,1.0,18500,true,false,100,'synced','seed-rec-1'),
  ('11111111-1111-1111-1111-111111111111','act-recall-garden','recall','What Came First?',3,0.5,24000,true,false,50,'synced','seed-rec-2'),
  ('11111111-1111-1111-1111-111111111111','act-counting-birds','counting','How Many?',2,1.0,15000,true,false,100,'synced','seed-rec-3')
on conflict (sync_id) do nothing;
