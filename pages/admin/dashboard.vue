<template>
  <div class="container mx-auto p-4">
    <header class="flex justify-between items-center py-4 border-b">
      <h1 class="text-3xl font-bold">Admin Dashboard</h1>
      <button @click="logout" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
        Đăng xuất
      </button>
    </header>

    <div class="mt-8">
      <div class="flex border-b">
        <button
          @click="activeTab = 'config'"
          :class="['px-4 py-2 text-lg font-medium', activeTab === 'config' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500']"
        >
          Cấu hình Mini Game
        </button>
        <button
          @click="activeTab = 'auction'"
          :class="['px-4 py-2 text-lg font-medium', activeTab === 'auction' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500']"
        >
          Chi tiết Đấu giá
        </button>
      </div>

      <div class="mt-6">
        <!-- Cấu hình Mini Game -->
        <div v-if="activeTab === 'config'" class="space-y-8">
          <h2 class="text-2xl font-bold">Cấu hình Game Đấu giá</h2>
          <form @submit.prevent="saveConfig" class="space-y-6 bg-white p-8 rounded-lg shadow-md">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="font-bold">Logo Thương hiệu:</label>
                <input type="file" @change="handleLogoUpload" accept="image/*" class="w-full" />
                <img v-if="config.logo" :src="config.logo" alt="Logo" class="h-24 mt-2 border" />
              </div>
              <div class="space-y-2">
                <label class="font-bold">Hình ảnh Linh vật:</label>
                <input type="file" @change="handleMascotUpload" accept="image/*" class="w-full" />
                <img v-if="config.mascot" :src="config.mascot" alt="Linh vật" class="h-24 mt-2 border" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="font-bold">Thời gian bắt đầu:</label>
                <input v-model="config.startTime" type="datetime-local" required class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div class="space-y-2">
                <label class="font-bold">Thời gian đấu giá (phút):</label>
                <input v-model.number="config.auctionDuration" type="number" min="1" required class="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="font-bold">Số người trúng giải:</label>
                <input v-model.number="config.winnersCount" type="number" min="1" :max="products.length" required class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div class="space-y-2">
                <label class="font-bold">Số lần tham gia tối đa mỗi Gmail:</label>
                <input v-model.number="config.maxParticipations" type="number" min="1" required class="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-bold">Thể lệ chương trình:</label>
              <textarea v-model="config.rules" rows="4" placeholder="Nhập thể lệ chương trình..." required class="w-full px-3 py-2 border rounded-lg"></textarea>
            </div>

            <div>
              <h3 class="text-xl font-bold mb-4">Danh sách sản phẩm đấu giá</h3>
              <div class="space-y-4">
                <div class="hidden md:grid grid-cols-5 gap-4 font-bold border-b pb-2">
                  <span>Hình ảnh</span>
                  <span>Tên sản phẩm</span>
                  <span>Mô tả</span>
                  <span>Giá khởi điểm</span>
                  <span>Thao tác</span>
                </div>
                <div v-for="(product, index) in products" :key="index" class="grid grid-cols-1 md:grid-cols-5 gap-4 items-center border-b py-2">
                  <div class="space-y-2">
                    <input type="file" @change="(e) => handleProductImageUpload(index, e)" accept="image/*" class="w-full text-sm" />
                    <img v-if="product.image" :src="product.image" alt="Product" class="h-16 border" />
                  </div>
                  <input v-model="product.name" placeholder="Tên sản phẩm" required class="px-3 py-2 border rounded-lg" />
                  <input v-model="product.description" placeholder="Mô tả" class="px-3 py-2 border rounded-lg" />
                  <input v-model.number="product.startPrice" type="number" placeholder="Giá khởi điểm" min="0" required class="px-3 py-2 border rounded-lg" />
                  <button type="button" @click="removeProduct(index)" class="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600">Xóa</button>
                </div>
              </div>
              <button type="button" @click="addProduct" class="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                Thêm sản phẩm
              </button>
            </div>

            <button type="submit" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 self-start">
              Lưu cấu hình
            </button>
          </form>
        </div>

        <!-- Chi tiết Đấu giá -->
        <div v-if="activeTab === 'auction'">
          <h2 class="text-2xl font-bold mb-4">Chi tiết Đấu giá</h2>
          <div v-if="auctionDetails.length === 0" class="text-center text-gray-500 italic">Chưa có dữ liệu đấu giá</div>
          <div v-else class="space-y-4">
            <div v-for="detail in auctionDetails" :key="detail.productId" class="p-4 border rounded-lg bg-white shadow-md">
              <h3 class="text-xl font-bold">{{ detail.productName }}</h3>
              <p class="text-lg">Giá cao nhất: <span class="font-semibold">{{ detail.highestBid }}</span></p>
              <p class="text-lg">Người thắng: <span class="font-semibold">{{ detail.winners.join(', ') }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const activeTab = ref('config')
const config = ref({
  logo: '',
  mascot: '',
  startTime: '',
  auctionDuration: 60,
  winnersCount: 1,
  maxParticipations: 3,
  rules: ''
})
const products = ref([])
const auctionDetails = ref([])

onMounted(async () => {
  await loadConfig()
  await loadProducts()
  await loadAuctionDetails()
  // Load auction details every 5 seconds
  setInterval(loadAuctionDetails, 5000)
})

const loadConfig = async () => {
  try {
    const data = await $fetch('/api/game-config')
    if (data) {
      Object.assign(config.value, data)
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

const loadProducts = async () => {
  try {
    const data = await $fetch('/api/products')
    if (data) {
      products.value = data
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const loadAuctionDetails = async () => {
  try {
    const data = await $fetch('/api/auction-details')
    if (data) {
      auctionDetails.value = data
    }
  } catch (error) {
    console.error('Failed to load auction details:', error)
  }
}

const handleImageUpload = async (file, callback) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result
        const response = await $fetch('/api/upload-image', {
          method: 'POST',
          body: { image: base64 }
        })
        callback(response.path)
      } catch (error) {
        alert('Lỗi khi tải ảnh lên: ' + error.message)
      }
    }
    reader.readAsDataURL(file)
  }
}

const handleLogoUpload = (event) => {
  handleImageUpload(event.target.files[0], (result) => {
    config.value.logo = result
  })
}

const handleMascotUpload = (event) => {
  handleImageUpload(event.target.files[0], (result) => {
    config.value.mascot = result
  })
}

const handleProductImageUpload = (index, event) => {
  handleImageUpload(event.target.files[0], (result) => {
    products.value[index].image = result
  })
}

const addProduct = () => {
  products.value.push({ name: '', description: '', startPrice: 0, image: '' })
}

const removeProduct = (index) => {
  products.value.splice(index, 1)
}

const saveConfig = async () => {
  try {
    await $fetch('/api/game-config', {
      method: 'POST',
      body: { config: config.value, products: products.value }
    })
    alert('Cấu hình đã được lưu!')
    // Cập nhật lại thông tin sau khi lưu
    await loadConfig()
    await loadProducts()
  } catch (error) {
    alert('Lỗi khi lưu cấu hình: ' + error.message)
  }
}

const logout = () => {
  navigateTo('/admin')
}
</script>