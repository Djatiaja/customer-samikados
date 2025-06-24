<template>
  <header class="bg-gradient-to-r from-red-600 to-black text-white p-4">
    <div class="container mx-auto">
      <!-- Mobile Menu -->
      <div class="flex justify-between items-center lg:hidden">
        <router-link to="/home" class="flex-shrink-0">
          <h1 class="text-2xl font-bold">SAMIKADOS</h1>
        </router-link>

        <div class="flex items-center space-x-3">
          <router-link to="/cart">
            <img src="/icons/cart.svg" alt="Cart Icon" class="w-7 h-7" />
          </router-link>

          <button @click="toggleMobileMenu" class="p-1">
            <img src="/icons/bars-solid.svg" alt="Menu" class="w-6 h-6" v-if="!mobileMenuOpen" />
            <img src="/icons/bars-solid.svg" alt="Close" class="w-6 h-6" v-else />
          </button>
        </div>
      </div>

      <!-- Mobile Search (when menu is open) -->
      <div v-if="mobileMenuOpen" class="mt-4 space-y-4 lg:hidden">
        <div class="relative w-full">
          <input
            type="text"
            v-model="locationQuery"
            placeholder="Cari kota, area, atau lokasi"
            class="w-full pl-5 pr-10 py-2 rounded-full text-black focus:outline-none bg-white focus:ring-2 focus:ring-white location-input"
            @focus="showLocationDropdown = true"
            @input="handleLocationSearch"
            @keyup.enter="performLocationSearch"
          />
          <img
            :src="locationQuery ? '/icons/close.svg' : '/icons/location.svg'"
            class="absolute right-3 top-3 w-4 h-4 cursor-pointer"
            @click="clearLocationSelection"
            alt="Location Icon"
          />

          <!-- Location Dropdown -->
          <div
            v-if="showLocationDropdown && locationResults.length > 0"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-64 overflow-y-auto location-dropdown"
          >
            <div class="p-2">
              <div class="text-gray-500 text-sm mb-2">HASIL PENCARIAN LOKASI</div>
              <div
                v-for="location in locationResults.slice(0, 5)"
                :key="location.id"
                class="flex items-center text-gray-700 py-2 cursor-pointer hover:bg-gray-100"
                @click="selectLocation(location)"
              >
                <img src="/icons/location.svg" class="mr-2 w-4 h-4" alt="Location Icon" />
                <span>{{ location.name }}, {{ location.province }}</span>
              </div>

              <div v-if="locationResults.length > 5" class="p-2 text-center border-t">
                <button
                  @click="viewAllResults('location')"
                  class="text-red-600 hover:text-red-700 font-medium"
                >
                  Lihat semua {{ locationResults.length }} hasil lokasi
                </button>
              </div>
            </div>
          </div>

          <!-- Location Loading Indicator -->
          <div
            v-if="isLocationSearching"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
          >
            <div class="p-4 text-gray-500 text-center">Mencari lokasi...</div>
          </div>
        </div>

        <div class="relative w-full">
          <input
            type="text"
            v-model="productQuery"
            placeholder="Cari Produk.."
            class="w-full pl-10 pr-10 py-2 rounded-full text-black focus:outline-none bg-white focus:ring-2 focus:ring-white"
            @input="handleProductSearch"
            @keyup.enter="performProductSearch"
          />
          <img
            src="/icons/search.svg"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer"
            @click="performProductSearch"
            alt="Search Icon"
          />
          <img
            v-if="productQuery"
            src="/icons/close.svg"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer"
            @click="clearProductSearch"
            alt="Clear Search"
          />

          <!-- Product Search Results Dropdown -->
          <div
            v-if="showProductDropdown && searchResults.length > 0"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-80 overflow-y-auto"
          >
            <div class="p-2">
              <div class="text-gray-500 text-sm mb-2">HASIL PENCARIAN PRODUK</div>
              <div
                v-for="product in searchResults.slice(0, 5)"
                :key="product.id"
                class="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded"
                @click="selectProduct(product)"
              >
                <img
                  :src="product.thumbnail_url"
                  :alt="product.name"
                  class="w-12 h-12 object-cover rounded mr-3"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-800">{{ product.name }}</div>
                  <div class="text-red-600 font-semibold">
                    Rp{{ product.price.toLocaleString('id-ID') }}
                  </div>
                  <div class="text-gray-500 text-sm">{{ product.category.name }}</div>
                </div>
              </div>

              <div v-if="searchResults.length > 5" class="p-2 text-center border-t">
                <button
                  @click="viewAllResults('product')"
                  class="text-red-600 hover:text-red-700 font-medium"
                >
                  Lihat semua {{ searchResults.length }} hasil
                </button>
              </div>
            </div>
          </div>

          <!-- No Results Message -->
          <div
            v-if="showProductDropdown && searchResults.length === 0 && productQuery && !isSearching"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
          >
            <div class="p-4 text-gray-500 text-center">
              Tidak ada produk yang ditemukan untuk "{{ productQuery }}"
            </div>
          </div>

          <!-- Loading Indicator -->
          <div
            v-if="isSearching"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
          >
            <div class="p-4 text-gray-500 text-center">Mencari produk...</div>
          </div>
        </div>

        <!-- Mobile Navigation Icons (Centered) -->
        <nav class="flex justify-center items-center space-x-8">
          <router-link to="/orders" class="flex flex-col items-center">
            <img
              :src="isActive('/orders') ? '/icons/order-active.svg' : '/icons/order.svg'"
              alt="Orders"
              class="w-6 h-6"
            />
          </router-link>

          <router-link to="/notifications" class="flex flex-col items-center relative">
            <img
              :src="
                isActive('/notifications')
                  ? '/icons/notification-active.svg'
                  : '/icons/notification.svg'
              "
              alt="Notifications"
              class="w-6 h-6"
            />
            <span
              v-if="unreadNotifications > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
            </span>
          </router-link>

          <router-link to="/account-settings" class="flex flex-col items-center">
            <img
              :src="
                isActive('/account-settings') ? '/icons/profile-active.svg' : '/icons/profile.svg'
              "
              alt="Profile"
              class="w-6 h-6"
            />
          </router-link>
        </nav>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden lg:flex lg:justify-between lg:items-center">
        <router-link to="/home">
          <h1 class="text-3xl font-bold">SAMIKADOS</h1>
        </router-link>

        <!-- Pencarian Lokasi -->
        <div class="relative w-1/4 mx-4">
          <div class="relative">
            <input
              type="text"
              v-model="locationQuery"
              placeholder="Cari kota, area, atau lokasi"
              autocomplete="off"
              class="w-full pl-5 pr-10 py-2 rounded-full text-black focus:outline-none bg-white focus:ring-2 focus:ring-white location-input"
              @focus="showLocationDropdown = true"
              @input="handleLocationSearch"
              @keyup.enter="performLocationSearch"
            />
            <img
              :src="locationQuery ? '/icons/close.svg' : '/icons/location.svg'"
              class="absolute right-3 top-3 w-4 h-4 cursor-pointer"
              @click="clearLocationSelection"
              alt="Location Icon"
            />

            <!-- Location Dropdown -->
            <div
              v-if="showLocationDropdown && locationResults.length > 0"
              class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-64 overflow-y-auto location-dropdown"
            >
              <div class="p-2">
                <div class="text-gray-500 text-sm mb-2">HASIL PENCARIAN LOKASI</div>
                <div
                  v-for="location in locationResults.slice(0, 5)"
                  :key="location.id"
                  class="flex items-center text-gray-700 py-2 cursor-pointer hover:bg-gray-100"
                  @click="selectLocation(location)"
                >
                  <img src="/icons/location.svg" class="mr-2 w-4 h-4" alt="Location Icon" />
                  <span>{{ location.name }}, {{ location.province }}</span>
                </div>

                <div v-if="locationResults.length > 5" class="p-2 text-center border-t">
                  <button
                    @click="viewAllResults('location')"
                    class="text-red-600 hover:text-red-700 font-medium"
                  >
                    Lihat semua {{ locationResults.length }} hasil lokasi
                  </button>
                </div>
              </div>
            </div>

            <!-- Location Loading Indicator -->
            <div
              v-if="isLocationSearching"
              class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
            >
              <div class="p-4 text-gray-500 text-center">Mencari lokasi...</div>
            </div>
          </div>
        </div>

        <!-- Pencarian Produk -->
        <div class="relative w-1/3 mx-4">
          <input
            type="text"
            v-model="productQuery"
            placeholder="Cari Produk.."
            class="w-full pl-10 pr-10 py-2 rounded-full text-black focus:outline-none bg-white focus:ring-2 focus:ring-white"
            @input="handleProductSearch"
            @keyup.enter="performProductSearch"
          />
          <img
            src="/icons/search.svg"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer"
            alt="Search Icon"
            @click="performProductSearch"
          />
          <img
            v-if="productQuery"
            src="/icons/close.svg"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer"
            @click="clearProductSearch"
            alt="Clear Search"
          />

          <!-- Product Search Results Dropdown -->
          <div
            v-if="showProductDropdown && searchResults.length > 0"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-80 overflow-y-auto"
          >
            <div class="p-2">
              <div class="text-gray-500 text-sm mb-2">HASIL PENCARIAN PRODUK</div>
              <div
                v-for="product in searchResults.slice(0, 5)"
                :key="product.id"
                class="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded"
                @click="selectProduct(product)"
              >
                <img
                  :src="product.thumbnail_url"
                  :alt="product.name"
                  class="w-12 h-12 object-cover rounded mr-3"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-800">{{ product.name }}</div>
                  <div class="text-red-600 font-semibold">
                    Rp{{ product.price.toLocaleString('id-ID') }}
                  </div>
                  <div class="text-gray-500 text-sm">{{ product.category.name }}</div>
                </div>
              </div>

              <div v-if="searchResults.length > 5" class="p-2 text-center border-t">
                <button
                  @click="viewAllResults('product')"
                  class="text-red-600 hover:text-red-700 font-medium"
                >
                  Lihat semua {{ searchResults.length }} hasil
                </button>
              </div>
            </div>
          </div>

          <!-- No Results Message -->
          <div
            v-if="showProductDropdown && searchResults.length === 0 && productQuery && !isSearching"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
          >
            <div class="p-4 text-gray-500 text-center">
              Tidak ada produk yang ditemukan untuk "{{ productQuery }}"
            </div>
          </div>

          <!-- Loading Indicator -->
          <div
            v-if="isSearching"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
          >
            <div class="p-4 text-gray-500 text-center">Mencari produk...</div>
          </div>
        </div>

        <!-- Ikon Navigasi -->
        <div class="flex items-center space-x-4">
          <router-link to="/cart">
            <img
              :src="isActive('/cart') ? '/icons/cart-active.svg' : '/icons/cart.svg'"
              alt="Cart Icon"
              class="w-7.5 h-7.5"
            />
          </router-link>

          <router-link to="/orders">
            <img
              :src="isActive('/orders') ? '/icons/order-active.svg' : '/icons/order.svg'"
              alt="Order Icon"
              class="w-7 h-7"
            />
          </router-link>

          <router-link to="/notifications" class="relative">
            <img
              :src="
                isActive('/notifications')
                  ? '/icons/notification-active.svg'
                  : '/icons/notification.svg'
              "
              alt="Notification Icon"
              class="w-6.5 h-6.5"
            />
            <span
              v-if="unreadNotifications > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
            </span>
          </router-link>

          <router-link to="/account-settings" class="flex items-center space-x-2">
            <img
              :src="
                isActive('/account-settings') ? '/icons/profile-active.svg' : '/icons/profile.svg'
              "
              alt="User Icon"
              class="w-6.5 h-6.5"
            />
            <span class="hidden md:inline">{{ userName || 'AnastasiaPutri' }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const locationQuery = ref('')
const productQuery = ref('')
const showLocationDropdown = ref(false)
const showProductDropdown = ref(false)
const mobileMenuOpen = ref(false)
const selectedLocation = ref(null)
const unreadNotifications = ref(0)
const notificationTimer = ref(null)
const userName = ref('')
const searchResults = ref([])
const locationResults = ref([])
const isSearching = ref(false)
const isLocationSearching = ref(false)
const searchTimeout = ref(null)
const locationSearchTimeout = ref(null)

const base_url = import.meta.env.VITE_API_BASE_URL

// Check if a route is active
const isActive = (path) => {
  return route.path === path
}

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (!mobileMenuOpen.value) {
    showLocationDropdown.value = false
    showProductDropdown.value = false
  }
}

