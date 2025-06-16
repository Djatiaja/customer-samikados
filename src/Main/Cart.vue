<template>
  <div class="bg-gray-200 flex flex-col min-h-screen">
    <HeaderAfterLogin />

    <!-- Checkout all products -->
    <div class="w-full md:w-3/4 flex mx-auto mb-4 mt-4 md:mb-10 md:mt-10 bg-white p-3 md:p-5">
      <input
        id="checkAllProducts"
        type="checkbox"
        class="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-4 checkbox-red"
        v-model="selectAll"
        @change="toggleSelectAll"
      />
      <h2 class="text-sm md:text-base">Checkout semua produk</h2>
    </div>

    <!-- Cart Content Wrapper -->
    <section class="w-full md:w-3/4 px-3 md:px-0 mx-auto flex-grow mb-32">
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
      class="fixed bottom-16 md:bottom-20 left-0 md:left-1/2 transform md:-translate-x-1/2 w-full md:w-3/4 bg-white p-3 md:p-4 shadow-lg flex justify-between items-center"
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
      >
        Checkout
      </button>
    </div>

    <AuthFooter />
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
      selectAll: false,
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
      baseUrl: 'http://127.0.0.1:8000/api',
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
  methods: {
    async fetchCart() {
      this.loading = true
      try {
        const response = await axios.get(`${this.baseUrl}/customer/cart`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        if (response.data.status === 'success') {
          // Filter out invalid items
          const validCartItems = response.data.data.filter(
            (item) => item.product && item.product.id && item.product.is_publish,
          )
          this.cartData = this.groupBySeller(validCartItems)
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
        console.log('Fetch Variants Response:', response.data)
        if (response.data.status === 'success') {
          this.variants[productId] = response.data.data
          console.log('Variants Set for product_id:', productId, this.variants[productId])
        } else {
          this.variants[productId] = []
        }
      } catch (error) {
        this.variants[productId] = []
        console.error('Error Fetch Variants:', error.response || error)
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
        console.log('Fetch Finishings Response:', response.data)
        if (response.data.status === 'success') {
          this.finishings[productId] = response.data.data
          console.log('Finishings Set for product_id:', productId, this.finishings[productId])
        } else {
          this.finishings[productId] = []
        }
      } catch (error) {
        this.finishings[productId] = []
        console.error('Error Fetch Finishings:', error.response || error)
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
      console.log('Variants for modal:', this.variants[item.productId])
      console.log('Finishings for modal:', this.finishings[item.productId])

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
            `<option value="${finish.finishing_id}" ${
              item.specs.finishingId === finish.finishing_id ? 'selected' : ''
            }>${finish.name} (+${this.formatPrice(finish.price)})</option>`,
        )
        .join('')

      if (!variantOptions || !finishingOptions) {
        Swal.fire({
          title: 'Error',
          text: 'Gagal memuat opsi varian atau finishing untuk produk ini',
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
          if (finishingId && !finishings.some((f) => f.finishing_id === parseInt(finishingId))) {
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
      const finishing = finishings.find((f) => f.finishing_id === formData.finishingId)
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
          Swal.fire({
            title: 'Error',
            text: errorMessage.includes('not found')
              ? 'Item di keranjang tidak valid, keranjang telah diperbarui'
              : errorMessage,
            icon: 'error',
            customClass: {
              confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
              title: 'text-lg md:text-xl',
              popup: 'rounded-lg',
            },
          })
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
            (f) => f.finishing_id === item.specs.finishingId,
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
          Swal.fire({
            title: 'Error',
            text: errorMessage.includes('not found')
              ? 'Item di keranjang tidak valid, keranjang telah diperbarui'
              : errorMessage,
            icon: 'error',
            customClass: {
              confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md',
              title: 'text-lg md:text-xl',
              popup: 'rounded-lg',
            },
          })
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
      const finishing = finishings.find((f) => f.finishing_id === parseInt(finishingId))
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
      const hasSelectedItems = this.cartData.some((seller) =>
        seller.items.some((item) => item.isSelected),
      )
      if (!hasSelectedItems) {
        Swal.fire({
          title: 'Tidak Ada Produk Dipilih',
          text: 'Pilih produk dulu untuk checkout',
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
      this.$router.push('/checkout')
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
    toggleSelectAll() {
      this.cartData.forEach((seller) => {
        seller.isSelected = this.selectAll
        seller.items.forEach((item) => {
          item.isSelected = this.selectAll
        })
      })
    },
    updateSellerSelection(sellerIndex) {
      const seller = this.cartData[sellerIndex]
      seller.isSelected = !seller.isSelected
      seller.items.forEach((item) => {
        item.isSelected = seller.isSelected
      })
      this.updateSelectionState()
    },
    updateItemSelection(sellerIndex, itemIndex) {
      const seller = this.cartData[sellerIndex]
      const item = seller.items[itemIndex]
      item.isSelected = !item.isSelected
      seller.isSelected = seller.items.every((item) => item.isSelected)
      this.updateSelectionState()
    },
    updateSelectionState() {
      const allSelected = this.cartData.every(
        (seller) => seller.isSelected && seller.items.every((item) => item.isSelected),
      )
      this.selectAll = allSelected
    },
  },
}
</script>

<style scoped>
.checkbox-red:checked {
  accent-color: #dc2626;
}
</style>
