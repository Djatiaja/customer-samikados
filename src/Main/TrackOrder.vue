<template>
  <div class="bg-gray-100 min-h-screen">
    <!-- Header Section -->
    <HeaderAfterLogin />

    <!-- Order Details Section -->
    <main
      class="container mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md mt-4 sm:mt-6 mb-16 w-full sm:w-3/4"
    >
      <div class="flex items-center justify-between mb-4 sm:mb-6 relative">
        <router-link
          to="/orders"
          class="absolute left-0 text-black text-2xl sm:text-3xl font-semibold hover:text-gray-600 transition-colors duration-200"
          >←</router-link
        >
        <h1 class="text-xl sm:text-2xl font-semibold mx-auto text-gray-800">Detail Pesanan</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div
          class="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-3"
        ></div>
        <p class="text-base sm:text-lg text-gray-600">Memuat detail pesanan...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="text-center py-8">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
          <p class="text-base sm:text-lg text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Order Details -->
      <div v-if="order && !loading" class="space-y-6">
        <!-- Order Status & Payment Status -->
        <div
          class="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
        >
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
            Status Pesanan
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div class="space-y-1">
              <p class="text-sm text-gray-600 font-medium">Status Pesanan</p>
              <span
                class="inline-flex px-2 sm:px-3 py-1 rounded-full text-sm font-semibold"
                :class="getOrderStatusClass(order.order_status.name)"
              >
                {{ order.order_status.name }}
              </span>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-600 font-medium">Status Pembayaran</p>
              <span
                class="inline-flex px-2 sm:px-3 py-1 rounded-full text-sm font-semibold"
                :class="getPaymentStatusClass(getPaymentStatus(order.order_status.name))"
              >
                {{ getPaymentStatusText(getPaymentStatus(order.order_status.name)) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Info -->
        <div
          class="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
        >
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Informasi Pesanan
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div class="space-y-1">
              <p class="text-sm text-gray-600 font-medium">ID Pesanan</p>
              <p class="text-base font-semibold text-black">{{ order.id }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-600 font-medium">Tanggal Pembuatan</p>
              <p class="text-base font-semibold text-black">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="space-y-1 sm:col-span-2">
              <p class="text-sm text-gray-600 font-medium">Alamat Pengiriman</p>
              <p class="text-base font-semibold text-black leading-relaxed">{{ order.address }}</p>
            </div>
            <div class="space-y-1 sm:col-span-2">
              <p class="text-sm text-gray-600 font-medium">Catatan Tambahan</p>
              <p class="text-base font-semibold text-black">{{ order.additional_info || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Seller Info -->
        <div
          class="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
        >
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div class="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
            Informasi Penjual
          </h2>
          <div class="flex items-center space-x-4">
            <img
              :src="
                order.seller.user.photo_url || 'https://placehold.co/64x64/e2e8f0/64748b?text=👤'
              "
              alt="Seller Avatar"
              class="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full"
            />
            <div>
              <p class="text-base font-semibold text-gray-800">{{ order.seller.name }}</p>
            </div>
          </div>
        </div>

        <!-- Shipping Info -->
        <div
          class="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
        >
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            Informasi Pengiriman
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div class="space-y-1">
              <p class="text-sm text-gray-600 font-medium">Jasa Pengiriman</p>
              <p class="text-base font-semibold text-black">{{ order.shipping_name }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-600 font-medium">Layanan</p>
              <p class="text-base font-semibold text-black">{{ order.service_name }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-600 font-medium">Nomor Resi</p>
              <div class="flex items-center space-x-3">
                <p class="text-base font-semibold text-black">
                  {{ order.shipping_airway_bill || '-' }}
                </p>
                <button
                  v-if="order.shipping_airway_bill"
                  class="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-200"
                  @click="copyTrackingNumber"
                  title="Salin nomor resi"
                >
                  <font-awesome-icon :icon="['fas', 'copy']" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-600 font-medium">ID Pengiriman</p>
              <p class="text-base font-semibold text-black">{{ order.shipping_order_id || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div
          class="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
        >
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div class="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
            Daftar Produk
          </h2>
          <div class="space-y-4">
            <div
              v-for="item in order.order_detail"
              :key="item.id"
              class="flex items-start p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <img
                :src="
                  item.product.thumbnail_url || 'https://placehold.co/80x80/e2e8f0/64748b?text=📦'
                "
                alt="Product Image"
                class="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg flex-shrink-0"
              />
              <div class="ml-3 sm:ml-4 flex-1">
                <p class="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  {{ item.product.name || 'Produk Tidak Diketahui' }}
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                  <div>
                    <p class="text-sm text-gray-600">
                      <strong>Varian:</strong> {{ item.product_variant?.name || '-' }}
                    </p>
                    <p class="text-sm text-gray-600">
                      <strong>Finishing:</strong> {{ item.product_finishing?.name || '-' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">
                      <strong>Jumlah:</strong> {{ item.quantity || 0 }}
                    </p>
                    <p class="text-sm text-gray-600">
                      <strong>Berat Total:</strong> {{ item.subtotal_weight || 0 }} kg
                    </p>
                    <p class="text-base sm:text-lg font-semibold text-gray-800 mt-1">
                      {{ formatCurrency(item.subtotal_price) }}
                    </p>
                  </div>
                </div>
                <div v-if="item.additional_info" class="text-sm text-gray-600 italic">
                  <strong>Catatan:</strong> {{ item.additional_info }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div
          class="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
        >
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            Ringkasan Pembayaran
          </h2>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-gray-100">
              <p class="text-sm text-gray-600 font-medium">Subtotal</p>
              <p class="text-base font-semibold text-black">{{ formatCurrency(order.subtotal) }}</p>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100">
              <p class="text-sm text-gray-600 font-medium">Biaya Pengiriman</p>
              <p class="text-base font-semibold text-black">
                {{ formatCurrency(order.delivery_price) }}
              </p>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100">
              <p class="text-sm text-gray-600 font-medium">Biaya Aplikasi</p>
              <p class="text-base font-semibold text-black">
                {{ formatCurrency(order.application_fee) }}
              </p>
            </div>
            <div class="flex justify-between py-3 bg-gray-50 rounded-lg px-4 mt-4">
              <p class="text-base sm:text-lg font-bold text-gray-800">Total</p>
              <p class="text-base sm:text-lg font-bold text-black">
                {{ formatCurrency(order.grand_total) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6">
          <!-- Belum Dibayar -->
          <template v-if="isUnpaidStatus(order.order_status.name)">
            <button
              @click="processPayment"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <font-awesome-icon :icon="['fas', 'credit-card']" />
              <span>Bayar Sekarang</span>
            </button>
            <button
              @click="cancelOrder"
              class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <font-awesome-icon :icon="['fas', 'times']" />
              <span>Batalkan Pesanan</span>
            </button>
          </template>

          <!-- Sudah Dibayar dan Sedang Diproses/Dikirim -->
          <template
            v-else-if="
              ['processing', 'shipped', 'in_transit', 'diproses', 'dikirim'].includes(
                order.order_status.name.toLowerCase(),
              )
            "
          >
            <button
              @click="completeOrder"
              class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <font-awesome-icon :icon="['fas', 'check']" />
              <span>Selesaikan Pesanan</span>
            </button>
          </template>

          <!-- Sudah Selesai -->
          <template
            v-else-if="
              order.order_status.name.toLowerCase() === 'completed' ||
              order.order_status.name.toLowerCase() === 'selesai'
            "
          >
            <div class="text-center">
              <span
                class="bg-green-100 text-green-800 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold inline-flex items-center space-x-2"
              >
                <font-awesome-icon :icon="['fas', 'check-circle']" />
                <span>Pesanan Telah Selesai</span>
              </span>
            </div>
          </template>

          <!-- Status Dibatalkan -->
          <template
            v-else-if="
              order.order_status.name.toLowerCase() === 'cancelled' ||
              order.order_status.name.toLowerCase() === 'dibatalkan' ||
              order.order_status.name.toLowerCase() === 'batal'
            "
          >
            <div class="text-center">
              <span
                class="bg-red-100 text-red-800 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold inline-flex items-center space-x-2"
              >
                <font-awesome-icon :icon="['fas', 'times-circle']" />
                <span>Pesanan Dibatalkan</span>
              </span>
            </div>
          </template>

          <!-- Status lainnya -->
          <template v-else>
            <div class="text-center">
              <span
                class="bg-gray-100 text-gray-600 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold"
              >
                Tidak ada aksi yang tersedia
              </span>
            </div>
          </template>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <AuthFooter />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'

export default {
  name: 'OrderDetailPage',

  components: {
    HeaderAfterLogin,
    AuthFooter,
  },

  data() {
    return {
      order: null,
      loading: false,
      error: null,
    }
  },

  methods: {
    async fetchOrderDetails() {
      this.loading = true
      this.error = null

      const orderId = localStorage.getItem('order_id')
      if (!orderId) {
        this.error = 'Order ID tidak ditemukan.'
        this.loading = false
        return
      }

      try {
        const token = localStorage.getItem('auth_token')
        const response = await axios.get(`${this.baseUrl}/customer/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.status === 'success') {
          this.order = response.data.data
          // Normalize order_detail to prevent null issues
          this.order.order_detail = this.order.order_detail.map(item => ({
            ...item,
            product: item.product || { name: 'Produk Tidak Diketahui', thumbnail_url: null },
            product_finishing: item.product_finishing || {
              name: '-',
              finishing: { name: '-', color_code: '-' },
            },
            product_variant: item.product_variant || { name: '-' },
            quantity: item.quantity || 0,
            subtotal_weight: item.subtotal_weight || 0,
            subtotal_price: item.subtotal_price || 0,
          }))
        } else {
          throw new Error(response.data.message || 'Gagal memuat detail pesanan.')
        }
      } catch (err) {
        this.error = err.message || 'Terjadi kesalahan saat mengambil data pesanan.'
        console.error('Error fetching order details:', err)
      } finally {
        this.loading = false
      }
    },

    isUnpaidStatus(orderStatus) {
      const unpaidStatuses = ['belum dibayar', 'unpaid', 'pending']
      return unpaidStatuses.includes(orderStatus.toLowerCase())
    },

    getPaymentStatus(orderStatus) {
      if (this.isUnpaidStatus(orderStatus)) {
        return 'unpaid'
      }
      return 'paid'
    },

    copyTrackingNumber() {
      if (!this.order?.shipping_airway_bill) {
        Swal.fire({
          title: 'Gagal',
          text: 'Nomor resi tidak tersedia.',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#2563EB',
        })
        return
      }

      navigator.clipboard
        .writeText(this.order.shipping_airway_bill)
        .then(() => {
          Swal.fire({
            title: 'Berhasil!',
            text: `Nomor resi ${this.order.shipping_airway_bill} berhasil disalin`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: '#2563EB',
          })
        })
        .catch((err) => {
          console.error('Gagal menyalin nomor resi:', err)
          Swal.fire({
            title: 'Gagal',
            text: 'Tidak dapat menyalin nomor resi.',
            icon: 'error',
            timer: 2000,
            showConfirmButton: false,
            confirmButtonColor: '#2563EB',
          })
        })
    },

    async processPayment() {
      const result = await Swal.fire({
        title: 'Konfirmasi Pembayaran',
        text: `Anda akan melakukan pembayaran sebesar ${this.formatCurrency(this.order.grand_total)}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563EB',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Bayar Sekarang',
        cancelButtonText: 'Batal',
      })

      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: 'Memproses Pembayaran...',
            text: 'Silakan tunggu sebentar',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading()
            },
          })

          const orderId = localStorage.getItem('order_id')
          const token = localStorage.getItem('auth_token')

          // Call the payment endpoint to get snap_token
          const response = await axios.post(
            `${this.baseUrl}/customer/payment/create/${orderId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (response.status !== 200) {
            console.error('Error fetching snap token:', response.status)
            throw new Error(response.data.message || 'Gagal mendapatkan snap token.')
          }

          const { snap_token } = response.data.data

          // Close the loading Swal
          Swal.close()

          // Initialize Midtrans Snap pop-up
          window.snap.pay(snap_token, {
            onSuccess: async (result) => {
              Swal.fire({
                title: 'Pembayaran Berhasil!',
                text: 'Pesanan Anda sedang diproses.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                confirmButtonColor: '#2563EB',
              })
              // Refresh order details to update status
              await this.fetchOrderDetails()
            },
            onPending: (result) => {
              Swal.fire({
                title: 'Pembayaran Menunggu',
                text: 'Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran sesuai instruksi.',
                icon: 'info',
                timer: 3000,
                showConfirmButton: false,
                confirmButtonColor: '#2563EB',
              })
              // Optionally refresh order details
              this.fetchOrderDetails()
            },
            onError: (result) => {
              Swal.fire({
                title: 'Pembayaran Gagal',
                text: 'Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.',
                icon: 'error',
                confirmButtonColor: '#2563EB',
              })
            },
            onClose: () => {
              Swal.fire({
                title: 'Pembayaran Dibatalkan',
                text: 'Anda menutup jendela pembayaran. Silakan coba lagi jika ingin melanjutkan.',
                icon: 'warning',
                confirmButtonColor: '#2563EB',
              })
            },
          })
        } catch (error) {
          Swal.fire({
            title: 'Pembayaran Gagal',
            text: error.message || 'Terjadi kesalahan saat memproses pembayaran.',
            icon: 'error',
            confirmButtonColor: '#2563EB',
          })
        }
      }
    },

    async cancelOrder() {
      const result = await Swal.fire({
        title: 'Batalkan Pesanan?',
        text: 'Apakah Anda yakin ingin membatalkan pesanan ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Tidak',
      })

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('auth_token')
          // Assuming there's a cancel order endpoint
          await axios.post(
            `${this.baseUrl}/customer/orders/${this.order.id}/cancel`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          Swal.fire({
            title: 'Pesanan Dibatalkan',
            text: 'Pesanan Anda telah berhasil dibatalkan',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            confirmButtonColor: '#2563EB',
          })
          this.fetchOrderDetails()
        } catch (error) {
          Swal.fire({
            title: 'Gagal Membatalkan',
            text: 'Terjadi kesalahan saat membatalkan pesanan',
            icon: 'error',
            confirmButtonColor: '#2563EB',
          })
        }
      }
    },

    async completeOrder() {
      const result = await Swal.fire({
        title: 'Selesaikan Pesanan?',
        text: 'Apakah Anda sudah menerima pesanan dengan baik?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#16A34A',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Selesaikan',
        cancelButtonText: 'Belum',
      })

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('auth_token')
          // Assuming there's a complete order endpoint
          await axios.post(
            `${this.baseUrl}/customer/orders/${this.order.id}/complete`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          Swal.fire({
            title: 'Pesanan Selesai!',
            text: 'Terima kasih telah berbelanja dengan kami',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            confirmButtonColor: '#2563EB',
          })
          this.fetchOrderDetails()
        } catch (error) {
          Swal.fire({
            title: 'Gagal Menyelesaikan',
            text: 'Terjadi kesalahan saat menyelesaikan pesanan',
            icon: 'error',
            confirmButtonColor: '#2563EB',
          })
        }
      }
    },

    getOrderStatusClass(status) {
      const statusLower = status.toLowerCase()
      switch (statusLower) {
        case 'masuk':
        case 'pending':
        case 'belum dibayar':
        case 'unpaid':
          return 'bg-yellow-100 text-yellow-800'
        case 'diproses':
        case 'processing':
          return 'bg-blue-100 text-blue-800'
        case 'dikirim':
        case 'shipped':
        case 'in_transit':
          return 'bg-purple-100 text-purple-800'
        case 'selesai':
        case 'completed':
          return 'bg-green-100 text-green-800'
        case 'dibatalkan':
        case 'cancelled':
        case 'batal':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    },

    getPaymentStatusClass(status) {
      switch (status) {
        case 'paid':
          return 'bg-green-100 text-green-800'
        case 'unpaid':
          return 'bg-red-100 text-red-800'
        case 'pending':
          return 'bg-yellow-100 text-yellow-800'
        case 'failed':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    },

    getPaymentStatusText(status) {
      switch (status) {
        case 'paid':
          return 'Sudah Dibayar'
        case 'unpaid':
          return 'Belum Dibayar'
        case 'pending':
          return 'Menunggu Pembayaran'
        case 'failed':
          return 'Pembayaran Gagal'
        default:
          return 'Status Tidak Diketahui'
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount)
    },

    formatDate(dateString) {
      if (!dateString) return '-'

      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    },
  },

  created() {
    // Load Midtrans Snap script dynamically
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY)
    document.head.appendChild(script)

    // Fetch order details
    this.fetchOrderDetails()
  },

  computed: {
    baseUrl() {
      return import.meta.env.VITE_API_BASE_URL
    },
  },
}
</script>

<style scoped>
/* Tailwind responsive adjustments */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
