<template>
  <div class="h-screen overflow-hidden bg-app-bg dark:bg-app-bg-dark flex flex-col md:flex-row gap-4 p-3 sm:p-4">
    <AppSidebar />

    <main class="flex-1 min-w-0 h-full rounded-2xl md:rounded-3xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden flex flex-col">
      <div class="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 md:pb-6 border-b border-default">
        <slot name="header" />
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 md:pb-6">
        <slot />
      </div>
    </main>

    <aside class="w-80 shrink-0 hidden xl:flex flex-col h-full rounded-3xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-6 overflow-y-auto">
      <slot name="aside" />
    </aside>
  </div>
</template>
