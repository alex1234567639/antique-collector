<script setup lang="ts">
import { RouterView } from "vue-router";
import AppNav from "./components/AppNav.vue";
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
.app {
  min-height: 100vh;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
