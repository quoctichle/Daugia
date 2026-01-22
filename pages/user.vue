<template>
  <div class="container mx-auto p-4">
    <header class="flex justify-between items-center py-4 border-b">
      <div class="flex items-center space-x-4">
        <img v-if="config.logo" :src="config.logo" alt="Logo" class="h-10" />
        <h1 class="text-3xl font-bold">Đấu giá Mini Game</h1>
      </div>
      <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
        Đăng xuất
      </button>
    </header>

    <div v-if="config.mascot" class="my-8 text-center">
      <img :src="config.mascot" alt="Linh vật" class="mx-auto max-h-48" />
    </div>

    <div class="my-8 text-center text-4xl font-bold text-blue-600">
      <h2>Thời gian còn lại: {{ countdown }}</h2>
    </div>

    <div class="my-8 p-6 bg-gray-200 rounded-lg">
      <h3 class="text-2xl font-bold mb-4">Thể lệ chương trình</h3>
      <p>{{ config.rules }}</p>
    </div>

    <div>
      <h3 class="text-2xl font-bold mb-4">Sản phẩm đấu giá</h3>
      <form @submit.prevent="submitBids">
        <div v-for="(product, index) in products" :key="product._id" class="mb-6 p-6 border rounded-lg bg-white shadow-md">
          <div class="flex items-start space-x-6">
            <img v-if="product.image" :src="product.image" alt="Product" class="w-24 h-24 object-cover rounded-lg" />
            <div class="flex-1">
              <h4 class="text-xl font-bold">{{ product.name }}</h4>
              <p class="text-gray-600">{{ product.description }}</p>
              <p class="text-lg font-semibold">Giá khởi điểm: {{ product.startPrice }} VND</p>
              <div v-if="userBids[product._id]">
                <p class="text-green-600 font-semibold">Đã dự đoán:</p>
                <ul>
                  <li v-for="bid in userBids[product._id]" :key="bid._id">
                    Lần {{ bid.bidNumber }}: {{ bid.amount }} VND
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div v-if="!userBids[product._id]" class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label v-for="i in config.maxParticipations" :key="i" class="flex flex-col">
              <span class="font-semibold">Lần {{ i }}:</span>
              <input
                v-model="bids[product._id][i-1]"
                type="number"
                :placeholder="`Giá đấu lần ${i}`"
                step="1000"
                required
                class="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              />
            </label>
          </div>
        </div>
        <button type="submit" :disabled="!isAuctionActive" class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400">
          Gửi đấu giá
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
const config = ref({})
const products = ref([])
const bids = ref({})
const countdown = ref('')
let countdownInterval
const userBids = ref({})

// Load data on mount
onMounted(async () => {
  await loadConfig()
  await loadProducts()
  await loadUserBids()
  initializeBids()
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})

const loadConfig = async () => {
  try {
    config.value = await $fetch('/api/game-config')
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

const loadProducts = async () => {
  try {
    products.value = await $fetch('/api/products')
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const loadUserBids = async () => {
  try {
    const userEmailValue = useState('userEmail').value
    userBids.value = await $fetch('/api/user-bids', {
      query: { userEmail: userEmailValue }
    })
  } catch (error) {
    console.error('Failed to load user bids:', error)
  }
}

const initializeBids = () => {
  products.value.forEach(product => {
    if (!userBids.value[product._id]) {
      bids.value[product._id] = Array(config.value.maxParticipations).fill('')
    }
  })
}

const startCountdown = () => {
  if (!config.value.startTime || !config.value.auctionDuration) return

  const updateCountdown = () => {
    const now = new Date()
    const startTime = parseDate(config.value.startTime)
    const endTime = new Date(startTime.getTime() + config.value.auctionDuration * 60000)

    if (now < startTime) {
      countdown.value = 'Chưa bắt đầu'
    } else if (now < endTime) {
      const diff = endTime - now
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      countdown.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
    } else {
      countdown.value = 'Đã kết thúc'
    }
  }

  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
}

const parseDate = (dateStr) => {
  if (dateStr.includes('T')) {
    // ISO format
    return new Date(dateStr)
  } else {
    // dd/mm/yyyy hh:mm:ss
    const [date, time] = dateStr.split(' ')
    const [day, month, year] = date.split('/')
    const [hours, minutes, seconds] = time.split(':')
    return new Date(year, month - 1, day, hours, minutes, seconds)
  }
}

const isAuctionActive = computed(() => {
  return countdown.value !== 'Chưa bắt đầu' && countdown.value !== 'Đã kết thúc'
})

const submitBids = async () => {
  if (!isAuctionActive.value) return

  try {
    const userEmailValue = useState('userEmail').value
    const bidsData = []

    for (const productId in bids.value) {
      const product = products.value.find(p => p._id === productId)
      bids.value[productId].forEach((bid, index) => {
        if (bid) {
          const bidAmount = parseInt(bid)
          if (bidAmount < product.startPrice) {
            alert(`Giá đấu cho sản phẩm ${product.name} lần ${index + 1} phải lớn hơn hoặc bằng giá khởi điểm ${product.startPrice} VND`)
            return
          }
          bidsData.push({
            productId,
            userEmail: userEmailValue,
            amount: bidAmount,
            bidNumber: index + 1
          })
        }
      })
    }

    await $fetch('/api/submit-bids', {
      method: 'POST',
      body: { bids: bidsData }
    })

    alert('Đấu giá đã được gửi!')
    // Reload user bids to update UI
    await loadUserBids()
    initializeBids()
  } catch (error) {
    alert('Lỗi khi gửi đấu giá: ' + error.message)
  }
}

const logout = () => {
  navigateTo('/')
}
</script>