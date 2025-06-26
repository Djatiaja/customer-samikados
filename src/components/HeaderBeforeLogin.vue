<template>
  <header class="bg-gradient-to-r from-red-600 to-black text-white p-4">
    <div class="container mx-auto">
      <!-- Mobile Menu -->
      <div class="flex justify-between items-center lg:hidden">
        <router-link to="/" class="flex-shrink-0">
          <h1 class="text-2xl font-bold">SAMIKADOS</h1>
        </router-link>

        <div class="flex items-center space-x-3">
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

          <!-- Location Products Dropdown -->
          <div
            v-if="showLocationDropdown && locationProducts.length > 0"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-80 overflow-y-auto location-dropdown"
          >
            <div class="p-2">
              <div class="text-gray-500 text-sm mb-2">
                PRODUK DI {{ locationQuery.toUpperCase() }}
              </div>
              <div
                v-for="product in locationProducts.slice(0, 5)"
                :key="product.id"
                class="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded"
                @click="selectLocationProduct(product)"
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
                  <div class="text-gray-500 text-sm">{{ product.seller_name }}</div>
                  <div
                    class="text-gray-400 text-xs"
                    v-if="product.addresses && product.addresses.length > 0"
                  >
                    {{ product.addresses[0].city_name }}, {{ product.addresses[0].province_name }}
                  </div>
                </div>
              </div>

              <div v-if="locationProducts.length > 5" class="p-2 text-center border-t">
                <button
                  @click="viewAllResults('location')"
                  class="text-red-600 hover:text-red-700 font-medium"
                >
                  Lihat semua {{ locationProducts.length }} hasil di {{ locationQuery }}
                </button>
              </div>
            </div>
          </div>

          <!-- No Location Results Message -->
          <div
            v-if="
              showLocationDropdown &&
              locationProducts.length === 0 &&
              locationQuery &&
              !isLocationSearching
            "
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
          >
            <div class="p-4 text-gray-500 text-center">
              Tidak ada produk yang ditemukan di "{{ locationQuery }}"
            </div>
          </div>

          <!-- Location Loading Indicator -->
          <div
            v-if="isLocationSearching"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
          >
            <div class="p-4 text-gray-500 text-center">Mencari produk di lokasi...</div>
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

        <!-- Login/Register Links for Mobile -->
        <div class="flex justify-center space-x-4 pt-4 border-t border-red-400">
          <button @click="goToLogin" class="text-white hover:underline">LOGIN</button>
          <span>|</span>
          <button @click="goToRegister" class="text-white hover:underline">REGISTER</button>
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden lg:flex lg:justify-between lg:items-center">
        <router-link to="/">
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

            <!-- Location Products Dropdown -->
            <div
              v-if="showLocationDropdown && locationProducts.length > 0"
              class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-80 overflow-y-auto location-dropdown"
            >
              <div class="p-2">
                <div class="text-gray-500 text-sm mb-2">
                  PRODUK DI {{ locationQuery.toUpperCase() }}
                </div>
                <div
                  v-for="product in locationProducts.slice(0, 5)"
                  :key="product.id"
                  class="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded"
                  @click="selectLocationProduct(product)"
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
                    <div class="text-gray-500 text-sm">{{ product.seller_name }}</div>
                    <div
                      class="text-gray-400 text-xs"
                      v-if="product.addresses && product.addresses.length > 0"
                    >
                      {{ product.addresses[0].city_name }}, {{ product.addresses[0].province_name }}
                    </div>
                  </div>
                </div>

                <div v-if="locationProducts.length > 5" class="p-2 text-center border-t">
                  <button
                    @click="viewAllResults('location')"
                    class="text-red-600 hover:text-red-700 font-medium"
                  >
                    Lihat semua {{ locationProducts.length }} hasil di {{ locationQuery }}
                  </button>
                </div>
              </div>
            </div>

            <!-- No Location Results Message -->
            <div
              v-if="
                showLocationDropdown &&
                locationProducts.length === 0 &&
                locationQuery &&
                !isLocationSearching
              "
              class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
            >
              <div class="p-4 text-gray-500 text-center">
                Tidak ada produk yang ditemukan di "{{ locationQuery }}"
              </div>
            </div>

            <!-- Location Loading Indicator -->
            <div
              v-if="isLocationSearching"
              class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black"
            >
              <div class="p-4 text-gray-500 text-center">Mencari produk di lokasi...</div>
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

        <!-- Login/Register Links -->
        <div class="flex items-center space-x-4">
          <button @click="goToLogin" class="text-white hover:underline font-medium">LOGIN</button>
          <span class="text-white">|</span>
          <button @click="goToRegister" class="text-white hover:underline font-medium">
            REGISTER
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const router = useRouter()
const locationQuery = ref('')
const productQuery = ref('')
const showLocationDropdown = ref(false)
const showProductDropdown = ref(false)
const mobileMenuOpen = ref(false)
const searchResults = ref([])
const locationProducts = ref([])
const isSearching = ref(false)
const isLocationSearching = ref(false)
const searchTimeout = ref(null)
const locationSearchTimeout = ref(null)