// Clear location selection
const clearLocationSelection = () => {
  locationQuery.value = ''
  selectedLocation.value = null
  locationResults.value = []
  showLocationDropdown.value = false
  if (locationSearchTimeout.value) {
    clearTimeout(locationSearchTimeout.value)
  }
}

// Clear product search
const clearProductSearch = () => {
  productQuery.value = ''
  searchResults.value = []
  showProductDropdown.value = false
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
}

// Handle location search with debouncing
const handleLocationSearch = () => {
  if (locationSearchTimeout.value) {
    clearTimeout(locationSearchTimeout.value)
  }

  if (!locationQuery.value.trim()) {
    locationResults.value = []
    showLocationDropdown.value = false
    return
  }

  locationSearchTimeout.value = setTimeout(() => {
    performLocationSearch(true)
  }, 500) // Debounce for 500ms
}

// Perform location-based search
const performLocationSearch = async (isDropdown = false) => {
  if (!locationQuery.value.trim()) {
    locationResults.value = []
    showLocationDropdown.value = false
    return
  }

  try {
    isLocationSearching.value = true
    if (isDropdown) {
      showLocationDropdown.value = true
    }

    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Token autentikasi tidak ada')
    }

    const response = await axios.get(`${base_url}/search/address`, {
      params: {
        query: locationQuery.value.trim(),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.data.status === 'success') {
      locationResults.value = response.data.data.locations || []
      searchResults.value = response.data.data.products || []
      if (!isDropdown && searchResults.value.length > 0) {
        router.push(`/search-results?address=${encodeURIComponent(locationQuery.value)}`)
      }
    } else {
      throw new Error(response.data.message || 'Gagal melakukan pencarian lokasi')
    }
  } catch (error) {
    console.error('Location search error:', error)
    locationResults.value = []
    searchResults.value = []

    if (error.response?.status === 401) {
      Swal.fire({
        icon: 'error',
        title: 'Sesi Berakhir',
        text: 'Silakan login kembali',
        confirmButtonText: 'OK',
      }).then(() => {
        router.push('/login')
      })
    }
  } finally {
    isLocationSearching.value = false
  }
}

// Handle product search with debouncing
const handleProductSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (!productQuery.value.trim()) {
    searchResults.value = []
    showProductDropdown.value = false
    return
  }

  searchTimeout.value = setTimeout(() => {
    performProductSearch()
  }, 500) // Debounce for 500ms
}

