<script setup lang="ts">
definePageMeta({ layout: false })

interface Business { id: number, name: string, createdAt: string }

const { data: businesses, refresh } = await useFetch<Business[]>('/api/admin/businesses')
const newName = ref('')
const creating = ref(false)
const error = ref('')

async function addBusiness() {
  if (!newName.value.trim()) return
  error.value = ''
  creating.value = true
  try {
    await $fetch('/api/admin/businesses', { method: 'POST', body: { name: newName.value.trim() } })
    newName.value = ''
    await refresh()
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Gagal menambah usaha'
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <NuxtLayout name="default">
    <template #header>
      <AppTopbar
        title="Usaha"
        subtitle="Kelola usaha yang dipantau lewat bot"
      />
    </template>

    <div class="flex flex-col gap-4">
      <form
        class="flex gap-2"
        @submit.prevent="addBusiness"
      >
        <UInput
          v-model="newName"
          placeholder="Nama usaha baru, mis. Usaha Pasir"
          class="flex-1"
        />
        <UButton
          type="submit"
          icon="i-lucide-plus"
          :loading="creating"
          class="bg-linear-to-r from-primary-500 to-rose-500 hover:brightness-105 shadow-sm shadow-primary-500/30"
        >
          Tambah Usaha
        </UButton>
      </form>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :title="error"
      />

      <UCard
        v-for="biz in businesses"
        :key="biz.id"
        :ui="{ body: 'flex items-center justify-between' }"
      >
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-xl bg-linear-to-br from-primary-500 to-rose-500 flex items-center justify-center shadow-sm shadow-primary-500/30">
            <UIcon
              name="i-lucide-briefcase"
              class="size-5 text-white"
            />
          </div>
          <div>
            <p class="font-medium">
              {{ biz.name }}
            </p>
            <p class="text-xs text-muted">
              Dibuat {{ new Date(biz.createdAt).toLocaleDateString('id-ID') }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            :to="`/categories?businessId=${biz.id}`"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-tag"
          >
            Kelola kategori
          </UButton>
          <UButton
            to="/settings"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-user-plus"
          >
            Buat akun
          </UButton>
        </div>
      </UCard>

      <p
        v-if="businesses && businesses.length === 0"
        class="text-sm text-muted"
      >
        Belum ada usaha. Tambah lewat form di atas, atau ketik <code>/usaha Nama Usaha</code> di grup Telegram terkait.
      </p>
    </div>
  </NuxtLayout>
</template>
