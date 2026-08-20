<script setup lang="ts">
definePageMeta({ layout: false })

interface Business { id: number, name: string }

const { user } = useUserSession()
const isScoped = computed(() => !!user.value?.businessId)

const { data: businesses } = await useFetch<Business[]>('/api/admin/businesses')

const period = ref<'day' | 'week' | 'month' | 'year' | 'custom'>('month')
const customFrom = ref('')
const customTo = ref('')
const scope = ref('personal')

const periodOptions = [
  { label: 'Hari ini', value: 'day' },
  { label: 'Minggu ini', value: 'week' },
  { label: 'Bulan ini', value: 'month' },
  { label: 'Tahun ini', value: 'year' },
  { label: 'Custom', value: 'custom' }
]

const scopeOptions = computed(() => [
  { label: 'Personal', value: 'personal' },
  ...(businesses.value ?? []).map(b => ({ label: b.name, value: String(b.id) }))
])

function formatLong(date: Date) {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const periodLabel = computed(() => {
  const now = new Date()
  switch (period.value) {
    case 'day':
      return `Hari ini, ${formatLong(now)}`
    case 'week': {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      return `${formatLong(start)} – ${formatLong(now)}`
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return `${formatLong(start)} – ${formatLong(now)}`
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1)
      return `${formatLong(start)} – ${formatLong(now)}`
    }
    case 'custom':
      return customFrom.value && customTo.value
        ? `${formatLong(new Date(customFrom.value))} – ${formatLong(new Date(customTo.value))}`
        : 'Pilih tanggal mulai & selesai'
    default:
      return ''
  }
})

function buildUrl(format: 'xlsx' | 'pdf') {
  const params = new URLSearchParams()
  params.set('period', period.value)
  params.set('format', format)
  if (period.value === 'custom') {
    if (customFrom.value) params.set('from', customFrom.value)
    if (customTo.value) params.set('to', customTo.value)
  }
  if (!isScoped.value) params.set('businessId', scope.value)
  return `/api/admin/reports/export?${params.toString()}`
}

function download(format: 'xlsx' | 'pdf') {
  window.open(buildUrl(format), '_blank')
}
</script>

<template>
  <NuxtLayout name="default">
    <template #header>
      <AppTopbar
        title="Laporan"
        subtitle="Unduh ringkasan & detail transaksi sebagai Excel atau PDF"
      />
    </template>

    <div class="max-w-2xl flex flex-col gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <div class="size-8 rounded-lg bg-linear-to-br from-primary-500 to-rose-500 flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/30">
              <UIcon
                name="i-lucide-sliders-horizontal"
                class="size-4 text-white"
              />
            </div>
            <p class="font-medium">
              Filter laporan
            </p>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <UFormField label="Periode">
            <USelect
              v-model="period"
              :items="periodOptions"
              icon="i-lucide-calendar"
              class="w-full"
            />
          </UFormField>

          <div
            v-if="period === 'custom'"
            class="grid grid-cols-2 gap-3"
          >
            <UFormField label="Dari tanggal">
              <UInput
                v-model="customFrom"
                type="date"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Sampai tanggal">
              <UInput
                v-model="customTo"
                type="date"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField
            v-if="!isScoped"
            label="Usaha"
          >
            <USelect
              v-model="scope"
              :items="scopeOptions"
              icon="i-lucide-briefcase"
              class="w-full"
            />
          </UFormField>
          <UFormField
            v-else
            label="Usaha"
          >
            <div class="flex items-center gap-2 text-sm">
              <UIcon
                name="i-lucide-briefcase"
                class="size-4 text-muted"
              />
              {{ user?.businessName }}
            </div>
          </UFormField>

          <div class="flex items-center gap-2 rounded-xl bg-primary-50 dark:bg-primary-950 px-4 py-3 text-sm text-primary-700 dark:text-primary-300">
            <UIcon
              name="i-lucide-calendar-range"
              class="size-4 shrink-0"
            />
            {{ periodLabel }}
          </div>
        </div>
      </UCard>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          class="group text-left rounded-2xl ring-1 ring-default p-5 hover:ring-primary-500 dark:hover:ring-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
          @click="download('xlsx')"
        >
          <div class="size-11 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-3 group-hover:bg-linear-to-br group-hover:from-primary-500 group-hover:to-rose-500 transition-colors">
            <UIcon
              name="i-lucide-file-spreadsheet"
              class="size-5 text-primary-700 dark:text-primary-300 group-hover:text-white transition-colors"
            />
          </div>
          <p class="font-medium mb-1">
            Unduh Excel
          </p>
          <p class="text-xs text-muted">
            Format .xlsx, cocok untuk diolah lebih lanjut
          </p>
        </button>

        <button
          type="button"
          class="group text-left rounded-2xl ring-1 ring-default p-5 hover:ring-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
          @click="download('pdf')"
        >
          <div class="size-11 rounded-xl bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-3 group-hover:bg-linear-to-br group-hover:from-rose-500 group-hover:to-primary-500 transition-colors">
            <UIcon
              name="i-lucide-file-text"
              class="size-5 text-rose-700 dark:text-rose-300 group-hover:text-white transition-colors"
            />
          </div>
          <p class="font-medium mb-1">
            Unduh PDF
          </p>
          <p class="text-xs text-muted">
            Format siap cetak & dibagikan
          </p>
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>
