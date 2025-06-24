<template>
  <div class="flex flex-col min-h-screen">
    <HeaderAfterLogin @search-product="handleProductSearch" />

    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <!-- Search Results -->
      <div class="container mx-auto">
        <h2 class="text-md sm:text-lg md:text-xl font-bold mb-4">
          Hasil Pencarian untuk "{{ searchQuery }}"
        </h2>
        <div v-if="loadingProducts" class="text-center py-8 text-gray-600">Memuat produk...</div>
        <div v-else-if="!products.length" class="text-center py-8 text-gray-600">
          Tidak ada produk ditemukan untuk "{{ searchQuery }}"
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

    // Debounce function
    const debounce = (func, wait) => {
      let timeout
      return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
      }
    }

    // Fetch products based on query
    const fetchProducts = async (query) => {
      if (!query.trim()) {
        products.value = []
        return
      }

      try {
        loadingProducts.value = true
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token autentikasi tidak ada')

        const response = await axios.get(`${baseUrl}/search`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { query: query.trim() },
        })

        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          products.value = response.data.data.map((product) => ({
            id: product.id,
            name: product.name,
            price: `Rp${product.price.toLocaleString('id-ID')}`,
            image: product.thumbnail_url.replace(/\\\//g, '/'),
            link: `/product-details/${product.id}`,
            sellerName: product.seller.name,
          }))
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
      // Update URL query parameter
      router.push({ path: '/search-results', query: { query: query.trim() } })
    }

    // Debounced search
    const debouncedSearch = debounce((query) => {
      fetchProducts(query)
    }, 500)

    // Watch for changes in searchQuery
    watch(searchQuery, (newQuery) => {
      debouncedSearch(newQuery)
    })

    // Watch for route query parameter changes
    watch(
      () => route.query.query,
      (newQuery) => {
        if (newQuery) {
          searchQuery.value = newQuery
        } else {
          searchQuery.value = ''
          products.value = []
        }
      },
      { immediate: true },
    )

    onMounted(() => {
      // Initial fetch based on URL query
      if (route.query.query) {
        searchQuery.value = route.query.query
      }
    })

    return {
      products,
      searchQuery,
      loadingProducts,
      handleProductSearch,
    }
  },
}
</script>
