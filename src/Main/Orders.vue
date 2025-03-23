<template>
  <div class="bg-gray-100 min-h-screen flex flex-col">
    <!-- Using the HeaderAfterLogin component -->
    <HeaderAfterLogin />

    <div class="container mx-auto my-10">
      <!-- Filter -->
      <div class="flex justify-start mb-4">
        <div class="w-1/4">
          <select
            v-model="selectedStatus"
            class="block w-full p-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Semua Pesanan</option>
            <option value="selesai">Pesanan Selesai</option>
            <option value="dikemas">Sedang Dikemas</option>
            <option value="dikirim">Sedang Dikirim</option>
            <option value="pembatalan">Proses Pembatalan</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      <!-- Order Section -->
      <main class="bg-white rounded-lg shadow-md w-full">
        <OrderCard
          v-for="order in filteredOrders"
          :key="order.id"
          :order="order"
          @cancel="showCancelModal(order.id)"
          @track="goToTrackOrder(order.id)"
          @review="goToReviewOrder(order.id)"
          @buy-again="goToCheckout(order.id)"
        />
      </main>
    </div>

    <!-- Using the AuthFooter component -->
    <AuthFooter />
  </div>
</template>

<script>
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import OrderCard from '@/components/OrderCard.vue'
import Swal from 'sweetalert2'

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
      orders: [
        {
          id: 1,
          status: 'selesai',
          shopName: 'Ruang Jaya Print',
          shopIcon: 'https://placehold.co/50x50',
          deliveryDate: '24 September',
          statusMessage: 'Pesanan Anda Telah Selesai',
          productImage: 'https://placehold.co/200x200',
          productName: 'PIN PENITI 58mm',
          notes: 'Packing pakai selongsong',
          size: '15 x 15 cm',
          finishing: 'Dengan Finishing',
          quantity: 50,
          price: 225000,
        },
        {
          id: 2,
          status: 'dikemas',
          shopName: 'Ruang Jaya Print',
          shopIcon: 'https://placehold.co/50x50',
          deliveryDate: '24 September',
          statusMessage: 'Pesanan Anda Sedang Dikemas oleh Penjual',
          productImage: 'https://placehold.co/200x200',
          productName: 'PIN PENITI 58mm',
          notes: 'Packing pakai selongsong',
          size: '15 x 15 cm',
          finishing: 'Dengan Finishing',
          quantity: 50,
          price: 225000,
        },
        {
          id: 3,
          status: 'dikirim',
          shopName: 'Ruang Jaya Print',
          shopIcon: 'https://placehold.co/50x50',
          deliveryDate: '24 September',
          statusMessage: 'Pesanan Anda Sedang Dalam Perjalanan',
          productImage: 'https://placehold.co/200x200',
          productName: 'PIN PENITI 58mm',
          notes: 'Packing pakai selongsong',
          size: '15 x 15 cm',
          finishing: 'Dengan Finishing',
          quantity: 50,
          price: 225000,
        },
        {
          id: 4,
          status: 'pembatalan',
          shopName: 'Ruang Jaya Print',
          shopIcon: 'https://placehold.co/50x50',
          deliveryDate: null,
          statusMessage: 'Menunggu Konfirmasi Pembatalan dari Seller',
          productImage: 'https://placehold.co/200x200',
          productName: 'PIN PENITI 58mm',
          notes: 'Packing pakai selongsong',
          size: '15 x 15 cm',
          finishing: 'Dengan Finishing',
          quantity: 50,
          price: 225000,
        },
        {
          id: 5,
          status: 'dibatalkan',
          shopName: 'Ruang Jaya Print',
          shopIcon: 'https://placehold.co/50x50',
          deliveryDate: null,
          statusMessage: 'Seller Mengonfirmasi Pembatalan',
          productImage: 'https://placehold.co/200x200',
          productName: 'PIN PENITI 58mm',
          notes: 'Packing pakai selongsong',
          size: '15 x 15 cm',
          finishing: 'Dengan Finishing',
          quantity: 50,
          price: 225000,
        },
      ],
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
  methods: {
    showCancelModal(orderId) {
      this.currentOrderId = orderId

      Swal.fire({
        title: `<h3 class="text-xl font-bold">Konfirmasi Batalkan Pesanan</h3>`,
        html: `
          <p class="text-center mb-3">
            Apakah Anda yakin ingin membatalkan pesanan?
          </p>
        `,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md mr-4',
          cancelButton: 'bg-gray-200 text-black py-2 w-24 rounded-md',
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Ya',
        width: 400,
      }).then((result) => {
        if (result.isConfirmed) {
          this.processCancelOrder()
        }
      })
    },

    processCancelOrder() {
      // Find the order and update its status
      const orderIndex = this.orders.findIndex((order) => order.id === this.currentOrderId)
      if (orderIndex !== -1) {
        // Update the order status to 'pembatalan' (cancellation in progress)
        this.orders[orderIndex].status = 'pembatalan'
        this.orders[orderIndex].statusMessage = 'Menunggu Konfirmasi Pembatalan dari Seller'
      }

      // Show the processing modal
      this.showProcessingModal()
    },

    showProcessingModal() {
      Swal.fire({
        title: `<span class="text-xl font-bold">Permintaan Sedang Diproses</span>`,
        html: `
          <p class="text-lg">
            Permintaan pembatalan Anda sedang diproses. Silakan tunggu konfirmasi dari penjual.
          </p>
        `,
        showCancelButton: false,
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
        },
        confirmButtonText: 'Tutup',
      })
    },
    // parameter (orderId)
    goToTrackOrder() {
      // Navigate to track order page with the order ID
      this.$router.push(`/track-order`)
    },
    // param (orderId)
    goToReviewOrder() {
      // Navigate to review order page with the order ID ${orderId}
      this.$router.push(`/review-order`)
    },
    //param (orderId)
    goToCheckout() {
      // Navigate to checkout page with the order ID for reordering /${orderId}
      this.$router.push(`/checkout`)
    },
  },
}
</script>

<style scoped>
/* Pastikan container bisa memanjang untuk mengisi seluruh halaman */
.min-h-screen {
  min-height: 100vh;
}

/* Agar footer berada di bawah konten */
.flex-grow {
  flex-grow: 1;
}
</style>
