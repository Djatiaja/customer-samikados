<!-- eslint-disable vue/no-parsing-error -->
<template>
  <div class="flex flex-col min-h-screen">
    <!-- Dynamically render header based on authentication status -->
    <HeaderAfterLogin
      v-if="isLoggedIn"
      @search-product="handleProductSearch"
      @search-location="handleLocationSearch"
    />
    <HeaderBeforeLogin
      v-else
      @search-product="handleProductSearch"
      @search-location="handleLocationSearch"
    />

    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <!-- Search Results -->
      <div class="container mx-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-md sm:text-lg md:text-xl font-bold">
            Hasil Pencarian untuk "{{ searchQuery || locationQuery }}"
          </h2>
          <div v-if="totalProducts > 0" class="text-sm text-gray-600">
            Menampilkan {{ startIndex }}-{{ endIndex }} dari {{ totalProducts }} produk
          </div>
        </div>

        <div v-if="loadingProducts" class="text-center py-8 text-gray-600">Memuat produk...</div>
        <div v-else-if="!products.length" class="text-center py-8 text-gray-600">
          Tidak ada produk ditemukan untuk "{{ searchQuery || locationQuery }}"
        </div>
        <div v-else>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <ProductCard1
              v-for="product in products"
              :key="product.id"
              :id="product.id"
              :name="product.name"
              :price="product.price"
              :link="product.link"
              :image="product.image"
              :seller-name="product.sellerName"
              :address="product.address"
            />
          </div>

          <!-- Pagination Component -->
          <div
            v-if="totalPages > 1"
            class="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0"
          >
            <div class="text-sm text-gray-600">Halaman {{ currentPage }} dari {{ totalPages }}</div>

            <div class="flex items-center space-x-2">
              <!-- Previous Button -->
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <<
              </button>

              <!-- Page Numbers -->
              <div class="hidden sm:flex items-center space-x-1">
                <!-- First page -->
                <button
                  v-if="startPage > 1"
                  @click="goToPage(1)"
                  class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  1
                </button>
                <span v-if="startPage > 2" class="px-2 text-gray-500">...</span>

                <!-- Visible page numbers -->
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="{
                    'bg-red-600 text-white border-red-600': page === currentPage,
                    'text-gray-700 bg-white border-gray-300 hover:bg-gray-50': page !== currentPage,
                  }"
                  class="px-3 py-2 text-sm font-medium border rounded-md"
                >
                  {{ page }}
                </button>

                <!-- Last page -->
                <span v-if="endPage < totalPages - 1" class="px-2 text-gray-500">...</span>
                <button
                  v-if="endPage < totalPages"
                  @click="goToPage(totalPages)"
                  class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {{ totalPages }}
                </button>
              </div>

              <!-- Mobile page info -->
              <div class="sm:hidden text-sm text-gray-600">
                {{ currentPage }} / {{ totalPages }}
              </div>

              <!-- Next Button -->
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                >>
              </button>
            </div>

            <!-- Items per page selector -->
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Per halaman:</span>
              <select
                v-model="itemsPerPage"
                @change="changeItemsPerPage"
                class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AuthFooter />
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

import AuthFooter from '@/components/AuthFooter.vue'
import ProductCard1 from '@/components/ProductCard1.vue'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import HeaderBeforeLogin from '@/components/HeaderBeforeLogin.vue'

