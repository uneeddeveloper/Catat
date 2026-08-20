<script setup lang="ts">
definePageMeta({ layout: false })

interface ChatRow {
  id: number
  platform: 'telegram' | 'whatsapp'
  externalChatId: string
  type: 'private' | 'group' | 'supergroup'
  title: string | null
  isActive: boolean
  createdAt: string
  businessId: number | null
  businessName: string | null
}

interface Business { id: number, name: string }

const { data: chats, refresh } = await useFetch<ChatRow[]>('/api/admin/chats')
const { data: businesses } = await useFetch<Business[]>('/api/admin/businesses')

const businessOptions = computed(() => [
  { label: 'Tidak ada (personal)', value: 0 },
  ...(businesses.value ?? []).map(b => ({ label: b.name, value: b.id }))
])

async function toggleActive(chat: ChatRow) {
  await $fetch(`/api/admin/chats/${chat.id}`, { method: 'PATCH', body: { isActive: !chat.isActive } })
  await refresh()
}

async function updateBusiness(chatId: number, businessId: number) {
  await $fetch(`/api/admin/chats/${chatId}`, { method: 'PATCH', body: { businessId: businessId || null } })
  await refresh()
}
</script>

<template>
  <NuxtLayout name="default">
    <template #header>
      <AppTopbar
        title="Grup & Chat"
        subtitle="Chat Telegram & WhatsApp yang terhubung ke bot"
      />
    </template>

    <div class="flex flex-col gap-4">
      <UCard
        v-for="chat in chats"
        :key="chat.id"
        :ui="{ body: 'flex flex-wrap items-center justify-between gap-3' }"
      >
        <div>
          <p class="font-medium">
            {{ chat.title ?? `Chat #${chat.externalChatId}` }}
          </p>
          <p class="text-sm text-muted">
            {{ chat.platform === 'telegram' ? 'Telegram' : 'WhatsApp' }} · {{ chat.type === 'private' ? 'Personal' : 'Grup' }} · sejak {{ new Date(chat.createdAt).toLocaleDateString('id-ID') }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <USelect
            v-if="chat.type !== 'private'"
            :model-value="chat.businessId ?? 0"
            :items="businessOptions"
            size="sm"
            class="w-48"
            @update:model-value="(val: number) => updateBusiness(chat.id, val)"
          />
          <USwitch
            :model-value="chat.isActive"
            label="Aktif"
            @update:model-value="toggleActive(chat)"
          />
        </div>
      </UCard>

      <p
        v-if="chats && chats.length === 0"
        class="text-muted text-sm"
      >
        Belum ada chat yang terhubung. Kirim /start ke bot untuk mendaftarkan chat.
      </p>
    </div>
  </NuxtLayout>
</template>
