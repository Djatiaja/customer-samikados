<template>
  <div class="flex flex-col min-h-screen" v-if="isLoaded">
    <HeaderAfterLogin />
    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <main class="container mx-auto p-8">
        <div class="lg:flex lg:justify-evenly">
          <ProductImages :product-images="productImages" :product="product" />
          <ProductDetails
            :product="product"
            :size-options="sizeOptions"
            :finishing-options="finishingOptions"
            :total-price="totalPrice"
            v-model:note="note"
            v-model:selected-size="selectedSize"
            v-model:selected-finishing="selectedFinishing"
            v-model:quantity="quantity"
            @update-total-price="updateTotalPrice"
            @select-size="selectSize"
            @increase-quantity="increaseQuantity"
            @decrease-quantity="decreaseQuantity"
            @place-order="placeOrder"
            @open-chat="openChat"
            @report-product="reportProduct"
            @toggle-bookmark="toggleBookmark"
          />
        </div>
        <StoreInfo />
        <Reviews :reviews="reviews" />
      </main>
    </div>
    <AuthFooter />
  </div>
  <div v-else class="flex flex-col min-h-screen justify-center items-center">
    <p>Loading...</p>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import ProductImages from '@/components/details-product/ProductImages.vue'
import ProductDetails from '@/components/details-product/ProductDetails.vue'
import StoreInfo from '@/components/details-product/StoreInfo.vue'
import Reviews from '@/components/details-product/Reviews.vue'

export default {
  components: {
    HeaderAfterLogin,
    AuthFooter,
    ProductImages,
    ProductDetails,
    StoreInfo,
    Reviews,
  },
  setup() {
    const isLoaded = ref(false)
    const product = reactive({
      name: '',
      soldCount: '0',
      description: '',
      price: 0,
    })

    const productImages = ref([])
    const note = ref('')
    const selectedSize = ref('')
    const selectedFinishing = ref('')
    const quantity = ref(1)
    const isBookmarked = ref(false)
    const sizeOptions = ref([])
    const finishingOptions = ref([{ value: '0', label: 'Tanpa Finishing' }])
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

    const fetchProduct = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/products/5')
        const data = response.data.data.product

        product.name = data.name || ''
        product.soldCount = data.unit || '0'
        product.description = data.description || ''
        product.price = data.variants.find((v) => v.is_default)?.price || data.price || 0

        productImages.value = data.images
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => ({
            src: img.image_url || 'https://placehold.co/400x400',
            alt: img.alt_text || 'Product image',
          }))

        sizeOptions.value = data.variants.map((variant, index) => ({
          value: variant.id.toString(),
          label: `Variant ${index + 1} (${formatCurrency(variant.price)})`,
        }))
        if (data.variants.length > 0) {
          selectedSize.value =
            data.variants.find((v) => v.is_default)?.id.toString() || data.variants[0].id.toString()
        }

        finishingOptions.value = [
          { value: '0', label: 'Tanpa Finishing' },
          ...data.finishings.map((finishing) => ({
            value: finishing.price.toString(),
            label: `${finishing.name} (+${formatCurrency(finishing.price)})`,
          })),
        ]

        isLoaded.value = true
      } catch (error) {
        console.error('Error fetching product:', error)
        Swal.fire({
          title: 'Error',
          text: 'Gagal memuat data produk. Silakan coba lagi nanti.',
          icon: 'error',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      }
    }

    onMounted(fetchProduct)

    const totalPrice = computed(() => {
      const selectedVariant = sizeOptions.value.find(
        (option) => option.value === selectedSize.value,
      )
      const variantPrice = selectedVariant
        ? parseInt(
            sizeOptions.value
              .find((option) => option.value === selectedSize.value)
              .label.match(/Rp([\d,.]+)/)?.[1]
              .replace(/[,.]/g, '') || '0',
          )
        : product.price
      const additionalPrice = parseInt(selectedFinishing.value) || 0
      return variantPrice * quantity.value + additionalPrice
    })

    const formatCurrency = (value) => {
      return `Rp${value.toLocaleString('id-ID')}`
    }

    const selectSize = (size) => {
      selectedSize.value = size
      updateTotalPrice()
    }

    const updateTotalPrice = () => {
      // Total price is computed automatically
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
                style="text-indent: 0; padding: 8px; box-sizing: border-box;"
                placeholder="Jelaskan lebih detail tentang laporan Anda"
              ></textarea>
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

          if (!reason) {
            Swal.showValidationMessage('Silakan pilih alasan laporan')
            return false
          }

          if (!description.trim()) {
            Swal.showValidationMessage('Silakan berikan deskripsi laporan')
            return false
          }

          return { reason, description }
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
      isLoaded,
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
