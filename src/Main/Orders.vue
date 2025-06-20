<template>
  <div class="bg-gray-100 min-h-screen flex flex-col">
    <HeaderAfterLogin />
    <div class="container mx-auto my-8 px-4 sm:px-6 lg:px-8">
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
        <OrderCard
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
    try {
      await this.fetchOrderStatuses()
      await this.fetchOrders()
    } catch (error) {
      console.error('Error in created hook:', error)
    }
  },
  methods: {
    async fetchOrderStatuses() {
      try {
        const response = await axios.get(`${baseUrl}/customer/orders/statuses`)
        if (response.data.status === 'success') {
          this.orderStatuses = response.data.data
        }
      } catch (error) {
        console.error('Error fetching order statuses:', error)
        Swal.fire({
          title: 'Error',
          text: 'Gagal memuat status pesanan.',
          icon: 'error',
          confirmButtonText: 'Tutup',
        })
      }
    },
    async fetchOrders() {
      try {
        const response = await axios.get(`${baseUrl}/customer/orders`)
        if (response.data.status === 'success') {
          this.orders = response.data.data.data.map((order) => ({
            id: order.id,
            status: order.order_status.name,
            shopName: order.seller.name,
            shopIcon: order.seller.user.photo_url || 'https://placehold.co/50x50',
            deliveryDate: order.shipping_airway_bill || 'N/A',
            statusMessage: `Pesanan Anda ${order.order_status.name}`,
            products: order.order_detail.map((detail) => ({
              productImage: detail.product.thumbnail_url || 'https://placehold.co/200x200',
              productName: detail.product.name,
              quantity: detail.quantity,
              subtotal: detail.subtotal_price,
              finishing: detail.product_finishing?.name || 'Tanpa Finishing',
            })),
            notes: order.additional_info || 'Tidak ada catatan',
            totalQuantity: order.order_detail.reduce((sum, detail) => sum + detail.quantity, 0),
            price: order.grand_total,
          }))
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        Swal.fire({
          title: 'Error',
          text: 'Gagal memuat daftar pesanan.',
          icon: 'error',
          confirmButtonText: 'Tutup',
        })
      }
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
        const orderIndex = this.orders.findIndex((order) => order.id === this.currentOrderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = 'batal'
          this.orders[orderIndex].statusMessage = 'Pesanan Dibatalkan'
        }
        this.showProcessingModal()
      } catch (error) {
        console.error('Error cancelling order:', error)
        Swal.fire({
          title: 'Error',
          text: 'Gagal membatalkan pesanan.',
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
      localStorage.setItem('order_id', orderId) // Store order_id in localStorage
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