const base_url = import.meta.env.VITE_API_BASE_URL

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (!mobileMenuOpen.value) {
    showLocationDropdown.value = false
    showProductDropdown.value = false
  }
}

// Navigation functions
const goToLogin = () => {
  const token = localStorage.getItem('token')
  if (token) {
    localStorage.removeItem('token')
  }
  router.push('/login')
}

const goToRegister = () => {
  const token = localStorage.getItem('token')
  if (token) {
    localStorage.removeItem('token')
  }
  router.push('/register')
}

// Clear location selection
const clearLocationSelection = () => {
  locationQuery.value = ''
  locationProducts.value = []
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
    locationProducts.value = []
    showLocationDropdown.value = false
    return
  }

  locationSearchTimeout.value = setTimeout(() => {
    performLocationSearch(true)
  }, 500)
}

// Perform location-based search without authentication
const performLocationSearch = async (isDropdown = false) => {
  if (!locationQuery.value.trim()) {
    locationProducts.value = []
    showLocationDropdown.value = false
    return
  }

  try {
    isLocationSearching.value = true
    if (isDropdown) {
      showLocationDropdown.value = true
    }

    // Try to search without authentication first
    const response = await axios.get(`${base_url}/search/address`, {
      params: {
        query: locationQuery.value.trim(),
      },
    })

    if (response.data.status === 'success') {
      locationProducts.value = response.data.data.products || []

      if (!isDropdown && locationProducts.value.length > 0) {
        router.push(`/search-results?address=${encodeURIComponent(locationQuery.value)}`)
      }
    } else {
      throw new Error(response.data.message || 'Gagal melakukan pencarian lokasi')
    }
  } catch (error) {
    console.error('Location search error:', error)
    locationProducts.value = []

    // If search requires authentication, redirect to login
    if (error.response?.status === 401) {
      Swal.fire({
        icon: 'info',
        title: 'Login Diperlukan',
        text: 'Silakan login untuk menggunakan fitur pencarian',
        confirmButtonText: 'Login Sekarang',
        showCancelButton: true,
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login')
        }
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
  }, 500)
}

// Perform product search without authentication
const performProductSearch = async () => {
  if (!productQuery.value.trim()) {
    searchResults.value = []
    showProductDropdown.value = false
    return
  }

  try {
    isSearching.value = true
    showProductDropdown.value = true

    // Try to search without authentication first
    const response = await axios.get(`${base_url}/search`, {
      params: {
        query: productQuery.value.trim(),
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

    // If search requires authentication, redirect to login
    if (error.response?.status === 401) {
      Swal.fire({
        icon: 'info',
        title: 'Login Diperlukan',
        text: 'Silakan login untuk menggunakan fitur pencarian',
        confirmButtonText: 'Login Sekarang',
        showCancelButton: true,
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login')
        }
      })
    }
  } finally {
    isSearching.value = false
  }
}

// Select a location product from search results
const selectLocationProduct = (product) => {
  showLocationDropdown.value = false
  // For before login, redirect to login first or show product details if accessible
  router.push(`/product-details/${product.id}`)
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
  } else if (type === 'location') {
    router.push(`/search-results?address=${encodeURIComponent(locationQuery.value)}`)
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
  const productDropdown = document.querySelector('.product-dropdown')

  if (
    showProductDropdown.value &&
    productInput &&
    !productInput.contains(event.target) &&
    !productDropdown?.contains(event.target)
  ) {
    showProductDropdown.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  if (locationSearchTimeout.value) {
    clearTimeout(locationSearchTimeout.value)
  }
})
</script>
