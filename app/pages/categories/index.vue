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

    <div class="flex flex-col gap-4">
      <UCard class="max-w-2xl">
        <template #header>
          <div class="flex items-center gap-2">
            <div class="size-8 rounded-lg bg-linear-to-br from-primary-500 to-rose-500 flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/30">
              <UIcon
                name="i-lucide-tag"
                class="size-4 text-white"
              />
            </div>
            <p class="font-medium">
              Kelola kategori
            </p>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <UFormField label="Scope">
            <USelect
              v-model="scope"
              :items="scopeOptions"
              icon="i-lucide-briefcase"
              class="w-full"
            />
          </UFormField>

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
        </div>
      </UCard>

      <UCard :ui="{ header: 'py-3' }">
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-medium">
              Daftar kategori
            </p>
            <UBadge
              color="neutral"
              variant="subtle"
            >
              {{ categories?.length ?? 0 }} kategori
            </UBadge>
          </div>
        </template>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="group flex flex-col gap-3 rounded-xl ring-1 ring-default p-3 hover:ring-primary-500 dark:hover:ring-primary-500 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="size-9 rounded-lg bg-linear-to-br from-primary-500 to-rose-500 flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/30">
                <UIcon
                  name="i-lucide-tag"
                  class="size-4 text-white"
                />
              </div>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
                @click="removeCategory(cat.id, cat.name)"
              />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">
                {{ cat.name }}
              </p>
              <UBadge
                v-if="cat.isDefault"
                color="neutral"
                variant="subtle"
                size="sm"
                class="mt-1"
              >
                Default
              </UBadge>
            </div>
          </div>
        </div>
        <p
          v-if="categories && categories.length === 0"
          class="py-6 text-sm text-muted text-center"
        >
          Belum ada kategori di scope ini.
        </p>
      </UCard>
    </div>
  </NuxtLayout>
</template>
