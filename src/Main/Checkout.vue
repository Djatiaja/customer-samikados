<template>
  <div class="bg-gray-100 min-h-screen flex flex-col">
    <!-- Using the HeaderAfterLogin component -->
    <HeaderAfterLogin />

    <!-- Order Detail Section -->
    <main
      class="container mx-auto my-8 bg-white rounded-lg shadow-lg w-full md:w-3/4 px-4 md:px-10 flex-grow"
    >
      <div class="p-4 md:p-6 border-b border-gray-200">
        <h2 class="text-xl md:text-2xl font-semibold text-center">Detail Pesanan</h2>
      </div>

      <!-- Customer Information -->
      <div class="p-4 md:p-6 border-b border-gray-200">
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-4">
            <img
              src="https://placehold.co/40x40"
              alt="Customer Icon"
              class="w-8 md:w-10 h-8 md:h-10 rounded-full"
            />
            <div>
              <p class="font-semibold">{{ customerInfo.name }}</p>
              <p class="text-gray-500 text-sm md:text-base">{{ customerInfo.phone }}</p>
              <p class="text-gray-500 text-sm md:text-base">{{ selectedAddress.address }}</p>
            </div>
          </div>
          <button @click="openAddressModal" class="text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Group products by seller -->
      <div
        v-for="(sellerGroup, sellerIndex) in groupedProducts"
        :key="sellerIndex"
        class="p-4 md:p-6 border-b border-gray-200"
      >
        <div class="flex items-center space-x-4">
          <!-- Seller Icon and Shop Name -->
          <img
            :src="sellerGroup.shopImage"
            alt="Seller Icon"
            class="w-8 md:w-10 h-8 md:h-10 rounded-full"
          />
          <h3 class="font-bold text-base md:text-lg">{{ sellerGroup.shopName }}</h3>
        </div>

        <!-- Products from this seller -->
        <div
          v-for="(product, productIndex) in sellerGroup.products"
          :key="productIndex"
          class="flex flex-col md:flex-row items-start mt-4 pb-4"
          :class="{ 'border-b border-gray-100': productIndex < sellerGroup.products.length - 1 }"
        >
          <!-- Product Image -->
          <div
            class="flex justify-center border border-gray-200 mb-4 md:mb-0 md:mr-4 w-full md:w-36 overflow-hidden"
          >
            <img :src="product.image" alt="Product Image" class="w-full h-auto object-contain" />
          </div>

          <!-- Product Details -->
          <div class="w-full px-0 md:px-4 flex flex-col">
            <h3 class="font-semibold text-lg md:text-xl">{{ product.name }}</h3>
            <p class="text-gray-500 text-sm mt-2" v-if="product.note">
              Catatan: {{ product.note }}
            </p>
            <p class="text-gray-500 text-sm" v-if="product.size">Ukuran: {{ product.size }}</p>
            <p class="text-gray-500 text-sm" v-if="product.finishing">
              Finishing: {{ product.finishing }}
            </p>
            <div class="text-right mt-4 flex items-center justify-between">
              <p class="font-semibold text-lg border-b border-gray-400 w-10 text-center">
                {{ product.quantity }}
              </p>
              <p class="font-semibold text-gray-900 text-lg md:text-xl">
                {{ formatPrice(product.price * product.quantity) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Notes for this seller -->
        <div class="mt-4">
          <textarea
            v-model="sellerNotes[sellerGroup.sellerId]"
            class="w-full p-2 border border-gray-200 rounded-md text-sm"
            rows="2"
            :placeholder="`Catatan untuk ${sellerGroup.shopName}...`"
          ></textarea>
        </div>

        <!-- Shipping options -->
        <div class="mt-4">
          <p class="font-medium mb-2">Pilih Pengiriman:</p>
          <div class="space-y-2">
            <div
              v-for="option in shippingOptions"
              :key="`${sellerGroup.sellerId}-${option.id}`"
              class="flex items-center justify-between p-2 border border-gray-200 rounded-md cursor-pointer"
              :class="{
                'bg-red-50 border-red-300': selectedShipping[sellerGroup.sellerId] === option.id,
              }"
              @click="selectShipping(sellerGroup.sellerId, option.id)"
            >
              <div class="flex items-center">
                <input
                  type="radio"
                  :id="`shipping-${sellerGroup.sellerId}-${option.id}`"
                  :name="`shipping-${sellerGroup.sellerId}`"
                  :value="option.id"
                  :checked="selectedShipping[sellerGroup.sellerId] === option.id"
                  class="mr-2 text-red-600 radio-red"
                />
                <label :for="`shipping-${sellerGroup.sellerId}-${option.id}`" class="text-sm">
                  {{ option.name }} ({{ option.eta }})
                </label>
              </div>
              <span class="text-sm font-medium">{{ formatPrice(option.price) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="p-4 md:p-6 border-b border-gray-200">
        <h3 class="font-semibold">Ringkasan Pesanan</h3>
        <div class="flex justify-between text-gray-600 text-sm my-2">
          <span>Subtotal Produk</span>
          <span>{{ formatPrice(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-gray-600 text-sm my-2">
          <span>Subtotal Pengiriman</span>
          <span>{{ formatPrice(shippingSubtotal) }}</span>
        </div>
        <div class="flex justify-between text-gray-600 text-sm my-2">
          <span>Biaya Layanan</span>
          <span>{{ formatPrice(serviceFee) }}</span>
        </div>
        <div class="flex justify-between text-gray-600 text-sm my-2">
          <span>Diskon</span>
          <span>{{ formatPrice(discount) }}</span>
        </div>
        <div class="flex justify-between font-semibold text-gray-900 my-2">
          <span>Total</span>
          <span>{{ formatPrice(total) }}</span>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="p-4 md:p-6 border-b border-gray-200">
        <h3 class="font-semibold">Metode Pembayaran</h3>
        <div
          class="flex items-center space-x-4 my-2"
          v-for="method in paymentMethods"
          :key="method.id"
        >
          <input
            type="radio"
            name="payment"
            :id="method.id"
            :value="method.id"
            v-model="selectedPayment"
            class="text-red-600 radio-red"
          />
          <label :for="method.id" class="text-gray-600">{{ method.label }}</label>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="p-4 md:p-6 text-center">
        <button
          class="w-full md:w-1/4 bg-red-600 text-white font-semibold py-2 md:py-3 px-6 md:px-10 rounded-lg hover:bg-red-700 transition-colors"
          @click="createOrder"
          :disabled="!isOrderValid"
        >
          Buat Pesanan
        </button>
      </div>
    </main>

    <!-- Using the AuthFooter component -->
    <AuthFooter />
  </div>
</template>

<script>
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import Swal from 'sweetalert2'
import { reactive } from 'vue'

export default {
  name: 'CheckoutPage',
  components: {
    HeaderAfterLogin,
    AuthFooter,
  },
  data() {
    return {
      customerInfo: {
        name: 'Anastasia Putri',
        phone: '081234567890',
      },
      addresses: [
        {
          id: 1,
          name: 'Anastasia Putri',
          phone: '081234567890',
          address: 'Jalan Podocarpus IIA No.5, Yogyakarta',
          isDefault: true,
        },
        {
          id: 2,
          name: 'Anastasia Putri',
          phone: '081234567890',
          address: 'Jalan Kaliurang KM 7, Yogyakarta',
          isDefault: false,
        },
      ],
      selectedAddressId: 1,
      products: [
        {
          sellerId: 1,
          shopName: 'Ruang Jaya Print',
          shopImage: 'https://placehold.co/40x40',
          name: 'PIN PENITI 58mm',
          image: 'https://placehold.co/200x200',
          note: 'Packing pakai selongsong',
          size: '15 x 15 cm',
          finishing: 'Dengan Finishing',
          quantity: 50,
          price: 4500,
        },
        {
          sellerId: 1,
          shopName: 'Ruang Jaya Print',
          shopImage: 'https://placehold.co/40x40',
          name: 'Stiker Vinyl',
          image: 'https://placehold.co/200x200',
          note: 'Tahan air',
          size: '5 x 5 cm',
          finishing: 'Tanpa Finishing',
          quantity: 100,
          price: 1000,
        },
        {
          sellerId: 2,
          shopName: 'Printing Murah',
          shopImage: 'https://placehold.co/40x40',
          name: 'Poster A3',
          image: 'https://placehold.co/200x200',
          note: 'Kertas glossy',
          size: 'A3',
          finishing: 'Dengan Finishing',
          quantity: 10,
          price: 12000,
        },
      ],
      shippingOptions: [
        { id: 'regular', name: 'Regular', price: 10000, eta: '2-3 hari' },
        { id: 'express', name: 'Express', price: 20000, eta: '1 hari' },
        { id: 'same_day', name: 'Same Day', price: 30000, eta: 'Hari ini' },
      ],
      selectedShipping: reactive({}),
      sellerNotes: reactive({}),
      paymentMethods: [
        { id: 'midtrans', label: 'Transfer ke Midtrans' },
        { id: 'cash', label: 'Cash (Ambil di Tempat)' },
      ],
      selectedPayment: '',
      serviceFee: 1000,
      discount: 0,
    }
  },
  computed: {
    selectedAddress() {
      return this.addresses.find((addr) => addr.id === this.selectedAddressId) || this.addresses[0]
    },
    groupedProducts() {
      // Group products by seller
      const groupedBySeller = this.products.reduce((groups, product) => {
        const sellerId = product.sellerId
        if (!groups[sellerId]) {
          groups[sellerId] = {
            sellerId: sellerId,
            shopName: product.shopName,
            shopImage: product.shopImage,
            products: [],
          }
        }
        groups[sellerId].products.push(product)
        return groups
      }, {})

      // Convert to array for v-for
      return Object.values(groupedBySeller)
    },
    subtotal() {
      return this.products.reduce((sum, product) => sum + product.price * product.quantity, 0)
    },
    shippingSubtotal() {
      // Calculate total shipping cost based on selected options
      let total = 0
      for (const [sellerId, shippingId] of Object.entries(this.selectedShipping)) {
        const option = this.shippingOptions.find((opt) => opt.id === shippingId)
        if (option) {
          total += option.price
        }
      }
      return total
    },
    total() {
      return this.subtotal + this.shippingSubtotal + this.serviceFee - this.discount
    },
    isOrderValid() {
      // Check if all sellers have shipping options selected
      const sellerIds = [...new Set(this.products.map((p) => p.sellerId))]
      return sellerIds.every((id) => this.selectedShipping[id]) && this.selectedPayment
    },
  },
  methods: {
    formatPrice(price) {
      return `Rp${price.toLocaleString('id-ID')}`
    },
    selectShipping(sellerId, optionId) {
      this.selectedShipping[sellerId] = optionId
    },
    openAddressModal() {
      const addressHtml = this.addresses
        .map((addr) => {
          const isSelected = addr.id === this.selectedAddressId
          return `
          <div class="address-item ${isSelected ? 'selected' : ''}" data-id="${addr.id}">
            <div class="flex items-start p-3 border ${isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-md mb-2 cursor-pointer">
              <input type="radio" name="address" ${isSelected ? 'checked' : ''} class="mt-1 mr-2">
              <div>
                <p class="font-medium">${addr.name}</p>
                <p class="text-sm text-gray-600">${addr.phone}</p>
                <p class="text-sm text-gray-600">${addr.address}</p>
              </div>
            </div>
          </div>
        `
        })
        .join('')

      Swal.fire({
        title: 'Pilih Alamat Pengiriman',
        html: `
          <div class="address-list mb-4">
            ${addressHtml}
          </div>
          <button id="add-new-address" class="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md text-center">
            + Tambah Alamat Baru
          </button>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Pilih',
        confirmButtonColor: '#dc2626',
        customClass: {
          container: 'swal-wide',
          popup: 'rounded-lg',
          header: 'border-b pb-2',
          title: 'text-xl font-medium',
        },
        didOpen: () => {
          // Add click handler for address items
          document.querySelectorAll('.address-item').forEach((item) => {
            item.addEventListener('click', () => {
              document.querySelectorAll('.address-item').forEach((i) => {
                i.classList.remove('selected')
                i.querySelector('input').checked = false
                i.querySelector('.border').classList.remove('border-red-500', 'bg-red-50')
                i.querySelector('.border').classList.add('border-gray-200')
              })

              item.classList.add('selected')
              item.querySelector('input').checked = true
              item.querySelector('.border').classList.remove('border-gray-200')
              item.querySelector('.border').classList.add('border-red-500', 'bg-red-50')
            })
          })

          // Add click handler for "add new address" button
          document.getElementById('add-new-address').addEventListener('click', () => {
            this.openNewAddressForm()
          })
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const selectedItem = document.querySelector('.address-item.selected')
          if (selectedItem) {
            this.selectedAddressId = parseInt(selectedItem.dataset.id)
          }
        }
      })
    },
    openNewAddressForm() {
      Swal.fire({
        title: 'Tambah Alamat Baru',
        html: `
          <form id="new-address-form" class="text-left">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-medium mb-1">Nama Penerima</label>
              <input type="text" id="recipient-name" class="w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-medium mb-1">Nomor Telepon</label>
              <input type="text" id="recipient-phone" class="w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-medium mb-1">Alamat Lengkap</label>
              <textarea id="recipient-address" rows="3" class="w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
            <div class="mb-1">
              <label class="flex items-center">
                <input type="checkbox" id="set-as-default" class="mr-2">
                <span class="text-sm">Jadikan alamat utama</span>
              </label>
            </div>
          </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#dc2626',
        customClass: {
          container: 'swal-wide',
          popup: 'rounded-lg',
          header: 'border-b pb-2',
          title: 'text-xl font-medium',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const name = document.getElementById('recipient-name').value
          const phone = document.getElementById('recipient-phone').value
          const address = document.getElementById('recipient-address').value
          const isDefault = document.getElementById('set-as-default').checked

          if (name && phone && address) {
            // Add new address
            const newId = Math.max(...this.addresses.map((a) => a.id)) + 1
            const newAddress = { id: newId, name, phone, address, isDefault }

            // If set as default, update other addresses
            if (isDefault) {
              this.addresses.forEach((a) => (a.isDefault = false))
            }

            this.addresses.push(newAddress)
            this.selectedAddressId = newId

            Swal.fire({
              title: 'Berhasil!',
              text: 'Alamat baru telah ditambahkan',
              icon: 'success',
              confirmButtonColor: '#dc2626',
            })
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Semua field harus diisi',
              icon: 'error',
              confirmButtonColor: '#dc2626',
            })
          }
        }
      })
    },
    createOrder() {
      if (!this.isOrderValid) {
        Swal.fire({
          title: 'Pesanan Belum Lengkap',
          text: 'Pilih metode pengiriman untuk semua toko dan metode pembayaran',
          icon: 'warning',
          confirmButtonColor: '#dc2626',
        })
        return
      }

      // Implement order creation logic here
      console.log('Creating order with details:', {
        customer: this.customerInfo,
        address: this.selectedAddress,
        products: this.products,
        shipping: this.selectedShipping,
        notes: this.sellerNotes,
        payment: this.selectedPayment,
        total: this.total,
      })

      Swal.fire({
        title: 'Pesanan Dibuat!',
        text: 'Pesanan Anda telah berhasil dibuat',
        icon: 'success',
        confirmButtonColor: '#dc2626',
      }).then(() => {
        // After successful order creation, navigate to orders page
        this.$router.push('/orders')
      })
    },
  },
  created() {
    // Initialize shipping and notes for each seller without using $set
    const sellerIds = [...new Set(this.products.map((p) => p.sellerId))]
    sellerIds.forEach((id) => {
      this.sellerNotes[id] = ''
      // Don't pre-select shipping options
    })
  },
}
</script>

<style scoped>
/* Custom Tailwind checkbox style */
.radio-red:checked {
  accent-color: #dc2626; /* Tailwind's red-600 color */
}

/* SweetAlert customizations */
::v-deep .swal-wide {
  width: 500px !important;
}

/* Additional responsive styles */
@media (max-width: 768px) {
  ::v-deep .swal-wide {
    width: 90% !important;
  }
}
</style>
