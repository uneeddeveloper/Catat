<script setup lang="ts">
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  htmlAttrs: { lang: 'id' }
})

useSeoMeta({
  title: 'TxStream — Panel Admin Pengeluaran',
  description: 'Pantau pengeluaran yang dicatat lewat bot Telegram TxStream.'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppThemeToggle />
  </UApp>
</template>
