<template>
  <div class="bg-gray-50 min-h-screen">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-3">
             <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 16v-2m0-8v-2m0 16V4m6 6h2m-16 0h2m14 0h-2m-14 0H4m14 10h2m-16 0h2m4-14v2m0 16v-2m0-8V4m0 16v-2m0-8V4"></path></svg>
            <h1 class="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button @click="logout" class="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200">
            Đăng xuất
          </button>
        </div>
      </div>
    </header>

    <main class="container mx-auto p-4 sm:p-6 lg:p-8">
      <div class="mb-8">
        <div class="flex border-b border-gray-200">
          <button
            @click="setActiveTab('config')"
            :class="[
              'px-4 py-3 font-medium text-sm transition-colors duration-200',
              activeTab === 'config' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Cấu hình Sự kiện
          </button>
          <button
            @click="setActiveTab('auction')"
            :class="[
              'px-4 py-3 font-medium text-sm transition-colors duration-200',
              activeTab === 'auction' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Kết quả Đấu giá
          </button>
        </div>
      </div>

      <!-- Cấu hình Mini Game -->
      <div v-show="activeTab === 'config'">
        <form @submit.prevent="saveConfig" class="space-y-12">
          <!-- Card Cấu hình chung -->
          <div class="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Cấu hình chung</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Upload Logo -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Logo Thương hiệu</label>
                <div class="mt-1 flex items-center space-x-4">
                  <img v-if="config.logo" :src="config.logo" alt="Logo" class="h-16 w-16 object-contain rounded-md bg-gray-100 p-1" />
                   <div class="h-16 w-16 flex items-center justify-center rounded-md bg-gray-100 text-gray-400" v-else>
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <input type="file" @change="handleLogoUpload" accept="image/*" class="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
              </div>
              <!-- Upload Linh vật -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Hình ảnh Linh vật</label>
                 <div class="mt-1 flex items-center space-x-4">
                  <img v-if="config.mascot" :src="config.mascot" alt="Linh vật" class="h-16 w-16 object-contain rounded-md bg-gray-100 p-1" />
                  <div class="h-16 w-16 flex items-center justify-center rounded-md bg-gray-100 text-gray-400" v-else>
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <input type="file" @change="handleMascotUpload" accept="image/*" class="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
              </div>
            </div>
            <div class="mt-6">
                <label for="rules" class="block text-sm font-medium text-gray-700">Thể lệ chương trình</label>
                <textarea id="rules" v-model="config.rules" rows="5" placeholder="Nhập thể lệ chương trình..." required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
              </div>
          </div>

          <!-- Card Sản phẩm -->
          <div class="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
             <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-gray-900">Sản phẩm đấu giá</h2>
              <button type="button" @click="addProduct" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Thêm sản phẩm
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Sản phẩm</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Giá khởi điểm</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thời gian bắt đầu</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thời gian đấu giá (phút)</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số người trúng giải</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số lượt đấu giá</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mô tả</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-if="products.length === 0">
                    <td colspan="8" class="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">Chưa có sản phẩm nào.</td>
                  </tr>
                  <tr v-for="(product, index) in products" :key="index">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div class="flex items-center">
                        <div class="h-16 w-16 flex-shrink-0">
                          <img class="h-16 w-16 object-contain rounded-md bg-gray-50" :src="product.image || 'https://via.placeholder.com/150'" alt="Product Image">
                        </div>
                        <div class="ml-4">
                           <input v-model="product.name" placeholder="Tên sản phẩm" required class="font-medium text-gray-900 border-gray-200 rounded-md" />
                           <input type="file" @change="(e) => handleProductImageUpload(index, e)" accept="image/*" class="mt-1 text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"/>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <input v-model.number="product.startPrice" type="number" placeholder="Giá" min="0" required class="w-32 border-gray-200 rounded-md" />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <input v-model="product.startTime" type="datetime-local" class="w-40 border-gray-200 rounded-md" />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <input v-model.number="product.auctionDuration" type="number" min="1" placeholder="60" class="w-20 border-gray-200 rounded-md" />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <input v-model.number="product.winnersCount" type="number" min="1" placeholder="1" class="w-20 border-gray-200 rounded-md" />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <input v-model.number="product.maxParticipations" type="number" min="1" placeholder="3" class="w-20 border-gray-200 rounded-md" />
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500">
                      <input v-model="product.description" placeholder="Mô tả ngắn" class="w-full border-gray-200 rounded-md" />
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button type="button" @click="removeProduct(index)" class="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end pt-8">
            <button type="submit" class="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>

      <!-- Chi tiết Đấu giá -->
       <div v-show="activeTab === 'auction'" class="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900">Kết quả Đấu giá</h2>
             <button @click="loadAuctionDetails" class="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16"></path></svg>
                <span>Cập nhật</span>
            </button>
        </div>
        <div v-if="auctionDetails.length === 0" class="text-center py-12 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zm2-10V5a2 2 0 012-2h10a2 2 0 012 2v2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Chưa có dữ liệu</h3>
          <p class="mt-1 text-sm text-gray-500">Dữ liệu đấu giá sẽ xuất hiện ở đây sau khi phiên đấu giá kết thúc.</p>
        </div>
        <div v-else class="space-y-6">
          <div v-for="detail in sortedAuctionDetails" :key="detail.productId" @click="showBidDetails(detail)" class="p-6 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200">
            <h3 class="text-lg font-semibold text-gray-800">{{ detail.productName }}</h3>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div class="bg-green-100 text-green-800 p-3 rounded-md">
                    <p class="font-medium">Dự đoán cao nhất</p>
                    <p class="font-bold text-xl">{{ formatCurrency(detail.highestBid) }}</p>
                </div>
                 <div class="bg-blue-100 text-blue-800 p-3 rounded-md">
                    <p class="font-medium">Thấp nhất trong top trúng</p>
                    <p class="font-bold text-xl">{{ formatCurrency(detail.lowestWinningBid) }}</p>
                </div>
            </div>
             <div class="mt-4">
                <h4 class="font-semibold text-gray-700">Danh sách trúng giải:</h4>
                <ul v-if="detail.winners.length > 0" class="mt-2 space-y-2">
                    <li v-for="(winner, index) in detail.winners" :key="index" class="p-2 bg-white rounded-md flex justify-between items-center text-sm">
                        <span class="font-mono text-gray-600">{{ winner.email }}</span>
                        <span class="font-semibold text-gray-800">{{ formatCurrency(winner.amount) }}</span>
                    </li>
                </ul>
                <p v-else class="text-sm text-gray-500 italic mt-2">Chưa có người trúng giải.</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bid Details Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div class="p-6 border-b flex justify-between items-center">
          <h2 v-if="selectedProductForBids" class="text-2xl font-bold text-gray-800">Chi tiết đấu giá: {{ selectedProductForBids.productName }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div v-if="isLoadingBids" class="text-center py-10">
            <p class="text-gray-500">Đang tải dữ liệu...</p>
          </div>
          <div v-else-if="detailedBids.length === 0" class="text-center py-10 text-gray-500">
            <p>Không có ai tham gia đấu giá cho sản phẩm này.</p>
          </div>
          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tham gia</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá dự đoán</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="bid in detailedBids" :key="bid._id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ bid.userEmail }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(bid.amount) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDateTime(bid.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-4 bg-gray-50 border-t flex justify-end">
          <button @click="closeModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Đóng</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const activeTab = ref('config')
const hasLoadedAuctionDetails = ref(false)
const config = ref({
  logo: '',
  mascot: '',
  rules: ''
})
const products = ref([])
const auctionDetails = ref([])

// New state for the modal
const detailedBids = ref([]);
const isModalOpen = ref(false);
const selectedProductForBids = ref(null);
const isLoadingBids = ref(false);


onMounted(async () => {
  // Tải config và danh sách sản phẩm song song để nhanh hơn
  await Promise.all([loadConfig(), loadProducts()])
})

const sortedAuctionDetails = computed(() => {
    return [...auctionDetails.value].sort((a, b) => {
        const productA = products.value.find(p => p._id === a.productId);
        const productB = products.value.find(p => p._id === b.productId);
        if (!productA || !productB) return 0;
        return productB.startPrice - productA.startPrice;
    });
});

const loadConfig = async () => {
  try {
    const data = await $fetch('/api/game-config')
    if (data) {
      Object.assign(config.value, data)
    }
  } catch (error) {
    console.error('Failed to load config:', error)
    alert('Không thể tải cấu hình.');
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
    alert('Không thể tải sản phẩm.');
  }
}

const loadAuctionDetails = async () => {
  try {
    const data = await $fetch('/api/auction-details')
    if (data) {
      auctionDetails.value = data
      hasLoadedAuctionDetails.value = true
    }
  } catch (error) {
    console.error('Failed to load auction details:', error)
    // Do not alert here to avoid bothering admin on auto-refresh
  }
}

const setActiveTab = async (tab) => {
  activeTab.value = tab

  // Chỉ gọi API chi tiết đấu giá khi cần và chỉ gọi 1 lần
  if (tab === 'auction' && !hasLoadedAuctionDetails.value) {
    await loadAuctionDetails()
  }
}

const showBidDetails = async (detail) => {
  selectedProductForBids.value = detail;
  isModalOpen.value = true;
  isLoadingBids.value = true;
  detailedBids.value = [];
  try {
    const bids = await $fetch(`/api/auction-bids/${detail.productId}`);
    detailedBids.value = bids;
  } catch (error) {
    console.error('Failed to load bid details:', error);
    alert('Không thể tải chi tiết các lượt đấu giá.');
    closeModal(); // Close modal on error
  } finally {
    isLoadingBids.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedProductForBids.value = null;
  detailedBids.value = [];
};

const handleImageUpload = async (file) => {
  if (!file) return null;
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await $fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });
    return response.path;
  } catch (error) {
    alert('Lỗi khi tải ảnh lên: ' + (error.data?.message || error.message));
    return null;
  }
}

