<template>
  <!-- Root container -->
  <div class="bg-gray-100 min-h-screen flex flex-col">
    <HeaderAfterLogin />
    <!-- Main content -->
    <main
      class="container mx-auto my-8 bg-white rounded-lg shadow-lg w-full md:w-3/4 px-4 md:px-10 flex-grow"
    >
      <div class="p-4 md:p-6 border-b border-gray-200">
        <h2 class="text-xl md:text-2xl font-semibold text-center">Detail Pesanan</h2>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="p-4 md:p-6 text-center">
        <p class="text-lg">Memuat detail checkout...</p>
      </div>
      <!-- Error state -->
      <div v-else-if="error" class="p-4 md:p-6 text-center text-red-600">
        <p class="text-lg">{{ error }}</p>
      </div>
      <!-- Main content -->
      <div v-else>
        <!-- Customer Information -->
        <div class="p-4 md:p-6 border-b border-gray-200">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4">
              <img
                :src="customerInfo.photo_url"
                alt="Customer Icon"
                class="w-8 md:w-10 h-8 md:h-10 rounded-full"
              />
              <div>
                <p class="font-semibold">{{ selectedAddress?.label || 'Belum ada alamat' }}</p>
                <p class="text-gray-500 text-sm md:text-base">
                  {{ selectedAddress?.detail || '-' }}
                </p>
                <p class="text-gray-500 text-sm md:text-base">
                  {{ selectedAddress?.phone || '-' }}
                </p>
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
          :key="sellerGroup.sellerId"
          class="p-4 md:p-6 border-b border-gray-200"
        >
          <div class="flex items-center space-x-4">
            <img
              :src="sellerGroup.shopImage"
              alt="Seller Icon"
              class="w-8 md:w-10 h-8 md:h-10 rounded-full"
            />
            <h3 class="font-bold text-base md:text-lg">{{ sellerGroup.shopName }}</h3>
          </div>
          <div
            v-for="(product, productIndex) in sellerGroup.products"
            :key="product.id"
            class="flex flex-col md:flex-row items-start mt-4 pb-4"
            :class="{ 'border-b border-gray-100': productIndex < sellerGroup.products.length - 1 }"
          >
            <div
              class="flex justify-center border border-gray-200 mb-4 md:mb-0 md:mr-4 w-full md:w-36 overflow-hidden"
            >
              <img :src="product.image" alt="Product Image" class="w-full h-auto object-contain" />
            </div>
            <div class="w-full px-0 md:px-4 flex flex-col">
              <h3 class="font-semibold text-lg md:text-xl">{{ product.name }}</h3>
              <p class="text-gray-500 text-sm mt-2" v-if="product.note">
                Catatan: {{ product.note }}
              </p>
              <p class="text-gray-500 text-sm" v-if="product.variantName">
                Varian: {{ product.variantName }}
              </p>
              <p class="text-gray-500 text-sm" v-if="product.finishingName">
                Finishing: {{ product.finishingName }}
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
          <div class="mt-4">
            <textarea
              v-model="sellerNotes[sellerGroup.sellerId]"
              class="w-full p-2 border border-gray-200 rounded-md text-sm"
              rows="2"
              :placeholder="`Catatan untuk ${sellerGroup.shopName}...`"
            ></textarea>
          </div>
          <div class="mt-4">
            <p class="font-medium mb-2">Pilih Pengiriman:</p>
            <div class="space-y-2">
              <div
                v-for="option in sellerGroup.shippingOptions"
                :key="`${sellerGroup.sellerId}-${option.service_name}`"
                class="flex items-center justify-between p-2 border border-gray-200 rounded-md cursor-pointer"
                :class="{
                  'bg-red-50 border-red-300':
                    selectedShipping[sellerGroup.sellerId] === option.service_name,
                }"
                @click="selectShipping(sellerGroup.sellerId, option.service_name)"
              >
                <div class="flex items-center">
                  <input
                    type="radio"
                    :id="`shipping-${sellerGroup.sellerId}-${option.service_name}`"
                    :name="`shipping-${sellerGroup.sellerId}`"
                    :value="option.service_name"
                    :checked="selectedShipping[sellerGroup.sellerId] === option.service_name"
                    class="mr-2 text-red-600 radio-red"
                  />
                  <label
                    :for="`shipping-${sellerGroup.sellerId}-${option.service_name}`"
                    class="text-sm"
                  >
                    {{ option.shipping_name }} {{ option.service_name }} ({{ option.etd || '-' }})
                  </label>
                </div>
                <span class="text-sm font-medium">{{ formatPrice(option.shipping_cost_net) }}</span>
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
      </div>
    </main>
    <AuthFooter />
  </div>
