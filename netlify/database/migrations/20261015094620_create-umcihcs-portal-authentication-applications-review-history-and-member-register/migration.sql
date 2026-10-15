create extension if not exists pgcrypto;

create table if not exists "user" (
  id text primary key,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  role text not null default 'viewer' check (role in ('super_admin','membership_admin','reviewer','viewer')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "session" (
  id text primary key,
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user"(id) on delete cascade
);
create index if not exists session_user_id_idx on "session" ("userId");

create table if not exists account (
  id text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user"(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("providerId", "accountId")
);
create index if not exists account_user_id_idx on account ("userId");

create table if not exists verification (
  id text primary key,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists verification_identifier_idx on verification (identifier);

create sequence if not exists member_number_seq start 1;

create table if not exists membership_applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  applicant_type text not null check (applicant_type in ('individual','organization')),
  applicant_name text not null,
  email text not null,
  phone text,
  location text,
  status text not null default 'pending' check (status in ('pending','under_review','clarification_requested','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text references "user"(id) on delete set null,
  application_data jsonb not null default '{}'::jsonb,
  document_key text,
  document_name text,
  document_type text,
  document_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists applications_status_idx on membership_applications (status);
create index if not exists applications_type_idx on membership_applications (applicant_type);
create index if not exists applications_submitted_idx on membership_applications (submitted_at desc);
create index if not exists applications_search_idx on membership_applications using gin (to_tsvector('simple', reference || ' ' || applicant_name || ' ' || email || ' ' || coalesce(phone,'')));

create table if not exists application_review_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references membership_applications(id) on delete cascade,
  body text not null,
  author_id text references "user"(id) on delete set null,
  author_name text not null,
  created_at timestamptz not null default now()
);
create index if not exists review_notes_application_idx on application_review_notes (application_id, created_at desc);

create table if not exists application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references membership_applications(id) on delete cascade,
  event_type text not null,
  description text not null,
  actor_id text references "user"(id) on delete set null,
  actor_name text,
  created_at timestamptz not null default now()
);
create index if not exists application_events_application_idx on application_events (application_id, created_at);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  member_number text not null unique,
  member_type text not null check (member_type in ('individual','organization')),
  display_name text not null,
  email text not null,
  phone text,
  location text,
  status text not null default 'active' check (status in ('active','inactive')),
  admitted_at timestamptz not null default now(),
  source_application_id uuid unique references membership_applications(id) on delete set null,
  created_by text references "user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists members_status_idx on members (status);
create index if not exists members_type_idx on members (member_type);
create index if not exists members_admitted_idx on members (admitted_at desc);
