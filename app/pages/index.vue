<script setup lang="ts">
definePageMeta({ layout: false })

interface DashboardData {
  range: { from: string, to: string, label: string }
  summary: {
    totalExpense: number
    totalIncome: number
    transactionCount: number
    averagePerDay: number
    byCategory: { name: string, total: number }[]
  }
  businesses: { id: number, name: string, income: number, expense: number, profit: number }[]
  dailyTrend: { date: string, total: number }[]
  recent: {
    id: number
    amount: string
    type: 'expense' | 'income'
    description: string | null
    expenseDate: string
    chatTitle: string | null
    businessName: string | null
    categoryName: string | null
    receiptImageUrl: string | null
  }[]
}

type Period = 'day' | 'week' | 'month' | 'year' | 'custom'

const periodOptions: { label: string, value: Period }[] = [
  { label: 'Hari ini', value: 'day' },
  { label: 'Minggu ini', value: 'week' },
  { label: 'Bulan ini', value: 'month' },
  { label: 'Tahun ini', value: 'year' },
  { label: 'Custom', value: 'custom' }
]

const period = ref<Period>('month')
const customFrom = ref('')
const customTo = ref('')
const pendingFrom = ref('')
const pendingTo = ref('')

function selectPreset(value: Period) {
  if (value === 'custom') {
    pendingFrom.value = customFrom.value
    pendingTo.value = customTo.value
    period.value = 'custom'
    return
  }
  period.value = value
}

function applyCustomRange() {
  if (!pendingFrom.value || !pendingTo.value) return
  customFrom.value = pendingFrom.value
  customTo.value = pendingTo.value
}

const query = computed(() => {
  const q: Record<string, string> = { period: period.value }
  if (period.value === 'custom' && customFrom.value && customTo.value) {
    q.from = customFrom.value
    q.to = customTo.value
  }
  return q
})

const { data, pending } = await useFetch<DashboardData>('/api/admin/dashboard', { query })

function formatRupiah(amount: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount))
}

const rangeLabel = computed(() => data.value?.range?.label ?? 'Ringkasan pengeluaran')

const topCategory = computed(() => data.value?.summary.byCategory?.[0])

const incomeShare = computed(() => {
  const income = data.value?.summary.totalIncome ?? 0
  const expense = data.value?.summary.totalExpense ?? 0
  const total = income + expense
  return total > 0 ? Math.round((income / total) * 100) : 0
})

const categoryColors = [
  'var(--ui-color-primary-500)',
  'var(--color-blue-500)',
  'var(--color-amber-500)',
  'var(--color-rose-500)',
  'var(--color-violet-500)',
  'var(--color-cyan-500)'
]

function categoryPercent(total: number) {
  const sum = data.value?.summary.totalExpense ?? 0
  return sum > 0 ? Math.max(1, Math.round((total / sum) * 100)) : 0
}

const categoryDonutStyle = computed(() => {
  const cats = data.value?.summary.byCategory ?? []
  const sum = data.value?.summary.totalExpense ?? 0
  if (!cats.length || sum <= 0) {
    return { background: 'var(--ui-color-neutral-100)' }
  }
  let acc = 0
  const stops = cats.map((cat, i) => {
    const from = acc
    acc += (cat.total / sum) * 100
    return `${categoryColors[i % categoryColors.length]} ${from}% ${acc}%`
  })
  return { background: `conic-gradient(${stops.join(', ')})` }
})

// Trend chart: plotted on a 0-100 x 0-36 viewBox, stretched to fill the card (preserveAspectRatio="none")
const trendPoints = computed(() => {
  const days = data.value?.dailyTrend ?? []
  const n = days.length
  if (!n) return []
  const max = Math.max(1, ...days.map(d => d.total))
  return days.map((d, i) => ({
    x: n === 1 ? 50 : (i / (n - 1)) * 100,
    y: 34 - (d.total / max) * 26,
    total: d.total,
    date: d.date
  }))
})

const trendLinePath = computed(() => trendPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' '))

