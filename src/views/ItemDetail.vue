<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/supabase";
import type { Antique } from "@/types/antique";

const route = useRoute();
const item = ref<Antique | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const canEdit = ref(false);
const imageList = computed(() => item.value?.image_urls ?? []);
const activeIndex = ref(0);

onMounted(async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    canEdit.value = !!user;

    const id = route.params.id as string;
    const { data, error: e } = await supabase
      .from("antiques")
      .select("*")
      .eq("id", id)
      .single();
    if (e) throw e;
    item.value = data as Antique;
    activeIndex.value = 0;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "找不到此藏品";
  } finally {
    loading.value = false;
  }
});

function setActive(i: number) {
  activeIndex.value = i;
}

function prev() {
  if (!imageList.value.length) return;
  activeIndex.value =
    (activeIndex.value - 1 + imageList.value.length) % imageList.value.length;
}

function next() {
  if (!imageList.value.length) return;
  activeIndex.value = (activeIndex.value + 1) % imageList.value.length;
}

function goEdit() {
  if (!item.value) return;
  const id = item.value.id;
  window.location.href = `/item/${encodeURIComponent(id)}/edit`;
}
</script>

<template>
  <div class="detail">
    <p v-if="error" class="message error">{{ error }}</p>
    <p v-else-if="loading" class="message">載入中…</p>

    <template v-else-if="item">
      <div v-if="imageList.length" class="detail-galleria">
        <div class="galleria-main">
          <button
            v-if="imageList.length > 1"
            type="button"
            class="galleria-arrow galleria-arrow-prev"
            aria-label="上一張"
            @click="prev"
          >
            ‹
          </button>
          <img
            :src="imageList[activeIndex]"
            :alt="`${item.name} - 圖 ${activeIndex + 1}`"
            class="galleria-main-img"
          />
          <button
            v-if="imageList.length > 1"
            type="button"
            class="galleria-arrow galleria-arrow-next"
            aria-label="下一張"
            @click="next"
          >
            ›
          </button>
        </div>
        <div v-if="imageList.length > 1" class="galleria-thumbs">
          <button
            v-for="(url, i) in imageList"
            :key="i"
            type="button"
            class="galleria-thumb"
            :class="{ active: i === activeIndex }"
            @click="setActive(i)"
          >
            <img :src="url" :alt="`縮圖 ${i + 1}`" />
          </button>
        </div>
      </div>
      <div v-else class="galleria-placeholder">無圖片</div>

      <div class="detail-body">
        <div class="detail-header">
          <h1 class="detail-title">{{ item.name }}</h1>
          <button
            v-if="canEdit"
            type="button"
            class="edit-btn"
            @click="goEdit"
          >
            編輯
          </button>
        </div>
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

.detail-galleria {
  margin-bottom: 1.5rem;
}

.galleria-main {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: var(--accent-soft);
  border: 1px solid var(--border);
  aspect-ratio: 5/3;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 720px;
}

.galleria-main-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.galleria-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding-top: 5px;
}

.galleria-arrow:hover {
  background: rgba(0, 0, 0, 0.7);
}

.galleria-arrow-prev {
  left: 8px;
}

.galleria-arrow-next {
  right: 8px;
}

.galleria-thumbs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  overflow-x: auto;
  max-width: 720px;
}

.galleria-thumb {
  flex-shrink: 0;
  width: 80px;
  height: 56px;
  padding: 0;
  border: 2px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--accent-soft);
  cursor: pointer;
}

.galleria-thumb.active {
  border-color: var(--accent);
}

.galleria-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.galleria-placeholder {
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--accent-soft);
}

.detail-body {
  max-width: 560px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.detail-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.edit-btn {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--text-muted);
}

.edit-btn:hover {
  background: var(--accent-soft);
  color: var(--text);
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
