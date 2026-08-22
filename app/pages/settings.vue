<script setup lang="ts">
definePageMeta({ layout: false })

interface Admin { id: number, name: string, email: string, createdAt: string, businessId: number | null, businessName: string | null }
interface Business { id: number, name: string }
interface AiUsageByModel { model: string, promptTokens: number, completionTokens: number, totalTokens: number, estimatedCostUsd: number | null }
interface AiUsage { periodLabel: string, totalTokens: number, promptTokens: number, completionTokens: number, estimatedCostUsd: number, hasUnpriced: boolean, byModel: AiUsageByModel[] }
interface ChatUsage { ok: boolean, device?: string, name?: string, package?: string, quota?: number, messages?: number, deviceStatus?: string, expired?: string, error?: string }

const { data: admins, refresh } = await useFetch<Admin[]>('/api/admin/admins')
const { data: businesses } = await useFetch<Business[]>('/api/admin/businesses')
const { data: aiUsage, pending: aiUsagePending } = await useFetch<AiUsage>('/api/admin/settings/ai-usage')
const { data: chatUsage, pending: chatUsagePending } = await useFetch<ChatUsage>('/api/admin/settings/chat-usage')
const { user } = useUserSession()
const { $swal } = useNuxtApp()

const GRADIENT = 'bg-linear-to-br from-primary-500 to-rose-500 shadow-sm shadow-primary-500/30'

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
const addAdminOpen = ref(false)

async function addAdmin() {
  error.value = ''
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
    addAdminOpen.value = false
    await refresh()
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Gagal menambah admin'
  } finally {
    submitting.value = false
  }
}

const editAdminOpen = ref(false)
const editSubmitting = ref(false)
const editError = ref('')
const editingId = ref<number | null>(null)
const editName = ref('')
const editEmail = ref('')
const editPassword = ref('')
const editBusinessId = ref<number>(0)

function openEditAdmin(admin: Admin) {
  editingId.value = admin.id
  editName.value = admin.name
  editEmail.value = admin.email
  editPassword.value = ''
  editBusinessId.value = admin.businessId ?? 0
  editError.value = ''
  editAdminOpen.value = true
}

async function saveAdmin() {
  if (!editingId.value) return
  editError.value = ''
  editSubmitting.value = true
  try {
    await $fetch(`/api/admin/admins/${editingId.value}`, {
      method: 'PATCH',
      body: {
        name: editName.value,
        email: editEmail.value,
        businessId: editBusinessId.value || null,
        ...(editPassword.value ? { password: editPassword.value } : {})
      }
    })
    editAdminOpen.value = false
    await refresh()
  } catch (e) {
    editError.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Gagal menyimpan perubahan'
  } finally {
    editSubmitting.value = false
  }
}

