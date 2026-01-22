<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Đăng nhập Admin</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 font-bold mb-2">Gmail:</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Nhập Gmail admin"
            required
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 font-bold mb-2">Password:</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Nhập password"
            required
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <button type="submit" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
          Đăng nhập
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    const response = await $fetch('/api/admin-login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    if (response.success) {
      navigateTo('/admin/dashboard')
    } else {
      alert(response.message)
    }
  } catch (error) {
    alert('Đăng nhập thất bại: ' + error.message)
  }
}
</script>