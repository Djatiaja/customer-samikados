<template>
  <div class="flex flex-col min-h-screen" v-if="isLoaded">
    <HeaderBeforeLogin v-if="!isAuthenticated" />
    <HeaderAfterLogin v-else />
    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <main class="container mx-auto p-8">
        <div class="lg:flex lg:justify-evenly">
          <ProductImages :product-images="productImages" :product="product" />
          <ProductDetails
            :product="product"
            :size-options="sizeOptions"
            :finishing-options="finishingOptions"
            :total-price="totalPrice"
            :is-adding-to-cart="isAddingToCart"
            v-model:note="note"
            v-model:selected-size="selectedSize"
            v-model:selected-finishing="selectedFinishing"
            v-model:quantity="quantity"
            @update-total-price="updateTotalPrice"
            @select-size="selectSize"
            @increase-quantity="increaseQuantity"
            @decrease-quantity="decreaseQuantity"
            @place-order="placeOrder"
            @add-to-cart="addToCart"
            @open-chat="openChat"
            @toggle-bookmark="toggleBookmark"
          />
        </div>
        <StoreInfo :seller="seller" />
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
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import HeaderBeforeLogin from '@/components/HeaderBeforeLogin.vue'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import ProductImages from '@/components/details-product/ProductImages.vue'
import ProductDetails from '@/components/details-product/ProductDetails.vue'
import StoreInfo from '@/components/details-product/StoreInfo.vue'
import Reviews from '@/components/details-product/Reviews.vue'