export default {
  components: { HeaderAfterLogin, HeaderBeforeLogin, AuthFooter, ProductCard1 },
  setup() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const route = useRoute()
    const router = useRouter()
    const products = ref([])
    const loadingProducts = ref(false)
    const searchQuery = ref('')
    const locationQuery = ref('')

    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    const totalProducts = ref(0)
    const totalPages = ref(0)

    // Check if user is logged in by checking for token in localStorage
    const isLoggedIn = computed(() => {
      return !!localStorage.getItem('token')
    })

    // Pagination computed properties
    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1
    })

    const endIndex = computed(() => {
      const end = currentPage.value * itemsPerPage.value
      return end > totalProducts.value ? totalProducts.value : end
    })

    const startPage = computed(() => {
      return Math.max(1, currentPage.value - 2)
    })

    const endPage = computed(() => {
      return Math.min(totalPages.value, currentPage.value + 2)
    })

    const visiblePages = computed(() => {
      const pages = []
      for (let i = startPage.value; i <= endPage.value; i++) {
        pages.push(i)
      }
      return pages
    })

    // Debounce function
    const debounce = (func, wait) => {
      let timeout
      return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
      }
    }

    // Store all products from API
    const allProducts = ref([])

    // Fetch products based on query or address
    const fetchProducts = async (query, isLocationSearch = false) => {
      if (!query.trim()) {
        allProducts.value = []
        products.value = []
        totalProducts.value = 0
        totalPages.value = 0
        return
      }

      try {
        loadingProducts.value = true
        const token = localStorage.getItem('token')
        const endpoint = isLocationSearch ? `${baseUrl}/search/address` : `${baseUrl}/search`
        const config = token
          ? {
              headers: { Authorization: `Bearer ${token}` },
              params: { query: query.trim() },
            }
          : {
              params: { query: query.trim() },
            }

        const response = await axios.get(endpoint, config)

        if (response.data.status === 'success') {
          const responseData = response.data.data

          // Handle different response structures
          let rawProducts = []

          if (isLocationSearch) {
            rawProducts = responseData.products || responseData || []
          } else {
            rawProducts = Array.isArray(responseData) ? responseData : []
          }

          if (Array.isArray(rawProducts)) {
            // Store all products
            allProducts.value = rawProducts.map((product) => ({
              id: product.id,
              name: product.name,
              price: `${product.price.toLocaleString('id-ID')}`,
              image: product.thumbnail_url.replace(/\\\//g, '/'),
              link: `/product-details/${product.id}`,
              sellerName: product.seller_name || product.seller?.name,
              address:
                isLocationSearch && product.addresses?.length > 0
                  ? `${product.addresses[0].city_name}, ${product.addresses[0].province_name}`
                  : '',
            }))

            // Update pagination info
            totalProducts.value = allProducts.value.length
            totalPages.value = Math.ceil(totalProducts.value / itemsPerPage.value)

            // Apply client-side pagination
            updateDisplayedProducts()
          } else {
            throw new Error('Data produk tidak valid')
          }
        } else {
          throw new Error(response.data.message || 'Gagal memuat produk')
        }
      } catch (error) {
        console.error('Error fetching search results:', error)
        allProducts.value = []
        products.value = []
        totalProducts.value = 0
        totalPages.value = 0

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
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Gagal memuat produk',
          })
        }
      } finally {
        loadingProducts.value = false
      }
    }

    // Update displayed products based on current page
    const updateDisplayedProducts = () => {
      const startIndex = (currentPage.value - 1) * itemsPerPage.value
      const endIndex = startIndex + itemsPerPage.value
      products.value = allProducts.value.slice(startIndex, endIndex)
    }

    // Handle product search from header
    const handleProductSearch = (query) => {
      searchQuery.value = query
      locationQuery.value = ''
      currentPage.value = 1
      router.push({
        path: '/search-results',
        query: {
          query: query.trim(),
          page: 1,
          limit: itemsPerPage.value,
        },
      })
    }

    // Handle location search from header
    const handleLocationSearch = (query) => {
      locationQuery.value = query
      searchQuery.value = ''
      currentPage.value = 1
      router.push({
        path: '/search-results',
        query: {
          address: query.trim(),
          page: 1,
          limit: itemsPerPage.value,
        },
      })
    }

    // Go to specific page
    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value) return

      currentPage.value = page

      // Update URL
      const query = searchQuery.value || locationQuery.value
      const isLocationSearch = !!locationQuery.value

      const queryParams = {
        page: page,
        limit: itemsPerPage.value,
      }

      if (isLocationSearch) {
        queryParams.address = locationQuery.value
      } else {
        queryParams.query = searchQuery.value
      }

      router.push({ path: '/search-results', query: queryParams })

      // Update displayed products
      updateDisplayedProducts()

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Change items per page
    const changeItemsPerPage = () => {
      currentPage.value = 1
      totalPages.value = Math.ceil(totalProducts.value / itemsPerPage.value)

      // Update URL
      const query = searchQuery.value || locationQuery.value
      const isLocationSearch = !!locationQuery.value

      const queryParams = {
        page: 1,
        limit: itemsPerPage.value,
      }

      if (isLocationSearch) {
        queryParams.address = locationQuery.value
      } else {
        queryParams.query = searchQuery.value
      }

      router.push({ path: '/search-results', query: queryParams })

      // Update displayed products
      updateDisplayedProducts()
    }

    // Debounced search
    const debouncedSearch = debounce((query, isLocationSearch) => {
      fetchProducts(query, isLocationSearch)
    }, 500)

    // Watch for changes in searchQuery or locationQuery
    watch([searchQuery, locationQuery], ([newSearchQuery, newLocationQuery]) => {
      currentPage.value = 1 // Reset to first page on new search
      if (newSearchQuery) {
        debouncedSearch(newSearchQuery, false)
      } else if (newLocationQuery) {
        debouncedSearch(newLocationQuery, true)
      }
    })

    // Watch for pagination changes
    watch([currentPage, itemsPerPage], () => {
      if (allProducts.value.length > 0) {
        totalPages.value = Math.ceil(totalProducts.value / itemsPerPage.value)
        updateDisplayedProducts()
      }
    })

    // Watch for route query parameter changes
    watch(
      () => route.query,
      (newQuery) => {
        const page = parseInt(newQuery.page) || 1
        const limit = parseInt(newQuery.limit) || 12

        currentPage.value = page
        itemsPerPage.value = limit

        if (newQuery.query) {
          searchQuery.value = newQuery.query
          locationQuery.value = ''
        } else if (newQuery.address) {
          locationQuery.value = newQuery.address
          searchQuery.value = ''
        } else {
          searchQuery.value = ''
          locationQuery.value = ''
          allProducts.value = []
          products.value = []
          totalProducts.value = 0
          totalPages.value = 0
        }
      },
      { immediate: true },
    )

    onMounted(() => {
      // Initial fetch based on URL query
      const page = parseInt(route.query.page) || 1
      const limit = parseInt(route.query.limit) || 12

      currentPage.value = page
      itemsPerPage.value = limit

      if (route.query.query) {
        searchQuery.value = route.query.query
      } else if (route.query.address) {
        locationQuery.value = route.query.address
      }
    })

    return {
      products,
      searchQuery,
      locationQuery,
      loadingProducts,
      handleProductSearch,
      handleLocationSearch,
      isLoggedIn,
      // Pagination
      currentPage,
      itemsPerPage,
      totalProducts,
      totalPages,
      startIndex,
      endIndex,
      visiblePages,
      goToPage,
      changeItemsPerPage,
      allProducts,
    }
  },
}
</script>