// Perform product search
const performProductSearch = async () => {
  if (!productQuery.value.trim()) {
    searchResults.value = []
    showProductDropdown.value = false
    return
  }

  try {
    isSearching.value = true
    showProductDropdown.value = true

    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Token autentikasi tidak ada')
    }

    const response = await axios.get(`${base_url}/search`, {
      params: {
        query: productQuery.value.trim(),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.data.status === 'success') {
      searchResults.value = response.data.data || []
    } else {
      throw new Error(response.data.message || 'Gagal melakukan pencarian')
    }
  } catch (error) {
    console.error('Product search error:', error)
    searchResults.value = []

    if (error.response?.status === 401) {
      Swal.fire({
        icon: 'error',
        title: 'Sesi Berakhir',
        text: 'Silakan login kembali',
        confirmButtonText: 'OK',
      }).then(() => {
        router.push('/login')
      })
    }
  } finally {
    isSearching.value = false
  }
}

// Select a location
const selectLocation = (location) => {
  selectedLocation.value = location
  locationQuery.value = `${location.name}, ${location.province}`
  showLocationDropdown.value = false
  performLocationSearch()
}

// Select a product from search results
const selectProduct = (product) => {
  showProductDropdown.value = false
  router.push(`/product-details/${product.id}`)
}

// View all search results
const viewAllResults = (type) => {
  showProductDropdown.value = false
  showLocationDropdown.value = false
  if (type === 'product') {
    router.push(`/search-results?query=${encodeURIComponent(productQuery.value)}`)
  } else {
    router.push(`/search-results?address=${encodeURIComponent(locationQuery.value)}`)
  }
}

// Fetch notification count
const fetchNotificationCount = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No authentication token found')
      return
    }

    const response = await axios.get(`${base_url}/seller/notifikasi/count`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.data.status === 'success') {
      unreadNotifications.value = response.data.data.belum_terbaca
    } else {
      throw new Error(response.data.message || 'Gagal memuat jumlah notifikasi')
    }
  } catch (error) {
    console.error('Fetch notification count error:', error)
  }
}

