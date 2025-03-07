-- profiles 테이블 생성
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS(Row Level Security) 정책 설정
alter table public.profiles enable row level security;

-- 사용자가 자신의 프로필만 읽을 수 있도록 정책 설정
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- 사용자가 자신의 프로필을 생성할 수 있도록 정책 설정
create policy "Users can create their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- 사용자가 자신의 프로필을 수정할 수 있도록 정책 설정
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- 사용자가 자신의 프로필을 삭제할 수 있도록 정책 설정
create policy "Users can delete their own profile"
  on public.profiles
  for delete
  using (auth.uid() = id); 