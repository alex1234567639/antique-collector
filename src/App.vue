<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNav from './components/AppNav.vue'
</script>

<template>
  <div class="app">
    <AppNav />
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style>
:root {
  --bg: #faf8f5;
  --card: #fff;
  --text: #2c2825;
  --text-muted: #6b6560;
  --accent: #8b6914;
  --accent-soft: #e8dfc4;
  --border: #e5e0d8;
  --font-serif: 'Noto Serif TC', serif;
  --font-sans: 'DM Sans', sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
}

.app {
  min-height: 100vh;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
