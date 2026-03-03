<script setup lang="ts">
import { provide, ref } from "vue";
import { RouterView } from "vue-router";
import AppNav from "./components/AppNav.vue";
import ToastMessage from "./components/ToastMessage.vue";

type ToastType = "success" | "error";

const toastVisible = ref(false);
const toastMessage = ref("");
const toastType = ref<ToastType>("success");

function showToast(message: string, type: ToastType = "success") {
  toastMessage.value = message;
  toastType.value = type;
  toastVisible.value = true;
}

provide("toast", {
  showToast,
});
</script>

<template>
  <div class="app">
    <AppNav />
    <main class="main">
      <RouterView />
    </main>

    <ToastMessage
      v-if="toastVisible"
      :message="toastMessage"
      :type="toastType"
      @close="toastVisible = false"
    />
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
