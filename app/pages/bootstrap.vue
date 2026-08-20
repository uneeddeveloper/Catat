<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { fetch: refreshSession } = useUserSession()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/admin/auth/bootstrap', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value }
    })
    await $fetch('/api/admin/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await refreshSession()
    await navigateTo('/')
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Gagal membuat akun'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 dark:ring-white/10 pt-20 pb-8 px-8">
      <div class="absolute inset-x-0 top-0 h-36 overflow-hidden pointer-events-none">
        <div class="absolute -top-12 -left-12 size-40 rounded-full bg-linear-to-br from-rose-400 to-primary-400 opacity-90" />
        <div class="absolute top-4 left-28 size-14 rounded-full bg-linear-to-br from-primary-500 to-amber-300 opacity-80" />
        <div class="absolute top-3 right-10 size-5 rounded-full bg-primary-500" />
        <div class="absolute top-16 right-24 size-3 rounded-full bg-rose-500" />
      </div>

      <div class="relative">
        <div class="size-12 rounded-2xl bg-linear-to-br from-rose-500 to-primary-500 flex items-center justify-center text-2xl shadow-lg shadow-primary-500/30 mb-5">
          🚀
        </div>
        <h1 class="font-display text-2xl tracking-wide text-default">
          DAFTAR
        </h1>
        <p class="text-xs font-medium tracking-[0.2em] text-muted uppercase mb-8">
          setup akun pertama
        </p>

        <form
          class="flex flex-col gap-6"
          @submit.prevent="submit"
        >
          <label class="block">
            <span class="text-xs text-muted">Nama</span>
            <input
              v-model="name"
              required
              class="w-full bg-transparent border-0 border-b-2 border-default focus:border-primary-500 outline-none py-1.5 text-sm text-default transition-colors"
            >
          </label>

          <label class="block">
            <span class="text-xs text-muted">Email</span>
            <input
              v-model="email"
              type="email"
              required
              class="w-full bg-transparent border-0 border-b-2 border-default focus:border-primary-500 outline-none py-1.5 text-sm text-default transition-colors"
            >
          </label>

          <label class="block">
            <span class="text-xs text-muted">Password <span class="normal-case text-[11px]">(min. 8 karakter)</span></span>
            <input
              v-model="password"
              type="password"
              required
              minlength="8"
              class="w-full bg-transparent border-0 border-b-2 border-default focus:border-primary-500 outline-none py-1.5 text-sm text-default transition-colors"
            >
          </label>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :title="error"
          />

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-full bg-linear-to-r from-rose-500 to-primary-500 text-white font-semibold tracking-wide py-3 text-sm shadow-lg shadow-primary-500/30 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60 disabled:pointer-events-none"
          >
            {{ loading ? 'Memproses…' : 'BUAT AKUN' }}
          </button>
        </form>

        <p class="text-center text-xs text-muted mt-6">
          Sudah punya akun?
          <NuxtLink
            to="/login"
            class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Masuk
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
