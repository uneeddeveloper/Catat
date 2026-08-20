// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils'
  ],

  // Disabled: its floating launcher docks at the bottom of the viewport and
  // overlaps/blocks taps on the mobile bottom nav bar. Toggle with Shift+Alt+D
  // if needed, or flip this back to true for a non-mobile dev session.
  devtools: {
    enabled: false
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Lilita+One&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    databaseUrl: process.env.TIDB_DATABASE_URL,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiBaseUrl: process.env.OPENAI_BASE_URL,
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2BucketName: process.env.R2_BUCKET_NAME,
    r2PublicUrl: process.env.R2_PUBLIC_URL,
    fonnteApiToken: process.env.FONNTE_API_TOKEN,
    fonnteWebhookSecret: process.env.FONNTE_WEBHOOK_SECRET,
    session: {
      cookie: {
        // Dev server runs over plain HTTP (including LAN IP for mobile testing),
        // so a Secure cookie would be silently dropped by the browser there.
        // Production (Vercel) is HTTPS, so keep it secure by default.
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  compatibilityDate: '2026-06-30',

  // Allow any host (e.g. random *.trycloudflare.com subdomain from a dev tunnel)
  // so Fonnte's webhook can reach the local dev server. Dev-only.
  vite: {
    server: {
      allowedHosts: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    clientBundle: {
      icons: [
        'lucide:layout-dashboard',
        'lucide:receipt-text',
        'lucide:briefcase',
        'lucide:users',
        'lucide:tag',
        'lucide:file-down',
        'lucide:settings',
        'lucide:sun',
        'lucide:moon',
        'lucide:log-out',
        'lucide:bell',
        'lucide:wallet',
        'lucide:trending-up',
        'lucide:search',
        'lucide:image',
        'lucide:receipt',
        'lucide:trash-2',
        'lucide:plus',
        'lucide:user-plus',
        'lucide:file-spreadsheet',
        'lucide:file-text',
        'lucide:more-horizontal'
      ],
      scan: true
    }
  }
})
