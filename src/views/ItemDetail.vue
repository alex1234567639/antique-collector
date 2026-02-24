<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/supabase";
import type { Antique } from "@/types/antique";

const route = useRoute();
const item = ref<Antique | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const id = route.params.id as string;
    const { data, error: e } = await supabase
      .from("antiques")
      .select("*")
      .eq("id", id)
      .single();
    if (e) throw e;
    item.value = data as Antique;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "找不到此藏品";
  } finally {
    loading.value = false;
  }
});

const images = (item: Antique | null) => item?.image_urls ?? [];
</script>

<template>
  <div class="detail">
    <p v-if="error" class="message error">{{ error }}</p>
    <p v-else-if="loading" class="message">載入中…</p>

    <template v-else-if="item">
      <div v-if="images(item).length" class="detail-gallery">
        <img
          v-for="(url, i) in images(item)"
          :key="i"
          :src="url"
          :alt="`${item.name} - 圖 ${i + 1}`"
          class="detail-img"
        />
      </div>
      <div v-else class="detail-img placeholder">無圖片</div>

      <div class="detail-body">
        <h1 class="detail-title">{{ item.name }}</h1>
        <p class="detail-meta">編號：{{ item.id }}</p>

        <dl class="detail-dl">
          <template v-if="item.height != null">
            <dt>高</dt>
            <dd>{{ item.height }} cm</dd>
          </template>
          <template v-if="item.diameter_mouth != null">
            <dt>口徑</dt>
            <dd>{{ item.diameter_mouth }} cm</dd>
          </template>
          <template v-if="item.diameter_bottom != null">
            <dt>底徑</dt>
            <dd>{{ item.diameter_bottom }} cm</dd>
          </template>
          <template v-if="item.origin">
            <dt>來源</dt>
            <dd>{{ item.origin }}</dd>
          </template>
          <template v-if="item.purchase_price != null">
            <dt>購入價格</dt>
            <dd>NT$ {{ item.purchase_price.toLocaleString() }}</dd>
          </template>
        </dl>

        <template v-if="item.reference_notes">
          <h3 class="detail-subtitle">參考資料</h3>
          <p class="detail-notes">{{ item.reference_notes }}</p>
        </template>

        <p v-if="item.reference_link" class="detail-link">
          <a :href="item.reference_link" target="_blank" rel="noopener"
            >參考連結</a
          >
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail {
  padding-bottom: 2rem;
}

.message {
  color: var(--text-muted);
}

.message.error {
  color: #b4534b;
}

.detail-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.detail-img {
  max-width: 100%;
  width: auto;
  max-height: 320px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--accent-soft);
}

.detail-img.placeholder {
  aspect-ratio: 4/3;
  max-height: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.detail-body {
  max-width: 560px;
}

.detail-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.detail-meta {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0 0 1rem;
}

.detail-dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1.5rem;
  margin: 0 0 1rem;
}

.detail-dl dt {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.detail-dl dd {
  margin: 0;
}

.detail-subtitle {
  font-size: 1rem;
  margin: 1rem 0 0.35rem;
}

.detail-notes {
  white-space: pre-wrap;
  margin: 0;
  font-size: 0.95rem;
}

.detail-link {
  margin-top: 1rem;
}

.detail-link a {
  color: var(--accent);
}
</style>
