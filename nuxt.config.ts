// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-01-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image'],
  vite: {
    server: {
      allowedHosts: ['sb-6aewko7yqi2x.vercel.run']
    }
  },
  nitro: {
    host: 'localhost',
    port: 3000
  },
  runtimeConfig: {
    mongoUri: process.env.MONGODB_URI || "mongodb+srv://quoctichle_db_user:Letich37@cluster0.ol5cjn6.mongodb.net/daugia?retryWrites=true&w=majority"
  }
})