export default {
  components: {
    HeaderBeforeLogin,
    HeaderAfterLogin,
    AuthFooter,
    ProductImages,
    ProductDetails,
    StoreInfo,
    Reviews,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isLoaded = ref(false)
    const isAddingToCart = ref(false)
    const isAuthenticated = computed(() => !!localStorage.getItem('token'))
    const product = reactive({
      id: '',
      name: '',
      soldCount: '0',
      description: '',
      price: 0,
    })

    const seller = reactive({
      id: '',
      name: '',
      photo_url: '',
      wa: '', // Tambahkan properti wa untuk menyimpan nomor WhatsApp
    })

    const productImages = ref([])
    const note = ref('')
    const selectedSize = ref('')
    const selectedFinishing = ref('')
    const quantity = ref(1)
    const isBookmarked = ref(false)
    const sizeOptions = ref([])
    const finishingOptions = ref([{ value: '0', label: 'Tanpa Finishing' }])

    // Dummy review data (tetap sama)
    const reviews = ref([
      {
        id: 1,
        user: 'John Doe',
        profilePic: 'https://placehold.co/100x100',
        rating: 4,
        content: 'Produk berkualitas tinggi, pengiriman cepat!',
        time: '14:30',
        date: '2025-06-20',
        reply: {
          content: 'Terima kasih atas ulasannya! Kami senang Anda puas dengan produk kami.',
          time: '15:00, 2025-06-20',
        },
      },
      {
        id: 2,
        user: 'Jane Smith',
        profilePic: 'https://placehold.co/100x100',
        rating: 5,
        content: 'Sangat puas dengan pembelian ini, sesuai dengan deskripsi.',
        time: '09:15',
        date: '2025-06-18',
        reply: null,
      },
      {
        id: 3,
        user: 'Mike Johnson',
        profilePic: 'https://placehold.co/100x100',
        rating: 3,
        content: 'Produk bagus tapi pengemasan bisa lebih baik.',
        time: '11:45',
        date: '2025-06-15',
        reply: {
          content: 'Terima kasih atas masukan Anda, kami akan tingkatkan pengemasan di masa depan.',
          time: '12:00, 2025-06-15',
        },
      },
    ])

    const fetchProduct = async (productId) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/products/${productId}`,
        )
        const data = response.data.data.product

        product.id = data.id || productId
        product.name = data.name || ''
        product.soldCount = data.terjual || '0' // Ubah dari unit ke terjual
        product.description = data.description || ''
        product.price = data.variants.find((v) => v.is_default)?.price || data.price || 0

        seller.id = data.seller.id || ''
        seller.name = data.seller.name || 'Unknown Seller'
        seller.photo_url = data.seller.photo_url || 'https://placehold.co/600x400'
        seller.wa = data.seller.wa || '' // Simpan nomor WhatsApp

        productImages.value = data.images
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => ({
            src: img.image_url || 'https://placehold.co/400x400',
            alt: img.alt_text || 'Product image',
          }))

        sizeOptions.value = data.variants.map((variant, index) => ({
          value: variant.id.toString(),
          label: variant.name
            ? `${variant.name} (${formatCurrency(variant.price)})`
            : `Variant ${index + 1} (${formatCurrency(variant.price)})`,
          price: variant.price,
        }))
        if (data.variants.length > 0) {
          selectedSize.value =
            data.variants.find((v) => v.is_default)?.id.toString() || data.variants[0].id.toString()
        }

        finishingOptions.value = [
          { value: '0', label: 'Tanpa Finishing' },
          ...data.finishings.map((finishing) => ({
            value: finishing.id.toString(),
            label: `${finishing.name} (+${formatCurrency(finishing.price)})`,
            price: finishing.price,
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

    onMounted(() => {
      const productId = route.params.id
      if (productId) {
        fetchProduct(productId)
      } else {
        Swal.fire({
          title: 'Error',
          text: 'ID produk tidak ditemukan.',
          icon: 'error',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      }
    })

    const totalPrice = computed(() => {
      const selectedVariant = sizeOptions.value.find(
        (option) => option.value === selectedSize.value,
      )
      const variantPrice = selectedVariant ? selectedVariant.price : product.price

      const selectedFinishingOption = finishingOptions.value.find(
        (option) => option.value === selectedFinishing.value,
      )
      const additionalPrice = selectedFinishingOption?.price || 0

      return (variantPrice + additionalPrice) * quantity.value
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

    const toggleBookmark = async () => {
      if (!isAuthenticated.value) {
        Swal.fire({
          title: 'Perhatian',
          text: 'Silakan login untuk menambahkan bookmark',
          icon: 'warning',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Login',
        }).then(() => {
          router.push('/login')
        })
        return
      }

      try {
        isAddingToCart.value = true

        const formData = new FormData()
        formData.append('product_id', product.id)
        formData.append('quantity', quantity.value)
        formData.append('product_variant_id', selectedSize.value)
        formData.append(
          'product_finishing_id',
          selectedFinishing.value === '0' ? '' : selectedFinishing.value,
        )
        formData.append('additional_info', note.value)

        const token = localStorage.getItem('token')
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/customer/cart`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        if (response.data.status === 'success') {
          Swal.fire({
            title: 'Berhasil!',
            text: 'Produk berhasil ditambahkan ke bookmark',
            icon: 'success',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
            },
            confirmButtonText: 'Tutup',
          })
        }
      } catch (error) {
        console.error('Error adding to bookmark:', error)
        let errorMessage = 'Gagal menambahkan produk ke bookmark'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.status === 401) {
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.'
        }

        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      } finally {
        isAddingToCart.value = false
      }
    }

    const openChat = () => {
      if (!isAuthenticated.value) {
        Swal.fire({
          title: 'Perhatian',
          text: 'Silakan login untuk menghubungi penjual',
          icon: 'warning',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Login',
        }).then(() => {
          router.push('/login')
        })
        return
      }

      if (seller.wa) {
        // Ensure the URL is properly formatted
        const waUrl = seller.wa.startsWith('http')
          ? seller.wa
          : `https://wa.me/${seller.wa.replace(/[^0-9]/g, '')}`
        window.open(waUrl, '_blank') // Open WhatsApp link in a new tab
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Nomor WhatsApp penjual tidak tersedia.',
          icon: 'error',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      }
    }

    const addToCart = async () => {
      if (!isAuthenticated.value) {
        Swal.fire({
          title: 'Perhatian',
          text: 'Silakan login untuk menambahkan ke keranjang',
          icon: 'warning',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Login',
        }).then(() => {
          router.push('/login')
        })
        return
      }

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

      try {
        isAddingToCart.value = true

        const formData = new FormData()
        formData.append('product_id', product.id)
        formData.append('quantity', quantity.value)
        formData.append('product_variant_id', selectedSize.value)
        formData.append(
          'product_finishing_id',
          selectedFinishing.value === '0' ? '' : selectedFinishing.value,
        )
        formData.append('additional_info', note.value)

        const token = localStorage.getItem('token')
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/customer/cart`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        if (response.data.status === 'success') {
          Swal.fire({
            title: 'Berhasil!',
            text: 'Produk berhasil ditambahkan ke keranjang',
            icon: 'success',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
            },
            confirmButtonText: 'Tutup',
          })
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        let errorMessage = 'Gagal menambahkan produk ke keranjang'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.status === 401) {
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.'
          router.push('/login')
        }

        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      } finally {
        isAddingToCart.value = false
      }
    }

    const placeOrder = async () => {
      if (!isAuthenticated.value) {
        Swal.fire({
          title: 'Perhatian',
          text: 'Silakan login untuk membuat pesanan',
          icon: 'warning',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Login',
        }).then(() => {
          router.push('/login')
        })
        return
      }

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

      try {
        isAddingToCart.value = true

        const formData = new FormData()
        formData.append('product_id', product.id)
        formData.append('quantity', quantity.value)
        formData.append('product_variant_id', selectedSize.value)
        formData.append(
          'product_finishing_id',
          selectedFinishing.value === '0' ? '' : selectedFinishing.value,
        )
        formData.append('additional_info', note.value)

        const token = localStorage.getItem('token')
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/customer/cart`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        if (response.data.status === 'success') {
          const cartId = response.data.data.id
          Swal.fire({
            title: 'Berhasil!',
            text: 'Produk ditambahkan ke keranjang, menuju checkout...',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-lg',
            },
          }).then(() => {
            router.push({
              path: '/checkout',
              query: { cart_ids: [cartId] },
            })
          })
        }
      } catch (error) {
        console.error('Error creating cart for checkout:', error)
        let errorMessage = 'Gagal membuat pesanan'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.status === 401) {
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.'
          router.push('/login')
        }

        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      } finally {
        isAddingToCart.value = false
      }
    }

    return {
      isLoaded,
      isAddingToCart,
      product,
      productImages,
      note,
      selectedSize,
      selectedFinishing,
      quantity,
      sizeOptions,
      finishingOptions,
      totalPrice,
      isBookmarked,
      formatCurrency,
      selectSize,
      updateTotalPrice,
      increaseQuantity,
      decreaseQuantity,
      toggleBookmark,
      openChat,
      addToCart,
      placeOrder,
      isAuthenticated,
      seller,
      reviews,
    }
  },
}
</script>
