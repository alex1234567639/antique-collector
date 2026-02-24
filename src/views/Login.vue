<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";

const router = useRouter();
const email = ref("");
const password = ref("");
const loading = ref(false);
const message = ref("");
const isSignUp = ref(false);

async function submit() {
  message.value = "";
  loading.value = true;
  try {
    if (isSignUp.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;
      message.value = "請至信箱確認註冊信（若未收到請檢查垃圾信）。";
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;
      router.push("/dashboard");
    }
  } catch (err) {
    message.value = err instanceof Error ? err.message : "操作失敗";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <h1 class="page-title">{{ isSignUp ? "註冊" : "登入" }}</h1>
    <form class="form" @submit.prevent="submit">
      <label>
        <span>Email</span>
        <input
          v-model="email"
          type="email"
          required
          placeholder="your@email.com"
        />
      </label>
      <label>
        <span>密碼</span>
        <input
          v-model="password"
          type="password"
          required
          placeholder="至少 6 碼"
          minlength="6"
        />
      </label>
      <p
        v-if="message"
        class="message"
        :class="{ error: !isSignUp || !message.includes('確認') }"
      >
        {{ message }}
      </p>
      <button type="submit" class="btn" :disabled="loading">
        {{ loading ? "處理中…" : isSignUp ? "註冊" : "登入" }}
      </button>
      <button type="button" class="btn-text" @click="isSignUp = !isSignUp">
        {{ isSignUp ? "改為登入" : "改為註冊" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 0;
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

.form input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
}

.form .message {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.form .message.error {
  color: #b4534b;
}

.btn {
  width: 100%;
  padding: 0.7rem;
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

.btn-text {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
  padding: 0;
}

.btn-text:hover {
  color: var(--accent);
}
</style>
