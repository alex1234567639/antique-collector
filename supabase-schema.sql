-- 在 Supabase Dashboard → SQL Editor 執行此腳本
-- 古董資料表欄位：編號、品名、高、口徑、底徑、來源、購入價格、參考資料、參考連結、圖片(多張)

-- 若已有舊版 antiques 表且需保留資料，請先備份再執行下方 drop
drop table if exists public.antiques;

-- 古董資料表
create table public.antiques (
  id text primary key,
  name text not null,
  height numeric,
  diameter_mouth numeric,
  diameter_bottom numeric,
  origin text,
  purchase_price integer,
  reference_notes text,
  reference_link text,
  image_urls text[] default '{}',
  created_at timestamptz default now()
);

comment on column public.antiques.id is '編號';
comment on column public.antiques.name is '品名';
comment on column public.antiques.height is '高';
comment on column public.antiques.diameter_mouth is '口徑';
comment on column public.antiques.diameter_bottom is '底徑';
comment on column public.antiques.origin is '來源';
comment on column public.antiques.purchase_price is '購入價格';
comment on column public.antiques.reference_notes is '參考資料';
comment on column public.antiques.reference_link is '參考連結';
comment on column public.antiques.image_urls is '圖片網址(多張)';

-- RLS：所有人可讀
alter table public.antiques enable row level security;

create policy "允許所有人讀取 antiques"
  on public.antiques for select
  using (true);

create policy "已登入使用者可新增 antiques"
  on public.antiques for insert
  with check (auth.role() = 'authenticated');

-- Storage：在 Dashboard → Storage 建立 bucket「images」，並設定讀取／上傳政策
