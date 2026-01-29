<template>
  <div class="bg-gray-100 min-h-screen flex flex-col">
    <HeaderAfterLogin />

    <!-- Main Content -->
    <main
      class="container mx-auto my-8 bg-white rounded-lg shadow-lg w-full md:w-3/4 px-4 md:px-10 flex-grow"
    >
      <div class="p-4 md:p-6 border-b border-gray-200">
        <h2 class="text-xl md:text-2xl font-semibold text-center">Checkout Langsung</h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-4 md:p-6 text-center">
        <div class="inline-block w-8 h-8 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
        <p class="text-lg mt-4">Memuat data checkout...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 md:p-6 text-center text-red-600">
        <p class="text-lg">{{ error }}</p>
        <button
          class="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg"
          @click="$router.go(-1)"
        >
          Kembali
        </button>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Customer Information -->
        <div class="p-4 md:p-6 border-b border-gray-200">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-4">
              <img
                :src="customerInfo.photo_url"
                alt="Customer"
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
              <div>
                <p class="font-semibold text-base sm:text-lg">{{ customerInfo.name }}</p>
                <p class="text-sm text-gray-600">{{ customerInfo.phone }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Information -->
        <div class="p-4 md:p-6 border-b border-gray-200">
          <h3 class="font-semibold text-lg mb-4">Detail Produk</h3>
          <div class="flex items-start space-x-4">
            <img
              :src="productData.product.thumbnail_url || 'https://placehold.co/100x100'"
              alt="Product"
              class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-base sm:text-lg">{{ productData.product.name }}</h4>
              <p v-if="productData.variant" class="text-sm text-gray-600 mt-1">
                Variant: {{ productData.variant.name }}
              </p>
              <p v-if="itemAdditionalInfo" class="text-sm text-gray-600 mt-1">
                Catatan: {{ itemAdditionalInfo }}
              </p>
              <div class="flex justify-between items-center mt-2">
                <span class="text-sm text-gray-600">Qty: {{ productData.quantity }}</span>
                <span class="font-semibold text-red-600">{{
                  formatPrice(productData.subtotal)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- File Upload Section -->
        <div class="p-4 md:p-6 border-b border-gray-200">
          <FileUploadSection
            v-model="uploadedFiles"
            :product-variant-id="parseInt(variantId)"
            :product-finishing-id="finishingId ? parseInt(finishingId) : null"
            :show-check-price="true"
            @price-checked="handlePriceChecked"
          />
        </div>

        <!-- Address Selection -->
        <div class="p-4 md:p-6 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-lg">Alamat Pengiriman</h3>
            <button
              class="text-red-600 hover:text-red-700 text-sm font-semibold"
              @click="openAddressModal"
            >
              Ubah
            </button>
          </div>
          <div v-if="selectedAddress" class="bg-gray-50 p-4 rounded-lg">
            <p class="font-semibold">{{ selectedAddress.receiver_name }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ selectedAddress.receiver_phone }}</p>
            <p class="text-sm text-gray-600 mt-2">{{ selectedAddress.full_address }}</p>
            <p class="text-sm text-gray-600">
              {{ selectedAddress.label }}
            </p>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            <p>Belum ada alamat dipilih</p>
            <button
              class="mt-2 text-red-600 hover:text-red-700 font-semibold"
              @click="openAddressModal"
            >
              Pilih Alamat
            </button>
          </div>
        </div>

        <!-- Shipping Method -->
        <div class="p-4 md:p-6 border-b border-gray-200">
          <h3 class="font-semibold text-lg mb-4">Metode Pengiriman</h3>
          <div v-if="shippingOptions.length > 0" class="space-y-3">
            <label
              v-for="option in shippingOptions"
              :key="`${option.shipping_name}-${option.service_name}`"
              class="flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors"
              :class="{
                'border-red-600 bg-red-50': isShippingSelected(option),
                'border-gray-300 hover:border-red-600': !isShippingSelected(option),
              }"
            >
              <div class="flex items-center flex-1">
                <input
                  type="radio"
                  :value="option"
                  v-model="selectedShipping"
                  class="radio-red w-4 h-4"
                />
                <div class="ml-3">
                  <p class="font-semibold text-sm sm:text-base">
                    {{ option.shipping_name }} - {{ option.service_name }}
                  </p>
                  <p class="text-xs sm:text-sm text-gray-600">
                    {{ option.etd || 'Estimasi tidak tersedia' }}
                  </p>
                </div>
              </div>
              <span class="font-semibold text-sm sm:text-base">{{
                formatPrice(option.shipping_cost_net)
              }}</span>
            </label>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            <p>Pilih alamat terlebih dahulu untuk melihat opsi pengiriman</p>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="p-4 md:p-6 border-b border-gray-200">
          <h3 class="font-semibold text-lg mb-4">Metode Pembayaran</h3>
          <div class="space-y-3">
            <label
              v-for="method in paymentMethods"
              :key="method.id"
              class="flex items-center p-4 border rounded-lg cursor-pointer transition-colors"
              :class="{
                'border-red-600 bg-red-50': selectedPayment === method.id,
                'border-gray-300 hover:border-red-600': selectedPayment !== method.id,
              }"
            >
              <input
                type="radio"
                :value="method.id"
                v-model="selectedPayment"
                class="radio-red w-4 h-4"
              />
              <span class="ml-3 text-sm sm:text-base">{{ method.label }}</span>
            </label>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="p-4 md:p-6 border-b border-gray-200">
          <h3 class="font-semibold text-lg mb-4">Catatan Tambahan (Opsional)</h3>
          <textarea
            v-model="additionalInfo"
            rows="4"
            class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm sm:text-base"
            placeholder="Tambahkan catatan untuk penjual..."
          ></textarea>
        </div>

        <!-- Order Summary -->
        <div class="p-4 md:p-6 border-b border-gray-200">
          <h3 class="font-semibold text-lg mb-4">Ringkasan Pesanan</h3>
          <div class="space-y-2 text-sm sm:text-base">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal Produk:</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Biaya Pengiriman:</span>
              <span>{{ formatPrice(shippingCost) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Biaya Aplikasi:</span>
              <span>{{ formatPrice(applicationFee) }}</span>
            </div>
            <div class="flex justify-between font-semibold text-gray-900 text-base sm:text-lg pt-2 border-t">
              <span>Total:</span>
              <span class="text-red-600">{{ formatPrice(grandTotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="p-4 md:p-6 text-center">
          <button
            class="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-base sm:text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isFormValid || isSubmitting"
            @click="submitOrder"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Memproses Pesanan...
            </span>
            <span v-else>Buat Pesanan</span>
          </button>
          <p v-if="!isFormValid" class="text-sm text-gray-500 mt-3">
            Lengkapi semua data dan upload file design untuk melanjutkan
          </p>
        </div>
      </div>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import FileUploadSection from '@/components/FileUploadSection.vue'
import Swal from 'sweetalert2'
import axios from 'axios'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'

export default {
  name: 'PreDirectCheckout',
  components: {
    HeaderAfterLogin,
    AuthFooter,
    FileUploadSection,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const error = ref(null)
    const isSubmitting = ref(false)
    const orderCreated = ref(false)

    // Customer Info
    const customerInfo = ref({
      name: '',
      phone: '',
      photo_url: '',
    })

    // Product Data from route params
    const productId = ref(null)
    const variantId = ref(null)
    const finishingId = ref(null)
    const quantity = ref(1)
    const itemAdditionalInfo = ref('')
    const uploadedFiles = ref([])
    const priceEstimation = ref(null)

    // Pre-checkout data
    const productData = ref({
      product: {},
      variant: {},
      quantity: 1,
      subtotal: 0,
    })

    // Address
    const addresses = ref([])
    const selectedAddressId = ref(null)

    // Shipping
    const shippingOptions = ref([])
    const selectedShipping = ref(null)

    // Payment
    const paymentMethods = ref([
      { id: 'midtrans', label: 'Transfer ke Midtrans' },
      { id: 'cash', label: 'Cash (Ambil di Tempat)' },
    ])
    const selectedPayment = ref('midtrans')

    // Additional
    const additionalInfo = ref('')
    const subtotal = ref(0)
    const applicationFee = ref(0)

    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const token = localStorage.getItem('token')

    // Computed
    const selectedAddress = computed(() => {
      return addresses.value.find((addr) => addr.id === selectedAddressId.value) || null
    })

    const shippingCost = computed(() => {
      return selectedShipping.value ? selectedShipping.value.shipping_cost_net : 0
    })

    const grandTotal = computed(() => {
      return subtotal.value + shippingCost.value + applicationFee.value
    })

    const isFormValid = computed(() => {
      return (
        uploadedFiles.value.length > 0 &&
        selectedAddressId.value &&
        selectedShipping.value &&
        selectedPayment.value
      )
    })

    // Methods
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${baseUrl}/customer/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data.status === 'success') {
          customerInfo.value.name = response.data.data.name || 'Pelanggan'
          customerInfo.value.phone = response.data.data.no_telp || '-'
          customerInfo.value.photo_url =
            response.data.data.photo_url || 'https://placehold.co/40x40'
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    }

    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${baseUrl}/customer/address`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data.status === 'success') {
          addresses.value = response.data.data
          const defaultAddress = addresses.value.find((addr) => addr.is_default) || addresses.value[0]
          selectedAddressId.value = defaultAddress?.id || null
        }
      } catch (err) {
        console.error('Error fetching addresses:', err)
      }
    }

    const fetchPreDirectCheckout = async () => {
      if (!selectedAddressId.value) return

      try {
        const payload = {
          product_id: productId.value,
          product_variant_id: variantId.value,
          quantity: quantity.value,
          address_id: selectedAddressId.value,
          metode_pembayaran: selectedPayment.value,
        }

        const response = await axios.post(
          `${baseUrl}/v2/customer/orders/pre-direct-checkout`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        if (response.data.status === 'success') {
          productData.value = response.data.data.item
          subtotal.value = response.data.data.subtotal
          applicationFee.value = response.data.data.application_fee
          shippingOptions.value = response.data.data.deliveries.calculate_reguler || []

          // Auto-select first shipping if available
          if (shippingOptions.value.length > 0 && !selectedShipping.value) {
            selectedShipping.value = shippingOptions.value[0]
          }
        } else {
          throw new Error(response.data.message || 'Gagal memuat data checkout')
        }
      } catch (err) {
        console.error('Error fetching pre-checkout:', err)
        error.value = err.response?.data?.message || 'Gagal memuat data checkout'
      }
    }

    const openAddressModal = async () => {
      const renderAddresses = () => {
        if (!addresses.value.length) {
          return `<div class="bg-gray-100 p-4 rounded-lg text-center text-gray-500">Belum ada alamat</div>`
        }
        return addresses.value
          .map(
            (addr) => `
            <div class="border rounded-lg p-4 mb-3 cursor-pointer hover:border-red-600 transition-colors ${
              addr.id === selectedAddressId.value ? 'border-red-600 bg-red-50' : 'border-gray-300'
            }"
            onclick="window.selectAddressId = ${addr.id}">
              <p class="font-semibold">${addr.receiver_name}</p>
              <p class="text-sm text-gray-600">${addr.receiver_phone}</p>
              <p class="text-sm text-gray-600 mt-1">${addr.full_address}</p>
              <p class="text-sm text-gray-500">${addr.label}</p>
            </div>
          `,
          )
          .join('')
      }

      try {
        const result = await Swal.fire({
          title: '<h3 class="text-lg font-bold">Pilih Alamat Pengiriman</h3>',
          html: `<div class="max-h-96 overflow-y-auto">${renderAddresses()}</div>`,
          showCancelButton: true,
          cancelButtonText: 'Tutup',
          confirmButtonText: 'Pilih',
          width: '600px',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white py-2 px-6 rounded-lg mr-3',
            cancelButton: 'bg-gray-200 text-black py-2 px-6 rounded-lg',
          },
          didOpen: () => {
            window.selectAddressId = selectedAddressId.value
          },
          preConfirm: () => {
            return window.selectAddressId
          },
        })

        if (result.isConfirmed && result.value) {
          selectedAddressId.value = result.value
          await fetchPreDirectCheckout()
        }
      } catch (err) {
        console.error('Error in address modal:', err)
      }
    }

    const isShippingSelected = (option) => {
      return (
        selectedShipping.value &&
        selectedShipping.value.shipping_name === option.shipping_name &&
        selectedShipping.value.service_name === option.service_name
      )
    }

    const handlePriceChecked = (priceData) => {
      priceEstimation.value = priceData
    }

    const submitOrder = async () => {
      if (!isFormValid.value) {
        Swal.fire({
          title: 'Data Belum Lengkap',
          text: 'Silakan lengkapi semua data dan upload file design',
          icon: 'warning',
          confirmButtonColor: '#dc2626',
        })
        return
      }

      isSubmitting.value = true

      try {
        const formData = new FormData()
        formData.append('address_id', selectedAddressId.value)
        formData.append('product_id', productId.value)
        formData.append('product_variant_id', variantId.value)

        if (finishingId.value && finishingId.value !== '0') {
          formData.append('product_finishing_id', finishingId.value)
        }

        formData.append('quantity', quantity.value)
        formData.append('item_additional_info', itemAdditionalInfo.value || additionalInfo.value)

        // Append files or links
        uploadedFiles.value.forEach((file, index) => {
          if (file.isLink) {
            formData.append(`files[${index}][link]`, file.link)
          } else {
            formData.append(`files[${index}][file]`, file)
          }
        })

        formData.append('shipping_name', selectedShipping.value.shipping_name)
        formData.append('service_name', selectedShipping.value.service_name)
        formData.append('metode_pembayaran', selectedPayment.value)

        const response = await axios.post(
          `${baseUrl}/v2/customer/orders/direct-checkout`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        if (response.data.status === 'success') {
          const orderId = response.data.data.id
          localStorage.setItem('order_id', orderId)

          // Mark order as created to prevent navigation back
          orderCreated.value = true

          // Set flag to prevent returning to this checkout page
          sessionStorage.setItem('checkout_completed', 'true')

          Swal.fire({
            title: 'Pesanan Berhasil Dibuat!',
            text: 'Pesanan Anda menunggu konfirmasi dari penjual',
            icon: 'success',
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Lihat Pesanan',
            allowOutsideClick: false,
          }).then(() => {
            // Use replace to prevent back navigation
            router.replace('/track-order')
          })
        } else {
          throw new Error(response.data.message || 'Gagal membuat pesanan')
        }
      } catch (err) {
        console.error('Submit order error:', err)
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        })
      } finally {
        isSubmitting.value = false
      }
    }

    const formatPrice = (price) => {
      return `Rp${price.toLocaleString('id-ID')}`
    }

    onMounted(async () => {
      if (!token) {
        router.push('/login')
        return
      }

      // Check if checkout was already completed
      const checkoutCompleted = sessionStorage.getItem('checkout_completed')
      if (checkoutCompleted === 'true') {
        sessionStorage.removeItem('checkout_completed')
        Swal.fire({
          title: 'Pesanan Sudah Dibuat',
          text: 'Pesanan untuk produk ini sudah berhasil dibuat sebelumnya',
          icon: 'info',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'Lihat Pesanan',
        }).then(() => {
          router.replace('/orders')
        })
        return
      }

      // Get data from route query
      productId.value = route.query.product_id
      variantId.value = route.query.variant_id
      finishingId.value = route.query.finishing_id
      quantity.value = parseInt(route.query.quantity) || 1
      itemAdditionalInfo.value = route.query.note || ''

      if (!productId.value || !variantId.value) {
        error.value = 'Data produk tidak lengkap'
        loading.value = false
        return
      }

      try {
        await fetchProfile()
        await fetchAddresses()
        await fetchPreDirectCheckout()
      } catch (err) {
        console.error('Error in onMounted:', err)
        error.value = 'Gagal memuat data. Silakan coba lagi.'
      } finally {
        loading.value = false
      }
    })

    // Prevent user from navigating back after order is created
    onBeforeRouteLeave((to, from, next) => {
      if (orderCreated.value) {
        // If order was created, don't allow back navigation to this page
        next()
      } else if (uploadedFiles.value.length > 0) {
        // If user has uploaded files but hasn't submitted, warn them
        Swal.fire({
          title: 'Batalkan Checkout?',
          text: 'File yang sudah diupload akan hilang. Yakin ingin keluar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#6B7280',
          confirmButtonText: 'Ya, Keluar',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            next()
          } else {
            next(false)
          }
        })
      } else {
        next()
      }
    })

    // Handle browser back button
    const handleBeforeUnload = (e) => {
      if (uploadedFiles.value.length > 0 && !orderCreated.value) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    onMounted(() => {
      window.addEventListener('beforeunload', handleBeforeUnload)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)

      // Clear sessionStorage flag when leaving page normally (not after order creation)
      if (!orderCreated.value) {
        sessionStorage.removeItem('checkout_completed')
      }
    })

    return {
      loading,
      error,
      isSubmitting,
      customerInfo,
      productId,
      variantId,
      finishingId,
      quantity,
      itemAdditionalInfo,
      uploadedFiles,
      priceEstimation,
      productData,
      addresses,
      selectedAddressId,
      selectedAddress,
      shippingOptions,
      selectedShipping,
      paymentMethods,
      selectedPayment,
      additionalInfo,
      subtotal,
      applicationFee,
      shippingCost,
      grandTotal,
      isFormValid,
      openAddressModal,
      isShippingSelected,
      handlePriceChecked,
      submitOrder,
      formatPrice,
    }
  },
}
</script>

<style scoped>
.radio-red:checked {
  accent-color: #dc2626;
}
</style>
