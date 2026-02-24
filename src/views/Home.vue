<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";
import type { AntiqueListItem } from "@/types/antique";

const router = useRouter();
const items = ref<AntiqueListItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const { data, error: e } = await supabase
      .from("antiques")
      .select("id, name, image_urls, created_at")
      .order("created_at", { ascending: false });
    if (e) throw e;
    items.value = data ?? [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : "無法載入藏品";
  } finally {
    loading.value = false;
  }
});

function openDetail(id: string) {
  router.push({ name: "ItemDetail", params: { id } });
}

function firstImageUrl(item: AntiqueListItem): string | undefined {
  const urls = item.image_urls;
  return Array.isArray(urls) && urls.length ? urls[0] : undefined;
}
</script>

<template>
  <div class="home">
    <h1 class="page-title">藏品一覽</h1>

    <p v-if="error" class="message error">{{ error }}</p>
    <p v-else-if="loading" class="message">載入中…</p>

    <div v-else-if="items.length === 0" class="empty">
      <p>尚無藏品，登入後可新增。</p>
    </div>

    <ul v-else class="grid">
      <li
        v-for="item in items"
        :key="item.id"
        class="card"
        @click="openDetail(item.id)"
      >
        <div class="card-img-wrap">
          <img
            v-if="firstImageUrl(item)"
            :src="firstImageUrl(item)"
            :alt="item.name"
            class="card-img"
          />
          <div v-else class="card-img placeholder">無圖片</div>
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ item.name }}</h3>
          <span class="card-id">編號 {{ item.id }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 2rem;
}

.page-title {
  font-weight: 700;
  font-size: 1.75rem;
  margin: 0 0 1.25rem;
  color: var(--text);
}

.message {
  color: var(--text-muted);
}

.message.error {
  color: #b4534b;
}

.empty {
  color: var(--text-muted);
  padding: 3rem;
  text-align: center;
}

.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--card);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-img-wrap {
  aspect-ratio: 4/3;
  background: var(--accent-soft);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-img.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.card-body {
  padding: 1rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.card-id {
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
