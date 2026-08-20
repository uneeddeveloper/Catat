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

      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="soft"
        square
        class="rounded-full hover:text-primary-500"
      />
    </div>

    <div class="min-w-0">
      <h1 class="font-display text-lg md:text-xl tracking-wide truncate">
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="text-sm text-muted truncate"
      >
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
