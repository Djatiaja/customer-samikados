<template>
  <div class="flex flex-col min-h-screen">
    <HeaderAfterLogin @search-product="handleProductSearch" />

    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <!-- Search Results -->
      <div class="container mx-auto">
        <h2 class="text-md sm:text-lg md:text-xl font-bold mb-4">
          Hasil Pencarian untuk "{{ searchQuery || locationQuery }}"
        </h2>
        <div v-if="loadingProducts" class="text-center py-8 text-gray-600">Memuat produk...</div>
        <div v-else-if="!products.length" class="text-center py-8 text-gray-600">
          Tidak ada produk ditemukan untuk "{{ searchQuery || locationQuery }}"
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </div>
    </div>

    <AuthFooter />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

import AuthFooter from '@/components/AuthFooter.vue'
import ProductCard1 from '@/components/ProductCard1.vue'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'

export default {
  components: { HeaderAfterLogin, AuthFooter, ProductCard1 },
  setup() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const route = useRoute()
    const router = useRouter()
    const products = ref([])
    const loadingProducts = ref(false)
    const searchQuery = ref('')
    const locationQuery = ref('')

    // Debounce function
    const debounce = (func, wait) => {
      let timeout
      return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
      }
    }

    // Fetch products based on query or address
    const fetchProducts = async (query, isLocationSearch = false) => {
      if (!query.trim()) {
        products.value = []
        return
      }

      try {
        loadingProducts.value = true
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token autentikasi tidak ada')

        const endpoint = isLocationSearch ? `${baseUrl}/search/address` : `${baseUrl}/search`
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          params: { query: query.trim() },
        })

        if (response.data.status === 'success') {
          // Handle both product and location search responses
          const rawProducts = isLocationSearch ? response.data.data.products : response.data.data
          if (Array.isArray(rawProducts)) {
            products.value = rawProducts.map((product) => ({
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
          } else {
            throw new Error('Data produk tidak valid')
          }
        } else {
          throw new Error(response.data.message || 'Gagal memuat produk')
        }
      } catch (error) {
        console.error('Error fetching search results:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Gagal memuat produk',
        })
        products.value = []
      } finally {
        loadingProducts.value = false
      }
    }

    // Handle product search from header
    const handleProductSearch = (query) => {
      searchQuery.value = query
      locationQuery.value = ''
      // Update URL query parameter
      router.push({ path: '/search-results', query: { query: query.trim() } })
    }

    // Debounced search
    const debouncedSearch = debounce((query, isLocationSearch) => {
      fetchProducts(query, isLocationSearch)
    }, 500)

    // Watch for changes in searchQuery or locationQuery
    watch([searchQuery, locationQuery], ([newSearchQuery, newLocationQuery]) => {
      if (newSearchQuery) {
        debouncedSearch(newSearchQuery, false)
      } else if (newLocationQuery) {
        debouncedSearch(newLocationQuery, true)
      }
    })

    // Watch for route query parameter changes
    watch(
      () => route.query,
      (newQuery) => {
        if (newQuery.query) {
          searchQuery.value = newQuery.query
          locationQuery.value = ''
        } else if (newQuery.address) {
          locationQuery.value = newQuery.address
          searchQuery.value = ''
        } else {
          searchQuery.value = ''
          locationQuery.value = ''
          products.value = []
        }
      },
      { immediate: true },
    )

    onMounted(() => {
      // Initial fetch based on URL query
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
    }
  },
}
</script>
