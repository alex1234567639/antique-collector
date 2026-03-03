<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";
import type { AntiqueListItem } from "@/types/antique";
import debounce from "lodash/debounce";
import EditItemDialog from "@/components/EditItemDialog.vue";

const router = useRouter();
const items = ref<AntiqueListItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref("");
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const canEdit = ref(false);
const editingId = ref<string | null>(null);

const totalPages = computed(() =>
  total.value > 0 ? Math.ceil(total.value / pageSize) : 1
);

async function fetchItems(keyword: string, pageNum: number) {
  loading.value = true;
  error.value = null;
  try {
    const q = keyword.trim();
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data,
      error: e,
      count,
    } = await supabase
      .from("antiques")
      .select("id, name, image_urls, created_at", { count: "exact" })
      .ilike("name", q ? `%${q}%` : "%")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (e) throw e;
    items.value = data ?? [];
    total.value = count ?? 0;
    page.value = pageNum;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "無法載入藏品";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchItems("", 1);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  canEdit.value = !!user;
});

const debouncedSearch = debounce((value: string) => {
  fetchItems(value, 1);
}, 400);

watch(searchQuery, (val) => {
  debouncedSearch(val);
});

function goPage(delta: number) {
  const target = page.value + delta;
  if (target < 1 || target > totalPages.value) return;
  fetchItems(searchQuery.value, target);
}

function openDetail(id: string) {
  router.push({ name: "ItemDetail", params: { id } });
}

function openEdit(id: string) {
  if (!canEdit.value) return;
  editingId.value = id;
}

function handleDialogClose() {
  editingId.value = null;
}

function handleDialogSaved() {
  fetchItems(searchQuery.value, page.value);
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

    <div v-else>
      <div class="toolbar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜尋品名…"
        />
        <span class="result-count">
          共 {{ total }} 筆，第 {{ page }} / {{ totalPages }} 頁
        </span>
      </div>

      <div class="table">
        <div class="table-header">
          <div class="cell cell-thumb">圖片</div>
          <div class="cell cell-id">編號</div>
          <div class="cell cell-name">品名</div>
          <div class="cell cell-date">建立時間</div>
          <div v-if="canEdit" class="cell cell-actions">操作</div>
        </div>

        <template v-if="loading">
          <div class="table-empty-row">載入中…</div>
        </template>
        <template v-else-if="items.length">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="table-row"
            @click="openDetail(item.id)"
          >
            <div class="cell cell-thumb">
              <img
                v-if="firstImageUrl(item)"
                :src="firstImageUrl(item)"
                :alt="item.name"
                class="thumb-img"
              />
              <span v-else class="thumb-placeholder">無</span>
            </div>
            <div class="cell cell-id">{{ item.id }}</div>
            <div class="cell cell-name">{{ item.name }}</div>
            <div class="cell cell-date">
              {{
                item.created_at
                  ? new Date(item.created_at).toLocaleDateString("zh-TW")
                  : ""
              }}
            </div>
            <div v-if="canEdit" class="cell cell-actions">
              <button
                type="button"
                class="edit-link"
                @click.stop="openEdit(item.id)"
              >
                編輯
              </button>
            </div>
          </button>
        </template>
        <div v-else class="table-empty-row">
          沒有符合搜尋「{{ searchQuery }}」的藏品
        </div>
      </div>

      <div v-if="totalPages > 1" class="pager">
        <button
          type="button"
          class="pager-btn"
          :disabled="page === 1"
          @click="goPage(-1)"
        >
          上一頁
        </button>
        <span class="pager-info">第 {{ page }} / {{ totalPages }} 頁</span>
        <button
          type="button"
          class="pager-btn"
          :disabled="page === totalPages"
          @click="goPage(1)"
        >
          下一頁
        </button>
      </div>
    </div>

    <EditItemDialog
      v-if="editingId"
      :item-id="editingId"
      @close="handleDialogClose"
      @saved="handleDialogSaved"
    />
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

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.search-input {
  flex: 1 1 auto;
  max-width: 320px;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 0.9rem;
}

.result-count {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pager-btn {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  cursor: pointer;
  font-size: 0.85rem;
}

.pager-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager-info {
  min-width: 110px;
  text-align: center;
}

.table {
  margin-top: 0.5rem;
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 96px 140px 1fr 140px auto;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: var(--accent-soft);
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.table-row {
  display: grid;
  grid-template-columns: 96px 140px 1fr 140px auto;
  gap: 0.75rem;
  width: 100%;
  padding: 0.6rem 1rem;
  border: none;
  border-top: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.table-row:hover {
  background: rgba(0, 0, 0, 0.02);
}

.cell {
  font-size: 0.9rem;
  color: var(--text);
  display: flex;
  align-items: center;
}

.cell-id {
  font-family: var(
    --font-mono,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace
  );
  font-size: 0.9rem;
  color: var(--text-muted);
}

.cell-name {
  font-weight: 500;
}

.cell-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.cell-actions {
  justify-content: flex-end;
}

.cell-thumb {
  justify-content: center;
}

.thumb-img {
  width: 72px;
  height: 54px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.thumb-placeholder {
  width: 72px;
  height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px dashed var(--border);
  color: var(--text-muted);
  font-size: 0.8rem;
}

.edit-link {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-muted);
}

.edit-link:hover {
  background: var(--accent-soft);
  color: var(--text);
}
</style>
