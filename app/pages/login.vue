<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>

<template>
  <div class="contents">
    <!-- Mobile & tablet: compact floating card -->
    <div class="w-full max-w-sm lg:hidden">
      <div class="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 dark:ring-white/10 pt-20 pb-8 px-8">
        <div class="absolute inset-x-0 top-0 h-36 overflow-hidden pointer-events-none">
          <div class="absolute -top-12 -left-12 size-40 rounded-full bg-linear-to-br from-primary-400 to-rose-400 opacity-90" />
          <div class="absolute top-4 left-28 size-14 rounded-full bg-linear-to-br from-amber-300 to-primary-500 opacity-80" />
          <div class="absolute top-3 right-10 size-5 rounded-full bg-rose-500" />
          <div class="absolute top-16 right-24 size-3 rounded-full bg-primary-500" />
        </div>

        <div class="relative">
          <img
            src="/logo.png"
            alt="TxStream"
            class="size-12 rounded-2xl shadow-lg shadow-primary-500/30 mb-5"
          >
          <h1 class="font-display text-2xl tracking-wide text-default">
            MASUK
          </h1>
          <p class="text-xs font-medium tracking-[0.2em] text-muted uppercase mb-8">
            untuk melanjutkan
          </p>

          <LoginForm />

          <p class="text-center text-xs text-muted mt-6">
            Belum ada admin?
            <NuxtLink
              to="/bootstrap"
              class="text-primary-600 dark:text-primary-400 font-medium"
            >
              Buat akun pertama
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>

    <!-- Desktop & wider: full split panel -->
    <div class="hidden lg:flex w-full max-w-4xl xl:max-w-5xl lg:min-h-140 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
      <div class="relative w-1/2 shrink-0 bg-linear-to-br from-primary-500 to-rose-500 p-12 xl:p-14 flex flex-col justify-between overflow-hidden">
        <div class="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10" />
        <div class="pointer-events-none absolute bottom-8 -left-12 size-48 rounded-full bg-white/10" />
        <div class="pointer-events-none absolute top-1/3 right-12 size-6 rounded-full bg-amber-300/80" />
        <div class="pointer-events-none absolute bottom-[38%] left-16 size-3 rounded-full bg-white/60" />

        <div class="relative">
          <img
            src="/logo.png"
            alt="TxStream"
            class="size-16 rounded-3xl shadow-lg mb-6"
          >
          <h2 class="font-display text-4xl tracking-wide text-white mb-3">
            TxStream
          </h2>
          <p class="text-white/80 text-sm leading-relaxed max-w-xs">
            Pantau pemasukan & pengeluaran usaha kamu otomatis, langsung dari chat Telegram & WhatsApp.
          </p>
        </div>

        <div class="relative flex flex-col gap-4">
          <div class="flex items-center gap-3 text-white">
            <span class="size-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <UIcon
                name="i-lucide-message-circle"
                class="size-4.5"
              />
            </span>
            <span class="text-sm font-medium">Catat lewat bot Telegram & WhatsApp</span>
          </div>
          <div class="flex items-center gap-3 text-white">
            <span class="size-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <UIcon
                name="i-lucide-file-down"
                class="size-4.5"
              />
            </span>
            <span class="text-sm font-medium">Laporan Excel/PDF otomatis</span>
          </div>
          <div class="flex items-center gap-3 text-white">
            <span class="size-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <UIcon
                name="i-lucide-briefcase"
                class="size-4.5"
              />
            </span>
            <span class="text-sm font-medium">Kelola banyak usaha & tim sekaligus</span>
          </div>
        </div>
      </div>

      <div class="w-1/2 shrink-0 bg-white dark:bg-gray-900 p-12 xl:p-16 flex flex-col justify-center">
        <h1 class="font-display text-3xl tracking-wide text-default">
          MASUK
        </h1>
        <p class="text-xs font-medium tracking-[0.2em] text-muted uppercase mb-10">
          untuk melanjutkan panel admin
        </p>

        <LoginForm />

        <p class="text-center text-xs text-muted mt-6">
          Belum ada admin?
          <NuxtLink
            to="/bootstrap"
            class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Buat akun pertama
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
