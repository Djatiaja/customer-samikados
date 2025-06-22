<template>
  <div class="bg-gray-200 flex flex-col min-h-screen">
    <HeaderAfterLogin />

    <!-- Cart Content Wrapper -->
    <section class="w-full md:w-3/4 px-3 md:px-0 mx-auto flex-grow mb-32 mt-10">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <p class="text-lg">Memuat keranjang...</p>
      </div>
      <!-- Empty Cart State -->
      <div v-else-if="!cartData.length" class="text-center py-10">
        <p class="text-lg">Keranjang Anda kosong.</p>
      </div>
      <!-- Cart Content for each seller -->
      <CartSeller
        v-else
        v-for="(seller, sellerIndex) in cartData"
        :key="seller.id"
        :seller="seller"
        :variants="variants"
        :finishings="finishings"
        @toggle-seller-selection="updateSellerSelection(sellerIndex)"
        @toggle-item-selection="(itemIndex) => updateItemSelection(sellerIndex, itemIndex)"
        @increase-quantity="(itemIndex) => increaseQuantity(sellerIndex, itemIndex)"
        @decrease-quantity="(itemIndex) => decreaseQuantity(sellerIndex, itemIndex)"
        @edit-item="(itemIndex) => openEditModal(sellerIndex, itemIndex)"
        @delete-item="(itemIndex) => confirmDelete(sellerIndex, itemIndex)"
      />
    </section>

    <!-- Floating Checkout Bar -->
    <div
      v-if="cartData.length"
      class="fixed bottom-16 md:bottom-20 left-0 md:left-1/2 transform md:-translate-x-1/2 w-full md:w-3/4 bg-white p-3 md:p-4 shadow-lg flex justify-between items-center checkout-bar"
      ref="checkoutBar"
    >
      <div class="ml-3 md:ml-10">
        <span class="text-base md:text-lg font-bold">Total Harga:</span>
        <span class="text-base md:text-lg font-bold block">{{
          formatPrice(calculateTotal())
        }}</span>
      </div>
      <button
        class="bg-red-600 hover:bg-red-700 text-white px-4 md:px-8 py-2 rounded text-sm md:text-base mr-3 md:mr-10"
        @click="goToCheckout"
        :disabled="!cartData.some((seller) => seller.items.some((item) => item.isSelected))"
      >
        Checkout
      </button>
    </div>

    <AuthFooter ref="footer" />
  </div>
</template>

<script>
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import CartSeller from '@/components/CartSeller.vue'
import Swal from 'sweetalert2'
import axios from 'axios'

