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

      <main class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2 space-y-12">
          <div class="text-center p-8 bg-black/20 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 transition-all duration-500" :class="pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
            <h2 class="text-xl font-medium text-gray-300 mb-3 tracking-widest uppercase">Thời gian còn lại</h2>
            <div class="text-7xl font-bold text-yellow-400 drop-shadow-lg mb-4">
              {{ countdown }}
            </div>
            <div class="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
              <div class="bg-gradient-to-r from-yellow-400 to-amber-500 h-3 rounded-full transition-all duration-500" :style="{ width: countdownPercent + '%' }"></div>
            </div>
          </div>

          <div v-if="config.mascot" class="my-8 text-center transition-all duration-500 delay-200" :class="pageLoaded ? 'opacity-100' : 'opacity-0'">
            <img :src="config.mascot" alt="Linh vật" class="mx-auto max-h-48 animate-bounce-slow" />
          </div>

          <div>
            <h3 class="text-4xl font-bold mb-8 text-white tracking-tight">Sản phẩm đấu giá</h3>
            <form @submit.prevent="submitBids" class="space-y-10">
              <div v-for="(product, index) in products" :key="product._id" 
                   class="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:border-yellow-400/50"
                   :class="pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'" 
                   :style="{ 'transition-delay': `${150 * index}ms` }">
                <div class="p-6">
                  <div class="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                    <img v-if="product.image" :src="product.image" alt="Product" class="w-full md:w-40 h-40 object-cover rounded-xl shadow-lg border-2 border-white/10" />
                    <div class="flex-1">
                      <h4 class="text-3xl font-bold text-yellow-400">{{ product.name }}</h4>
                      <p class="text-gray-300 mt-2">{{ product.description }}</p>
                      <p class="text-xl font-semibold text-white mt-3">
                        Giá khởi điểm: {{ formatCurrency(product.startPrice) }}
                      </p>
                    </div>
                  </div>

                  <div v-if="userBids[product._id]" class="mt-6 bg-teal-900/50 border-l-4 border-teal-400 p-4 rounded-lg">
                    <p class="text-teal-300 font-semibold">Giá bạn đã dự đoán:</p>
                    <ul class="list-disc list-inside text-gray-200 mt-2">
                      <li v-for="bid in userBids[product._id]" :key="bid._id">
                        Lần {{ bid.bidNumber }}: <span class="font-bold text-white">{{ formatCurrency(bid.amount) }}</span>
                      </li>
                    </ul>
                  </div>

                  <div v-if="!userBids[product._id]" class="mt-8">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div v-for="i in config.maxParticipations" :key="i">
                        <label :for="`bid-${product._id}-${i}`" class="block text-sm font-medium text-gray-400 mb-2">Dự đoán lần {{ i }}</label>
                        <input :id="`bid-${product._id}-${i}`" v-model="bids[product._id][i-1]" type="number" :placeholder="`Nhập giá tiền`" step="1000"
                               class="w-full px-4 py-3 bg-gray-800/60 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" :disabled="!isAuctionActive || isSubmitting" 
                      class="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none">
                {{ isSubmitting ? 'ĐANG GỬI...' : 'GỬI TẤT CẢ DỰ ĐOÁN' }}
              </button>
            </form>
          </div>
        </div>

        <aside class="lg:col-span-1 space-y-8 transition-all duration-500 delay-500" :class="pageLoaded ? 'opacity-100' : 'opacity-0'">
          <div class="p-8 bg-black/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 sticky top-8">
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
const bids = ref({})
const countdown = ref('Đang tải...')
const countdownPercent = ref(100)
const userBids = ref({})
const isSubmitting = ref(false)
let countdownInterval

const userEmail = computed(() => useState('userEmail').value || 'Guest')

onMounted(async () => {
  await loadInitialData()
  startCountdown()
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
    [config.value, products.value] = await Promise.all([
      $fetch('/api/game-config'),
      $fetch('/api/products')
    ]);
    await loadUserBids();
    initializeBids();
  } catch (error) {
    console.error('Failed to load initial data:', error);
    countdown.value = 'Lỗi tải dữ liệu';
  }
}

const loadUserBids = async () => {
  try {
    const email = useState('userEmail').value
    if (!email) return;
    userBids.value = await $fetch('/api/user-bids', { query: { userEmail: email } })
  } catch (error) {
    console.error('Failed to load user bids:', error)
  }
}

const initializeBids = () => {
  products.value.forEach(product => {
    if (!userBids.value[product._id]) {
      bids.value[product._id] = Array(config.value.maxParticipations || 1).fill('')
    }
  })
}

const startCountdown = () => {
  if (!config.value.startTime || !config.value.auctionDuration) {
    countdown.value = 'Chưa cấu hình';
    return;
  }

  countdownInterval = setInterval(() => {
    const now = new Date().getTime()
    const startTime = new Date(config.value.startTime).getTime()
    const duration = config.value.auctionDuration * 60000
    const endTime = startTime + duration

    if (now < startTime) {
      const diff = startTime - now;
      let days = Math.floor(diff / (1000 * 60 * 60 * 24));
      let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((diff % (1000 * 60)) / 1000);
      countdown.value = `Bắt đầu sau ${days}d ${hours}h ${minutes}m ${seconds}s`;
      countdownPercent.value = 100;
    } else if (now < endTime) {
      const diff = endTime - now
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      countdown.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      countdownPercent.value = (diff / duration) * 100
    } else {
      countdown.value = 'ĐÃ KẾT THÚC'
      countdownPercent.value = 0
      clearInterval(countdownInterval)
    }
  }, 1000)
}

const isAuctionActive = computed(() => {
  if (!config.value.startTime || !config.value.auctionDuration) return false;
  const now = new Date().getTime();
  const startTime = new Date(config.value.startTime).getTime();
  const endTime = startTime + config.value.auctionDuration * 60000;
  return now >= startTime && now < endTime;
})

const submitBids = async () => {
  if (!isAuctionActive.value || isSubmitting.value) return

  isSubmitting.value = true;
  let hasValidationError = false;

  try {
    const userEmailValue = useState('userEmail').value
    const bidsData = []

    for (const productId in bids.value) {
      if (userBids.value[productId]) continue;

      const product = products.value.find(p => p._id === productId)
      for (let i = 0; i < bids.value[productId].length; i++) {
        const bidValue = bids.value[productId][i];
        if (bidValue) {
           const bidAmount = parseInt(bidValue);
           if (bidAmount < product.startPrice) {
            alert(`Giá dự đoán cho "${product.name}" lần ${i + 1} (${formatCurrency(bidAmount)}) phải lớn hơn hoặc bằng giá khởi điểm ${formatCurrency(product.startPrice)}.`)
            hasValidationError = true;
            break;
          }
          bidsData.push({
            productId,
            userEmail: userEmailValue,
            amount: bidAmount,
            bidNumber: i + 1
          })
        }
      }
      if (hasValidationError) break;
    }
    
    if (hasValidationError) return;

    if (bidsData.length === 0) {
      alert("Bạn chưa nhập giá dự đoán nào.");
      return;
    }

    await $fetch('/api/submit-bids', {
      method: 'POST',
      body: { bids: bidsData }
    })

    alert('Dự đoán của bạn đã được gửi thành công!')
    await loadUserBids()
    initializeBids()
  } catch (error) {
    alert('Lỗi khi gửi dự đoán: ' + (error.data?.message || error.message))
  } finally {
    isSubmitting.value = false
  }
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