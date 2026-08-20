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
  <UCard
    class="w-full max-w-sm"
    :ui="{ root: 'rounded-3xl shadow-lg' }"
  >
    <template #header>
      <div class="size-11 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl mb-3">
        🚀
      </div>
      <h1 class="text-lg font-semibold">
        Setup Awal
      </h1>
      <p class="text-sm text-muted">
        Buat akun admin pertama. Halaman ini otomatis nonaktif setelah ada admin.
      </p>
    </template>

    <form
      class="flex flex-col gap-4"
      @submit.prevent="submit"
    >
      <UFormField label="Nama">
        <UInput
          v-model="name"
          class="w-full"
          required
        />
      </UFormField>

      <UFormField label="Email">
        <UInput
          v-model="email"
          type="email"
          class="w-full"
          required
        />
      </UFormField>

      <UFormField
        label="Password"
        hint="min. 8 karakter"
      >
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
        Buat Akun
      </UButton>
    </form>
  </UCard>
</template>
