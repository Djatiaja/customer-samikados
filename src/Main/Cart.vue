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
      <!-- Cart Content for each seller -->
      <CartSeller
        v-for="(seller, sellerIndex) in cartData"
        :key="sellerIndex"
        :seller="seller"
        @toggle-seller-selection="updateSellerSelection(sellerIndex)"
        @toggle-item-selection="(itemIndex) => updateItemSelection(sellerIndex, itemIndex)"
        @increase-quantity="(itemIndex) => increaseQuantity(sellerIndex, itemIndex)"
        @decrease-quantity="(itemIndex) => decreaseQuantity(sellerIndex, itemIndex)"
        @edit-item="(itemIndex) => openEditModal(sellerIndex, itemIndex)"
        @delete-item="(itemIndex) => confirmDelete(sellerIndex, itemIndex)"
      />
    </section>

    <!-- Floating Checkout Bar - Fixed positioning -->
    <div
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
      editForm: {
        note: '',
        size: '',
        finishing: '',
        quantity: 1,
      },
      currentEditItem: {
        sellerIndex: null,
        itemIndex: null,
      },
      // Product options for different products
      productOptions: {
        // Options for PIN products
        PIN: {
          sizes: [
            { value: '44mm', label: 'PIN 44mm', price: 175000 },
            { value: '58mm', label: 'PIN 58mm', price: 225000 },
            { value: '75mm', label: 'PIN 75mm', price: 275000 },
          ],
          finishings: [
            { value: 'standard', label: 'Standar', multiplier: 1 },
            { value: 'laminasi', label: 'Laminasi Doff', multiplier: 1.1 },
            { value: 'glossy', label: 'Laminasi Glossy', multiplier: 1.15 },
          ],
        },
        // Options for Sticker products
        STICKER: {
          sizes: [
            { value: '5x5cm', label: 'Stiker 5 x 5 cm', price: 50000 },
            { value: '7x7cm', label: 'Stiker 7 x 7 cm', price: 75000 },
            { value: '10x10cm', label: 'Stiker 10 x 10 cm', price: 100000 },
          ],
          finishings: [
            { value: 'vinyl', label: 'Vinyl', multiplier: 1 },
            { value: 'transparant', label: 'Transparant', multiplier: 1.2 },
            { value: 'chrome', label: 'Chrome', multiplier: 1.5 },
          ],
        },
        // Options for Banner products
        BANNER: {
          sizes: [
            { value: '60x160cm', label: 'X-Banner 60x160cm', price: 150000 },
            { value: '80x180cm', label: 'Roll Banner 80x180cm', price: 250000 },
            { value: '100x200cm', label: 'Standing Banner 100x200cm', price: 350000 },
          ],
          finishings: [
            { value: 'flexi', label: 'Flexi 280gsm', multiplier: 1 },
            { value: 'albatros', label: 'Albatros', multiplier: 1.25 },
            { value: 'luster', label: 'Luster', multiplier: 1.35 },
          ],
        },
        // Options for Business Card products
        CARD: {
          sizes: [
            { value: 'standard', label: 'Standar 9x5.5cm', price: 80000 },
            { value: 'square', label: 'Kotak 8x8cm', price: 100000 },
          ],
          finishings: [
            { value: 'artpaper', label: 'Art Paper 260gsm', multiplier: 1 },
            { value: 'artcarton', label: 'Art Carton 310gsm', multiplier: 1.2 },
            { value: 'spotUV', label: 'Spot UV', multiplier: 1.45 },
          ],
        },
        // Options for T-Shirt products
        TSHIRT: {
          sizes: [
            { value: 'S', label: 'Small', price: 120000 },
            { value: 'M', label: 'Medium', price: 120000 },
            { value: 'L', label: 'Large', price: 130000 },
            { value: 'XL', label: 'Extra Large', price: 140000 },
          ],
          finishings: [
            { value: 'sablon', label: 'Sablon', multiplier: 1 },
            { value: 'bordir', label: 'Bordir', multiplier: 1.3 },
            { value: 'polyflex', label: 'Polyflex', multiplier: 1.2 },
          ],
        },
      },
      cartData: [
        {
          id: 1,
          name: 'Ruang Jaya Print',
          location: 'Jakarta Selatan',
          image: 'https://placehold.co/50x50',
          isSelected: false,
          items: [
            {
              id: 101,
              name: 'PIN PENITI 58mm',
              type: 'PIN',
              image: 'https://placehold.co/150x150',
              price: 225000,
              basePrice: 225000,
              quantity: 1,
              isSelected: false,
              specs: {
                note: 'Packing pakai selongsong',
                size: '58mm',
                finishing: 'standard',
              },
            },
            {
              id: 102,
              name: 'Stiker Vinyl Custom',
              type: 'STICKER',
              image: 'https://placehold.co/150x150',
              price: 75000,
              basePrice: 75000,
              quantity: 2,
              isSelected: false,
              specs: {
                note: 'Logo perusahaan dengan warna cerah',
                size: '7x7cm',
                finishing: 'vinyl',
              },
            },
          ],
        },
        {
          id: 2,
          name: 'Sentosa Digital Printing',
          location: 'Bandung',
          image: 'https://placehold.co/50x50',
          isSelected: false,
          items: [
            {
              id: 201,
              name: 'Roll Up Banner Premium',
              type: 'BANNER',
              image: 'https://placehold.co/150x150',
              price: 312500, // 250000 * 1.25 (albatros)
              basePrice: 250000,
              quantity: 1,
              isSelected: false,
              specs: {
                note: 'Desain untuk pameran produk',
                size: '80x180cm',
                finishing: 'albatros',
              },
            },
            {
              id: 202,
              name: 'Kartu Nama Premium',
              type: 'CARD',
              image: 'https://placehold.co/150x150',
              price: 145000, // 100000 * 1.45 (spotUV)
              basePrice: 100000,
              quantity: 3,
              isSelected: false,
              specs: {
                note: 'Tambahkan logo perusahaan di bagian depan',
                size: 'square',
                finishing: 'spotUV',
              },
            },
          ],
        },
        {
          id: 3,
          name: 'Creative Factory',
          location: 'Surabaya',
          image: 'https://placehold.co/50x50',
          isSelected: false,
          items: [
            {
              id: 301,
              name: 'Kaos Custom Premium',
              type: 'TSHIRT',
              image: 'https://placehold.co/150x150',
              price: 169000, // 130000 * 1.3 (bordir)
              basePrice: 130000,
              quantity: 2,
              isSelected: false,
              specs: {
                note: 'Logo di bagian depan, nama di bagian belakang',
                size: 'L',
                finishing: 'bordir',
              },
            },
            {
              id: 302,
              name: 'PIN PENITI 75mm Special',
              type: 'PIN',
              image: 'https://placehold.co/150x150',
              price: 316250, // 275000 * 1.15 (glossy)
              basePrice: 275000,
              quantity: 1,
              isSelected: false,
              specs: {
                note: 'Desain full color dengan efek glossy',
                size: '75mm',
                finishing: 'glossy',
              },
            },
          ],
        },
      ],
    }
  },
  methods: {
    toggleSelectAll() {
      // Update all sellers and items selection state
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

      // Update all items of this seller to match seller selection
      seller.items.forEach((item) => {
        item.isSelected = seller.isSelected
      })

      this.updateSelectionState()
    },
    updateItemSelection(sellerIndex, itemIndex) {
      const seller = this.cartData[sellerIndex]
      const item = seller.items[itemIndex]
      item.isSelected = !item.isSelected

      // Check if all items are selected to update the seller selection
      seller.isSelected = seller.items.every((item) => item.isSelected)

      this.updateSelectionState()
    },
    updateSelectionState() {
      // Check if all items are selected to update the selectAll state
      const allSelected = this.cartData.every(
        (seller) => seller.isSelected && seller.items.every((item) => item.isSelected),
      )
      this.selectAll = allSelected
    },
    calculateItemPrice(item) {
      return item.price * item.quantity
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
      // Check if any items are selected
      const hasSelectedItems = this.cartData.some((seller) =>
        seller.items.some((item) => item.isSelected),
      )

      if (!hasSelectedItems) {
        Swal.fire({
          title: 'Tidak Ada Produk Dipilih',
          text: 'Silakan pilih produk untuk checkout',
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

      // Navigate to checkout page with selected items
      this.$router.push('/checkout')
    },

    // Quantity handling methods
    increaseQuantity(sellerIndex, itemIndex) {
      this.cartData[sellerIndex].items[itemIndex].quantity += 1
      this.updatePrice(sellerIndex, itemIndex)
    },
    decreaseQuantity(sellerIndex, itemIndex) {
      const item = this.cartData[sellerIndex].items[itemIndex]
      if (item.quantity > 1) {
        item.quantity -= 1
        this.updatePrice(sellerIndex, itemIndex)
      }
    },

    // Calculate dynamic price based on product type, size, and finishing
    calculateProductPrice(productType, sizeValue, finishingValue, quantity) {
      // Get product options
      const options = this.productOptions[productType]
      if (!options) return 0

      // Find size and finishing details
      const sizeObj = options.sizes.find((size) => size.value === sizeValue)
      const finishingObj = options.finishings.find((finish) => finish.value === finishingValue)

      if (!sizeObj || !finishingObj) return 0

      // Calculate price with finishing multiplier
      const basePrice = sizeObj.price
      const priceWithFinishing = basePrice * finishingObj.multiplier

      return priceWithFinishing * quantity
    },

    updatePrice(sellerIndex, itemIndex) {
      const item = this.cartData[sellerIndex].items[itemIndex]
      const options = this.productOptions[item.type]

      if (!options) return

      // Find size and finishing details
      const sizeObj = options.sizes.find((size) => size.value === item.specs.size)
      const finishingObj = options.finishings.find(
        (finish) => finish.value === item.specs.finishing,
      )

      if (!sizeObj || !finishingObj) return

      // Update base price and final price
      item.basePrice = sizeObj.price
      item.price = item.basePrice * finishingObj.multiplier
    },

    // Edit modal methods using SweetAlert2
    openEditModal(sellerIndex, itemIndex) {
      const item = this.cartData[sellerIndex].items[itemIndex]
      this.currentEditItem = { sellerIndex, itemIndex }
      const productType = item.type
      const options = this.productOptions[productType]

      // Store initial values
      this.editForm = {
        note: item.specs.note,
        size: item.specs.size,
        finishing: item.specs.finishing,
        quantity: item.quantity,
      }

      // Generate size options HTML
      let sizeOptionsHTML = options.sizes
        .map(
          (size) =>
            `<option value="${size.value}" ${item.specs.size === size.value ? 'selected' : ''}>${size.label} - ${this.formatPrice(size.price)}</option>`,
        )
        .join('')

      // Generate finishing options HTML
      let finishingOptionsHTML = options.finishings
        .map(
          (finish) =>
            `<option value="${finish.value}" ${item.specs.finishing === finish.value ? 'selected' : ''}>${finish.label} (${(finish.multiplier * 100 - 100).toFixed(0)}%)</option>`,
        )
        .join('')

      Swal.fire({
        title: 'Edit Produk',
        html: `
          <div class="text-left">
            <div class="mb-4">
              <label class="block text-gray-700 mb-1 text-left">Catatan</label>
              <input
                id="swal-input-note"
                class="w-full border rounded-md p-2"
                value="${item.specs.note}"
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 mb-1 text-left">Ukuran</label>
              <select id="swal-input-size" class="w-full border rounded-md p-2" onchange="window.updatePreviewPrice()">
                ${sizeOptionsHTML}
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 mb-1 text-left">Finishing</label>
              <select id="swal-input-finishing" class="w-full border rounded-md p-2" onchange="window.updatePreviewPrice()">
                ${finishingOptionsHTML}
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
                    productType,
                    item.specs.size,
                    item.specs.finishing,
                    item.quantity,
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
          // Add price preview update function to window object for access from HTML
          window.updatePreviewPrice = () => {
            const sizeValue = document.getElementById('swal-input-size').value
            const finishingValue = document.getElementById('swal-input-finishing').value
            const quantityValue =
              parseInt(document.getElementById('swal-input-quantity').value) || 1

            const price = this.calculateProductPrice(
              productType,
              sizeValue,
              finishingValue,
              quantityValue,
            )

            document.getElementById('preview-price').innerText = this.formatPrice(price)
          }

          // Add event listeners for quantity buttons
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
          return {
            note: document.getElementById('swal-input-note').value,
            size: document.getElementById('swal-input-size').value,
            finishing: document.getElementById('swal-input-finishing').value,
            quantity: parseInt(document.getElementById('swal-input-quantity').value) || 1,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.saveEdit(result.value)
        }
      })
    },
    saveEdit(formData) {
      const { sellerIndex, itemIndex } = this.currentEditItem
      const item = this.cartData[sellerIndex].items[itemIndex]
      const productType = item.type
      const options = this.productOptions[productType]

      // Update specs
      item.specs.note = formData.note
      item.specs.size = formData.size
      item.specs.finishing = formData.finishing
      item.quantity = formData.quantity

      // Find size and finishing details
      const sizeObj = options.sizes.find((size) => size.value === formData.size)
      const finishingObj = options.finishings.find((finish) => finish.value === formData.finishing)

      // Update price
      item.basePrice = sizeObj.price
      item.price = item.basePrice * finishingObj.multiplier

      // Show confirmation message
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
    },

    // Delete method
    confirmDelete(sellerIndex, itemIndex) {
      const item = this.cartData[sellerIndex].items[itemIndex]

      Swal.fire({
        title: 'Konfirmasi Hapus Produk',
        html: `Apakah Anda yakin ingin menghapus ${item.name} dari keranjang?`,
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
        width: 'auto',
        padding: '1.25em',
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteItem(sellerIndex, itemIndex)
        }
      })
    },
    deleteItem(sellerIndex, itemIndex) {
      // Remove the item from the cart
      this.cartData[sellerIndex].items.splice(itemIndex, 1)

      // If seller has no more items, remove the seller as well
      if (this.cartData[sellerIndex].items.length === 0) {
        this.cartData.splice(sellerIndex, 1)
      }

      // Update selection state
      this.updateSelectionState()

      // Show confirmation
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
    },
  },
}
</script>

<style scoped>
/* Custom Tailwind checkbox style */
.checkbox-red:checked {
  accent-color: #dc2626; /* Tailwind's red-600 color */
}

/* Add responsive styles */
@media (max-width: 768px) {
  /* Additional mobile-specific styles can be added here if needed */
}
</style>
