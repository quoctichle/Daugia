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

      <main v-if="product" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cột trái: Thông tin sản phẩm + countdown + form -->
        <div class="lg:col-span-2 space-y-12">
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

          <!-- Phần đấu giá -->
          <div v-if="auctionStatus === 'Đang đấu giá'" class="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden">
            <div class="p-8">
              <h3 class="text-2xl font-bold text-yellow-400 mb-6">Đấu giá ngay!</h3>
              <p class="text-lg text-gray-300 mb-4">Giá cao nhất hiện tại: <span class="font-bold text-white">{{ formatCurrency(currentHighestBid) }}</span></p>
              <p class="text-lg text-gray-300 mb-6">Giá đấu tiếp theo: <span class="font-bold text-green-400">{{ formatCurrency(nextBidAmount) }}</span></p>

              <button type="button" @click="submitBid" :disabled="isBidding || isCurrentUserHighest || auctionStatus !== 'Đang đấu giá'"
                      class="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none">
                {{ isBidding ? 'ĐANG GỬI...' : isCurrentUserHighest ? 'BẠN ĐANG DẪN ĐẦU' : 'ĐẤU GIÁ SẢN PHẨM' }}
              </button>
            </div>
          </div>

          <!-- Trạng thái khi chưa bắt đầu hoặc đã kết thúc -->
          <div v-else class="text-center p-8 bg-black/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/10">
            <p class="text-gray-400 text-lg">
              {{ auctionStatus === 'Chưa bắt đầu' ? 'Phiên đấu giá chưa bắt đầu.' : 'Phiên đấu giá đã kết thúc.' }}
            </p>
            <div v-if="userBids && userBids.length > 0" class="mt-8">
              <h4 class="text-xl font-bold text-yellow-400 mb-4">Giá bạn đã dự đoán</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="bid in userBids" :key="bid._id" class="bg-teal-900/50 border border-teal-400 rounded-lg p-4">
                  <p class="text-teal-300 font-semibold">Lần {{ bid.bidNumber }}</p>
                  <p class="text-2xl font-bold text-white">{{ formatCurrency(bid.amount) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột phải: Leaderboard -->
        <aside class="lg:col-span-1 lg:sticky lg:top-24 h-fit">
          <div class="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden">
            <div class="p-8">
              <div class="flex items-center justify-between gap-4 mb-6">
                <h3 class="text-2xl font-bold text-yellow-400">Người tham gia đấu giá</h3>
                <button
                  type="button"
                  @click="loadLeaderboard"
                  class="text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Cập nhật
                </button>
              </div>

              <div v-if="isLoadingLeaderboard" class="text-gray-400">Đang tải danh sách...</div>
              <div v-else-if="leaderboard.length === 0" class="text-gray-400">Chưa có ai tham gia.</div>
              <ul v-else class="space-y-3">
                <li
                  v-for="(row, idx) in leaderboard"
                  :key="row.userEmail"
                  class="flex items-center justify-between gap-4 p-4 rounded-lg bg-gray-800/40 border border-white/10"
                >
                  <div class="flex items-center gap-4 min-w-0">
                    <div class="w-10 text-gray-400 font-semibold">#{{ idx + 1 }}</div>
                    <div class="min-w-0">
                      <div class="font-mono text-gray-200 truncate">
                        {{ maskEmail(row.userEmail) }}
                      </div>
                      <div class="text-xs text-gray-400">
                        {{ row.bidsCount }} lượt dự đoán
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-white">{{ formatCurrency(row.highestBid) }}</div>
                    <div class="text-xs text-gray-400">Giá cao nhất</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </aside>
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
const isSubmitting = ref(false) // For general form submission
const isBidding = ref(false) // For bid button specific state
const leaderboard = ref([])
const isLoadingLeaderboard = ref(false)
let countdownInterval
let leaderboardInterval

const userEmail = computed(() => (process.client ? localStorage.getItem('userEmail') : useState('userEmail').value) || 'Guest')

onMounted(async () => {
  await loadData()
  startCountdown()
  setTimeout(() => {
    pageLoaded.value = true
  }, 100)
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
  if (leaderboardInterval) clearInterval(leaderboardInterval)
})

const loadData = async () => {
  try {
    [config.value, product.value] = await Promise.all([
      $fetch('/api/game-config'),
      $fetch(`/api/products/${productId}`)
    ])

    if (product.value) {
      await Promise.all([loadUserBids(), loadLeaderboard()])
      startLeaderboardPolling()
      initializeBids()
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

const loadUserBids = async () => {
  try {
    const email = useState('userEmail').value
    if (!email) {
    const storedEmail = process.client ? localStorage.getItem('userEmail') : null;
    if (storedEmail) {
      email = storedEmail;
    } else {
      return;
    }
  }
    const allUserBids = await $fetch('/api/user-bids', { query: { userEmail: email } })
    userBids.value = allUserBids[productId] || []
  } catch (error) {
    console.error('Failed to load user bids:', error)
  }
}

const loadLeaderboard = async () => {
  if (!productId) return
  if (isLoadingLeaderboard.value) return
  isLoadingLeaderboard.value = true
  try {
    const data = await $fetch(`/api/auction-leaderboard/${productId}`, { query: { limit: 50, _t: Date.now() } })
    leaderboard.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to load leaderboard:', error)
    leaderboard.value = []
  } finally {
    isLoadingLeaderboard.value = false
  }
}

const startLeaderboardPolling = () => {
  if (leaderboardInterval) clearInterval(leaderboardInterval)

  const getIntervalMs = () => {
    if (auctionStatus.value === 'Đang đấu giá') return 3000
    if (auctionStatus.value === 'Chưa bắt đầu') return 8000
    return 15000
  }

  let lastMs = getIntervalMs()
  leaderboardInterval = setInterval(async () => {
    const nextMs = getIntervalMs()
    if (nextMs !== lastMs) {
      startLeaderboardPolling()
      return
    }
    await loadLeaderboard()
  }, lastMs)
}

const initializeBids = () => {
  // No longer needed as we're not inputting multiple bids
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

const currentHighestBid = computed(() => {
  if (leaderboard.value.length > 0) {
    return leaderboard.value[0].highestBid
  }
  return product.value?.startPrice || 0
})

const nextBidAmount = computed(() => currentHighestBid.value + 100)

const isCurrentUserHighest = computed(() => {
  return leaderboard.value.length > 0 && leaderboard.value[0].userEmail === userEmail.value
})


const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return ''
  const [local, domain] = email.split('@')
  if (!domain) return email

  const safeLocal = local || ''
  if (safeLocal.length <= 2) {
    return `${safeLocal[0] || ''}*@${domain}`
  }

  const start = safeLocal.slice(0, 2)
  const end = safeLocal.slice(-1)
  const maskLen = Math.max(safeLocal.length - (start.length + end.length), 1)
  return `${start}${'*'.repeat(maskLen)}${end}@${domain}`
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 ¥'
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value)
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
