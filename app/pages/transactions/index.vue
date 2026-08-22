<script setup lang="ts">
definePageMeta({ layout: false })

interface TransactionRow {
  id: number
  amount: string
  currency: string
  type: 'expense' | 'income'
  merchant: string | null
  description: string | null
  expenseDate: string
  receiptImageUrl: string | null
  source: 'text' | 'photo'
  chatId: number | null
  chatTitle: string | null
  chatType: string | null
  businessName: string | null
  categoryId: number | null
  categoryName: string | null
  senderFirstName: string | null
  senderUsername: string | null
  items: { name: string, price: number }[]
}

interface Category { id: number, name: string }
interface ChatOption { id: number, title: string | null }

const route = useRoute()
const search = ref(typeof route.query.search === 'string' ? route.query.search : '')
const chatId = ref<number | undefined>()
const categoryId = ref<number | undefined>()
const type = ref<'expense' | 'income' | undefined>()

const { data: transactions, refresh } = await useFetch<TransactionRow[]>('/api/admin/transactions', {
  query: computed(() => ({ search: search.value || undefined, chatId: chatId.value, categoryId: categoryId.value, type: type.value }))
})

const { data: categories } = await useFetch<Category[]>('/api/admin/categories', { query: { businessId: 'all' } })
const { data: chats } = await useFetch<ChatOption[]>('/api/admin/chats')

function formatRupiah(amount: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount))
}

async function updateCategory(transactionId: number, newCategoryId: number) {
  await $fetch(`/api/admin/transactions/${transactionId}`, { method: 'PATCH', body: { categoryId: newCategoryId } })
  await refresh()
}

const { $swal } = useNuxtApp()

async function removeTransaction(transactionId: number) {
  const result = await $swal.fire({
    title: 'Hapus transaksi?',
    text: 'Transaksi ini akan dihapus permanen dan tidak bisa dikembalikan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal'
  })
  if (!result.isConfirmed) return
  await $fetch(`/api/admin/transactions/${transactionId}`, { method: 'DELETE' })
  await refresh()
}

const categoryOptions = computed(() => (categories.value ?? []).map(c => ({ label: c.name, value: c.id })))
const chatOptions = computed(() => (chats.value ?? []).map(c => ({ label: c.title ?? `Chat #${c.id}`, value: c.id })))
const typeOptions = [
  { label: '📈 Pemasukan', value: 'income' },
  { label: '📉 Pengeluaran', value: 'expense' }
]
</script>

<template>
  <NuxtLayout name="default">
    <template #header>
      <AppTopbar
        title="Transaksi"
        subtitle="Semua pemasukan & pengeluaran dari bot Telegram"
      />
    </template>

    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Cari deskripsi..."
          class="col-span-2 sm:w-56"
        />
        <USelect
          v-model="type"
          :items="typeOptions"
          placeholder="Semua jenis"
          class="w-full sm:w-44"
        />
        <USelect
          v-model="chatId"
          :items="chatOptions"
          placeholder="Semua chat"
          class="w-full sm:w-48"
        />
        <USelect
          v-model="categoryId"
          :items="categoryOptions"
          placeholder="Semua kategori"
          class="col-span-2 sm:w-48"
        />
      </div>

      <UCard
        v-for="row in transactions"
        :key="row.id"
        :ui="{ body: 'flex flex-wrap items-center gap-3 justify-between' }"
      >
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span
              class="font-semibold"
              :class="row.type === 'income' ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ row.type === 'income' ? '+' : '−' }}{{ formatRupiah(row.amount) }}
            </span>
            <UBadge
              color="neutral"
              variant="subtle"
            >
              {{ row.businessName ?? row.chatTitle ?? 'Personal' }}
            </UBadge>
            <UBadge
              v-if="row.source === 'photo'"
              color="primary"
              variant="subtle"
              icon="i-lucide-image"
            >
              struk
            </UBadge>
          </div>
          <p class="text-sm text-muted">
            {{ row.description }}<span v-if="row.merchant"> · {{ row.merchant }}</span>
          </p>
          <ul
            v-if="row.items.length"
            class="flex flex-col gap-0.5 text-xs text-muted border-l-2 border-default pl-2 mt-0.5"
          >
            <li
              v-for="(item, idx) in row.items"
              :key="idx"
              class="flex justify-between gap-4"
            >
              <span>{{ item.name }}</span>
              <span>{{ formatRupiah(item.price) }}</span>
            </li>
          </ul>
          <p class="text-xs text-muted">
            {{ new Date(row.expenseDate).toLocaleString('id-ID') }} · {{ row.senderFirstName ?? row.senderUsername ?? '—' }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <ULink
            v-if="row.receiptImageUrl"
            :to="row.receiptImageUrl"
            target="_blank"
          >
            <UButton
              icon="i-lucide-receipt"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </ULink>
          <USelect
            :model-value="row.categoryId ?? undefined"
            :items="categoryOptions"
            size="sm"
            class="w-40"
            @update:model-value="(val: number) => updateCategory(row.id, val)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            @click="removeTransaction(row.id)"
          />
        </div>
      </UCard>

      <p
        v-if="transactions && transactions.length === 0"
        class="text-muted text-sm"
      >
        Belum ada transaksi yang cocok dengan filter.
      </p>
    </div>
  </NuxtLayout>
</template>
