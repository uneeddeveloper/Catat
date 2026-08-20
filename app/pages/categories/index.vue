<script setup lang="ts">
definePageMeta({ layout: false })

interface Category { id: number, name: string, isDefault: boolean }
interface Business { id: number, name: string }

const route = useRoute()
const { data: businesses } = await useFetch<Business[]>('/api/admin/businesses')

const scope = ref<number>(route.query.businessId ? Number(route.query.businessId) : 0)

const scopeOptions = computed(() => [
  { label: 'Umum (chat personal)', value: 0 },
  ...(businesses.value ?? []).map(b => ({ label: b.name, value: b.id }))
])

const { data: categories, refresh } = await useFetch<Category[]>('/api/admin/categories', {
  query: computed(() => ({ businessId: scope.value || 'null' }))
})

const newName = ref('')

async function addCategory() {
  if (!newName.value.trim()) return
  await $fetch('/api/admin/categories', { method: 'POST', body: { name: newName.value.trim(), businessId: scope.value || null } })
  newName.value = ''
  await refresh()
}

const { $swal } = useNuxtApp()

async function removeCategory(id: number, name: string) {
  const result = await $swal.fire({
    title: 'Hapus kategori?',
    text: `"${name}" akan dihapus permanen.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal'
  })
  if (!result.isConfirmed) return
  await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <NuxtLayout name="default">
    <template #header>
      <AppTopbar
        title="Kategori"
        subtitle="Dipakai bot untuk auto-kategorisasi"
      />
    </template>

    <div class="max-w-2xl flex flex-col gap-4">
      <USelect
        v-model="scope"
        :items="scopeOptions"
        class="w-full sm:w-64"
      />

      <form
        class="flex gap-2"
        @submit.prevent="addCategory"
      >
        <UInput
          v-model="newName"
          placeholder="Nama kategori baru"
          class="flex-1"
        />
        <UButton
          type="submit"
          icon="i-lucide-plus"
          class="bg-linear-to-r from-primary-500 to-rose-500 hover:brightness-105 shadow-sm shadow-primary-500/30"
        >
          Tambah
        </UButton>
      </form>

      <UCard :ui="{ body: 'divide-y divide-default' }">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="flex items-center justify-between py-2 first:pt-0 last:pb-0"
        >
          <span>{{ cat.name }}</span>
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            @click="removeCategory(cat.id, cat.name)"
          />
        </div>
        <p
          v-if="categories && categories.length === 0"
          class="text-sm text-muted py-2"
        >
          Belum ada kategori di scope ini.
        </p>
      </UCard>
    </div>
  </NuxtLayout>
</template>
