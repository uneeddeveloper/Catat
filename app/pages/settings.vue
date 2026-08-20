<script setup lang="ts">
definePageMeta({ layout: false })

interface Admin { id: number, name: string, email: string, createdAt: string, businessId: number | null, businessName: string | null }
interface Business { id: number, name: string }

const { data: admins, refresh } = await useFetch<Admin[]>('/api/admin/admins')
const { data: businesses } = await useFetch<Business[]>('/api/admin/businesses')

const name = ref('')
const email = ref('')
const password = ref('')
const businessId = ref<number>(0)
const error = ref('')

const businessOptions = computed(() => [
  { label: 'Super admin (semua usaha)', value: 0 },
  ...(businesses.value ?? []).map(b => ({ label: b.name, value: b.id }))
])

const submitting = ref(false)
const success = ref(false)

async function addAdmin() {
  error.value = ''
  success.value = false
  submitting.value = true
  try {
    await $fetch('/api/admin/admins', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value, businessId: businessId.value || null }
    })
    name.value = ''
    email.value = ''
    password.value = ''
    businessId.value = 0
    success.value = true
    await refresh()
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Gagal menambah admin'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <NuxtLayout name="default">
    <template #header>
      <AppTopbar
        title="Pengaturan"
        subtitle="Kelola akun admin panel"
      />
    </template>

    <div class="max-w-2xl flex flex-col gap-6">
      <UCard :ui="{ header: 'py-3', body: 'divide-y divide-default p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-medium">
              Admin panel
            </p>
            <UBadge
              color="neutral"
              variant="subtle"
            >
              {{ admins?.length ?? 0 }} akun
            </UBadge>
          </div>
        </template>

        <div
          v-for="admin in admins"
          :key="admin.id"
          class="flex items-center gap-3 px-4 py-3"
        >
          <div class="size-9 rounded-full bg-linear-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm shadow-primary-500/30">
            {{ admin.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium truncate">
              {{ admin.name }}
            </p>
            <p class="text-xs text-muted truncate">
              {{ admin.email }}
            </p>
          </div>
          <UBadge
            color="neutral"
            variant="subtle"
            size="sm"
            class="shrink-0"
          >
            {{ admin.businessName ?? 'Super admin' }}
          </UBadge>
        </div>
        <p
          v-if="admins && admins.length === 0"
          class="px-4 py-3 text-sm text-muted"
        >
          Belum ada akun admin.
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <div class="size-8 rounded-lg bg-linear-to-br from-primary-500 to-rose-500 flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/30">
              <UIcon
                name="i-lucide-user-plus"
                class="size-4 text-white"
              />
            </div>
            <div>
              <p class="font-medium">
                Tambah admin baru
              </p>
              <p class="text-xs text-muted">
                Beri akses ke panel ini untuk anggota tim
              </p>
            </div>
          </div>
        </template>

        <form
          class="flex flex-col gap-4"
          @submit.prevent="addAdmin"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Nama">
              <UInput
                v-model="name"
                icon="i-lucide-user"
                placeholder="Nama lengkap"
                class="w-full"
                required
              />
            </UFormField>
            <UFormField label="Email">
              <UInput
                v-model="email"
                type="email"
                icon="i-lucide-mail"
                placeholder="nama@email.com"
                class="w-full"
                required
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField
              label="Password"
              hint="Min. 8 karakter"
            >
              <UInput
                v-model="password"
                type="password"
                icon="i-lucide-lock"
                placeholder="••••••••"
                class="w-full"
                required
              />
            </UFormField>
            <UFormField
              label="Akses akun"
              hint="Batasi ke satu usaha, atau beri akses penuh"
            >
              <USelect
                v-model="businessId"
                :items="businessOptions"
                icon="i-lucide-briefcase"
                class="w-full"
              />
            </UFormField>
          </div>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            icon="i-lucide-alert-circle"
            :title="error"
          />
          <UAlert
            v-if="success"
            color="primary"
            variant="soft"
            icon="i-lucide-check-circle-2"
            title="Admin baru berhasil ditambahkan"
          />

          <UButton
            type="submit"
            icon="i-lucide-user-plus"
            :loading="submitting"
            class="self-start bg-linear-to-r from-primary-500 to-rose-500 hover:brightness-105 shadow-sm shadow-primary-500/30"
          >
            Tambah Admin
          </UButton>
        </form>
      </UCard>
    </div>
  </NuxtLayout>
</template>
