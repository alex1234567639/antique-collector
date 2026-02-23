<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/supabase'

const router = useRouter()
const user = ref<User | null>(null)

onMounted(async () => {
  const { data: { user: u } } = await supabase.auth.getUser()
  user.value = u
  supabase.auth.onAuthStateChange((_event, session) => { user.value = session?.user ?? null })
})

const isLoggedIn = computed(() => !!user.value)

function go(path: string) {
  router.push(path)
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/')
}
</script>

<template>
  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="logo" @click.prevent="go('/')">古董收藏</a>
      <div class="links">
        <button class="link" @click="go('/')">藏品一覽</button>
        <template v-if="isLoggedIn">
          <button class="link" @click="go('/dashboard')">新增藏品</button>
          <button class="link link-out" @click="logout">登出</button>
        </template>
        <template v-else>
          <button class="link link-accent" @click="go('/login')">登入</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text);
  text-decoration: none;
}

.links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.link {
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
}

.link:hover {
  color: var(--text);
  background: var(--accent-soft);
}

.link-accent {
  color: var(--accent);
  font-weight: 600;
}

.link-out {
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
