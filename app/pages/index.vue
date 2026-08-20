<script setup lang="ts">
definePageMeta({ layout: false })

interface DashboardData {
  summary: {
    totalExpenseThisMonth: number
    totalIncomeThisMonth: number
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
  }[]
}

const { data } = await useFetch<DashboardData>('/api/admin/dashboard')

function formatRupiah(amount: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount))
}

const quickStats = computed(() => [
  { label: 'Total Pengeluaran', value: formatRupiah(data.value?.summary.totalExpenseThisMonth ?? 0), icon: 'i-lucide-wallet', tint: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' },
  { label: 'Rata-rata/hari', value: formatRupiah(data.value?.summary.averagePerDay ?? 0), icon: 'i-lucide-trending-up', tint: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  { label: 'Total Transaksi', value: `${data.value?.summary.transactionCount ?? 0}`, icon: 'i-lucide-receipt-text', tint: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' }
])

const categoryColors = [
  'var(--ui-color-primary-500)',
  'var(--color-blue-500)',
  'var(--color-amber-500)',
  'var(--color-rose-500)',
  'var(--color-violet-500)',
  'var(--color-cyan-500)'
]

function categoryPercent(total: number) {
  const sum = data.value?.summary.totalExpenseThisMonth ?? 0
  return sum > 0 ? Math.max(1, Math.round((total / sum) * 100)) : 0
}

const categoryDonutStyle = computed(() => {
  const cats = data.value?.summary.byCategory ?? []
  const sum = data.value?.summary.totalExpenseThisMonth ?? 0
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
</script>

<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <AppTopbar
        title="Dashboard"
        subtitle="Ringkasan pengeluaran bulan ini"
      />
    </template>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div
        v-for="stat in quickStats"
        :key="stat.label"
        class="rounded-2xl ring-1 ring-default p-4 flex items-center gap-3"
      >
        <div
          class="size-11 rounded-xl flex items-center justify-center shrink-0"
          :class="stat.tint"
        >
          <UIcon
            :name="stat.icon"
            class="size-5"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-muted truncate">
            {{ stat.label }}
          </p>
          <p class="text-base font-semibold truncate">
            {{ stat.value }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="data?.businesses?.length"
      class="mb-6"
    >
      <p class="text-sm font-medium text-muted mb-3">
        Per usaha — bulan ini
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="biz in data.businesses"
          :key="biz.id"
          class="rounded-2xl ring-1 ring-default p-4"
        >
          <div class="flex items-center gap-2 mb-3">
            <div class="size-8 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0">
              <UIcon
                name="i-lucide-briefcase"
                class="size-4 text-primary-700 dark:text-primary-300"
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

    <!-- Charts: shown from tablet width up -->
    <div class="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <UCard :ui="{ body: 'pt-2' }">
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
              {{ data?.dailyTrend?.length ?? 0 }} hari terakhir
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
          Belum ada data bulan ini
        </p>
      </UCard>

      <UCard>
        <template #header>
          <p class="font-medium">
            Pengeluaran per kategori
          </p>
          <p class="text-xs text-muted mt-0.5">
            Bulan ini
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
              <span class="text-xs font-semibold leading-tight">{{ formatRupiah(data.summary.totalExpenseThisMonth) }}</span>
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
          Belum ada data bulan ini
        </p>
      </UCard>
    </div>

    <UCard :ui="{ header: 'py-3', body: 'p-0 sm:p-0' }">
      <template #header>
        <p class="font-medium">
          Transaksi terbaru
        </p>
      </template>

      <!-- Desktop/tablet: full table -->
      <div class="hidden sm:block">
        <UTable
          :data="data?.recent ?? []"
          :columns="[
            { accessorKey: 'expenseDate', header: 'Tanggal' },
            { accessorKey: 'chatTitle', header: 'Chat/Usaha' },
            { accessorKey: 'categoryName', header: 'Kategori' },
            { accessorKey: 'description', header: 'Deskripsi' },
            { accessorKey: 'amount', header: 'Nominal' }
          ]"
        >
          <template #amount-cell="{ row }">
            <span :class="row.original.type === 'income' ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600 dark:text-rose-400'">
              {{ row.original.type === 'income' ? '+' : '−' }}{{ formatRupiah(row.original.amount) }}
            </span>
          </template>
          <template #expenseDate-cell="{ row }">
            {{ new Date(row.original.expenseDate).toLocaleDateString('id-ID') }}
          </template>
          <template #chatTitle-cell="{ row }">
            {{ row.original.businessName ?? row.original.chatTitle ?? 'Personal' }}
          </template>
        </UTable>
      </div>

      <!-- Mobile: stacked cards, no horizontal scroll needed -->
      <div class="sm:hidden divide-y divide-default">
        <div
          v-for="row in data?.recent ?? []"
          :key="row.id"
          class="flex flex-col gap-1 px-4 py-3"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-medium truncate">
              {{ row.description || (row.categoryName ?? 'Transaksi') }}
            </p>
            <span
              class="text-sm font-semibold shrink-0"
              :class="row.type === 'income' ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ row.type === 'income' ? '+' : '−' }}{{ formatRupiah(row.amount) }}
            </span>
          </div>
          <div class="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted">
            <span>{{ new Date(row.expenseDate).toLocaleDateString('id-ID') }}</span>
            <span v-if="row.categoryName">· {{ row.categoryName }}</span>
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ row.businessName ?? row.chatTitle ?? 'Personal' }}
            </UBadge>
          </div>
        </div>
        <p
          v-if="!data?.recent?.length"
          class="px-4 py-3 text-sm text-muted"
        >
          Belum ada transaksi.
        </p>
      </div>
    </UCard>

    <template #aside>
      <div class="relative size-36 mx-auto mb-2">
        <div
          class="absolute inset-0 rounded-full"
          :style="{ background: `conic-gradient(var(--ui-color-primary-500) 0% ${categoryPercent(data?.summary.byCategory?.[0]?.total ?? 0)}%, var(--ui-color-primary-100) ${categoryPercent(data?.summary.byCategory?.[0]?.total ?? 0)}% 100%)` }"
        />
        <div class="absolute inset-3 rounded-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center text-center px-2">
          <span class="text-sm font-semibold leading-tight">{{ formatRupiah(data?.summary.totalExpenseThisMonth ?? 0) }}</span>
          <span class="text-xs text-muted">bulan ini</span>
        </div>
      </div>
      <p
        v-if="data?.summary.byCategory?.[0]"
        class="text-center text-xs text-muted mb-6"
      >
        {{ categoryPercent(data.summary.byCategory[0].total) }}% dari <span class="font-medium text-default">{{ data.summary.byCategory[0].name }}</span>
      </p>

      <div class="rounded-2xl bg-primary-50 dark:bg-primary-950 p-5 text-center">
        <div class="text-3xl mb-2">
          🤖
        </div>
        <p class="text-sm font-medium mb-1">
          Hubungkan bot ke grup usaha
        </p>
        <p class="text-xs text-muted mb-4">
          Invite bot ke grup, lalu ketik /usaha Nama Usaha supaya transaksi grup itu tercatat otomatis ke usaha tersebut.
        </p>
        <UButton
          to="/businesses"
          block
          size="sm"
        >
          Lihat Usaha
        </UButton>
      </div>
    </template>
  </NuxtLayout>
</template>
