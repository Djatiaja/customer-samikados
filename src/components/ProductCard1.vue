<template>
  <div
    class="p-4 mx-auto border border-gray-200 shadow-md rounded-lg hover:shadow-lg transition min-h-[400px] max-w-[300px] w-full"
  >
    <router-link :to="link" class="block h-full flex flex-col">
      <div class="w-full h-[250px] flex items-center justify-center overflow-hidden rounded-t-lg">
        <img :src="image" :alt="'Product image for ' + name" class="w-full h-full object-contain" />
      </div>
      <div class="p-4 flex flex-col flex-grow justify-end">
        <div class="text-base lg:text-lg font-semibold truncate">{{ name }}</div>
        <div class="text-gray-500 text-base lg:text-lg">Rp{{ price }}</div>
        <div class="text-gray-500 text-sm mt-2">
          <i class="fas fa-store mr-1"></i>{{ sellerName }}
        </div>
        <div v-if="address" class="text-gray-400 text-xs mt-1 flex items-center">
          <i class="fas fa-map-marker-alt mr-1"></i>{{ address }}
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
      default: '',
    },
  },
}
</script>

<style scoped>
a,
.router-link-active {
  text-decoration: none;
  color: inherit;
}
</style>
