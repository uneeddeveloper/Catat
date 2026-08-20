<script setup lang="ts">
defineProps<{ title: string, subtitle?: string }>()

const searchQuery = ref('')

function submitSearch() {
  if (!searchQuery.value.trim()) return
  navigateTo({ path: '/transactions', query: { search: searchQuery.value.trim() } })
}

const quickCreateItems = [[
  { label: 'Tambah Usaha', icon: 'i-lucide-briefcase', to: '/businesses' },
  { label: 'Tambah Kategori', icon: 'i-lucide-tag', to: '/categories' },
  { label: 'Tambah Admin', icon: 'i-lucide-user-plus', to: '/settings' }
]]

interface NotificationItem {
  id: number
  amount: string
  type: 'expense' | 'income'
  description: string | null
  categoryName: string | null
  chatTitle: string | null
  businessName: string | null
  createdAt: string
}

const { data: notifications } = useLazyFetch<NotificationItem[]>('/api/admin/notifications')

function formatRupiah(amount: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount))
}

function formatRelativeTime(dateStr: string) {
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  return `${Math.floor(diffHour / 24)} hari lalu`
}

const LAST_SEEN_KEY = 'catat:notif:lastSeen'
const lastSeenAt = ref('')

onMounted(() => {
  lastSeenAt.value = localStorage.getItem(LAST_SEEN_KEY) ?? ''
})

const hasUnread = computed(() => {
  const latest = notifications.value?.[0]
  if (!latest) return false
  return !lastSeenAt.value || new Date(latest.createdAt) > new Date(lastSeenAt.value)
})

function onNotifOpenChange(open: boolean) {
  if (!open) return
  const now = new Date().toISOString()
  lastSeenAt.value = now
  localStorage.setItem(LAST_SEEN_KEY, now)
}

const clockNow = ref<Date>()
let clockTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  clockNow.value = new Date()
  clockTimer = setInterval(() => {
    clockNow.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

const liveClock = computed(() => clockNow.value?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) ?? '')
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-3">
      <label class="flex-1 flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 ring-1 ring-default shadow-sm px-4 py-2.5 min-w-0 focus-within:ring-primary-500 transition-colors">
        <UIcon
          name="i-lucide-search"
          class="size-4 text-primary-500 shrink-0"
        />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Cari transaksi, deskripsi..."
          class="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted"
          @keyup.enter="submitSearch"
        >
      </label>

      <UDropdownMenu :items="quickCreateItems">
        <UButton
          icon="i-lucide-plus"
          square
          class="rounded-full bg-linear-to-br from-primary-500 to-rose-500 hover:brightness-105 shadow-sm shadow-primary-500/30"
        />
      </UDropdownMenu>

      <UPopover
        :content="{ side: 'bottom', align: 'end' }"
        @update:open="onNotifOpenChange"
      >
        <button
          type="button"
          class="relative size-9 rounded-full bg-elevated flex items-center justify-center hover:text-primary-500 transition-colors cursor-pointer"
          aria-label="Notifikasi"
        >
          <UIcon
            name="i-lucide-bell"
            class="size-4.5"
          />
          <span
            v-if="hasUnread"
            class="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900"
          />
        </button>

        <template #content>
          <div class="w-80 max-w-[90vw] p-2">
            <p class="px-2 py-1.5 text-sm font-semibold">
              Aktivitas terbaru
            </p>

            <div class="max-h-80 overflow-y-auto flex flex-col">
              <NuxtLink
                v-for="n in notifications"
                :key="n.id"
                to="/transactions"
                class="flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
              >
                <span
                  class="size-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="n.type === 'income'
                    ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'"
                >
                  <UIcon
                    :name="n.type === 'income' ? 'i-lucide-trending-up' : 'i-lucide-receipt-text'"
                    class="size-4"
                  />
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate">
                    {{ n.description || (n.categoryName ?? 'Transaksi') }}
                  </p>
                  <p class="text-xs text-muted truncate">
                    {{ n.businessName ?? n.chatTitle ?? 'Personal' }} · {{ formatRelativeTime(n.createdAt) }}
                  </p>
                </div>
                <span
                  class="text-xs font-semibold shrink-0"
                  :class="n.type === 'income' ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600 dark:text-rose-400'"
                >
                  {{ n.type === 'income' ? '+' : '−' }}{{ formatRupiah(n.amount) }}
                </span>
              </NuxtLink>

              <p
                v-if="!notifications?.length"
                class="px-2 py-6 text-sm text-muted text-center"
              >
                Belum ada aktivitas.
              </p>
            </div>

            <NuxtLink
              to="/transactions"
              class="block text-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-rose-500 dark:hover:text-rose-400 mt-1 py-1.5 transition-colors"
            >
              Lihat semua transaksi
            </NuxtLink>
          </div>
        </template>
      </UPopover>
    </div>

    <div class="min-w-0">
      <div class="flex items-center justify-between gap-3">
        <h1 class="font-display text-lg md:text-xl tracking-wide truncate">
          {{ title }}
        </h1>
        <span
          v-if="liveClock"
          class="shrink-0 flex items-center gap-2 rounded-full bg-linear-to-r from-primary-50 to-rose-50 dark:from-primary-950 dark:to-rose-950 ring-1 ring-primary-100 dark:ring-primary-900 shadow-sm px-3 py-1"
        >
          <UIcon
            name="i-lucide-clock"
            class="size-4 text-primary-500 shrink-0"
          />
          <span class="font-display text-sm sm:text-base tracking-wider tabular-nums bg-linear-to-r from-primary-600 to-rose-600 dark:from-primary-400 dark:to-rose-400 bg-clip-text text-transparent">
            {{ liveClock }}
          </span>
        </span>
      </div>
      <p
        v-if="subtitle"
        class="text-sm text-muted truncate"
      >
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
