-- ============================================================
-- DERECHO MÉDICO — Repositorio del Semestre
-- SQL Schema + RLS Policies para Supabase
-- ============================================================

-- ─────────────────────────────────────────
-- 1. TABLA: profiles
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ─────────────────────────────────────────
-- 2. TABLA: subjects
-- ─────────────────────────────────────────
create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  semester    text not null check (semester in ('12','13','14','15','16')),
  name        text not null,
  created_at  timestamptz default now(),
  created_by  uuid references public.profiles(id) on delete set null
);

alter table public.subjects enable row level security;

create policy "Authenticated users can view subjects"
  on public.subjects for select
  to authenticated
  using (true);

create policy "Authenticated users can create subjects"
  on public.subjects for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Creator can delete subject"
  on public.subjects for delete
  to authenticated
  using (auth.uid() = created_by);

-- ─────────────────────────────────────────
-- 3. TABLA: resources
-- ─────────────────────────────────────────
create table if not exists public.resources (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  semester          text not null check (semester in ('12','13','14','15','16')),
  subject_id        uuid references public.subjects(id) on delete cascade,
  subject_name      text,
  type              text not null check (type in (
                      'Clase','Resumen','Banco de preguntas',
                      'Presentación','Guía','Tarea','Video','Joseo','Otro'
                    )),
  file_url          text,
  file_path         text,
  link_url          text,
  uploaded_by       uuid references public.profiles(id) on delete set null,
  uploaded_by_name  text,
  resource_kind     text not null check (resource_kind in ('file','link')),
  created_at        timestamptz default now()
);

alter table public.resources enable row level security;

create policy "Authenticated users can view resources"
  on public.resources for select
  to authenticated
  using (true);

create policy "Authenticated users can upload resources"
  on public.resources for insert
  to authenticated
  with check (auth.uid() = uploaded_by);

create policy "Uploader can delete own resource"
  on public.resources for delete
  to authenticated
  using (auth.uid() = uploaded_by);

-- ─────────────────────────────────────────
-- 4. STORAGE — bucket: semester-files
-- ─────────────────────────────────────────
-- Ejecutar en Supabase Dashboard → Storage → New Bucket
-- Nombre: semester-files
-- Public: false (privado, acceso solo autenticados)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'semester-files',
  'semester-files',
  false,
  209715200,  -- 200 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg','image/png','image/gif','image/webp',
    'video/mp4','video/webm',
    'text/plain','application/zip'
  ]
) on conflict (id) do nothing;

-- Storage RLS
create policy "Authenticated users can upload files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'semester-files');

create policy "Authenticated users can read files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'semester-files');

create policy "Uploader can delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'semester-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────
-- 5. TRIGGER: auto-crear perfil al registrarse
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- 6. ÍNDICES para mejorar performance
-- ─────────────────────────────────────────
create index if not exists idx_subjects_semester on public.subjects(semester);
create index if not exists idx_resources_semester on public.resources(semester);
create index if not exists idx_resources_subject_id on public.resources(subject_id);
create index if not exists idx_resources_type on public.resources(type);
create index if not exists idx_resources_created_at on public.resources(created_at desc);
create index if not exists idx_resources_uploaded_by on public.resources(uploaded_by);
