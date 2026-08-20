<script setup lang="ts">
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UTooltip
    text="Ganti tema"
    :content="{ side: 'left' }"
  >
    <button
      type="button"
      class="fixed z-50 right-4 sm:right-6 bottom-20 md:bottom-6 size-12 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-900/25 flex items-center justify-center transition-colors"
      aria-label="Ganti tema"
      @click="toggleColorMode"
    >
      <UIcon
        :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
        class="size-5"
      />
    </button>
  </UTooltip>
</template>
