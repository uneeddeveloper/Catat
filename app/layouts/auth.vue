<template>
  <div class="min-h-screen relative overflow-hidden bg-app-bg dark:bg-app-bg-dark flex items-center justify-center p-4">
    <div class="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-primary-300/40 dark:bg-primary-900/30 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-rose-300/40 dark:bg-rose-900/20 blur-3xl" />
    <div class="relative w-full flex items-center justify-center">
      <slot />
    </div>
  </div>
</template>
