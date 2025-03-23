<template>
  <div class="mb-4 md:mb-6 bg-white rounded-md shadow">
    <!-- Seller Header -->
    <div class="p-3 md:p-4 border-b border-gray-200 flex items-center">
      <input
        type="checkbox"
        class="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-4 checkbox-red"
        :checked="seller.isSelected"
        @change="$emit('toggle-seller-selection')"
      />
      <img :src="seller.image" class="w-6 h-6 md:w-8 md:h-8 rounded-full mr-2" alt="Seller" />
      <h3 class="font-semibold text-sm md:text-base">{{ seller.name }}</h3>
    </div>

    <!-- Seller Items -->
    <CartItem
      v-for="(item, itemIndex) in seller.items"
      :key="item.id"
      :item="item"
      @toggle-selection="$emit('toggle-item-selection', itemIndex)"
      @increase-quantity="$emit('increase-quantity', itemIndex)"
      @decrease-quantity="$emit('decrease-quantity', itemIndex)"
      @edit-item="$emit('edit-item', itemIndex)"
      @delete-item="$emit('delete-item', itemIndex)"
    />
  </div>
</template>

<script>
import CartItem from './CartItem.vue'

export default {
  name: 'CartSeller',
  components: {
    CartItem,
  },
  props: {
    seller: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style scoped>
.checkbox-red:checked {
  accent-color: #dc2626; /* Tailwind's red-600 color */
}
</style>