const handleLogoUpload = async (event) => {
  const path = await handleImageUpload(event.target.files[0])
  if(path) config.value.logo = path
}

const handleMascotUpload = async (event) => {
  const path = await handleImageUpload(event.target.files[0])
  if(path) config.value.mascot = path
}

const handleProductImageUpload = async (index, event) => {
  const path = await handleImageUpload(event.target.files[0])
  if(path) products.value[index].image = path
}

const addProduct = () => {
  products.value.unshift({ name: '', description: '', startPrice: 0, image: '', startTime: '', auctionDuration: 60, winnersCount: 1, maxParticipations: 3 })
}

const removeProduct = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
    products.value.splice(index, 1)
  }
}

const saveConfig = async () => {
  try {
    const configToSave = { ...config.value };

    await $fetch('/api/game-config', {
      method: 'POST',
      body: { config: configToSave, products: products.value }
    })
    alert('Cấu hình đã được lưu thành công!')
    await loadConfig() // Reload to reflect saved state
    await loadProducts()
  } catch (error) {
    alert('Lỗi khi lưu cấu hình: ' + (error.data?.message || error.message))
  }
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  // Using vi-VN locale for a familiar date and time format
  return d.toLocaleString('vi-VN', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
};

const logout = () => {
  // Here you might want to clear any admin session/token
  navigateTo('/admin')
}
</script>