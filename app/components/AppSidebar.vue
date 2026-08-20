<script setup lang="ts">
const route = useRoute()
const { user, clear } = useUserSession()

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

const generalLinks = computed(() => [...primaryLinks.value, ...moreLinks.value.filter(l => l.to !== '/settings')])
const toolLinks = computed(() => moreLinks.value.filter(l => l.to === '/settings'))

const isMoreActive = computed(() => moreLinks.value.some(link => isActive(link.to)))

const menuOpen = ref(false)
const { $swal } = useNuxtApp()

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

async function logout() {
  const result = await $swal.fire({
    title: 'Keluar dari akun?',
    text: 'Kamu perlu login lagi untuk mengakses panel admin.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Keluar',
    cancelButtonText: 'Batal'
  })
  if (!result.isConfirmed) return
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <!-- Desktop: wide labeled sidebar -->
  <aside class="hidden lg:flex w-64 shrink-0 flex-col h-full rounded-3xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-4 overflow-y-auto">
    <div class="flex items-center gap-3 mb-5 px-1">
      <div class="size-10 rounded-full bg-linear-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white font-semibold shrink-0 shadow-sm shadow-primary-500/30">
        {{ (user?.name ?? '?').charAt(0).toUpperCase() }}
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-sm truncate">
          {{ user?.name }}
        </p>
        <p class="text-xs text-muted truncate">
          {{ user?.businessName ?? 'Super Admin' }}
        </p>
      </div>
    </div>

    <p class="px-2 mb-1.5 text-xs font-semibold tracking-wide text-primary-600 dark:text-primary-400 uppercase">
      General
    </p>
    <nav class="flex flex-col gap-0.5 mb-4">
      <NuxtLink
        v-for="link in generalLinks"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors"
        :class="isActive(link.to)
          ? 'bg-linear-to-r from-primary-500 to-rose-500 text-white shadow-sm shadow-primary-500/30'
          : 'text-default hover:bg-primary-50 dark:hover:bg-primary-950'"
      >
        <span
          class="size-6 rounded-lg flex items-center justify-center shrink-0"
          :class="isActive(link.to) ? 'bg-white/20' : 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'"
        >
          <UIcon
            :name="link.icon"
            class="size-3.5"
          />
        </span>
        {{ link.label }}
      </NuxtLink>
    </nav>

    <template v-if="toolLinks.length">
      <p class="px-2 mb-1.5 text-xs font-semibold tracking-wide text-primary-600 dark:text-primary-400 uppercase">
        Tools
      </p>
      <nav class="flex flex-col gap-0.5 mb-1">
        <NuxtLink
          v-for="link in toolLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors"
          :class="isActive(link.to)
            ? 'bg-linear-to-r from-primary-500 to-rose-500 text-white shadow-sm shadow-primary-500/30'
            : 'text-default hover:bg-primary-50 dark:hover:bg-primary-950'"
        >
          <span
            class="size-6 rounded-lg flex items-center justify-center shrink-0"
            :class="isActive(link.to) ? 'bg-white/20' : 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'"
          >
            <UIcon
              :name="link.icon"
              class="size-3.5"
            />
          </span>
          {{ link.label }}
        </NuxtLink>
      </nav>
    </template>

    <button
      type="button"
      class="mt-auto flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
      @click="logout"
    >
      <span class="size-6 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center shrink-0">
        <UIcon
          name="i-lucide-log-out"
          class="size-3.5"
        />
      </span>
      Keluar
    </button>
  </aside>

  <!-- Mobile & tablet: fixed bottom tab bar -->
  <nav
    class="lg:hidden fixed inset-x-0 bottom-0 z-40 flex items-stretch bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-default pb-[env(safe-area-inset-bottom)]"
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
          <button
            type="button"
            class="flex items-center gap-3 px-3 py-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
            @click="menuOpen = false; logout()"
          >
            <UIcon
              name="i-lucide-log-out"
              class="size-5"
            />
            <span class="font-medium">Keluar</span>
          </button>
        </div>
      </template>
    </UDrawer>
  </nav>
</template>
