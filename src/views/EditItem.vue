<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/supabase";
import { isInteger, isNumeric } from "@/utils/validate";
import type { Antique } from "@/types/antique";

const route = useRoute();
const router = useRouter();

const id = ref("");
const name = ref("");
const height = ref("");
const diameterMouth = ref("");
const diameterBottom = ref("");
const origin = ref("");
const purchasePrice = ref("");
const referenceNotes = ref("");
const referenceLink = ref("");
const existingImages = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const message = ref("");

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    router.replace("/login");
    return;
  }

  const itemId = route.params.id as string;
  const { data, error } = await supabase
    .from("antiques")
    .select("*")
    .eq("id", itemId)
    .single();
  if (error || !data) {
    message.value = error?.message || "找不到此藏品";
    return;
  }

  const item = data as Antique;
  id.value = item.id;
  name.value = item.name;
  height.value = item.height != null ? String(item.height) : "";
  diameterMouth.value =
    item.diameter_mouth != null ? String(item.diameter_mouth) : "";
  diameterBottom.value =
    item.diameter_bottom != null ? String(item.diameter_bottom) : "";
  origin.value = item.origin ?? "";
  purchasePrice.value =
    item.purchase_price != null ? String(item.purchase_price) : "";
  referenceNotes.value = item.reference_notes ?? "";
  referenceLink.value = item.reference_link ?? "";
  existingImages.value = item.image_urls ?? [];
});

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files?.length) return;
  imageFiles.value = Array.from(files);
  imagePreviews.value = imageFiles.value.map((f) => URL.createObjectURL(f));
}

function removePreview(i: number) {
  URL.revokeObjectURL(imagePreviews.value[i]);
  imagePreviews.value.splice(i, 1);
  imageFiles.value.splice(i, 1);
}

async function submit() {
  message.value = "";
  if (!name.value.trim()) {
    message.value = "請填寫品名";
    return;
  }
  if (!isNumeric(height.value)) {
    message.value = "請輸入有效的數字（高）";
    return;
  }
  if (!isNumeric(diameterMouth.value)) {
    message.value = "請輸入有效的數字（口徑）";
    return;
  }
  if (!isNumeric(diameterBottom.value)) {
    message.value = "請輸入有效的數字（底徑）";
    return;
  }
  if (!isInteger(purchasePrice.value)) {
    message.value = "請輸入有效的整數（購入價格，不可為負）";
    return;
  }

  loading.value = true;
  try {
    const imageUrlList: string[] = [...existingImages.value];
    for (const file of imageFiles.value) {
      const ext = file.name.split(".").pop() || "png";
      const path = `antiques/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("images")
        .upload(path, file, { upsert: false });
      if (uploadErr) {
        const msg = uploadErr.message || "圖片上傳失敗";
        throw new Error(
          msg.includes("Bucket")
            ? `${msg} 請在 Supabase → Storage 建立名為「images」的 bucket。`
            : msg
        );
      }
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(path);
      imageUrlList.push(urlData.publicUrl);
    }

    const str = (v: string | number | undefined) =>
      v == null ? "" : String(v);
    const num = (v: string | number | undefined) => {
      const s = str(v).trim();
      return s === "" ? null : Number(s);
    };
    const int = (v: string | number | undefined) => {
      const n = num(v);
      return n == null ? null : Math.floor(n);
    };

    const { error } = await supabase
      .from("antiques")
      .update({
        name: str(name.value).trim(),
        height: num(height.value),
        diameter_mouth: num(diameterMouth.value),
        diameter_bottom: num(diameterBottom.value),
        origin: str(origin.value).trim() || null,
        purchase_price: int(purchasePrice.value),
        reference_notes: str(referenceNotes.value).trim() || null,
        reference_link: str(referenceLink.value).trim() || null,
        image_urls: imageUrlList,
      })
      .eq("id", id.value);
    if (error) throw error;

    message.value = "已更新藏品！";
    imageFiles.value = [];
    imagePreviews.value.forEach(URL.revokeObjectURL);
    imagePreviews.value = [];
    if (fileInput.value) fileInput.value.value = "";
  } catch (err) {
    message.value = err instanceof Error ? err.message : "更新失敗";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="dashboard">
    <h1 class="page-title">編輯藏品</h1>
    <form class="form" @submit.prevent="submit">
      <label>
        <span>編號</span>
        <input v-model="id" type="text" disabled />
      </label>
      <label>
        <span>品名 *</span>
        <input
          v-model="name"
          type="text"
          required
          placeholder="例：清乾隆 青花瓷瓶"
        />
      </label>
      <label>
        <span>高 (cm)</span>
        <input v-model="height" type="text" placeholder="可小數，例：12.5" />
      </label>
      <label>
        <span>口徑 (cm)</span>
        <input
          v-model="diameterMouth"
          type="text"
          placeholder="可小數，例：8.2"
        />
      </label>
      <label>
        <span>底徑 (cm)</span>
        <input
          v-model="diameterBottom"
          type="text"
          placeholder="可小數，例：6.0"
        />
      </label>
      <label>
        <span>來源</span>
        <input v-model="origin" type="text" placeholder="例：某拍賣會、藏家" />
      </label>
      <label>
        <span>購入價格 (NT$)</span>
        <input
          v-model="purchasePrice"
          type="text"
          placeholder="整數，例：5000"
        />
      </label>
      <label>
        <span>參考資料</span>
        <textarea
          v-model="referenceNotes"
          rows="4"
          placeholder="文字說明、出處等"
        />
      </label>
      <label>
        <span>參考連結</span>
        <input v-model="referenceLink" type="url" placeholder="https://..." />
      </label>
      <label v-if="existingImages.length">
        <span>目前圖片</span>
        <div class="preview-list">
          <img
            v-for="(url, i) in existingImages"
            :key="i"
            :src="url"
            alt="目前圖片"
            class="preview-img"
          />
        </div>
      </label>
      <label>
        <span>新增圖片（可多選，會追加到原有圖片後）</span>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          @change="onFileChange"
        />
        <div v-if="imagePreviews.length" class="preview-list">
          <div v-for="(url, i) in imagePreviews" :key="i" class="preview-wrap">
            <img :src="url" alt="預覽" class="preview-img" />
            <button
              type="button"
              class="preview-remove"
              @click="removePreview(i)"
            >
              移除
            </button>
          </div>
        </div>
      </label>
      <p
        v-if="message"
        class="message"
        :class="{ error: message.includes('失敗') || message.includes('找不到') }"
      >
        {{ message }}
      </p>
      <button type="submit" class="btn" :disabled="loading">
        {{ loading ? "儲存中…" : "儲存變更" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 560px;
  padding-bottom: 2rem;
}

.page-title {
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
}

.form label {
  display: block;
  margin-bottom: 1rem;
}

.form label span {
  display: block;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.form input[type="text"],
.form input[type="url"],
.form textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}

.form textarea {
  resize: vertical;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preview-wrap {
  position: relative;
}

.preview-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.preview-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  padding: 0.15rem 0.4rem;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.message.error {
  color: #b4534b;
}

.btn {
  padding: 0.7rem 1.5rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

