<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Đăng nhập User</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 font-bold mb-2">Gmail:</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Nhập Gmail của bạn"
            required
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          Tiếp tục
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const router = useRouter()

const handleLogin = () => {
  // Giả lập login, lưu email và chuyển đến trang user
  const userEmail = useState('userEmail', () => email.value)
  userEmail.value = email.value
  navigateTo('/user')
}
</script>