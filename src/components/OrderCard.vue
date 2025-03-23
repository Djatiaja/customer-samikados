<template>
  <div class="p-10 border-b order-card">
    <div class="flex items-center justify-between mb-4">
      <!-- Left Section: User Icon and Shop Name -->
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <img :src="order.shopIcon" alt="Shop Icon" class="rounded-full" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">{{ order.shopName }}</h3>
      </div>

      <!-- Right Section: Status -->
      <span class="text-gray-900 font-semibold">{{ statusLabel }}</span>
    </div>

    <!-- Button Section -->
    <div
      class="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg flex items-center justify-between shadow-sm cursor-pointer"
      @click="$emit('track', order.id)"
    >
      <div>
        <p class="text-base font-medium">{{ getStatusTitle }}</p>
        <p class="text-sm opacity-80">{{ order.statusMessage }}</p>
      </div>
      <span class="text-white text-lg font-semibold">&rsaquo;</span>
    </div>

    <div class="flex items-start mt-4">
      <!-- Product Image -->
      <div class="flex justify-center border mr-4 w-36 overflow-hidden">
        <img :src="order.productImage" alt="Product Image" class="w-full h-auto object-contain" />
      </div>

      <!-- Product Details -->
      <div class="w-full px-4 flex flex-col">
        <h3 class="font-semibold text-xl">{{ order.productName }}</h3>
        <p class="text-gray-500 text-sm mt-2">Catatan: {{ order.notes }}</p>
        <p class="text-gray-500 text-sm">Ukuran: {{ order.size }}</p>
        <p class="text-gray-500 text-sm">Finishing: {{ order.finishing }}</p>
        <div class="text-right mt-4 flex items-center justify-between">
          <p class="font-semibold text-lg border-b-2 w-10 text-center border-black">
            {{ order.quantity }}
          </p>
          <p class="font-semibold text-gray-900 text-xl">{{ formatPrice(order.price) }}</p>
        </div>
      </div>
    </div>

    <!-- Dynamic buttons based on status -->
    <div class="mt-4 flex justify-end" :class="{ 'space-x-4': order.status === 'selesai' }">
      <!-- For completed orders -->
      <template v-if="order.status === 'selesai'">
        <button
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-36"
          @click="$emit('buy-again', order.id)"
        >
          Beli Lagi
        </button>
        <button
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-36"
          @click="$emit('review', order.id)"
        >
          Beri Ulasan
        </button>
      </template>

      <!-- For orders being packed -->
      <template v-else-if="order.status === 'dikemas'">
        <button
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-36"
          @click="$emit('cancel', order.id)"
        >
          Batalkan
        </button>
      </template>

      <!-- For orders being shipped -->
      <template v-else-if="order.status === 'dikirim'">
        <button
          class="bg-white text-red-600 px-4 py-2 rounded-md border border-red-600 cursor-not-allowed w-36 disabled"
        >
          Batalkan
        </button>
      </template>

      <!-- For orders in cancellation process -->
      <template v-else-if="order.status === 'pembatalan'">
        <button
          class="bg-white text-red-600 px-4 py-2 rounded-md border border-red-600 cursor-not-allowed w-36 disabled"
        >
          Membatalkan
        </button>
      </template>

      <!-- For cancelled orders -->
      <template v-else-if="order.status === 'dibatalkan'">
        <button
          class="bg-white text-red-600 px-4 py-2 rounded-md border border-red-600 cursor-not-allowed w-36 disabled"
        >
          Dibatalkan
        </button>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderCard',
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  computed: {
    statusLabel() {
      const statusMap = {
        selesai: 'Pesanan Selesai',
        dikemas: 'Sedang Dikemas',
        dikirim: 'Sedang Dikirim',
        pembatalan: 'Proses Pembatalan',
        dibatalkan: 'Dibatalkan',
      }
      return statusMap[this.order.status] || this.order.status
    },
    getStatusTitle() {
      if (this.order.status === 'selesai') {
        return `Tiba ${this.order.deliveryDate}`
      } else if (this.order.status === 'dikemas' || this.order.status === 'dikirim') {
        return `Perkiraan Tiba ${this.order.deliveryDate}`
      } else if (this.order.status === 'pembatalan') {
        return 'Membatalkan Pesanan'
      } else if (this.order.status === 'dibatalkan') {
        return 'Pesanan Dibatalkan'
      } else {
        return 'Status Tidak Dikenal'
      }
    },
  },
  methods: {
    formatPrice(price) {
      return `Rp${price.toLocaleString('id-ID')}`
    },
  },
}
</script>
