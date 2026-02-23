# 古董收藏 Antique Collector

Vue 3 古董收藏網站：前台瀏覽藏品，登入後可新增藏品。前後端同專案，後端使用 Supabase（資料庫 + 登入 + 圖片儲存），可部署至 Netlify。

## 功能

- **前台**：瀏覽所有古董（名稱、圖片、分類），點擊進入詳情（描述、來源等）
- **登入／註冊**：Supabase Auth（Email + 密碼）
- **登入後**：新增藏品（名稱、分類、來源、描述、圖片上傳）

## 技術

- **前端**：Vue 3、Vue Router、Vite、**TypeScript**
- **後端／資料**：Supabase（PostgreSQL、Auth、Storage）
- **部署**：Netlify（靜態站 + SPA 導向）

## 為什麼用 Supabase？

- 免費額度足夠個人／小專案
- 內建登入、資料庫、檔案儲存，不需自架後端
- 與 Netlify 搭配：專案只放 Vue，部署後用環境變數連 Supabase 即可
- 前後端同一個 repo：所有程式碼都在這裡，後端邏輯由 Supabase 提供

## 本地開發

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 建立 Supabase 專案

1. 到 [supabase.com](https://supabase.com) 註冊並建立新專案
2. 在 **Project Settings → API** 複製：
   - `Project URL` → 作為 `VITE_SUPABASE_URL`
   - `anon public` key → 作為 `VITE_SUPABASE_ANON_KEY`

### 3. 資料庫與儲存

1. 在 Supabase **SQL Editor** 執行專案裡的 `supabase-schema.sql`（建立 `antiques` 表與 RLS 政策）
2. 在 **Storage** 新增一個 bucket，名稱為 **`images`**（存藏品圖片）
3. 在 `images` 的 **Policies** 新增：
   - **讀取**：所有人可讀（SELECT）
   - **上傳**：已登入使用者可上傳（INSERT，role = authenticated）

### 4. 環境變數

複製 `.env.example` 為 `.env`，填入你的 Supabase URL 與 anon key：

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 5. 啟動

```bash
pnpm dev
```

瀏覽 `http://localhost:5173`。

## 部署到 Netlify

1. 將此專案推送到 GitHub（或 GitLab、Bitbucket）
2. 在 [Netlify](https://netlify.com) 新增站台，連到該 repo
3. Build 設定已寫在 `netlify.toml`，通常不用改（Netlify 偵測到 `pnpm-lock.yaml` 會用 pnpm）：
   - Build command: `pnpm run build`
   - Publish directory: `dist`
4. 在 Netlify **Site settings → Environment variables** 新增：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 重新部署後即可使用

## 專案結構

```
antique-collector/
├── index.html
├── vite.config.js
├── netlify.toml
├── supabase-schema.sql    # Supabase 資料表與 RLS
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── supabase.ts        # Supabase 客戶端
│   ├── vite-env.d.ts      # 環境變數與 .vue 型別
│   ├── types/antique.ts   # 藏品型別
│   ├── router/index.ts
│   ├── components/
│   │   └── AppNav.vue
│   └── views/
│       ├── Home.vue       # 藏品列表
│       ├── ItemDetail.vue # 藏品詳情
│       ├── Login.vue      # 登入／註冊
│       └── Dashboard.vue  # 新增藏品（需登入）
└── .env.example
```

## 授權

MIT
