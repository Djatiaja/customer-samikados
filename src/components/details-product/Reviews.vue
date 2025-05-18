<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="mt-8 lg:mx-20">
    <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-10">Ulasan</h3>
    <div class="mt-4">
      <div v-for="review in reviews" :key="review.id" class="mb-8">
        <div class="flex flex-col lg:flex-row items-start">
          <!-- User Info -->
          <div class="flex flex-col lg:flex-row items-start mr-6 w-full lg:w-1/2">
            <img
              :src="review.profilePic"
              alt="User profile picture"
              class="rounded-full mr-4 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
            />
            <div>
              <span class="font-bold block text-sm sm:text-base lg:text-lg">{{ review.user }}</span>
              <span class="text-gray-500 text-xs sm:text-sm lg:text-base"
                >{{ review.time }} | {{ review.date }}</span
              >
              <div class="flex items-center mt-1">
                <i
                  v-for="star in 5"
                  :key="star"
                  class="fas fa-star text-yellow-500 text-xs sm:text-sm lg:text-base"
                  :class="{ 'text-gray-300': star > review.rating }"
                ></i>
              </div>
            </div>
          </div>

          <!-- Review Text with Seller Response -->
          <div class="flex-1">
            <p class="text-gray-700 text-sm sm:text-base lg:text-lg">{{ review.content }}</p>
            <div
              v-if="review.reply"
              class="mt-4 p-4 bg-gray-100 rounded-lg border-l-4 border-red-600"
            >
              <p class="text-gray-800 font-semibold text-sm sm:text-base lg:text-lg">
                Tanggapan Seller
                <span class="text-xs sm:text-sm lg:text-base text-gray-500">{{
                  review.reply.time
                }}</span>
              </p>
              <p class="text-gray-700 text-xs sm:text-sm lg:text-base">
                {{ review.reply.content }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    reviews: {
      type: Array,
      required: true,
    },
  },
  setup() {
    return {}
  },
}
</script>
