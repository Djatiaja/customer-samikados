<template>
  <div class="flex flex-col min-h-screen">
    <HeaderAfterLogin />

    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <main class="container mx-auto p-8">
        <div class="lg:flex lg:justify-evenly">
          <!-- Product Image & Description -->
          <div class="lg:w-1/3 h-1/3">
            <!-- Slider Container -->
            <div class="relative">
              <div class="overflow-hidden rounded-lg shadow-lg">
                <swiper
                  :modules="[Navigation, Pagination]"
                  :navigation="true"
                  :pagination="{ clickable: true }"
                  class="mySwiper"
                >
                  <swiper-slide v-for="(image, index) in productImages" :key="index">
                    <img :src="image.src" :alt="image.alt" class="w-full" />
                  </swiper-slide>
                </swiper>
              </div>
            </div>

            <h2 class="text-3xl font-bold mt-4">{{ product.name }}</h2>
            <p class="text-gray-500">{{ product.soldCount }}+ Terjual</p>
            <p class="mt-4 text-gray-700">{{ product.description }}</p>
          </div>

          <!-- Product Details -->
          <div class="lg:w-1/2 lg:pl-12 mt-8 lg:mt-0">
            <!-- Harga -->
            <div class="pb-4 mb-4">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Harga</h3>
              <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
                {{ formatCurrency(product.price) }}
              </p>
            </div>

            <!-- Catatan -->
            <div class="pb-4 mb-4">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Catatan</h3>
              <textarea
                v-model="note"
                class="w-full sm:w-3/4 h-24 sm:h-28 border p-2 rounded-lg mt-2 text-sm sm:text-base lg:text-lg"
                placeholder="Masukkan catatan untuk produk Anda"
              ></textarea>
              <p class="text-gray-500 mt-1 text-xs sm:text-sm lg:text-base">
                Contoh: packing pakai selongsong
              </p>
            </div>

            <!-- Ukuran (Diubah menjadi opsi pilihan) -->
            <div class="pb-4 mb-4">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Ukuran</h3>
              <div class="flex flex-wrap gap-2 mt-2">
                <button
                  v-for="option in sizeOptions"
                  :key="option.value"
                  @click="selectSize(option.value)"
                  class="px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg border"
                  :class="
                    selectedSize === option.value ? 'bg-red-600 text-white' : 'border-gray-300'
                  "
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- Finishing -->
            <div class="pb-4 mb-4">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Finishing</h3>
              <select
                v-model="selectedFinishing"
                class="w-full sm:w-3/4 border p-2 mb-2 rounded-lg text-sm sm:text-base lg:text-lg"
                @change="updateTotalPrice"
              >
                <option value="">Tidak Ada yang Dipilih</option>
                <option
                  v-for="option in finishingOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Jumlah -->
            <div class="pb-4 mb-4">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Jumlah</h3>
              <div class="flex items-center mt-2">
                <button
                  @click="decreaseQuantity"
                  class="bg-white px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg border border-gray-300"
                >
                  -
                </button>
                <span class="px-4 text-sm sm:text-base lg:text-lg">{{ quantity }}</span>
                <button
                  @click="increaseQuantity"
                  class="bg-white px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg border border-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Harga Total -->
            <div class="pb-4 mb-4">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Harga Total</h3>
              <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-red-600">
                {{ formatCurrency(totalPrice) }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2 mt-4">
              <button
                class="bg-white border border-red-600 text-red-600 p-3 rounded-lg"
                @click="toggleBookmark"
              >
                <i class="fas" :class="isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'"></i>
              </button>

              <button
                class="bg-white border border-red-600 text-red-600 p-3 rounded-lg"
                @click="openChat"
              >
                <i class="fas fa-comment"></i>
              </button>

              <button
                class="flex-grow bg-red-600 text-white py-3 px-8 rounded-lg text-sm sm:text-base lg:text-lg"
                @click="placeOrder"
              >
                Pesan Sekarang
              </button>

              <button
                class="bg-white border border-red-600 text-red-600 p-3 rounded-lg"
                @click="reportProduct"
              >
                <i class="fas fa-flag"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Store Info Section -->
        <section class="mt-8 lg:mx-20 p-4 border rounded-lg shadow-sm">
          <div class="flex items-center">
            <img
              src="https://placehold.co/80x80"
              alt="Store Logo"
              class="rounded-full w-12 h-12 sm:w-16 sm:h-16"
            />
            <div class="ml-4">
              <h3 class="font-bold text-lg sm:text-xl">Nama Toko</h3>
              <div class="flex items-center space-x-4 mt-1">
                <div class="flex items-center">
                  <i class="fas fa-star text-yellow-500 mr-1"></i>
                  <span>4.9</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-box text-gray-500 mr-1"></i>
                  <span>1.2k Produk</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-map-marker-alt text-gray-500 mr-1"></i>
                  <span>Jakarta</span>
                </div>
              </div>
            </div>
            <div class="ml-auto">
              <button class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base">
                Kunjungi Toko
              </button>
            </div>
          </div>
        </section>

        <!-- Reviews Section -->
        <section class="mt-8 lg:mx-20">
          <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-10">Ulasan</h3>
          <div class="mt-4">
            <div v-for="review in reviews" :key="review.id" class="mb-8">
              <div class="flex flex-col lg:flex-row items-start">
                <!-- User Info (Profile, Name, Date, Stars) -->
                <div class="flex flex-col lg:flex-row items-start mr-6 w-full lg:w-1/2">
                  <img
                    :src="review.profilePic"
                    alt="User profile picture"
                    class="rounded-full mr-4 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
                  />
                  <div>
                    <span class="font-bold block text-sm sm:text-base lg:text-lg">{{
                      review.user
                    }}</span>
                    <span class="text-gray-500 text-xs sm:text-sm lg:text-base"
                      >{{ review.time }} | {{ review.date }}</span
                    >
                    <div class="flex items-center mt-1">
                      <i
                        v-for="star in 5"
                        :key="star"
                        class="fas fa-star text-yellow-500 text-xs sm:text-sm lg:text-base"
                        :class="{ 'text-gray-300': star > review.rating }"
                      ></i>
                    </div>
                  </div>
                </div>

                <!-- Review Text with Seller Response -->
                <div class="flex-1">
                  <p class="text-gray-700 text-sm sm:text-base lg:text-lg">
                    {{ review.content }}
                  </p>
                  <!-- Tanggapan Seller -->
                  <div
                    v-if="review.reply"
                    class="mt-4 p-4 bg-gray-100 rounded-lg border-l-4 border-red-600"
                  >
                    <p class="text-gray-800 font-semibold text-sm sm:text-base lg:text-lg">
                      Tanggapan Seller
                      <span class="text-xs sm:text-sm lg:text-base text-gray-500">{{
                        review.reply.time
                      }}</span>
                    </p>
                    <p class="text-gray-700 text-xs sm:text-sm lg:text-base">
                      {{ review.reply.content }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <AuthFooter />
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Navigation } from 'swiper/modules'
import Swal from 'sweetalert2'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import AuthFooter from '@/components/AuthFooter.vue'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'

export default {
  components: {
    HeaderAfterLogin,
    AuthFooter,
    Swiper,
    SwiperSlide,
  },

  setup() {
    // Product data
    const product = reactive({
      name: 'PIN PENITI 58mm',
      soldCount: '10RB',
      description:
        'Temukan solusi praktis untuk menyatukan kain dan aksesoris dengan Pin Peniti 58mm. Dirancang dengan ukuran ideal untuk penggunaan sehari-hari, pin ini terbuat dari bahan berkualitas tinggi yang memastikan daya tahan dan ketahanan terhadap korosi.',
      price: 4500,
    })

    // Product images
    const productImages = ref([
      { src: 'https://placehold.co/600x600', alt: 'Gambar 1' },
      { src: 'https://placehold.co/600x600', alt: 'Gambar 2' },
      { src: 'https://placehold.co/600x600', alt: 'Gambar 3' },
    ])

    // Form values
    const note = ref('')
    const selectedSize = ref('')
    const selectedFinishing = ref('')
    const quantity = ref(1)
    const isBookmarked = ref(false)

    // Size options
    const sizeOptions = ref([
      { value: 'small', label: '44mm' },
      { value: 'medium', label: '58mm' },
      { value: 'large', label: '75mm' },
    ])

    // Finishing options
    const finishingOptions = ref([
      { value: '0', label: 'Tanpa Finishing' },
      { value: '10000', label: 'Finishing + Paperbag' },
    ])

    // Reviews data
    const reviews = ref([
      {
        id: 1,
        user: 'Denada Ananda',
        time: '15.49',
        date: '23 Desember 2023',
        rating: 5,
        content:
          'Bahan yang digunakan terasa kokoh dan tahan lama, sehingga saya tidak khawatir tentang kerusakan setelah penggunaan berulang. Ujung pin yang runcing memudahkan untuk menembus berbagai jenis kain, dan saya sangat menghargai kenyamanan saat menggunakannya.',
        profilePic: 'https://placehold.co/50x50',
      },
      {
        id: 2,
        user: 'Denada Ananda',
        time: '15.49',
        date: '23 Desember 2023',
        rating: 5,
        content:
          'Bahan yang digunakan terasa kokoh dan tahan lama, sehingga saya tidak khawatir tentang kerusakan setelah penggunaan berulang. Ujung pin yang runcing memudahkan untuk menembus berbagai jenis kain, dan saya sangat menghargai kenyamanan saat menggunakannya.',
        profilePic: 'https://placehold.co/50x50',
        reply: {
          time: '10.55',
          content:
            'Halo Denada Ananda! Terima kasih atas ulasan baiknya, semoga barang awet. Kami menantikan pembelian Anda selanjutnya!',
        },
      },
    ])

    // Computed properties
    const totalPrice = computed(() => {
      const basePrice = product.price * quantity.value
      const additionalPrice = parseInt(selectedFinishing.value) || 0
      return basePrice + additionalPrice
    })

    // Methods
    const formatCurrency = (value) => {
      return `Rp${value.toLocaleString('id-ID')}`
    }

    const selectSize = (size) => {
      selectedSize.value = size
      updateTotalPrice()
    }

    const updateTotalPrice = () => {
      // Total price dihitung otomatis melalui computed property
    }

    const increaseQuantity = () => {
      quantity.value++
      updateTotalPrice()
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
        updateTotalPrice()
      }
    }

    const toggleBookmark = () => {
      isBookmarked.value = !isBookmarked.value
      const message = isBookmarked.value
        ? 'Produk ditambahkan ke wishlist'
        : 'Produk dihapus dari wishlist'

      Swal.fire({
        title: 'Berhasil!',
        text: message,
        icon: 'success',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
        },
        confirmButtonText: 'Tutup',
      })
    }

    const openChat = () => {
      Swal.fire({
        title: 'Chat dengan Penjual',
        text: 'Fitur chat sedang dibuka...',
        icon: 'info',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
        },
        confirmButtonText: 'Tutup',
      })
    }

    const placeOrder = () => {
      if (!selectedSize.value) {
        Swal.fire({
          title: 'Perhatian',
          text: 'Silakan pilih ukuran terlebih dahulu',
          icon: 'warning',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
        return
      }

      Swal.fire({
        title: 'Pesanan Dibuat',
        text: 'Pesanan Anda sedang diproses',
        icon: 'success',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
        },
        confirmButtonText: 'Lihat Pesanan',
      })
    }

    const reportProduct = () => {
      Swal.fire({
        title: 'Laporkan Produk',
        html: `
          <form id="reportForm" class="text-left">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="reportReason">
                Alasan Laporan
              </label>
              <select
                id="reportReason"
                class="w-full text-sm p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Pilih alasan</option>
                <option value="counterfeit">Produk palsu</option>
                <option value="misleading">Informasi menyesatkan</option>
                <option value="prohibited">Produk terlarang</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="reportDescription">
                Deskripsi
              </label>
              <textarea
                id="reportDescription"
                class="w-full text-sm p-2 border border-gray-300 rounded-lg h-32"
                placeholder="Jelaskan lebih detail tentang laporan Anda">
              </textarea>
            </div>
          </form>
        `,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          cancelButton:
            'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          actions: 'flex justify-center space-x-6',
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Kirim Laporan',
        preConfirm: () => {
          const reason = document.getElementById('reportReason').value
          const description = document.getElementById('reportDescription').value

          // Validation
          if (!reason) {
            Swal.showValidationMessage('Silakan pilih alasan laporan')
            return false
          }

          if (!description.trim()) {
            Swal.showValidationMessage('Silakan berikan deskripsi laporan')
            return false
          }

          return {
            reason,
            description,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Terima Kasih',
            text: 'Laporan Anda telah kami terima dan akan segera kami tindaklanjuti',
            icon: 'success',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
            },
            confirmButtonText: 'Tutup',
          })
        }
      })
    }

    return {
      // Navigation
      Navigation,
      Pagination,

      // Data
      product,
      productImages,
      note,
      selectedSize,
      selectedFinishing,
      quantity,
      sizeOptions,
      finishingOptions,
      reviews,
      totalPrice,
      isBookmarked,

      // Methods
      formatCurrency,
      selectSize,
      updateTotalPrice,
      increaseQuantity,
      decreaseQuantity,
      toggleBookmark,
      openChat,
      placeOrder,
      reportProduct,
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