</template>

<script>
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import Swal from 'sweetalert2'
import { reactive, ref } from 'vue'
import axios from 'axios'

export default {
  name: 'CheckoutPage',
  components: {
    HeaderAfterLogin,
    AuthFooter,
  },
  data() {
    return {
      loading: true,
      error: null,
      customerInfo: {
        name: '',
        phone: '',
        photo_url: '',
      },
      addresses: ref([]),
      selectedAddressId: null,
      cartItems: [],
      serviceFee: 0,
      discount: 0,
      subtotal: 0,
      shippingOptionsBySeller: {},
      selectedShipping: reactive({}),
      sellerNotes: reactive({}),
      paymentMethods: [
        { id: 'midtrans', label: 'Transfer ke Midtrans' },
        { id: 'cash', label: 'Cash (Ambil di Tempat)' },
      ],
      selectedPayment: '',
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      token: localStorage.getItem('token'),
      // Address modal state
      locationSearch: ref(''),
      locations: ref([]),
      selectedLocation: ref(null),
      showLocationDropdown: ref(false),
      isLoadingLocation: ref(false),
      locationError: ref(''),
      editingAddress: ref(null),
    }
  },
  computed: {
    selectedAddress() {
      return this.addresses.find((addr) => addr.id === this.selectedAddressId) || null
    },
    groupedProducts() {
      const groupedBySeller = this.cartItems.reduce((groups, item) => {
        const sellerId = item.product.seller_id
        if (!groups[sellerId]) {
          groups[sellerId] = {
            sellerId: sellerId,
            shopName: `Toko ${sellerId}`,
            shopImage: item.product.thumbnail_url || 'https://placehold.co/40x40',
            products: [],
            shippingOptions: this.shippingOptionsBySeller[sellerId] || [],
          }
        }
        groups[sellerId].products.push({
          id: item.id,
          name: item.product.name,
          image: item.product.thumbnail_url || 'https://placehold.co/200x200',
          note: item.additional_info,
          variantName: item.product_variant ? item.product_variant.name : null,
          finishingName: item.product_finishing ? item.product_finishing.name : null,
          quantity: item.quantity,
          price: item.product_variant ? item.product_variant.price : item.product.price,
        })
        return groups
      }, {})
      return Object.values(groupedBySeller)
    },
    shippingSubtotal() {
      let total = 0
      for (const [sellerId, serviceName] of Object.entries(this.selectedShipping)) {
        const option = this.shippingOptionsBySeller[sellerId]?.find(
          (opt) => opt.service_name === serviceName,
        )
        if (option) {
          total += option.shipping_cost_net
        }
      }
      return total
    },
    total() {
      return this.subtotal + this.shippingSubtotal + this.serviceFee - this.discount
    },
    isOrderValid() {
      const sellerIds = [...new Set(this.cartItems.map((item) => item.product.seller_id))]
      return (
        sellerIds.every((id) => this.selectedShipping[id]) &&
        this.selectedPayment &&
        this.selectedAddressId
      )
    },
  },
  created() {
    if (!this.token) {
      this.$router.push('/login')
      Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Silakan login kembali.',
        icon: 'warning',
        confirmButtonColor: '#dc2626',
      })
      return
    }

    const cartIds = this.$route.query.cart_ids
      ? Array.isArray(this.$route.query.cart_ids)
        ? this.$route.query.cart_ids.map(Number)
        : [Number(this.$route.query.cart_ids)]
      : []
    if (!cartIds.length) {
      this.error = 'Tidak ada item yang dipilih untuk checkout'
      Swal.fire({
        title: 'Error',
        text: this.error,
        icon: 'error',
        confirmButtonColor: '#dc2626',
      }).then(() => {
        this.$router.push('/cart')
      })
      return
    }

    this.fetchProfile()
    this.fetchAddresses()
    this.fetchPreCheckout()
  },
  methods: {
    escapeHtml(str) {
      if (!str) return ''
      return str
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    },
    async fetchProfile() {
      try {
        const response = await axios.get(`${this.baseUrl}/customer/profile`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        if (response.data.status === 'success') {
          this.customerInfo.name = response.data.data.name || 'Pelanggan'
          this.customerInfo.phone = response.data.data.no_telp || '-'
          this.customerInfo.photo_url = response.data.data.photo_url || 'https://placehold.co/40x40'
        } else {
          throw new Error(response.data.message || 'Gagal memuat data profil')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        this.error = error.response?.data?.message || 'Gagal memuat data profil'
        Swal.fire({
          title: 'Error',
          text: this.error,
          icon: 'error',
          confirmButtonColor: '#dc2626',
        })
      }
    },
    async fetchAddresses() {
      try {
        const response = await axios.get(`${this.baseUrl}/customer/address`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        if (response.data.status === 'success') {
          this.addresses = response.data.data
          const defaultAddress = this.addresses.find((addr) => addr.is_default) || this.addresses[0]
          this.selectedAddressId = defaultAddress?.id || null
          if (this.selectedAddressId) {
            await this.fetchPreCheckout(this.selectedAddressId)
          }
        } else {
          throw new Error(response.data.message || 'Gagal memuat daftar alamat')
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
        this.error = error.response?.data?.message || 'Gagal memuat daftar alamat'
        Swal.fire({
          title: 'Error',
          text: this.error,
          icon: 'error',
          confirmButtonColor: '#dc2626',
        })
      }
    },
    async fetchPreCheckout(addressId = null) {
      this.loading = true
      this.error = null
      try {
        const cartIds = this.$route.query.cart_ids
          ? Array.isArray(this.$route.query.cart_ids)
            ? this.$route.query.cart_ids.map(Number)
            : [Number(this.$route.query.cart_ids)]
          : []

        const payload = { cart_ids: cartIds }
        if (addressId) {
          payload.address_id = addressId.toString()
        }

        const response = await axios.post(`${this.baseUrl}/customer/cart/pre-checkout`, payload, {
          headers: { Authorization: `Bearer ${this.token}` },
        })

        if (response.data.status === 'success') {
          this.cartItems = response.data.data.cart_items
          this.subtotal = response.data.data.subtotal
          this.serviceFee = response.data.data.application_fee
          this.discount = 0

          Object.keys(this.selectedShipping).forEach((key) => {
            delete this.selectedShipping[key]
          })

          this.shippingOptionsBySeller = {}
          this.cartItems.forEach((item) => {
            const sellerId = item.product.seller_id
            if (!this.shippingOptionsBySeller[sellerId]) {
              this.shippingOptionsBySeller[sellerId] =
                response.data.data.deliveries.calculate_reguler
            }
          })
        } else {
          throw new Error(response.data.message || 'Gagal memuat data checkout')
        }
      } catch (error) {
        console.error('Pre-checkout error:', error)
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
          Swal.fire({
            title: 'Sesi Berakhir',
            text: 'Silakan login kembali.',
            icon: 'warning',
            confirmButtonColor: '#dc2626',
          })
        } else {
          this.error = error.response?.data?.message || 'Gagal memuat data checkout'
          Swal.fire({
            title: 'Error',
            text: this.error,
            icon: 'error',
            confirmButtonColor: '#dc2626',
          })
        }
      } finally {
        this.loading = false
      }
    },
    formatPrice(price) {
      return `Rp${price.toLocaleString('id-ID')}`
    },
    selectShipping(sellerId, serviceName) {
      this.selectedShipping[sellerId] = serviceName
    },
    async searchLocation(searchValue) {
      if (!searchValue.trim()) {
        this.locationError = 'Masukkan kata kunci pencarian'
        return
      }

      this.isLoadingLocation = true
      this.locationError = ''

      try {
        const response = await axios.get(
          `${this.baseUrl}/rajaongkir/search/${searchValue.trim()}`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          },
        )
        if (response.data.status === 'success' && response.data.data.data) {
          this.locations = response.data.data.data
          this.showLocationDropdown = true
        } else {
          this.locations = []
          this.locationError = 'Tidak ada hasil pencarian'
        }
      } catch (error) {
        this.locationError = 'Gagal mencari alamat. Silakan coba lagi.'
        this.locations = []
        console.error('Location search error:', error)
      } finally {
        this.isLoadingLocation = false
      }
    },
    selectLocation(location) {
      this.selectedLocation = location
      this.locationSearch = location.label
      this.showLocationDropdown = false
      this.locationError = ''
    },
    formatLocationDisplay(location) {
      return `${location.subdistrict_name}, ${location.district_name}, ${location.city_name}, ${location.zip_code}`
    },
    async openAddressModal() {
      const renderAddresses = () => {
        if (!this.addresses.length) {
          return `<div class="bg-gray-100 p-4 rounded-lg text-center text-gray-500">Belum ada alamat</div>`
        }
        return this.addresses
          .map(
            (address) => `
              <div class="bg-gray-100 p-4 mb-2 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center address-item">
                <div class="flex items-center flex-1 mr-4">
                  <input
                    type="radio"
                    name="address"
                    id="address-${address.id}"
                    value="${address.id}"
                    class="mr-2 text-red-600 radio-red"
                    ${this.selectedAddressId === address.id ? 'checked' : ''}
                  />
                  <label for="address-${address.id}" class="cursor-pointer">
                    <div class="font-semibold">${this.escapeHtml(address.label || 'Label Tidak Ada')}</div>
                    <div class="text-sm text-gray-600">${this.escapeHtml(address.address)}, ${this.escapeHtml(address.subdistrict_name)}, ${this.escapeHtml(address.city_name)}, ${this.escapeHtml(address.province_name)}, ${this.escapeHtml(address.zip_code)}</div>
                    ${address.detail ? `<div class="text-sm text-gray-600 mt-1">${this.escapeHtml(address.detail)}</div>` : ''}
                    <div class="text-sm text-gray-600">${this.escapeHtml(address.phone)}</div>
                  </label>
                </div>
                <div class="flex space-x-2 mt-2 sm:mt-0">
                  <button
                    data-address-id="${address.id}"
                    class="edit-btn text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded min-w-[80px]"
                  >
                    Edit
                  </button>
                </div>
              </div>
            `,
          )
          .join('')
      }

      const showAddressForm = async (isEdit = false, address = null) => {
        this.editingAddress = isEdit ? address : null
        this.locationSearch = isEdit ? address?.label || '' : ''
        this.selectedLocation = isEdit ? address : null
        this.locations = []
        this.showLocationDropdown = false
        this.isLoadingLocation = false
        this.locationError = ''

        try {
          const result = await Swal.fire({
            title: `<h3 class="text-lg font-bold">${isEdit ? 'Edit Alamat' : 'Tambah Alamat Baru'}</h3>`,
            html: `
              <form id="addressForm" class="text-left form-compact">
                <div class="mb-4 relative">
                  <label class="block text-gray-700 font-medium text-sm mb-1">Pilih Alamat</label>
                  <div class="flex">
                    <input
                      id="locationSearchInput"
                      class="flex-1 p-3 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Cari alamat (contoh: sleman)"
                      type="text"
                      value="${this.escapeHtml(this.locationSearch)}"
                    />
                    <button
                      type="button"
                      id="searchButton"
                      class="bg-red-600 text-white px-4 py-3 rounded-r-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <i id="searchIcon" class="fas fa-search"></i>
                    </button>
                  </div>
                  <div
                    id="selectedLocationDiv"
                    class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                    style="display: ${this.selectedLocation ? 'block' : 'none'}"
                  >
                    <div class="flex items-center text-green-700">
                      <i class="fas fa-check-circle mr-2"></i>
                      <span class="font-medium">Alamat dipilih:</span>
                    </div>
                    <div class="text-green-600 mt-1" id="selectedLocationText">
                      ${this.selectedLocation ? this.escapeHtml(this.formatLocationDisplay(this.selectedLocation)) : ''}
                    </div>
                  </div>
                  <small id="locationError" class="text-red-500" style="display: none;"></small>
                  <div
                    id="locationDropdown"
                    class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-64 overflow-y-auto"
                    style="display: none;"
                  >
                    <div id="locationResults"></div>
                    <div class="p-3 text-center border-t">
                      <button
                        type="button"
                        id="closeDropdownBtn"
                        class="text-gray-500 hover:text-gray-700"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mb-4">
                  <label class="block text-gray-700 font-medium text-sm mb-1">Detail Alamat (Patokan)</label>
                  <textarea
                    id="address"
                    class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  >${isEdit ? this.escapeHtml(address?.address || '') : ''}</textarea>
                </div>
                <div class="mb-4">
                  <label class="block text-gray-700 font-medium text-sm mb-1">No. Penerima</label>
                  <input
                    id="phone"
                    type="tel"
                    class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    value="${isEdit ? this.escapeHtml(address?.phone || '') : ''}"
                  />
                </div>
                <div class="mb-4">
                  <label class="flex items-center">
                    <input
                      id="is_default"
                      type="checkbox"
                      class="mr-2"
                      ${isEdit && address?.is_default ? 'checked' : ''}
                    />
                    Jadikan Alamat Utama
                  </label>
                </div>
              </form>
            `,
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonText: isEdit ? 'Simpan' : 'Tambah',
            focusConfirm: false,
            width: '600px',
            buttonsStyling: false,
            customClass: {
              container: 'swal-container',
              popup: 'swal-modal-popup rounded-lg',
              htmlContainer: 'pb-2 px-1',
              confirmButton:
                'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
              cancelButton:
                'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
              actions: 'flex justify-center space-x-6',
            },
            didOpen: () => {
              try {
                const modalContent = document.querySelector('.swal2-content')
                if (modalContent) {
                  modalContent.style.maxHeight = '70vh'
                  modalContent.style.overflowY = 'auto'
                  modalContent.style.overflowX = 'hidden'
                }

                const styleElement = document.createElement('style')
                styleElement.textContent = `
                  .swal2-content::-webkit-scrollbar { width: 6px; }
                  .swal2-content::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                  .swal2-content::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 10px; }
                  .swal2-content::-webkit-scrollbar-thumb:hover { background: #b91c1c; }
                  .form-compact input, .form-compact textarea { font-size: 0.875rem; padding: 0.5rem; }
                  .form-compact label { font-size: 0.75rem; margin-bottom: 0.25rem; }
                `
                document.head.appendChild(styleElement)

                const locationSearchInput = document.getElementById('locationSearchInput')
                const searchButton = document.getElementById('searchButton')
                const searchIcon = document.getElementById('searchIcon')
                const locationDropdown = document.getElementById('locationDropdown')
                const locationResults = document.getElementById('locationResults')
                const locationError = document.getElementById('locationError')
                const selectedLocationDiv = document.getElementById('selectedLocationDiv')
                const selectedLocationText = document.getElementById('selectedLocationText')
                const closeDropdownBtn = document.getElementById('closeDropdownBtn')

                if (
                  !locationSearchInput ||
                  !searchButton ||
                  !searchIcon ||
                  !locationDropdown ||
                  !locationResults ||
                  !locationError ||
                  !selectedLocationDiv ||
                  !selectedLocationText ||
                  !closeDropdownBtn
                ) {
                  console.error('Missing DOM elements in address form modal')
                  return
                }

                locationSearchInput.addEventListener('input', (e) => {
                  this.locationSearch = e.target.value
                })

                searchButton.addEventListener('click', async () => {
                  const searchValue = locationSearchInput.value.trim()
                  if (!searchValue) {
                    locationError.textContent = 'Masukkan kata kunci pencarian'
                    locationError.style.display = 'block'
                    return
                  }

                  searchIcon.className = 'fas fa-spinner fa-spin'
                  searchButton.disabled = true
                  locationError.style.display = 'none'

                  try {
                    await this.searchLocation(searchValue)
                    locationResults.innerHTML = `
                      <div class="p-4">
                        <div class="text-gray-500 text-sm mb-2">HASIL PENCARIAN</div>
                        ${this.locations
                          .map(
                            (location) => `
                            <div
                              class="flex items-center text-gray-700 py-2 cursor-pointer hover:bg-gray-100 location-item"
                              data-location='${JSON.stringify(location).replace(/'/g, '&apos;').replace(/"/g, '&quot;')}'
                            >
                              <i class="fas fa-map-marker-alt mr-2"></i>
                              <span>${this.escapeHtml(location.subdistrict_name)}, ${this.escapeHtml(location.district_name)}, ${this.escapeHtml(location.city_name)}, ${this.escapeHtml(location.zip_code)}</span>
                            </div>
                          `,
                          )
                          .join('')}
                      </div>
                    `

                    document.querySelectorAll('.location-item').forEach((item) => {
                      item.addEventListener('click', () => {
                        try {
                          const location = JSON.parse(
                            item.dataset.location.replace(/&apos;/g, "'").replace(/&quot;/g, '"'),
                          )
                          this.selectLocation(location)
                          selectedLocationText.textContent = this.formatLocationDisplay(location)
                          selectedLocationDiv.style.display = 'block'
                          locationDropdown.style.display = 'none'
                          locationError.style.display = 'none'
                        } catch (err) {
                          console.error('Error parsing location:', err)
                        }
                      })
                    })

                    locationDropdown.style.display = this.locations.length ? 'block' : 'none'
                    if (!this.locations.length) {
                      locationError.textContent = 'Tidak ada hasil pencarian'
                      locationError.style.display = 'block'
                    }
                  } catch (err) {
                    console.error('Error during location search:', err)
                    locationError.textContent = 'Gagal mencari alamat'
                    locationError.style.display = 'block'
                  } finally {
                    searchIcon.className = 'fas fa-search'
                    searchButton.disabled = false
                  }
                })

                closeDropdownBtn.addEventListener('click', () => {
                  locationDropdown.style.display = 'none'
                })
              } catch (err) {
                console.error('Error in address form didOpen:', err)
              }
            },
            preConfirm: () => {
              try {
                const addressInput = document.getElementById('address').value.trim()
                const phone = document.getElementById('phone').value.trim()
                const is_default = document.getElementById('is_default').checked

                if (!this.selectedLocation) {
                  Swal.showValidationMessage('Alamat wajib dipilih dari hasil pencarian')
                  return false
                }
                if (!addressInput) {
                  Swal.showValidationMessage('Detail alamat wajib diisi')
                  return false
                }
                if (!phone || !/^\+?\d{10,13}$/.test(phone)) {
                  Swal.showValidationMessage('No. telepon tidak valid (10-13 digit)')
                  return false
                }

                return {
                  id: isEdit ? address?.id : null,
                  label: this.selectedLocation.label,
                  address: addressInput,
                  phone,
                  is_default,
                  subdistrict_name: this.selectedLocation.subdistrict_name,
                  city_name: this.selectedLocation.city_name,
                  province_name: this.selectedLocation.province_name,
                  zip_code: this.selectedLocation.zip_code,
                }
              } catch (err) {
                console.error('Error in preConfirm:', err)
                Swal.showValidationMessage('Terjadi kesalahan, silakan coba lagi')
                return false
              }
            },
          })

          if (result.isConfirmed && result.value) {
            try {
              const formData = new FormData()
              formData.append('label', result.value.label)
              formData.append('address', result.value.address)
              formData.append('phone', result.value.phone)
              formData.append('is_default', result.value.is_default ? '1' : '0')
              formData.append('zip_code', result.value.zip_code)
              formData.append('subdistrict_name', result.value.subdistrict_name)
              formData.append('city_name', result.value.city_name)
              formData.append('province_name', result.value.province_name)
              formData.append('detail', result.value.address) // Added for consistency with ProfilePage.vue

              console.log('FormData Payload:', Object.fromEntries(formData))

              const url = isEdit
                ? `${this.baseUrl}/customer/address/${result.value.id}`
                : `${this.baseUrl}/customer/address`
              const method = 'post'

              if (isEdit && !result.value.id) {
                throw new Error('Invalid address ID')
              }

              const response = await axios({
                method,
                url,
                data: formData,
                headers: {
                  Authorization: `Bearer ${this.token}`,
                  'Content-Type': 'multipart/form-data',
                },
              })

              console.log('API Response:', response.data)

              if (response.data.status === 'success') {
                await this.fetchAddresses()
                Swal.fire({
                  title: 'Berhasil!',
                  text: isEdit ? 'Alamat berhasil diperbarui' : 'Alamat baru telah ditambahkan',
                  icon: 'success',
                  confirmButtonColor: '#dc2626',
                })
              } else {
                throw new Error(response.data.message || 'Gagal menyimpan alamat')
              }
            } catch (error) {
              console.error('Error saving address:', error)
              const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Gagal menyimpan alamat. Silakan coba lagi.'
              Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#dc2626',
              })
            }
          }
        } catch (err) {
          console.error('Error in showAddressForm:', err)
          Swal.fire({
            title: 'Error!',
            text: 'Terjadi kesalahan saat membuka form alamat',
            icon: 'error',
            confirmButtonColor: '#dc2626',
          })
        }
      }

      try {
        const result = await Swal.fire({
          title: '<h3 class="text-lg font-bold">Pilih Alamat Pengiriman</h3>',
          html: `
            <div class="text-left form-compact">
              ${renderAddresses()}
              <button id="add-new-address" class="w-full mt-4 bg-gray-200 hover:bg-gray-300 p-3 rounded-lg flex items-center justify-center">
                <span class="mr-2">+ Tambah Alamat Baru</span>
              </button>
            </div>
          `,
          showCancelButton: true,
          cancelButtonText: 'Tutup',
          confirmButtonText: 'Pilih',
          focusConfirm: false,
          width: '600px',
          buttonsStyling: false,
          customClass: {
            container: 'swal-container',
            popup: 'swal-modal-popup rounded-lg',
            htmlContainer: 'pb-2 px-1',
            confirmButton:
              'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
            cancelButton:
              'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
            actions: 'flex justify-center space-x-6',
          },
          didOpen: () => {
            try {
              const modalContent = document.querySelector('.swal2-content')
              if (modalContent) {
                modalContent.style.maxHeight = '70vh'
                modalContent.style.overflowY = 'auto'
                modalContent.style.overflowX = 'hidden'
              }

              const styleElement = document.createElement('style')
              styleElement.textContent = `
                .swal2-content::-webkit-scrollbar { width: 6px; }
                .swal2-content::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .swal2-content::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 10px; }
                .swal2-content::-webkit-scrollbar-thumb:hover { background: #b91c1c; }
                .form-compact { font-size: 0.875rem; }
                .radio-red:checked { accent-color: #dc2626; }
              `
              document.head.appendChild(styleElement)

              const addNewAddressBtn = document.getElementById('add-new-address')
              if (!addNewAddressBtn) {
                console.error('Add new address button not found')
                return
              }

              document.querySelectorAll('input[name="address"]').forEach((radio) => {
                radio.addEventListener('change', async (e) => {
                  try {
                    const addressId = parseInt(e.target.value)
                    if (addressId !== this.selectedAddressId) {
                      this.selectedAddressId = addressId
                      await this.fetchPreCheckout(this.selectedAddressId)
                      Swal.close()
                    }
                  } catch (err) {
                    console.error('Error on address selection:', err)
                  }
                })
              })

              document.querySelectorAll('.edit-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                  try {
                    const addressId = parseInt(btn.getAttribute('data-address-id'))
                    console.log('Editing address ID:', addressId)
                    const address = this.addresses.find((addr) => addr.id === addressId)
                    if (address) {
                      showAddressForm(true, address)
                    } else {
                      console.error('Address not found for ID:', addressId)
                      Swal.fire({
                        title: 'Error!',
                        text: 'Alamat tidak ditemukan',
                        icon: 'error',
                        confirmButtonColor: '#dc2626',
                      })
                    }
                  } catch (err) {
                    console.error('Error on edit button click:', err)
                  }
                })
              })

              addNewAddressBtn.addEventListener('click', () => {
                try {
                  showAddressForm()
                } catch (err) {
                  console.error('Error on add new address click:', err)
                }
              })
            } catch (err) {
              console.error('Error in address selection didOpen:', err)
            }
          },
          preConfirm: () => {
            try {
              if (!this.selectedAddressId) {
                Swal.showValidationMessage('Pilih alamat terlebih dahulu')
                return false
              }
              return true
            } catch (err) {
              console.error('Error in address selection preConfirm:', err)
              Swal.showValidationMessage('Terjadi kesalahan, silakan coba lagi')
              return false
            }
          },
        })

        if (result.isConfirmed) {
          // Address selection confirmed
        }
      } catch (err) {
        console.error('Error in openAddressModal:', err)
        Swal.fire({
          title: 'Error!',
          text: 'Terjadi kesalahan saat membuka modal alamat',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        })
      }
    },
    async createOrder() {
      if (!this.isOrderValid) {
        Swal.fire({
          title: 'Pesanan Belum Lengkap',
          text: 'Pilih alamat, metode pengiriman untuk semua toko, dan metode pembayaran',
          icon: 'warning',
          confirmButtonColor: '#dc2626',
        })
        return
      }

      try {
        const cartIds = this.$route.query.cart_ids
          ? Array.isArray(this.$route.query.cart_ids)
            ? this.$route.query.cart_ids.map(Number)
            : [Number(this.$route.query.cart_ids)]
          : []

        const firstSellerId = Object.keys(this.selectedShipping)[0]
        const selectedShippingOption = this.shippingOptionsBySeller[firstSellerId]?.find(
          (opt) => opt.service_name === this.selectedShipping[firstSellerId],
        )

        const payload = {
          cart_ids: cartIds,
          address_id: this.selectedAddressId.toString(),
          shipping_name: selectedShippingOption?.shipping_name || '',
          service_name: selectedShippingOption?.service_name || '',
          additional_info: Object.values(this.sellerNotes).join('; ') || '',
          metode_pembayaran: this.selectedPayment,
        }

        const response = await axios.post(`${this.baseUrl}/customer/cart/checkout`, payload, {
          headers: { Authorization: `Bearer ${this.token}` },
        })

        if (response.data.status === 'success') {
          const orderId = response.data.data.id
          localStorage.setItem('order_id', orderId)
          Swal.fire({
            title: 'Pesanan Dibuat!',
            text: response.data.message,
            icon: 'success',
            confirmButtonColor: '#dc2626',
          }).then(() => {
            this.$router.push('/track-order')
          })
        } else {
          throw new Error(response.data.message || 'Gagal membuat pesanan')
        }
      } catch (error) {
        console.error('Checkout error:', error)
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal membuat pesanan',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        })
      }
    },
  },
}
</script>

<style scoped>
.radio-red:checked {
  accent-color: #dc2626;
}
</style>
