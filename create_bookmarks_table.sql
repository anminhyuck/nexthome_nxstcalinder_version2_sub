create table public.bookmarks (id uuid default gen_random_uuid() primary key, user_id uuid references auth.users(id) on delete cascade not null, term text not null, created_at timestamp with time zone default timezone('utc'::text, now()) not null, unique(user_id, term)); alter table public.bookmarks enable row level security; create policy \
Users
can
view
their
own
bookmarks.\ on public.bookmarks for select using (auth.uid() = user_id); create policy \Users
can
create
their
own
bookmarks.\ on public.bookmarks for insert with check (auth.uid() = user_id); create policy \Users
can
delete
their
own
bookmarks.\ on public.bookmarks for delete using (auth.uid() = user_id);
