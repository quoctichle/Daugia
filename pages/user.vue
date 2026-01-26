<template>
  <div class="bg-gray-900 text-white min-h-screen font-sans">
    <div class="absolute inset-0 z-0 opacity-10">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
      <div class="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-yellow-500/10 to-transparent rounded-full filter blur-3xl"></div>
    </div>

    <div class="relative z-10 container mx-auto p-4 sm:p-6 lg:p-8">
      <header class="flex flex-col sm:flex-row justify-between items-center py-4 mb-12 border-b border-gray-700/50">
        <div class="flex items-center space-x-4 mb-4 sm:mb-0">
          <img v-if="config.logo" :src="config.logo" alt="Logo" class="h-14 w-14 object-contain rounded-full bg-white/10 p-1 transition-transform duration-300 hover:scale-110" />
          <div>
            <h1 class="text-3xl font-bold text-white">PHIÊN ĐẤU GIÁ VÀNG</h1>
            <p class="text-sm text-gray-400">Xin chào, <span class="font-semibold text-yellow-400">{{ userEmail }}</span></p>
          </div>
        </div>
        <button @click="logout" class="bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-yellow-500/30 transform hover:-translate-y-1 transition-all duration-300">
          Đăng xuất
        </button>
      </header>

      <main class="space-y-12">
        <div v-if="config.mascot" class="text-center transition-all duration-500 delay-200" :class="pageLoaded ? 'opacity-100' : 'opacity-0'">
          <img :src="config.mascot" alt="Linh vật" class="mx-auto max-h-48 animate-bounce-slow" />
        </div>

        <div>
          <h3 class="text-4xl font-bold mb-8 text-white tracking-tight">Sản phẩm đấu giá</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="(product, index) in products" :key="product._id"
                 class="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:border-yellow-400/50 cursor-pointer"
                 :class="pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'"
                 :style="{ 'transition-delay': `${150 * index}ms` }"
                 @click="goToAuction(product._id)">
              <div class="p-6">
                <div class="flex flex-col items-center space-y-4">
                  <img v-if="product.image" :src="product.image" alt="Product" class="w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-white/10" />
                  <div class="text-center">
                    <h4 class="text-2xl font-bold text-yellow-400">{{ product.name }}</h4>
                    <p class="text-gray-300 mt-2">{{ product.description }}</p>
                    <p class="text-xl font-semibold text-white mt-3">
                      Giá khởi điểm: {{ formatCurrency(product.startPrice) }}
                    </p>
                    <div class="mt-4">
                      <span :class="getProductStatus(product) === 'Đang đấu giá' ? 'bg-green-500' : 'bg-red-500'" class="px-3 py-1 rounded-full text-sm font-medium text-white">
                        {{ getProductStatus(product) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="space-y-8 transition-all duration-500 delay-500" :class="pageLoaded ? 'opacity-100' : 'opacity-0'">
          <div class="p-8 bg-black/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/10">
            <h3 class="text-2xl font-bold mb-4 text-yellow-400">Thể lệ chương trình</h3>
            <div class="text-gray-300 leading-relaxed whitespace-pre-line prose prose-invert prose-p:text-gray-300">
                <p>{{ config.rules }}</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const pageLoaded = ref(false)
const config = ref({})
const products = ref([])
let countdownInterval

const userEmail = computed(() => useState('userEmail').value || 'Guest')

onMounted(async () => {
  await loadInitialData()
  // Trigger page load animations
  setTimeout(() => {
    pageLoaded.value = true
  }, 100)
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})

const loadInitialData = async () => {
  try {
    [config.value] = await Promise.all([
      $fetch('/api/game-config')
    ]);
    
    // Load products
    const productsData = await $fetch('/api/products')
    if (productsData) {
      products.value = productsData
    }
  } catch (error) {
    console.error('Failed to load initial data:', error);
  }
}

const getProductStatus = (product) => {
  const now = new Date().getTime();
  const startTime = product.startTime ? new Date(product.startTime).getTime() : 0;
  const duration = (product.auctionDuration || 60) * 60000;
  const endTime = startTime + duration;

  if (now < startTime) return 'Chưa bắt đầu';
  if (now < endTime) return 'Đang đấu giá';
  return 'Đã kết thúc';
}

const goToAuction = (productId) => {
  navigateTo(`/auction_id/${productId}`)
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 VND';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

const logout = () => {
  useState('userEmail').value = null;
  navigateTo('/')
}

</script>

<style scoped>
@import url('https://rsms.me/inter/inter.css');
html { font-family: 'Inter', sans-serif; }

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(-4%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
.animate-bounce-slow {
  animation: bounce-slow 4s infinite;
}
.prose {
  @apply text-gray-300;
}
</style>