create table if not exists public.kv_store_7faefafb (
  key text primary key,
  value jsonb not null
);

alter table public.kv_store_7faefafb enable row level security;

revoke all on table public.kv_store_7faefafb from anon, authenticated;
grant select, insert, update, delete on table public.kv_store_7faefafb to service_role;

comment on table public.kv_store_7faefafb is
  'Server-only key-value storage for Anakabo user preferences and route history.';
