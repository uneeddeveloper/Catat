<template>
  <div class="h-screen overflow-hidden relative bg-app-bg dark:bg-app-bg-dark flex flex-col lg:flex-row gap-4 p-3 sm:p-4">
    <div class="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-primary-300/30 dark:bg-primary-900/20 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-rose-300/30 dark:bg-rose-900/15 blur-3xl" />

    <AppSidebar />

    <main class="relative flex-1 min-w-0 h-full overflow-hidden flex flex-col">
      <div class="shrink-0 px-2 sm:px-4 pt-1 pb-4 sm:pb-6">
        <slot name="header" />
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 pb-24 lg:pb-4">
        <slot />
      </div>
      <AppFooter />
    </main>
  </div>
</template>
