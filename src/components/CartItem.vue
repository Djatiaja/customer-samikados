<template>
  <div class="p-3 md:p-4 border-b border-gray-200">
    <div class="flex flex-col md:flex-row">
      <!-- Checkbox -->
      <div class="flex items-start mb-2 md:mb-0 md:mr-4">
        <input
          type="checkbox"
          class="w-4 h-4 md:w-5 md:h-5 checkbox-red mr-2 md:mr-0"
          :checked="item.isSelected"
          @change="$emit('toggle-selection')"
        />
        <!-- Product Image (mobile: beside checkbox, desktop: own column) -->
        <img :src="item.image" class="w-16 h-16 md:hidden object-cover ml-2" alt="Product" />
      </div>

      <!-- Product Image (desktop only) -->
      <div class="hidden md:block mr-4">
        <img :src="item.image" class="w-24 h-24 object-cover" alt="Product" />
      </div>

      <!-- Product Details -->
      <div class="flex-grow">
        <h4 class="font-medium text-base md:text-lg">{{ item.name }}</h4>

        <!-- Product Specifications -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mt-2">
          <div>
            <div class="flex justify-between mb-1 md:mb-2">
              <span class="text-gray-600 text-sm md:text-base">Catatan:</span>
              <span class="text-sm md:text-base">{{ item.specs.note }}</span>
            </div>
            <div class="flex justify-between mb-1 md:mb-2">
              <span class="text-gray-600 text-sm md:text-base">Ukuran:</span>
              <span class="text-sm md:text-base">{{ item.specs.size }}</span>
            </div>
            <div class="flex justify-between mb-1 md:mb-2">
              <span class="text-gray-600 text-sm md:text-base">Finishing:</span>
              <span class="text-sm md:text-base">{{ item.specs.finishing }}</span>
            </div>
          </div>

          <!-- Quantity Selector and Price -->
          <div class="flex flex-col items-start md:items-end mt-2 md:mt-0">
            <div class="flex items-center mb-2 md:mb-4">
              <button
                class="border border-gray-300 w-4 h-4 md:w-6 md:h-6 rounded-md flex items-center justify-center"
                @click="$emit('decrease-quantity')"
              >
                <i class="fas fa-minus text-gray-500 text-xs md:text-sm"></i>
              </button>
              <span class="mx-3 md:mx-4 text-sm md:text-base">{{ item.quantity }}</span>
              <button
                class="border border-gray-300 w-4 h-4 md:w-6 md:h-6 rounded-md flex items-center justify-center"
                @click="$emit('increase-quantity')"
              >
                <i class="fas fa-plus text-gray-500 text-xs md:text-sm"></i>
              </button>
            </div>
            <div class="font-bold text-base md:text-lg">
              {{ formatPrice(calculateItemPrice(item)) }}
            </div>

            <!-- Action Buttons -->
            <div class="flex mt-2">
              <button class="text-blue-600 mr-4 text-sm md:text-base" @click="$emit('edit-item')">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="text-red-600 text-sm md:text-base" @click="$emit('delete-item')">
                <i class="fas fa-trash-alt"></i> Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    calculateItemPrice(item) {
      return item.price * item.quantity
    },
    formatPrice(price) {
      return `Rp${price.toLocaleString('id-ID')}`
    },
  },
}
</script>

<style scoped>
.checkbox-red:checked {
  accent-color: #dc2626; /* Tailwind's red-600 color */
}
</style>
