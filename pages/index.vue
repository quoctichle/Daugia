<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-5xl font-extrabold text-gray-900 drop-shadow-lg">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Sự kiện Đấu Giá
          </span>
        </h1>
        <p class="mt-2 text-lg text-gray-600">Chào mừng bạn đến với phiên đấu giá đặc biệt!</p>
      </div>

      <div class="relative">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <div class="relative bg-white/60 backdrop-blur-xl p-8 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5">
          <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Tham gia ngay</h2>
          <form @submit.prevent="handleLogin">
            <div class="mb-4">
              <label for="email" class="sr-only">Gmail:</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                required
                class="w-full px-4 py-3 bg-white/80 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
              />
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              Bắt đầu hành trình
            </button>
          </form>
        </div>
      </div>

      <div class="text-center mt-8">
        <NuxtLink to="/admin" class="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
          Quản trị viên? Đăng nhập tại đây
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')

const handleLogin = () => {
  if (email.value) {
    const userEmail = useState('userEmail', () => email.value)
    userEmail.value = email.value
    navigateTo('/user')
  }
}
</script>

<style>
@keyframes tilt {
  0%, 50%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(0.5deg);
  }
  75% {
    transform: rotate(-0.5deg);
  }
}
.animate-tilt {
  animation: tilt 10s infinite linear;
}
</style>