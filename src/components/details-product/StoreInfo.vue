<template>
  <section class="mt-8 lg:mx-20 p-4 border rounded-lg shadow-sm">
    <div class="flex items-center">
      <img
        src="https://placehold.co/80x80"
        alt="Store Logo"
        class="rounded-full w-12 h-12 sm:w-16 sm:h-16"
      />
      <div class="ml-4 flex-1">
        <h3 class="font-bold text-lg sm:text-xl">Ruang Jaya Print</h3>
        <div class="flex items-center mt-1">
          <i
            v-for="star in 5"
            :key="star"
            class="fas fa-star text-yellow-500 text-sm sm:text-base mr-1"
          ></i>
        </div>
        <div class="text-sm sm:text-base text-gray-600 mt-1">
          <span>Terakhir Aktif 1 Jam yang Lalu</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  setup() {
    return {}
  },
}
</script>
