<script setup lang="ts">
defineProps<{ title: string, subtitle?: string }>()

const { user, clear } = useUserSession()

const profileItems = computed(() => [[
  { label: user.value?.name ?? 'Admin', slot: 'account' as const, disabled: true }
], [
  { label: 'Keluar', icon: 'i-lucide-log-out', color: 'error' as const, onSelect: logout }
]])

async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex items-center justify-between gap-3 md:gap-4">
    <div class="min-w-0 flex-1">
      <h1 class="text-lg md:text-xl font-semibold truncate">
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="text-sm text-muted truncate"
      >
        {{ subtitle }}
      </p>
    </div>

    <div class="flex items-center gap-3 shrink-0">
      <slot name="actions" />
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        square
      />

      <!-- Profile: top-right, click to reveal logout -->
      <UDropdownMenu
        :items="profileItems"
        :content="{ side: 'bottom', align: 'end' }"
      >
        <button
          type="button"
          class="flex items-center gap-2 shrink-0 rounded-full pl-2 border-l border-default hover:bg-elevated transition-colors"
        >
          <div class="size-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium text-sm shrink-0">
            {{ (user?.name ?? '?').charAt(0).toUpperCase() }}
          </div>
          <div class="hidden sm:block leading-tight text-left">
            <p class="text-xs text-muted">
              Halo,
            </p>
            <span class="text-sm font-medium">{{ user?.name }}</span>
          </div>
          <UIcon
            name="i-lucide-chevron-down"
            class="hidden sm:block size-4 text-muted"
          />
        </button>

        <template #account>
          <div class="text-left">
            <p class="font-medium truncate">
              {{ user?.name }}
            </p>
            <p class="text-xs text-muted truncate">
              {{ user?.email }}
            </p>
          </div>
        </template>
      </UDropdownMenu>
    </div>
  </div>
</template>