// Fetch user profile for username
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No authentication token found')
      return
    }

    const response = await axios.get(`${base_url}/customer/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.data.status === 'success') {
      userName.value = response.data.data.name || 'AnastasiaPutra'
    } else {
      throw new Error(response.data.message || 'Gagal memuat profil')
    }
  } catch (error) {
    console.error('Fetch user profile error:', error)
  }
}

// Handler for clicking outside the dropdown
const handleClickOutside = (event) => {
  const locationDropdown = document.querySelector('.location-dropdown')
  const locationInput = document.querySelector('.location-input')

  if (showLocationDropdown.value && locationDropdown && locationInput) {
    if (!locationDropdown.contains(event.target) && !locationInput.contains(event.target)) {
      showLocationDropdown.value = false
    }
  }

  const productInput = document.querySelector('input[placeholder="Cari Produk.."]')
  const productDropdown = document.querySelector('.product-details')

  if (
    showProductDropdown.value &&
    productInput &&
    !productInput.contains(event.target) &&
    !productDropdown?.contains(event.target)
  ) {
    showProductDropdown.value = false
  }
}

// Add click outside listener and fetch initial data
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchNotificationCount()
  fetchUserProfile()

  notificationTimer.value = setInterval(() => {
    fetchNotificationCount()
  }, 60000)
})

// Clean up
onMounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (notificationTimer.value) {
    clearInterval(notificationTimer.value)
  }
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  if (locationSearchTimeout.value) {
    clearTimeout(locationSearchTimeout.value)
  }
})
</script>