async function removeAdmin(admin: Admin) {
  const result = await $swal.fire({
    title: 'Hapus admin?',
    text: `Akun "${admin.name}" akan dihapus permanen dan tidak bisa login lagi.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal'
  })
  if (!result.isConfirmed) return
  await $fetch(`/api/admin/admins/${admin.id}`, { method: 'DELETE' })
  await refresh()
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 }).format(amount)
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

const deviceStatusLabel = computed(() => chatUsage.value?.deviceStatus === 'connect' ? 'Terhubung' : 'Terputus')

function downloadBackup() {
  window.open('/api/admin/settings/backup', '_blank')
}
</script>

<template>
  <NuxtLayout name="default">
    <template #header>
      <AppTopbar
        title="Pengaturan"
        subtitle="Kelola akun admin, pantau penggunaan sistem, dan backup data"
      />
    </template>

    <div class="flex flex-col gap-8">
      <div>
        <UCard :ui="{ header: 'py-3', body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <p class="font-medium">
                Admin panel
              </p>
              <div class="flex items-center gap-2 shrink-0">
                <UBadge
                  color="neutral"
                  variant="subtle"
                >
                  {{ admins?.length ?? 0 }} akun
                </UBadge>

                <UModal
                  v-model:open="addAdminOpen"
                  title="Tambah admin baru"
                  description="Beri akses ke panel ini untuk anggota tim"
                >
                  <UButton
                    icon="i-lucide-user-plus"
                    size="sm"
                    class="hover:brightness-105"
                    :class="GRADIENT"
                  >
                    Tambah
                  </UButton>

                  <template #body>
                    <form
                      class="flex flex-col gap-4"
                      @submit.prevent="addAdmin"
                    >
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

                      <UAlert
                        v-if="error"
                        color="error"
                        variant="soft"
                        icon="i-lucide-alert-circle"
                        :title="error"
                      />

                      <UButton
                        type="submit"
                        icon="i-lucide-user-plus"
                        :loading="submitting"
                        class="self-start hover:brightness-105"
                        :class="GRADIENT"
                      >
                        Tambah Admin
                      </UButton>
                    </form>
                  </template>
                </UModal>
              </div>
            </div>
          </template>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default text-left text-xs text-muted">
                  <th class="px-4 py-2.5 font-medium">
                    Nama
                  </th>
                  <th class="px-4 py-2.5 font-medium">
                    Email
                  </th>
                  <th class="px-4 py-2.5 font-medium">
                    Akses
                  </th>
                  <th class="px-4 py-2.5 font-medium">
                    Dibuat
                  </th>
                  <th class="px-4 py-2.5 font-medium text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr
                  v-for="admin in admins"
                  :key="admin.id"
                >
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div
                        class="size-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                        :class="GRADIENT"
                      >
                        {{ admin.name.charAt(0).toUpperCase() }}
                      </div>
                      <p class="font-medium truncate">
                        {{ admin.name }}
                      </p>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-muted truncate">
                    {{ admin.email }}
                  </td>
                  <td class="px-4 py-3">
                    <UBadge
                      color="neutral"
                      variant="subtle"
                      size="sm"
                    >
                      {{ admin.businessName ?? 'Super admin' }}
                    </UBadge>
                  </td>
                  <td class="px-4 py-3 text-muted whitespace-nowrap">
                    {{ new Date(admin.createdAt).toLocaleDateString('id-ID') }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                      <UButton
                        icon="i-lucide-pencil"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        @click="openEditAdmin(admin)"
                      />
                      <UButton
                        icon="i-lucide-trash-2"
                        color="error"
                        variant="ghost"
                        size="sm"
                        :disabled="admin.id === user?.id"
                        :title="admin.id === user?.id ? 'Tidak bisa menghapus akun sendiri' : undefined"
                        @click="removeAdmin(admin)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            v-if="admins && admins.length === 0"
            class="px-4 py-6 text-sm text-muted text-center"
          >
            Belum ada akun admin.
          </p>
        </UCard>

        <UModal
          v-model:open="editAdminOpen"
          title="Edit admin"
          description="Perbarui data akun admin"
        >
          <template #body>
            <form
              class="flex flex-col gap-4"
              @submit.prevent="saveAdmin"
            >
              <UFormField label="Nama">
                <UInput
                  v-model="editName"
                  icon="i-lucide-user"
                  placeholder="Nama lengkap"
                  class="w-full"
                  required
                />
              </UFormField>
              <UFormField label="Email">
                <UInput
                  v-model="editEmail"
                  type="email"
                  icon="i-lucide-mail"
                  placeholder="nama@email.com"
                  class="w-full"
                  required
                />
              </UFormField>
              <UFormField
                label="Password baru"
                hint="Kosongkan jika tidak ingin mengubah"
              >
                <UInput
                  v-model="editPassword"
                  type="password"
                  icon="i-lucide-lock"
                  placeholder="••••••••"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Akses akun"
                hint="Batasi ke satu usaha, atau beri akses penuh"
              >
                <USelect
                  v-model="editBusinessId"
                  :items="businessOptions"
                  icon="i-lucide-briefcase"
                  class="w-full"
                />
              </UFormField>

              <UAlert
                v-if="editError"
                color="error"
                variant="soft"
                icon="i-lucide-alert-circle"
                :title="editError"
              />

              <UButton
                type="submit"
                icon="i-lucide-check"
                :loading="editSubmitting"
                class="self-start hover:brightness-105"
                :class="GRADIENT"
              >
                Simpan Perubahan
              </UButton>
            </form>
          </template>
        </UModal>
      </div>

      <div class="flex flex-col gap-4">
        <p class="px-1 text-xs font-semibold tracking-wide text-primary-600 dark:text-primary-400 uppercase">
          Sistem & Penggunaan
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <div
                  class="size-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="GRADIENT"
                >
                  <UIcon
                    name="i-lucide-cpu"
                    class="size-4 text-white"
                  />
                </div>
                <div>
                  <p class="font-medium">
                    Penggunaan Token AI
                  </p>
                  <p class="text-xs text-muted capitalize">
                    {{ aiUsage?.periodLabel ?? '...' }}
                  </p>
                </div>
              </div>
            </template>

            <div
              v-if="aiUsagePending"
              class="flex items-center gap-2 text-sm text-muted"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="size-4 animate-spin"
              />
              Menghitung pemakaian token...
            </div>

            <div
              v-else
              class="flex flex-col gap-3"
            >
              <div>
                <p class="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                  {{ formatNumber(aiUsage?.totalTokens ?? 0) }}
                </p>
                <p class="text-xs text-muted">
                  token terpakai bulan ini
                </p>
              </div>
              <div class="rounded-lg bg-elevated px-3 py-2">
                <p class="text-xs text-muted">
                  Estimasi biaya
                </p>
                <p class="font-medium text-default">
                  {{ formatUsd(aiUsage?.estimatedCostUsd ?? 0) }}<span
                    v-if="aiUsage?.hasUnpriced"
                    class="text-muted"
                  > +</span>
                </p>
              </div>

              <div
                v-if="aiUsage?.byModel?.length"
                class="flex flex-col gap-1.5 text-xs"
              >
                <div
                  v-for="m in aiUsage.byModel"
                  :key="m.model"
                  class="flex items-center justify-between gap-2"
                >
                  <span class="text-muted truncate">{{ m.model }}</span>
                  <span class="font-medium text-default shrink-0">{{ formatNumber(m.totalTokens) }} token</span>
                </div>
              </div>
              <p
                v-else
                class="text-xs text-muted"
              >
                Belum ada pemakaian AI bulan ini.
              </p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <div
                  class="size-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="GRADIENT"
                >
                  <UIcon
                    name="i-lucide-message-circle"
                    class="size-4 text-white"
                  />
                </div>
                <div>
                  <p class="font-medium">
                    Kuota Chat
                  </p>
                  <p class="text-xs text-muted">
                    WhatsApp via Fonnte
                  </p>
                </div>
              </div>
            </template>

            <div
              v-if="chatUsagePending"
              class="flex items-center gap-2 text-sm text-muted"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="size-4 animate-spin"
              />
              Mengambil data device...
            </div>

            <div
              v-else-if="chatUsage?.ok"
              class="flex flex-col gap-3"
            >
              <div class="flex items-center justify-between">
                <p class="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                  {{ chatUsage.quota ?? '—' }}
                </p>
                <UBadge
                  :color="chatUsage.deviceStatus === 'connect' ? 'primary' : 'error'"
                  variant="subtle"
                  size="sm"
                >
                  {{ deviceStatusLabel }}
                </UBadge>
              </div>
              <p class="text-xs text-muted -mt-2">
                sisa kuota kirim pesan
              </p>
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="rounded-lg bg-elevated px-3 py-2">
                  <p class="text-muted">
                    Paket
                  </p>
                  <p class="font-medium text-default">
                    {{ chatUsage.package ?? '—' }}
                  </p>
                </div>
                <div class="rounded-lg bg-elevated px-3 py-2">
                  <p class="text-muted">
                    Terkirim
                  </p>
                  <p class="font-medium text-default">
                    {{ chatUsage.messages ?? '—' }}
                  </p>
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              icon="i-lucide-info"
              :title="chatUsage?.error ?? 'Data device tidak tersedia'"
              description="Cek langsung di dashboard Fonnte kamu."
            />
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <div
                  class="size-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="GRADIENT"
                >
                  <UIcon
                    name="i-lucide-database"
                    class="size-4 text-white"
                  />
                </div>
                <div>
                  <p class="font-medium">
                    Backup Database
                  </p>
                  <p class="text-xs text-muted">
                    Unduh cadangan seluruh data
                  </p>
                </div>
              </div>
            </template>

            <div class="flex flex-col gap-3">
              <p class="text-sm text-muted">
                Mengunduh salinan lengkap semua usaha, chat, kategori, dan transaksi dalam format JSON.
              </p>
              <UButton
                icon="i-lucide-download"
                class="self-start hover:brightness-105"
                :class="GRADIENT"
                @click="downloadBackup"
              >
                Unduh Backup
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
