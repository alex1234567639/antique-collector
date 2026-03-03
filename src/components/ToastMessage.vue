<script setup lang="ts">
import { onMounted } from "vue";

const props = defineProps<{
  message: string;
  type?: "success" | "error";
  duration?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

onMounted(() => {
  const d = props.duration ?? 2000;
  if (d > 0) {
    setTimeout(() => emit("close"), d);
  }
});
</script>

<template>
  <div class="toast" :data-type="type || 'success'">
    <span class="toast-text">{{ message }}</span>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-size: 0.9rem;
  color: #fff;
  background: #16a34a;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  z-index: 50;
}

.toast[data-type="error"] {
  background: #dc2626;
}

.toast-text {
  white-space: nowrap;
}
</style>

