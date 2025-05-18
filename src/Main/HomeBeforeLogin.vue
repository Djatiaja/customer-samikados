<template>
  <div class="flex flex-col min-h-screen">
    <HeaderBeforeLogin />

    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <!-- Full-width Banner with Swiper Carousel -->
      <div
        class="relative my-8"
        style="margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); width: 100vw"
      >
        <div v-if="loading" class="text-center py-8">Loading banners...</div>
        <Swiper
          v-else
          :modules="[Pagination, Navigation]"
          :slides-per-view="1"
          :space-between="30"
          :loop="true"
          :centered-slides="true"
          :pagination="{ el: '.swiper-pagination', clickable: true }"
          :navigation="true"
          :breakpoints="{
            1028: { slidesPerView: 1.5, spaceBetween: 10 },
          }"
          class="swiper centered-slide-carousel swiper-container relative w-full"
        >
          <SwiperSlide v-for="(banner, index) in banners" :key="index">
            <img
              :src="banner.image"
              :alt="banner.alt"
              class="w-full h-[500px] object-cover"
              style="max-width: 1500px; margin: 0 auto;"
            />
          </SwiperSlide>
        </Swiper>

        <div class="swiper-pagination"></div>
      </div>

      <!-- Pilih Kategori -->
      <div class="container mx-auto mt-8">
        <h2 class="text-md sm:text-lg md:text-xl font-bold">PILIH KATEGORI ANDA</h2>
        <div class="text-center mt-4 mb-6 border border-gray-300 shadow-lg p-6 rounded-lg">
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-60 overflow-y-auto"
          >
            <CategoryItem1
              v-for="(category, index) in categories"
              :key="index"
              :name="category.name"
              :image="category.image"
              :link="category.link"
            />
          </div>
        </div>
      </div>

      <!-- Produk -->
      <div class="container grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto">
        <ProductCard1
          v-for="(product, index) in products"
          :key="index"
          :name="product.name"
          :price="product.price"
          :link="product.link"
          :image="product.image"
        />
      </div>
    </div>

    <AuthFooter />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import axios from 'axios'

import AuthFooter from '@/components/AuthFooter.vue'
import CategoryItem1 from '@/components/CategoryItem1.vue'
import ProductCard1 from '@/components/ProductCard1.vue'
import HeaderBeforeLogin from '@/components/HeaderBeforeLogin.vue'

export default {
  components: { HeaderBeforeLogin, AuthFooter, Swiper, SwiperSlide, CategoryItem1, ProductCard1 },
  setup() {
    // Data banner slider
    const banners = ref([])
    const loading = ref(true)

    // Fetch banners from API
    const fetchBanners = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/banners')
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          banners.value = response.data.data.slice(0, 5).map((banner, index) => ({
            // Use placeholder with 1500x500 to ensure consistent size
            image: `https://placehold.co/1500x500?text=Banner+${index + 1}`,
            alt: banner.name || `Banner ${index + 1}`,
          }))
        } else {
          throw new Error('Invalid API response')
        }
      } catch (error) {
        console.error('Error fetching banners:', error)
        // Fallback to placeholder banners
        banners.value = [
          { image: 'https://placehold.co/1500x500?text=Banner+1', alt: 'Banner 1' },
          { image: 'https://placehold.co/1500x500?text=Banner+2', alt: 'Banner 2' },
          { image: 'https://placehold.co/1500x500?text=Banner+3', alt: 'Banner 3' },
          { image: 'https://placehold.co/1500x500?text=Banner+4', alt: 'Banner 4' },
          { image: 'https://placehold.co/1500x500?text=Banner+5', alt: 'Banner 5' },
        ]
      } finally {
        loading.value = false
      }
    }

    // Data kategori
    const categories = ref([
      { name: 'Merchandise', image: 'https://placehold.co/100x100', link: '/category-view' },
      { name: 'Aksesoris', image: 'https://placehold.co/100x100', link: '/category-view' },
      { name: 'Pakaian', image: 'https://placehold.co/100x100', link: '/category-view' },
      { name: 'Elektronik', image: 'https://placehold.co/100x100', link: '/category-view' },
      { name: 'Perabotan', image: 'https://placehold.co/100x100', link: '/category-view' },
    ])

    // Data produk
    const products = ref([
      {
        name: 'Ganci',
        price: '20000',
        image: 'https://placehold.co/400x400',
        link: '/product-details',
      },
      {
        name: 'Kaos',
        price: '75000',
        image: 'https://placehold.co/400x400',
        link: '/product-details',
      },
      {
        name: 'Topi',
        price: '50000',
        image: 'https://placehold.co/400x400',
        link: '/product-details',
      },
      {
        name: 'Tas',
        price: '400000',
        image: 'https://placehold.co/400x400',
        link: '/product-details',
      },
      {
        name: 'Mug',
        price: '30000',
        image: 'https://placehold.co/400x400',
        link: '/product-details',
      },
    ])

    // Fetch banners when component is mounted
    onMounted(() => {
      fetchBanners()
    })

    return {
      banners,
      categories,
      products,
      loading,
      Pagination,
      Navigation,
    }
  },
}
</script>

<style scoped>
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #dc2626; /* Red-600 */
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #b91c1c !important;
}
</style>
