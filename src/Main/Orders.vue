<template>
  <div class="bg-gray-100 min-h-screen flex flex-col">
    <HeaderAfterLogin />
    <div class="container mx-auto my-8 px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <p>Memuat data pesanan...</p>
      </div>

      <!-- Content when loaded -->
      <div v-else>
        <!-- Filter -->
        <div class="mb-6">
          <div class="w-full sm:w-64">
            <select
              v-model="selectedStatus"
              class="block w-full p-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
            >
              <option value="all">Semua Pesanan</option>
              <option v-for="status in orderStatuses" :key="status.id" :value="status.name">
                {{ status.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Order Section -->
        <main class="space-y-6">
          <div v-if="filteredOrders.length === 0" class="text-center py-8">
            <p class="text-gray-500">Tidak ada pesanan ditemukan.</p>
          </div>
          <OrderCard
            v-else
            v-for="order in filteredOrders"
            :key="order.id"
            :order="order"
            :order-statuses="orderStatuses"
            @cancel="showCancelModal(order.id)"
            @track="goToTrackOrder(order.id)"
            @review="goToReviewOrder(order.id)"
            @buy-again="goToCheckout(order.id)"
          />
        </main>
      </div>
    </div>
    <AuthFooter />
  </div>
</template>

<script>
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import OrderCard from '@/components/OrderCard.vue'
import Swal from 'sweetalert2'
import axios from 'axios'

const baseUrl = import.meta.env.VITE_API_BASE_URL

// Set up axios interceptors
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Silakan login kembali.',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
    }
    return Promise.reject(error)
  },
)

export default {
  name: 'OrderDetailsPage',
  components: {
    HeaderAfterLogin,
    AuthFooter,
    OrderCard,
  },
  data() {
    return {
      selectedStatus: 'all',
      currentOrderId: null,
      orders: [],
      orderStatuses: [],
      isLoading: true,
    }
  },
  computed: {
    filteredOrders() {
      if (this.selectedStatus === 'all') {
        return this.orders
      }
      return this.orders.filter((order) => order.status === this.selectedStatus)
    },
  },
  async created() {
    await this.initializeData()
  },
  methods: {
    async initializeData() {
      this.isLoading = true
      try {
        await Promise.all([this.fetchOrderStatuses(), this.fetchOrders()])
      } catch (error) {
        console.error('Error initializing data:', error)
        this.showErrorMessage('Gagal memuat data. Silakan refresh halaman.')
      } finally {
        this.isLoading = false
      }
    },
    async fetchOrderStatuses() {
      try {
        const response = await axios.get(`${baseUrl}/customer/orders/statuses`)
        console.log('Order statuses response:', response.data) // Debug log

        if (response.data && response.data.status === 'success' && response.data.data) {
          this.orderStatuses = response.data.data
        } else {
          console.warn('Unexpected order statuses response format:', response.data)
          this.orderStatuses = []
        }
      } catch (error) {
        console.error('Error fetching order statuses:', error)
        this.orderStatuses = []
        throw error // Re-throw to be caught by initializeData
      }
    },
    async fetchOrders() {
      try {
        const response = await axios.get(`${baseUrl}/customer/orders`)
        console.log('Orders response:', response.data) // Debug log

        if (response.data && response.data.status === 'success' && response.data.data) {
          // Handle different possible response structures
          const ordersData = response.data.data.data || response.data.data

          if (Array.isArray(ordersData)) {
            this.orders = ordersData.map((order) => this.mapOrderData(order))
          } else {
            console.warn('Orders data is not an array:', ordersData)
            this.orders = []
          }
        } else {
          console.warn('Unexpected orders response format:', response.data)
          this.orders = []
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        this.orders = []
        throw error // Re-throw to be caught by initializeData
      }
    },
    mapOrderData(order) {
      try {
        return {
          id: order.id,
          status: order.order_status?.name || 'Unknown',
          shopName: order.seller?.name || 'Unknown Shop',
          shopIcon: order.seller?.user?.photo_url || 'https://placehold.co/50x50',
          deliveryDate: order.shipping_airway_bill || 'N/A',
          statusMessage: `Pesanan Anda ${order.order_status?.name || 'Unknown'}`,
          products: this.mapOrderProducts(order.order_detail || []),
          notes: order.additional_info || 'Tidak ada catatan',
          totalQuantity: this.calculateTotalQuantity(order.order_detail || []),
          price: order.grand_total || 0,
        }
      } catch (error) {
        console.error('Error mapping order data:', error, order)
        // Return a fallback order object
        return {
          id: order.id || 'unknown',
          status: 'Unknown',
          shopName: 'Unknown Shop',
          shopIcon: 'https://placehold.co/50x50',
          deliveryDate: 'N/A',
          statusMessage: 'Status tidak diketahui',
          products: [],
          notes: 'Tidak ada catatan',
          totalQuantity: 0,
          price: 0,
        }
      }
    },
    mapOrderProducts(orderDetails) {
      if (!Array.isArray(orderDetails)) {
        console.warn('Order details is not an array:', orderDetails)
        return []
      }

      return orderDetails.map((detail) => ({
        productImage: detail.product?.thumbnail_url || 'https://placehold.co/200x200',
        productName: detail.product?.name || 'Unknown Product',
        quantity: detail.quantity || 0,
        subtotal: detail.subtotal_price || 0,
        finishing: detail.product_finishing?.name || 'Tanpa Finishing',
      }))
    },
    calculateTotalQuantity(orderDetails) {
      if (!Array.isArray(orderDetails)) return 0
      return orderDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0)
    },
    showErrorMessage(message) {
      Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'Tutup',
      })
    },
    async showCancelModal(orderId) {
      this.currentOrderId = orderId
      const result = await Swal.fire({
        title: `<h3 class="text-xl font-bold">Konfirmasi Batalkan Pesanan</h3>`,
        html: `<p class="text-center mb-3">Apakah Anda yakin ingin membatalkan pesanan?</p>`,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md mr-4',
          cancelButton: 'bg-gray-200 text-black py-2 w-24 rounded-md',
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Ya',
        width: 400,
      })
      if (result.isConfirmed) {
        await this.processCancelOrder()
      }
    },
    async processCancelOrder() {
      try {
        await axios.post(`${baseUrl}/customer/orders/${this.currentOrderId}/cancel`)

        // Update the order status locally
        const orderIndex = this.orders.findIndex((order) => order.id === this.currentOrderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = 'batal'
          this.orders[orderIndex].statusMessage = 'Pesanan Dibatalkan'
        }

        this.showProcessingModal()
      } catch (error) {
        console.error('Error cancelling order:', error)
        let errorMessage = 'Gagal membatalkan pesanan.'

        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }

        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Tutup',
        })
      }
    },
    showProcessingModal() {
      Swal.fire({
        title: `<span class="text-xl font-bold">Permintaan Sedang Diproses</span>`,
        html: `<p class="text-lg">Permintaan pembatalan Anda sedang diproses. Silakan tunggu konfirmasi dari penjual.</p>`,
        showCancelButton: false,
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
        },
        confirmButtonText: 'Tutup',
      })
    },
    goToTrackOrder(orderId) {
      localStorage.setItem('order_id', orderId)
      this.$router.push(`/track-order`)
    },
    goToReviewOrder(orderId) {
      this.$router.push(`/review-order/${orderId}`)
    },
    goToCheckout(orderId) {
      this.$router.push(`/checkout/${orderId}`)
    },
  },
}
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>
