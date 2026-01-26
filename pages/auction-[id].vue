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
            <h1 class="text-3xl font-bold text-white">ĐẤU GIÁ SẢN PHẨM</h1>
            <p class="text-sm text-gray-400">Xin chào, <span class="font-semibold text-yellow-400">{{ userEmail }}</span></p>
          </div>
        </div>
        <button @click="goBack" class="bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-yellow-500/30 transform hover:-translate-y-1 transition-all duration-300">
          Quay lại
        </button>
      </header>

      <main v-if="product" class="space-y-12">
        <!-- Thông tin sản phẩm -->
        <div class="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden">
          <div class="p-8">
            <div class="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <img v-if="product.image" :src="product.image" alt="Product" class="w-full md:w-64 h-64 object-cover rounded-xl shadow-lg border-2 border-white/10" />
              <div class="flex-1 text-center md:text-left">
                <h2 class="text-4xl font-bold text-yellow-400 mb-4">{{ product.name }}</h2>
                <p class="text-gray-300 text-lg mb-4">{{ product.description }}</p>
                <p class="text-2xl font-semibold text-white mb-4">
                  Giá khởi điểm: {{ formatCurrency(product.startPrice) }}
                </p>
                <div class="text-lg">
                  <span :class="auctionStatus === 'Đang đấu giá' ? 'text-green-400' : auctionStatus === 'Chưa bắt đầu' ? 'text-yellow-400' : 'text-red-400'">
                    Trạng thái: {{ auctionStatus }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thời gian đấu giá -->
        <div v-if="auctionStatus !== 'Đã kết thúc'" class="text-center p-8 bg-black/20 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10">
          <h2 class="text-xl font-medium text-gray-300 mb-3 tracking-widest uppercase">Thời gian còn lại</h2>
          <div class="text-7xl font-bold text-yellow-400 drop-shadow-lg mb-4">
            {{ countdown }}
          </div>
          <div class="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div class="bg-gradient-to-r from-yellow-400 to-amber-500 h-3 rounded-full transition-all duration-500" :style="{ width: countdownPercent + '%' }"></div>
          </div>
        </div>

        <!-- Form đấu giá hoặc thông tin bids -->
        <div v-if="userBids && userBids.length > 0" class="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden">
          <div class="p-8">
            <h3 class="text-2xl font-bold text-yellow-400 mb-6">Giá bạn đã dự đoán</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="bid in userBids" :key="bid._id" class="bg-teal-900/50 border border-teal-400 rounded-lg p-4">
                <p class="text-teal-300 font-semibold">Lần {{ bid.bidNumber }}</p>
                <p class="text-2xl font-bold text-white">{{ formatCurrency(bid.amount) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="auctionStatus === 'Đang đấu giá'" class="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden">
          <div class="p-8">
            <h3 class="text-2xl font-bold text-yellow-400 mb-6">Nhập giá dự đoán</h3>
            <form @submit.prevent="submitBids" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="i in maxParticipations" :key="i">
                  <label :for="`bid-${i}`" class="block text-sm font-medium text-gray-400 mb-2">Dự đoán lần {{ i }}</label>
                  <input :id="`bid-${i}`" v-model="bids[i-1]" type="number" :placeholder="`Nhập giá tiền`" step="1000" required
                         class="w-full px-4 py-3 bg-gray-800/60 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-300" />
                </div>
              </div>
              <button type="submit" :disabled="isSubmitting"
                      class="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none">
                {{ isSubmitting ? 'ĐANG GỬI...' : 'GỬI DỮ ĐOÁN' }}
              </button>
            </form>
          </div>
        </div>

        <div v-else class="text-center p-8 bg-black/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/10">
          <p class="text-gray-400 text-lg">
            {{ auctionStatus === 'Chưa bắt đầu' ? 'Phiên đấu giá chưa bắt đầu.' : 'Phiên đấu giá đã kết thúc.' }}
          </p>
        </div>
      </main>

      <div v-else class="text-center py-12">
        <p class="text-gray-400 text-lg">Không tìm thấy sản phẩm.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const route = useRoute()
const productId = route.params['auction-[id]']

const pageLoaded = ref(false)
const config = ref({})
const product = ref(null)
const bids = ref([])
const countdown = ref('Đang tải...')
const countdownPercent = ref(100)
const userBids = ref([])
const isSubmitting = ref(false)
let countdownInterval

const userEmail = computed(() => useState('userEmail').value || 'Guest')

onMounted(async () => {
  await loadData()
  startCountdown()
  setTimeout(() => {
    pageLoaded.value = true
  }, 100)
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})

const loadData = async () => {
  try {
    [config.value, product.value] = await Promise.all([
      $fetch('/api/game-config'),
      $fetch(`/api/products/${productId}`)
    ])

    if (product.value) {
      await loadUserBids()
      initializeBids()
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

const loadUserBids = async () => {
  try {
    const email = useState('userEmail').value
    if (!email) return
    const allUserBids = await $fetch('/api/user-bids', { query: { userEmail: email } })
    userBids.value = allUserBids[productId] || []
  } catch (error) {
    console.error('Failed to load user bids:', error)
  }
}

const initializeBids = () => {
  if (userBids.value.length === 0) {
    const maxParticipations = product.value.maxParticipations || 3
    bids.value = Array(maxParticipations).fill('')
  }
}

const startCountdown = () => {
  if (!product.value) return

  countdownInterval = setInterval(() => {
    const now = new Date().getTime()
    const startTime = product.value.startTime ? new Date(product.value.startTime).getTime() : 0
    const duration = (product.value.auctionDuration || 60) * 60000
    const endTime = startTime + duration

    if (now < startTime) {
      const diff = startTime - now
      let days = Math.floor(diff / (1000 * 60 * 60 * 24))
      let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = Math.floor((diff % (1000 * 60)) / 1000)
      countdown.value = `Bắt đầu sau ${days}d ${hours}h ${minutes}m ${seconds}s`
      countdownPercent.value = 100
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

const auctionStatus = computed(() => {
  if (!product.value) return ''
  const now = new Date().getTime()
  const startTime = product.value.startTime ? new Date(product.value.startTime).getTime() : 0
  const duration = (product.value.auctionDuration || 60) * 60000
  const endTime = startTime + duration

  if (now < startTime) return 'Chưa bắt đầu'
  if (now < endTime) return 'Đang đấu giá'
  return 'Đã kết thúc'
})

const maxParticipations = computed(() => product.value?.maxParticipations || 3)

const submitBids = async () => {
  if (isSubmitting.value || auctionStatus.value !== 'Đang đấu giá') return

  isSubmitting.value = true

  try {
    const userEmailValue = useState('userEmail').value
    const bidsData = []

    bids.value.forEach((bidValue, index) => {
      if (bidValue) {
        const bidAmount = parseInt(bidValue)
        if (bidAmount < product.value.startPrice) {
          alert(`Giá dự đoán lần ${index + 1} (${formatCurrency(bidAmount)}) phải lớn hơn hoặc bằng giá khởi điểm ${formatCurrency(product.value.startPrice)}.`)
          return
        }
        bidsData.push({
          productId: product.value._id,
          userEmail: userEmailValue,
          amount: bidAmount,
          bidNumber: index + 1
        })
      }
    })

    if (bidsData.length === 0) {
      alert('Bạn chưa nhập giá dự đoán nào.')
      return
    }

    await $fetch('/api/submit-bids', {
      method: 'POST',
      body: { bids: bidsData }
    })

    alert('Dự đoán của bạn đã được gửi thành công!')
    await loadUserBids()
    bids.value = []
  } catch (error) {
    alert('Lỗi khi gửi dự đoán: ' + (error.data?.message || error.message))
  } finally {
    isSubmitting.value = false
  }
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 VND'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const goBack = () => {
  navigateTo('/user')
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
