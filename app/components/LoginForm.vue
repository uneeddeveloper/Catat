<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/admin/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await refreshSession()
    await navigateTo('/')
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Gagal login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form
    class="flex flex-col gap-6"
    @submit.prevent="submit"
  >
    <label class="block">
      <span class="text-xs text-muted">Email</span>
      <input
        v-model="email"
        type="email"
        required
        placeholder="admin@contoh.com"
        class="w-full bg-transparent border-0 border-b-2 border-default focus:border-primary-500 outline-none py-1.5 text-sm text-default transition-colors"
      >
    </label>

    <label class="block">
      <span class="text-xs text-muted">Password</span>
      <div class="relative flex items-center">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          class="peer w-full bg-transparent border-0 border-b-2 border-default focus:border-primary-500 outline-none py-1.5 pr-9 text-sm transition-colors caret-primary-500"
          :class="showPassword
            ? 'font-semibold tracking-wide text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-rose-600'
            : 'text-default'"
        >
        <button
          type="button"
          class="absolute right-0 flex items-center justify-center size-7 rounded-full transition-all duration-200 cursor-pointer"
          :class="showPassword
            ? 'bg-linear-to-br from-primary-500/15 to-rose-500/15 text-primary-600 dark:text-primary-400'
            : 'text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950'"
          :aria-label="showPassword ? 'Sembunyikan password' : 'Lihat password'"
          @click="showPassword = !showPassword"
        >
          <Transition
            name="eye"
            mode="out-in"
          >
            <UIcon
              :key="showPassword ? 'open' : 'closed'"
              :name="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
              class="size-4"
            />
          </Transition>
        </button>
      </div>
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
      class="w-full rounded-full bg-linear-to-r from-primary-500 to-rose-500 text-white font-semibold tracking-wide py-3 text-sm shadow-lg shadow-primary-500/30 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60 disabled:pointer-events-none"
    >
      {{ loading ? 'Memproses…' : 'MASUK' }}
    </button>
  </form>
</template>

<style scoped>
.eye-enter-active,
.eye-leave-active {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease;
}

.eye-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.4);
}

.eye-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.4);
}
</style>
