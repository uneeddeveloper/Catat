<script setup lang="ts">
const route = useRoute()
const { user } = useUserSession()

const isSuperAdmin = computed(() => !user.value?.businessId)

const primaryLinks = computed(() => [
  { label: 'Dashboard', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Transaksi', to: '/transactions', icon: 'i-lucide-receipt-text' },
  { label: 'Kategori', to: '/categories', icon: 'i-lucide-tag' },
  { label: 'Laporan', to: '/reports', icon: 'i-lucide-file-down' }
])

const moreLinks = computed(() => [
  ...(isSuperAdmin.value ? [{ label: 'Usaha', to: '/businesses', icon: 'i-lucide-briefcase' }] : []),
  { label: 'Grup & Chat', to: '/chats', icon: 'i-lucide-users' },
  { label: 'Panduan', to: '/panduan', icon: 'i-lucide-book-open' },
  ...(isSuperAdmin.value ? [{ label: 'Pengaturan', to: '/settings', icon: 'i-lucide-settings' }] : [])
])

const allLinks = computed(() => [...primaryLinks.value, ...moreLinks.value])
const isMoreActive = computed(() => moreLinks.value.some(link => isActive(link.to)))

const menuOpen = ref(false)

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <!-- Tablet & desktop: vertical icon rail -->
  <aside class="hidden md:flex w-20 shrink-0 rounded-3xl bg-gradient-to-b from-primary-500 to-primary-700 flex-col items-center py-5 gap-4 shadow-lg shadow-primary-900/10">
    <NuxtLink
      to="/"
      class="size-11 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0"
    >
      💸
    </NuxtLink>

    <nav class="flex flex-col items-center gap-1.5">
      <UTooltip
        v-for="link in allLinks"
        :key="link.to"
        :text="link.label"
        :content="{ side: 'right' }"
      >
        <NuxtLink
          :to="link.to"
          class="size-11 rounded-2xl flex items-center justify-center transition-colors"
          :class="isActive(link.to) ? 'bg-white text-primary-600 shadow-sm' : 'text-white/75 hover:bg-white/15 hover:text-white'"
        >
          <UIcon
            :name="link.icon"
            class="size-5"
          />
        </NuxtLink>
      </UTooltip>
    </nav>
  </aside>

  <!-- Mobile: fixed bottom tab bar -->
  <nav
    class="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-stretch bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-default pb-[env(safe-area-inset-bottom)]"
    aria-label="Navigasi utama"
  >
    <NuxtLink
      v-for="link in primaryLinks"
      :key="link.to"
      :to="link.to"
      class="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors"
      :class="isActive(link.to) ? 'text-primary-600 dark:text-primary-400' : 'text-muted'"
    >
      <UIcon
        :name="link.icon"
        class="size-5"
      />
      {{ link.label }}
    </NuxtLink>

    <UDrawer
      v-model:open="menuOpen"
      title="Menu"
    >
      <button
        type="button"
        class="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors"
        :class="isMoreActive ? 'text-primary-600 dark:text-primary-400' : 'text-muted'"
      >
        <UIcon
          name="i-lucide-more-horizontal"
          class="size-5"
        />
        Lainnya
      </button>

      <template #body>
        <div class="flex flex-col gap-1 pb-2">
          <NuxtLink
            v-for="link in moreLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
            :class="isActive(link.to) ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-default'"
            @click="menuOpen = false"
          >
            <UIcon
              :name="link.icon"
              class="size-5"
            />
            <span class="font-medium">{{ link.label }}</span>
          </NuxtLink>
        </div>
      </template>
    </UDrawer>
  </nav>
</template>