export default {
  name: 'CartPage',
  components: {
    HeaderAfterLogin,
    AuthFooter,
    CartSeller,
  },
  data() {
    return {
      loading: false,
      cartData: [],
      variants: {}, // Cache per product_id
      finishings: {}, // Cache per product_id
      editForm: {
        note: '',
        quantity: 1,
        variantId: null,
        finishingId: null,
      },
      currentEditItem: {
        sellerIndex: null,
        itemIndex: null,
        productId: null,
      },
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      token: localStorage.getItem('token'),
    }
  },
  created() {
    if (!this.token) {
      this.$router.push('/login')
      return
    }
    this.fetchCart()
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('resize', this.handleScroll)
    this.handleScroll() // Initial adjustment
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleScroll)
  },
  methods: {
    handleScroll() {
      if (this.scrollTimeout) clearTimeout(this.scrollTimeout)
      this.scrollTimeout = setTimeout(() => {
        const checkoutBar = this.$refs.checkoutBar
        const footer = this.$refs.footer?.$el
        if (!checkoutBar || !footer) {
          console.warn('Checkout bar or footer not found')
          return
        }

        const footerRect = footer.getBoundingClientRect()
        const checkoutBarRect = checkoutBar.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // Default bottom spacing for the checkout bar
        const defaultBottom = window.innerWidth < 768 ? 64 : 80 // 64px or 80px
        const buffer = 20 // Gap between checkout bar and footer

        // Calculate the maximum allowed bottom position to avoid overlap
        const footerTopRelativeToViewport = footerRect.top
        const spaceBelowFooter = windowHeight - footerRect.top

        // If the footer is close to or above the viewport bottom, adjust the checkout bar
        if (
          footerTopRelativeToViewport <
          windowHeight - defaultBottom - checkoutBarRect.height - buffer
        ) {
          // Pin the checkout bar just above the footer
          checkoutBar.style.bottom = `${spaceBelowFooter + buffer}px`
        } else {
          // Use default bottom spacing
          checkoutBar.style.bottom = `${defaultBottom}px`
        }
      }, 100)
    },
    async fetchCart() {
      this.loading = true
      try {
        const response = await axios.get(`${this.baseUrl}/customer/cart`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })

        console.log('API Response:', response.data) // Debug log

        if (response.data.status === 'success') {
          // Filter out invalid or deleted products
          const validCartItems = response.data.data.filter(
            (item) => item.product && item.product.id && item.product.deleted_at === null,
          )

          console.log('Valid cart items:', validCartItems) // Debug log

          this.cartData = this.groupBySeller(validCartItems)

          console.log('Grouped cart data:', this.cartData) // Debug log

          // Pre-fetch variants and finishings for all products
          const productIds = [...new Set(validCartItems.map((item) => item.product.id))]
          await Promise.all([
            ...productIds.map((productId) => this.fetchVariants(productId)),
            ...productIds.map((productId) => this.fetchFinishings(productId)),
          ])
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('Fetch cart error:', error) // Debug log
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        } else {
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message || 'Gagal memuat keranjang',
            icon: 'error',
            customClass: {
              confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
              title: 'text-lg md:text-xl',
              popup: 'rounded-lg',
            },
          })
        }
      } finally {
        this.loading = false
      }
    },
    async fetchVariants(productId) {
      if (this.variants[productId]) return // Use cached data
      try {
        const response = await axios.get(`${this.baseUrl}/seller/product/variant`, {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { product_id: productId },
        })
        if (response.data.status === 'success') {
          this.variants[productId] = response.data.data
        } else {
          this.variants[productId] = []
        }
      } catch (error) {
        this.variants[productId] = []
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        }
      }
    },
    async fetchFinishings(productId) {
      if (this.finishings[productId]) return // Use cached data
      try {
        const response = await axios.get(`${this.baseUrl}/seller/product/finishing`, {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { product_id: productId },
        })
        if (response.data.status === 'success') {
          this.finishings[productId] = response.data.data
        } else {
          this.finishings[productId] = []
        }
      } catch (error) {
        this.finishings[productId] = []
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        }
      }
    },
    groupBySeller(cartItems) {
      const sellerMap = {}
      cartItems.forEach((item) => {
        const sellerId = item.product.seller_id
        if (!sellerMap[sellerId]) {
          sellerMap[sellerId] = {
            id: sellerId,
            name: `Toko ${sellerId}`,
            location: 'Unknown',
            image: item.product.thumbnail_url || 'https://placehold.co/50x50',
            isSelected: false,
            items: [],
          }
        }
        sellerMap[sellerId].items.push({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          type: item.product.category_id,
          image: item.product.thumbnail_url || 'https://placehold.co/150x150',
          price: item.product_variant ? item.product_variant.price : item.product.price,
          finishingPrice: item.product_finishing ? item.product_finishing.price : 0,
          basePrice: item.product.price,
          quantity: item.quantity,
          isSelected: false,
          specs: {
            note: item.additional_info || '',
            variantId: item.product_variant_id,
            finishingId: item.product_finishing_id,
          },
        })
      })
      return Object.values(sellerMap)
    },
    async openEditModal(sellerIndex, itemIndex) {
      if (!this.token) {
        this.$router.push('/login')
        return
      }
      const item = this.cartData[sellerIndex].items[itemIndex]
      this.currentEditItem = { sellerIndex, itemIndex, productId: item.productId }
      this.editForm = {
        note: item.specs.note,
        quantity: item.quantity,
        variantId: item.specs.variantId,
        finishingId: item.specs.finishingId,
      }

      await Promise.all([this.fetchVariants(item.productId), this.fetchFinishings(item.productId)])

      const variantOptions = (this.variants[item.productId] || [])
        .map(
          (variant) =>
            `<option value="${variant.id}" ${
              item.specs.variantId === variant.id ? 'selected' : ''
            }>${variant.name} - ${this.formatPrice(variant.price)}</option>`,
        )
        .join('')

      const finishingOptions = (this.finishings[item.productId] || [])
        .map(
          (finish) =>
            `<option value="${finish.id}" ${
              item.specs.finishingId === finish.id ? 'selected' : ''
            }>${finish.name} (+${this.formatPrice(finish.price)})</option>`,
        )
        .join('')

      if (!variantOptions && !finishingOptions) {
        Swal.fire({
          title: 'Error',
          text: 'Tidak ada opsi varian atau finishing tersedia untuk produk ini',
          icon: 'error',
          customClass: {
            confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
            title: 'text-lg md:text-xl',
            popup: 'rounded-lg',
          },
        })
        return
      }

      Swal.fire({
        title: 'Edit Produk',
        html: `
          <div class="text-left">
            <div class="mb-4">
              <label class="block text-gray-700 mb-1 text-left">Catatan</label>
              <input
                id="swal-input-note"
                class="w-full border rounded-md p-2"
                value="${item.specs.note || ''}"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 mb-1 text-left">Varian</label>
              <select id="swal-input-variant" class="w-full border rounded-md p-2" onchange="window.updatePreviewPrice()">
                <option value="">Pilih Varian</option>
                ${variantOptions}
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 mb-1 text-left">Finishing</label>
              <select id="swal-input-finishing" class="w-full border rounded-md p-2" onchange="window.updatePreviewPrice()">
                <option value="">Pilih Finishing</option>
                ${finishingOptions}
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 mb-1 text-left">Jumlah</label>
              <div class="flex items-center">
                <button type="button" id="decrease-quantity" class="px-3 py-1 bg-gray-200 rounded-l-md border border-gray-300">-</button>
                <input
                  id="swal-input-quantity"
                  type="number"
                  min="1"
                  class="w-16 text-center border border-gray-300 py-1"
                  value="${item.quantity}"
                  onchange="window.updatePreviewPrice()"
                />
                <button type="button" id="increase-quantity" class="px-3 py-1 bg-gray-200 rounded-r-md border border-gray-300">+</button>
              </div>
            </div>
            <div class="mt-5 p-3 bg-gray-100 rounded-md">
              <div class="flex justify-between items-center">
                <span class="font-semibold">Total Harga:</span>
                <span id="preview-price" class="font-bold text-lg">${this.formatPrice(
                  this.calculateProductPrice(
                    item.specs.variantId,
                    item.specs.finishingId,
                    item.quantity,
                    item.productId,
                  ),
                )}</span>
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md mr-4',
          cancelButton: 'bg-gray-200 text-black py-2 w-24 rounded-md',
          title: 'text-lg md:text-xl font-bold',
          popup: 'rounded-lg',
          htmlContainer: 'max-w-full',
        },
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        focusConfirm: false,
        didOpen: () => {
          window.updatePreviewPrice = () => {
            const variantId = document.getElementById('swal-input-variant').value
            const finishingId = document.getElementById('swal-input-finishing').value
            const quantity = parseInt(document.getElementById('swal-input-quantity').value) || 1
            const price = this.calculateProductPrice(
              variantId,
              finishingId,
              quantity,
              item.productId,
            )
            document.getElementById('preview-price').innerText = this.formatPrice(price)
          }
          document.getElementById('decrease-quantity').addEventListener('click', () => {
            const quantityInput = document.getElementById('swal-input-quantity')
            const currentValue = parseInt(quantityInput.value) || 1
            if (currentValue > 1) {
              quantityInput.value = currentValue - 1
              window.updatePreviewPrice()
            }
          })
          document.getElementById('increase-quantity').addEventListener('click', () => {
            const quantityInput = document.getElementById('swal-input-quantity')
            const currentValue = parseInt(quantityInput.value) || 1
            quantityInput.value = currentValue + 1
            window.updatePreviewPrice()
          })
        },
        preConfirm: () => {
          const variantId = document.getElementById('swal-input-variant').value
          const finishingId = document.getElementById('swal-input-finishing').value
          const variants = this.variants[item.productId] || []
          const finishings = this.finishings[item.productId] || []

          if (variantId && !variants.some((v) => v.id === parseInt(variantId))) {
            Swal.showValidationMessage('Opsi varian tidak valid untuk produk ini')
            return false
          }
          if (finishingId && !finishings.some((f) => f.id === parseInt(finishingId))) {
            Swal.showValidationMessage('Opsi finishing tidak valid untuk produk ini')
            return false
          }

          return {
            note: document.getElementById('swal-input-note').value,
            quantity: parseInt(document.getElementById('swal-input-quantity').value) || 1,
            variantId: variantId ? parseInt(variantId) : null,
            finishingId: finishingId ? parseInt(finishingId) : null,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.saveEdit(result.value)
        }
      })
    },
    async saveEdit(formData) {
      if (!this.token) {
        this.$router.push('/login')
        return
      }
      const { sellerIndex, itemIndex, productId } = this.currentEditItem
      const item = this.cartData[sellerIndex].items[itemIndex]

      item.specs.note = formData.note
      item.specs.variantId = formData.variantId
      item.specs.finishingId = formData.finishingId
      item.quantity = formData.quantity

      const variants = this.variants[productId] || []
      const finishings = this.finishings[productId] || []
      const variant = variants.find((v) => v.id === formData.variantId)
      const finishing = finishings.find((f) => f.id === formData.finishingId)
      item.price = variant ? variant.price : item.basePrice
      item.finishingPrice = finishing ? finishing.price : 0

      try {
        const response = await axios.post(
          `${this.baseUrl}/customer/cart/${item.id}`,
          {
            quantity: formData.quantity,
            product_variant_id: formData.variantId,
            product_finishing_id: formData.finishingId,
            additional_info: formData.note,
          },
          { headers: { Authorization: `Bearer ${this.token}` } },
        )
        if (response.data.status === 'success') {
          Swal.fire({
            title: 'Produk Diperbarui',
            text: 'Detail produk berhasil diubah',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              title: 'text-lg md:text-xl',
              popup: 'rounded-lg',
            },
          })
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        } else {
          const errorMessage = error.response?.data?.message || 'Gagal memperbarui produk'
          if (
            errorMessage.includes('not found') ||
            errorMessage.includes('invalid') ||
            error.response?.data?.errors?.product_finishing_id
          ) {
            delete this.finishings[productId]
            await this.fetchFinishings(productId)
            Swal.fire({
              title: 'Error',
              text: 'Opsi finishing tidak valid, cache telah diperbarui. Silakan coba lagi.',
              icon: 'error',
              customClass: {
                confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
                title: 'text-lg md:text-xl',
                popup: 'rounded-lg',
              },
            })
          } else {
            Swal.fire({
              title: 'Error',
              text: errorMessage,
              icon: 'error',
              customClass: {
                confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
                title: 'text-lg md:text-xl',
                popup: 'rounded-lg',
              },
            })
          }
          if (errorMessage.includes('not found')) {
            await this.fetchCart()
          }
        }
      }
    },
    async updateCartItem(sellerIndex, itemIndex) {
      if (!this.token) {
        this.$router.push('/login')
        return
      }
      const item = this.cartData[sellerIndex].items[itemIndex]
      try {
        const response = await axios.post(
          `${this.baseUrl}/customer/cart/${item.id}`,
          {
            quantity: item.quantity,
            product_variant_id: item.specs.variantId,
            product_finishing_id: item.specs.finishingId,
            additional_info: item.specs.note,
          },
          { headers: { Authorization: `Bearer ${this.token}` } },
        )
        if (response.data.status === 'success') {
          const variant = this.variants[item.productId]?.find((v) => v.id === item.specs.variantId)
          const finishing = this.finishings[item.productId]?.find(
            (f) => f.id === item.specs.finishingId,
          )
          item.price = variant ? variant.price : item.basePrice
          item.finishingPrice = finishing ? finishing.price : 0
          Swal.fire({
            title: 'Berhasil',
            text: 'Item berhasil diperbarui',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              title: 'text-lg md:text-xl',
              popup: 'rounded-lg',
            },
          })
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        } else {
          const errorMessage = error.response?.data?.message || 'Gagal memperbarui item'
          if (
            errorMessage.includes('not found') ||
            errorMessage.includes('invalid') ||
            error.response?.data?.errors?.product_finishing_id
          ) {
            delete this.finishings[item.productId]
            await this.fetchFinishings(item.productId)
            Swal.fire({
              title: 'Error',
              text: 'Opsi finishing tidak valid, cache telah diperbarui. Silakan coba lagi.',
              icon: 'error',
              customClass: {
                confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
                title: 'text-lg md:text-xl',
                popup: 'rounded-lg',
              },
            })
          } else {
            Swal.fire({
              title: 'Error',
              text: errorMessage,
              icon: 'error',
              customClass: {
                confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
                title: 'text-lg md:text-xl',
                popup: 'rounded-lg',
              },
            })
          }
          if (errorMessage.includes('not found')) {
            await this.fetchCart()
          }
        }
      }
    },
    async confirmDelete(sellerIndex, itemIndex) {
      if (!this.token) {
        this.$router.push('/login')
        return
      }
      const item = this.cartData[sellerIndex].items[itemIndex]
      Swal.fire({
        title: 'Konfirmasi Hapus Produk',
        html: `Yakin mau hapus ${item.name} dari keranjang?`,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md mr-4',
          cancelButton: 'bg-gray-200 text-black py-2 w-24 rounded-md',
          title: 'text-lg md:text-xl',
          popup: 'rounded-lg',
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Ya',
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteItem(sellerIndex, itemIndex)
        }
      })
    },
    async deleteItem(sellerIndex, itemIndex) {
      if (!this.token) {
        this.$router.push('/login')
        return
      }
      const item = this.cartData[sellerIndex].items[itemIndex]
      try {
        const response = await axios.delete(`${this.baseUrl}/customer/cart/${item.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        if (response.data.status === 'success') {
          this.cartData[sellerIndex].items.splice(itemIndex, 1)
          if (!this.cartData[sellerIndex].items.length) {
            this.cartData.splice(sellerIndex, 1)
          }
          this.updateSelectionState()
          Swal.fire({
            title: 'Produk Dihapus',
            text: 'Produk berhasil dihapus dari keranjang',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              title: 'text-lg md:text-xl',
              popup: 'rounded-lg',
            },
          })
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        } else {
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message || 'Gagal menghapus produk',
            icon: 'error',
            customClass: {
              confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
              title: 'text-lg md:text-xl',
              popup: 'rounded-lg',
            },
          })
        }
      }
    },
    calculateProductPrice(variantId, finishingId, quantity, productId) {
      const variants = this.variants[productId] || []
      const finishings = this.finishings[productId] || []
      const variant = variants.find((v) => v.id === parseInt(variantId))
      const finishing = finishings.find((f) => f.id === parseInt(finishingId))
      const basePrice = variant
        ? variant.price
        : this.cartData
            .find((seller) => seller.items.some((item) => item.productId === productId))
            ?.items.find((item) => item.productId === productId)?.basePrice || 0
      const finishingPrice = finishing ? finishing.price : 0
      return (basePrice + finishingPrice) * quantity
    },
    calculateItemPrice(item) {
      return this.calculateProductPrice(
        item.specs.variantId,
        item.specs.finishingId,
        item.quantity,
        item.productId,
      )
    },
    calculateTotal() {
      let total = 0
      this.cartData.forEach((seller) => {
        seller.items.forEach((item) => {
          if (item.isSelected) {
            total += this.calculateItemPrice(item)
          }
        })
      })
      return total
    },
    formatPrice(price) {
      return `Rp${price.toLocaleString('id-ID')}`
    },
    goToCheckout() {
      if (!this.token) {
        this.$router.push('/login')
        return
      }

      const selectedItems = this.cartData.flatMap((seller) =>
        seller.items.filter((item) => item.isSelected),
      )

      if (!selectedItems.length) {
        Swal.fire({
          title: 'Tidak Ada Produk Dipilih',
          text: 'Pilih satu produk untuk checkout',
          icon: 'warning',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
            title: 'text-lg md:text-xl',
            popup: 'rounded-lg',
          },
          confirmButtonText: 'OK',
        })
        return
      }

      if (selectedItems.length > 1) {
        Swal.fire({
          title: 'Terlalu Banyak Produk Dipilih',
          text: 'Hanya satu produk yang dapat di-checkout pada satu waktu',
          icon: 'warning',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
            title: 'text-lg md:text-xl',
            popup: 'rounded-lg',
          },
          confirmButtonText: 'OK',
        })
        return
      }

      const cartIds = selectedItems.map((item) => item.id)
      this.$router.push({
        path: '/checkout',
        query: { cart_ids: cartIds },
      })
    },
    async increaseQuantity(sellerIndex, itemIndex) {
      if (!this.token) {
        this.$router.push('/login')
        return
      }
      const item = this.cartData[sellerIndex].items[itemIndex]
      item.quantity += 1
      await this.updateCartItem(sellerIndex, itemIndex)
    },
    async decreaseQuantity(sellerIndex, itemIndex) {
      if (!this.token) {
        this.$router.push('/login')
        return
      }
      const item = this.cartData[sellerIndex].items[itemIndex]
      if (item.quantity > 1) {
        item.quantity -= 1
        await this.updateCartItem(sellerIndex, itemIndex)
      }
    },
    updateSellerSelection(sellerIndex) {
      const seller = this.cartData[sellerIndex]
      const shouldSelect = !seller.isSelected

      // Deselect all items first
      this.cartData.forEach((s, si) => {
        s.isSelected = false
        s.items.forEach((item) => {
          item.isSelected = false
        })
      })

      // If selecting, select all items of this seller
      if (shouldSelect) {
        seller.isSelected = true
        seller.items[0].isSelected = true // Select only the first item
      }
    },
    updateItemSelection(sellerIndex, itemIndex) {
      // Deselect all items first
      this.cartData.forEach((seller, si) => {
        seller.isSelected = false
        seller.items.forEach((item) => {
          item.isSelected = false
        })
      })

      // Select the clicked item
      const item = this.cartData[sellerIndex].items[itemIndex]
      item.isSelected = true

      // Update seller selection state
      this.updateSelectionState()
    },
    updateSelectionState() {
      this.cartData.forEach((seller) => {
        seller.isSelected = seller.items.some((item) => item.isSelected)
      })
    },
  },
}
</script>

<style scoped>
.checkbox-red:checked {
  accent-color: #dc2626;
}
.checkout-bar {
  transition: bottom 0.2s ease;
}
</style>
