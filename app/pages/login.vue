<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { fetch: refreshSession } = useUserSession()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

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
  <UCard
    class="w-full max-w-sm"
    :ui="{ root: 'rounded-3xl shadow-lg' }"
  >
    <template #header>
      <div class="size-11 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl mb-3">
        💸
      </div>
      <h1 class="text-lg font-semibold">
        Masuk ke Catat
      </h1>
      <p class="text-sm text-muted">
        Panel admin pencatatan pengeluaran
      </p>
    </template>

    <form
      class="flex flex-col gap-4"
      @submit.prevent="submit"
    >
      <UFormField label="Email">
        <UInput
          v-model="email"
          type="email"
          placeholder="admin@contoh.com"
          class="w-full"
          required
        />
      </UFormField>

      <UFormField label="Password">
        <UInput
          v-model="password"
          type="password"
          class="w-full"
          required
        />
      </UFormField>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :title="error"
      />

      <UButton
        type="submit"
        block
        :loading="loading"
      >
        Masuk
      </UButton>
    </form>

    <template #footer>
      <p class="text-sm text-muted">
        Belum ada admin? <NuxtLink
          to="/bootstrap"
          class="text-primary"
        >Buat akun pertama</NuxtLink>
      </p>
    </template>
  </UCard>
</template>