const trendAreaPath = computed(() => {
  const pts = trendPoints.value
  if (!pts.length) return ''
  const first = pts[0]!
  const last = pts[pts.length - 1]!
  return `${trendLinePath.value} L${last.x.toFixed(2)},34 L${first.x.toFixed(2)},34 Z`
})

const trendLabelIndexes = computed(() => {
  const n = trendPoints.value.length
  if (n <= 1) return [0]
  if (n <= 4) return trendPoints.value.map((_, i) => i)
  return [0, Math.round((n - 1) / 2), n - 1]
})

function formatDayLabel(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y!, m! - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const trendTotal = computed(() => (data.value?.dailyTrend ?? []).reduce((acc, d) => acc + d.total, 0))

function dateChip(dateStr: string) {
  const d = new Date(dateStr)
  return { day: d.getDate(), month: d.toLocaleDateString('id-ID', { month: 'short' }) }
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <AppTopbar
        title="Dashboard"
        :subtitle="rangeLabel"
      />
    </template>

    <div class="mb-6 rounded-2xl ring-1 ring-default bg-white dark:bg-gray-900 shadow-sm p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="opt in periodOptions"
          :key="opt.value"
          type="button"
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
          :class="period === opt.value
            ? 'bg-linear-to-r from-primary-500 to-rose-500 text-white shadow-sm shadow-primary-500/30'
            : 'text-muted hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950 dark:hover:text-primary-400'"
          @click="selectPreset(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <div
        v-if="period === 'custom'"
        class="flex items-center gap-2 flex-wrap"
      >
        <UInput
          v-model="pendingFrom"
          type="date"
          size="sm"
          icon="i-lucide-calendar"
        />
        <span class="text-muted text-sm">–</span>
        <UInput
          v-model="pendingTo"
          type="date"
          size="sm"
          icon="i-lucide-calendar"
        />
        <UButton
          size="sm"
          icon="i-lucide-check"
          :disabled="!pendingFrom || !pendingTo"
          class="bg-linear-to-r from-primary-500 to-rose-500 hover:brightness-105 shadow-sm shadow-primary-500/30"
          @click="applyCustomRange"
        >
          Terapkan
        </UButton>
      </div>
    </div>

    <div
      class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6 transition-opacity"
      :class="{ 'opacity-60': pending }"
    >
      <div class="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Hero: Total Pengeluaran -->
        <div class="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-500 via-primary-600 to-rose-600 text-white p-5 shadow-lg shadow-primary-500/30 flex flex-col">
          <div class="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-white/10 blur-2xl" />

          <div class="relative flex items-center justify-between mb-6">
            <p class="font-semibold">
              Total Pengeluaran
            </p>
            <span class="size-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <UIcon
                name="i-lucide-wallet"
                class="size-4"
              />
            </span>
          </div>

          <p class="font-display relative text-2xl mb-4 truncate">
            {{ formatRupiah(data?.summary.totalExpense ?? 0) }}
          </p>

          <div class="relative flex items-center gap-3 flex-wrap text-xs text-white/85 mb-4">
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-calendar"
                class="size-3.5"
              />{{ rangeLabel }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-receipt-text"
                class="size-3.5"
              />{{ data?.summary.transactionCount ?? 0 }} transaksi
            </span>
          </div>

          <div
            v-if="topCategory"
            class="relative mt-auto"
          >
            <div class="flex items-center justify-between text-xs text-white/85 mb-1">
              <span>Kategori teratas</span>
              <span>{{ categoryPercent(topCategory.total) }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-white/25 overflow-hidden mb-3">
              <div
                class="h-full rounded-full bg-white"
                :style="{ width: categoryPercent(topCategory.total) + '%' }"
              />
            </div>
            <span class="inline-flex text-xs font-medium bg-black/15 rounded-full px-3 py-1">
              {{ topCategory.name }}
            </span>
          </div>
        </div>

        <!-- Secondary: Total Pemasukan -->
        <div class="rounded-3xl bg-white dark:bg-gray-900 ring-1 ring-default shadow-sm p-5 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <p class="font-semibold text-rose-600 dark:text-rose-400">
              Total Pemasukan
            </p>
            <span class="size-8 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center shrink-0">
              <UIcon
                name="i-lucide-trending-up"
                class="size-4 text-rose-600 dark:text-rose-400"
              />
            </span>
          </div>

          <p class="font-display text-2xl mb-4 truncate">
            {{ formatRupiah(data?.summary.totalIncome ?? 0) }}
          </p>

          <div class="flex items-center gap-3 text-xs text-muted mb-4">
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-calendar"
                class="size-3.5"
              />{{ rangeLabel }}
            </span>
          </div>

          <div class="mt-auto">
            <div class="flex items-center justify-between text-xs text-muted mb-1">
              <span>Pemasukan vs Pengeluaran</span>
              <span>{{ incomeShare }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-primary-50 dark:bg-primary-950 overflow-hidden mb-3">
              <div
                class="h-full rounded-full bg-linear-to-r from-rose-500 to-primary-500"
                :style="{ width: incomeShare + '%' }"
              />
            </div>
            <span class="inline-flex text-xs font-medium bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-full px-3 py-1">
              Rata-rata {{ formatRupiah(data?.summary.averagePerDay ?? 0) }}/hari
            </span>
          </div>
        </div>
      </div>

      <UCard :ui="{ root: 'rounded-3xl', body: 'pt-2' }">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <p class="font-medium">
              Tren pengeluaran
            </p>
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ rangeLabel }}
            </UBadge>
          </div>
          <p class="text-xs text-muted mt-0.5">
            Total {{ formatRupiah(trendTotal) }}
          </p>
        </template>

        <div v-if="trendPoints.length">
          <svg
            viewBox="0 0 100 36"
            preserveAspectRatio="none"
            class="w-full h-32"
          >
            <defs>
              <linearGradient
                id="trendFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stop-color="var(--ui-color-primary-500)"
                  stop-opacity="0.35"
                />
                <stop
                  offset="100%"
                  stop-color="var(--ui-color-primary-500)"
                  stop-opacity="0"
                />
              </linearGradient>
            </defs>
            <line
              v-for="g in [8, 17, 26]"
              :key="g"
              x1="0"
              x2="100"
              :y1="g"
              :y2="g"
              stroke="var(--ui-border)"
              stroke-width="0.3"
              vector-effect="non-scaling-stroke"
            />
            <path
              :d="trendAreaPath"
              fill="url(#trendFill)"
              stroke="none"
            />
            <path
              :d="trendLinePath"
              fill="none"
              stroke="var(--ui-color-primary-500)"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
            <circle
              v-for="(p, i) in trendPoints"
              :key="p.date"
              :cx="p.x"
              :cy="p.y"
              :r="i === trendPoints.length - 1 ? 2.4 : 1.4"
              :fill="i === trendPoints.length - 1 ? 'var(--ui-color-primary-500)' : 'var(--ui-bg)'"
              stroke="var(--ui-color-primary-500)"
              stroke-width="1"
              vector-effect="non-scaling-stroke"
            >
              <title>{{ formatDayLabel(p.date) }} · {{ formatRupiah(p.total) }}</title>
            </circle>
          </svg>

          <div class="flex justify-between px-1 mt-1">
            <span
              v-for="i in trendLabelIndexes"
              :key="i"
              class="text-[10px] text-muted"
            >
              {{ formatDayLabel(trendPoints[i]!.date) }}
            </span>
          </div>
        </div>
        <p
          v-else
          class="text-sm text-muted"
        >
          Belum ada data pada periode ini
        </p>
      </UCard>
    </div>

    <div
      v-if="data?.businesses?.length"
      class="mb-6"
    >
      <p class="text-sm font-medium text-muted mb-3">
        Per usaha — {{ rangeLabel }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="biz in data.businesses"
          :key="biz.id"
          class="rounded-2xl ring-1 ring-default bg-white dark:bg-gray-900 shadow-sm p-4"
        >
          <div class="flex items-center gap-2 mb-3">
            <div class="size-8 rounded-lg bg-linear-to-br from-primary-500 to-rose-500 flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/30">
              <UIcon
                name="i-lucide-briefcase"
                class="size-4 text-white"
              />
            </div>
            <p class="font-medium truncate">
              {{ biz.name }}
            </p>
          </div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-muted">Pemasukan</span>
            <span class="font-medium text-primary-600 dark:text-primary-400">{{ formatRupiah(biz.income) }}</span>
          </div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-muted">Pengeluaran</span>
            <span class="font-medium text-rose-600 dark:text-rose-400">{{ formatRupiah(biz.expense) }}</span>
          </div>
          <div class="flex justify-between text-sm pt-1 mt-1 border-t border-default">
            <span class="text-muted">Laba</span>
            <span
              class="font-semibold"
              :class="biz.profit >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600 dark:text-rose-400'"
            >{{ formatRupiah(biz.profit) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
      <UCard :ui="{ root: 'rounded-3xl xl:col-span-2', header: 'py-3', body: 'p-0 sm:p-0' }">
        <template #header>
          <p class="font-medium">
            Transaksi terbaru
          </p>
        </template>

        <div class="divide-y divide-default">
          <div
            v-for="row in data?.recent ?? []"
            :key="row.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <div class="flex flex-col items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 size-11 shrink-0 leading-none">
              <span class="text-sm font-bold">{{ dateChip(row.expenseDate).day }}</span>
              <span class="text-[10px] uppercase">{{ dateChip(row.expenseDate).month }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate">
                {{ row.description || (row.categoryName ?? 'Transaksi') }}
              </p>
              <p class="text-xs text-muted truncate">
                {{ row.categoryName ?? '—' }} · {{ row.businessName ?? row.chatTitle ?? 'Personal' }}
              </p>
            </div>
            <span
              class="text-sm font-semibold shrink-0"
              :class="row.type === 'income' ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ row.type === 'income' ? '+' : '−' }}{{ formatRupiah(row.amount) }}
            </span>
            <ULink
              v-if="row.receiptImageUrl"
              :to="row.receiptImageUrl"
              target="_blank"
            >
              <UButton
                icon="i-lucide-chevron-right"
                color="neutral"
                variant="ghost"
                size="sm"
                square
              />
            </ULink>
            <span
              v-else
              class="size-8 flex items-center justify-center text-muted shrink-0"
            >
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4"
              />
            </span>
          </div>
          <p
            v-if="!data?.recent?.length"
            class="px-4 py-6 text-sm text-muted text-center"
          >
            Belum ada transaksi pada periode ini.
          </p>
        </div>
      </UCard>

      <UCard :ui="{ root: 'rounded-3xl' }">
        <template #header>
          <p class="font-medium">
            Pengeluaran per kategori
          </p>
          <p class="text-xs text-muted mt-0.5">
            {{ rangeLabel }}
          </p>
        </template>

        <div
          v-if="data?.summary.byCategory?.length"
          class="flex items-center gap-6"
        >
          <div class="relative size-28 shrink-0">
            <div
              class="absolute inset-0 rounded-full"
              :style="categoryDonutStyle"
            />
            <div class="absolute inset-2.5 rounded-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center text-center px-2">
              <span class="text-[10px] text-muted">Total</span>
              <span class="text-xs font-semibold leading-tight">{{ formatRupiah(data.summary.totalExpense) }}</span>
            </div>
          </div>

          <div class="flex-1 min-w-0 flex flex-col gap-2.5">
            <div
              v-for="(cat, i) in data.summary.byCategory"
              :key="cat.name"
              class="flex items-center gap-2 text-sm"
            >
              <span
                class="size-2.5 rounded-full shrink-0"
                :style="{ backgroundColor: categoryColors[i % categoryColors.length] }"
              />
              <span class="truncate flex-1">{{ cat.name }}</span>
              <span class="font-medium shrink-0">{{ categoryPercent(cat.total) }}%</span>
            </div>
          </div>
        </div>
        <p
          v-else
          class="text-sm text-muted"
        >
          Belum ada data pada periode ini
        </p>
      </UCard>
    </div>
  </NuxtLayout>
</template>
