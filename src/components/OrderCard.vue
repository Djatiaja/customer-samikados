<template>
  <div class="p-6 bg-white rounded-lg shadow-md order-card mb-6">
    <!-- Header: Shop Info and Status -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden"
        >
          <img :src="order.shopIcon" alt="Shop Icon" class="w-full h-full object-cover" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800">{{ order.shopName }}</h3>
      </div>
      <span :class="getStatusClass" class="text-sm font-medium text-white px-3 py-1 rounded-full">
        {{ statusLabel }}
      </span>
    </div>

    <!-- Products List (Limited to 2 initially) -->
    <div
      v-for="(product, index) in displayedProducts"
      :key="index"
      class="flex items-start mb-4 last:mb-0"
    >
      <!-- Product Image -->
      <div class="flex justify-center border mr-4 w-24 h-24 rounded-md overflow-hidden">
        <img :src="product.productImage" alt="Product Image" class="w-full h-full object-contain" />
      </div>
      <!-- Product Details -->
      <div class="flex-1">
        <h4 class="font-medium text-gray-800">{{ product.productName }}</h4>
        <p class="text-gray-500 text-sm mt-1">Catatan: {{ order.notes || 'Tidak ada catatan' }}</p>
        <p class="text-gray-500 text-sm">Finishing: {{ product.finishing || 'Tanpa Finishing' }}</p>
        <div class="flex justify-between items-center mt-2">
          <p class="text-gray-600 text-sm">Jumlah: {{ product.quantity }}</p>
          <p class="font-semibold text-gray-800">{{ formatPrice(product.subtotal) }}</p>
        </div>
      </div>
    </div>

    <!-- Accordion Toggle Button -->
    <div v-if="order.products.length > 2" class="mt-4">
      <button
        @click="isExpanded = !isExpanded"
        class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center text-sm"
      >
        {{ isExpanded ? 'Sembunyikan' : 'Lihat Semua Pesanan' }}
        <span class="ml-2">{{ isExpanded ? '▲' : '▼' }}</span>
      </button>
    </div>

    <!-- Total and Status Button -->
    <div class="flex items-center justify-between mt-4 pt-4 border-t">
      <div>
        <p class="text-sm font-medium text-gray-700">{{ getStatusTitle }}</p>
        <p class="text-xs text-gray-500">{{ order.statusMessage }}</p>
      </div>
      <p class="font-semibold text-lg text-gray-800">Total: {{ formatPrice(order.price) }}</p>
    </div>

    <!-- Track Button -->
    <div class="mt-4">
      <button
        class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center justify-between"
        @click="$emit('track', order.id)"
      >
        <span>Detail Pesanan</span>
        <span class="text-lg">›</span>
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="mt-4 flex justify-end space-x-3">
      <template v-if="order.status === 'selesai'">
        <button
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-32 text-sm"
          @click="$emit('buy-again', order.id)"
        >
          Beli Lagi
        </button>
        <button
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-32 text-sm"
          @click="$emit('review', order.id)"
        >
          Beri Ulasan
        </button>
      </template>
      <template v-else-if="order.status === 'Diproses'">
        <button
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-32 text-sm"
          @click="$emit('cancel', order.id)"
        >
          Batalkan
        </button>
      </template>
      <template v-else-if="order.status === 'Masuk' || order.status === 'Belum Dibayar'">
        <button
          class="bg-gray-100 text-red-600 px-4 py-2 rounded-md border border-red-600 cursor-not-allowed w-32 text-sm"
          disabled
        >
          {{ order.status === 'Belum Dibayar' ? 'Belum Dibayar' : 'Batalkan' }}
        </button>
      </template>
      <template v-else-if="order.status === 'batal'">
        <button
          class="bg-gray-100 text-red-600 px-4 py-2 rounded-md border border-red-600 cursor-not-allowed w-32 text-sm"
          disabled
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
    orderStatuses: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isExpanded: false,
    }
  },
  computed: {
    statusLabel() {
      const statusMap = {
        Masuk: 'Pesanan Masuk',
        Diproses: 'Sedang Diproses',
        selesai: 'Pesanan Selesai',
        batal: 'Dibatalkan',
        'Belum Dibayar': 'Belum Dibayar',
      }
      return statusMap[this.order.status] || this.order.status
    },
    getStatusClass() {
      const statusLower = this.order.status.toLowerCase()
      switch (statusLower) {
        case 'masuk':
        case 'pending':
        case 'belum dibayar':
        case 'unpaid':
          return 'bg-yellow-200 text-yellow-800'
        case 'diproses':
        case 'processing':
          return 'bg-blue-500 text-blue-800'
        case 'dikirim':
        case 'shipped':
        case 'in_transit':
          return 'bg-orange-500 text-orange-800'
        case 'selesai':
        case 'completed':
          return 'bg-green-500 text-green-800'
        case 'batal':
        case 'dibatalkan':
        case 'cancelled':
          return 'bg-red-500 text-red-800'
        default:
          return 'bg-gray-300 text-gray-800'
      }
    },
    getStatusTitle() {
      if (this.order.status === 'selesai') {
        return `Pesanan telah selesai`
      } else if (this.order.status === 'Diproses') {
        return `Pesanan dalam proses`
      } else if (this.order.status === 'Masuk') {
        return `Pesanan diterima`
      } else if (this.order.status === 'batal') {
        return 'Pesanan Dibatalkan'
      } else if (this.order.status === 'Belum Dibayar') {
        return 'Menunggu Pembayaran'
      } else {
        return 'Status Tidak Dikenal'
      }
    },
    displayedProducts() {
      return this.isExpanded ? this.order.products : this.order.products.slice(0, 2)
    },
  },
  methods: {
    formatPrice(price) {
      return `Rp${price.toLocaleString('id-ID')}`
    },
  },
}
</script>
