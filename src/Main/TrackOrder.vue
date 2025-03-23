<template>
  <div class="bg-gray-100">
    <!-- Header Section -->
    <HeaderAfterLogin />

    <!-- Tracking Section -->
    <main class="container mx-auto p-6 bg-white rounded-lg shadow-md mt-6 mb-16 w-3/4">
      <div class="flex items-center justify-between mb-4 relative">
        <a href="#" class="absolute left-0 text-black text-3xl font-semibold">&larr;</a>
        <h1 class="text-2xl font-semibold mx-auto">Lacak Pesanan</h1>
      </div>

      <!-- Order Details -->
      <div class="flex items-center justify-between border-b pb-4 mb-4 px-8">
        <!-- Left Side: Order Info -->
        <div class="flex-1">
          <p class="font-medium text-gray-800 mb-2">Telah Diterima 24 September</p>
          <p class="text-sm text-gray-600 mb-12">Bukti Pengiriman dari Jasa Pengiriman</p>

          <div class="flex items-center mb-6">
            <img src="https://placehold.co/64x64" alt="Shipping Icon" class="w-16 h-16" />
            <p class="text-lg font-semibold text-gray-800 ml-4">Raja Ongkir</p>
          </div>

          <div class="flex items-center">
            <p class="text-base font-medium text-black">RJGDK762448163859</p>
            <button
              class="flex items-center text-red-600 hover:text-red-700 ml-4"
              @click="copyTrackingNumber"
            >
              <font-awesome-icon :icon="['fas', 'copy']" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Right Side: Package Image -->
        <div>
          <img
            src="https://placehold.co/1000x1000"
            alt="Package Image"
            class="object-contain w-72 h-72"
          />
        </div>
      </div>

      <!-- Rating Section -->
      <div class="text-center border-b py-8 my-6">
        <h2 class="text-2xl text-gray-800 mb-6">Seberapa Puaskah Anda dengan Jasa Pengiriman?</h2>
        <!-- Star Rating with FontAwesome -->
        <div class="flex justify-center space-x-4 mb-8">
          <font-awesome-icon
            v-for="star in 5"
            :key="star"
            :icon="['fas', 'star']"
            :class="[
              star <= rating || star <= hoverRating ? 'text-red-600' : 'text-gray-300',
              'w-8 h-8 md:w-10 md:h-10 cursor-pointer',
            ]"
            @click="setRating(star)"
            @mouseover="hoverRating = star"
            @mouseleave="hoverRating = 0"
          />
        </div>

        <button
          class="bg-red-600 text-white mt-4 px-8 py-3 rounded-lg hover:bg-red-700 text-lg"
          @click="submitReview"
        >
          Kirim Ulasan
        </button>
      </div>

      <!-- Tracking Timeline -->
      <div class="flex justify-center mt-12 mb-8">
        <div class="flex flex-col">
          <!-- Timeline Items -->
          <div v-for="(item, index) in trackingItems" :key="index" class="flex">
            <!-- Date and Time -->
            <div class="w-40 text-right pr-4">
              <p class="text-gray-800 font-semibold">{{ item.date }}</p>
              <p class="text-sm text-gray-600">{{ item.time }}</p>
            </div>

            <!-- Timeline Line and Dot -->
            <div class="flex flex-col items-center mx-4">
              <div class="w-6 h-6 bg-red-600 rounded-full"></div>
              <div v-if="index < trackingItems.length - 1" class="w-1 h-24 bg-gray-300"></div>
            </div>

            <!-- Content -->
            <div class="w-64 pl-4">
              <p class="text-gray-800 font-semibold">{{ item.title }}</p>
              <p class="text-sm text-gray-600">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer with margin -->
    <AuthFooter />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import Swal from 'sweetalert2'

export default defineComponent({
  name: 'TrackingOrderPage',

  components: {
    HeaderAfterLogin,
    AuthFooter,
  },

  data() {
    return {
      rating: 0,
      hoverRating: 0,
      trackingItems: [
        {
          date: '21 September',
          time: '09.27 WIB',
          title: 'Penjual Mengemas Pesanan',
          description: 'Pesanan Anda Sedang Dikemas',
        },
        {
          date: '21 September',
          time: '09.27 WIB',
          title: 'Penjual Mengemas Pesanan',
          description: 'Pesanan Anda Sedang Dikemas',
        },
      ],
    }
  },

  methods: {
    setRating(value) {
      this.rating = value
    },

    submitReview() {
      if (this.rating === 0) {
        this.showErrorAlert()
        return
      }

      this.showSuccessAlert()
    },

    showSuccessAlert() {
      Swal.fire({
        title: 'Berhasil!',
        html: `Rating ${this.rating} bintang telah dikirim. Terima kasih!`,
        icon: 'success',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-6 rounded-md mt-4',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/orders'
        }
      })
    },

    showErrorAlert() {
      Swal.fire({
        title: "<span class='text-xl font-bold'>Peringatan</span>",
        html: "<p class='text-lg'>Silakan berikan rating terlebih dahulu</p>",
        icon: 'warning',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-6 rounded-md mt-4',
        },
      })
    },

    copyTrackingNumber() {
      const trackingNumber = 'RJGDK762448163859'
      navigator.clipboard
        .writeText(trackingNumber)
        .then(() => {
          Swal.fire({
            title: "<span class='text-xl font-bold'>Berhasil</span>",
            html: "<p class='text-lg'>Nomor resi berhasil disalin!</p>",
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          })
        })
        .catch((err) => {
          console.error('Gagal menyalin nomor resi:', err)
          Swal.fire({
            title: "<span class='text-xl font-bold'>Gagal</span>",
            html: "<p class='text-lg'>Tidak dapat menyalin nomor resi</p>",
            icon: 'error',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'bg-red-600 text-white py-2 px-6 rounded-md mt-4',
            },
          })
        })
    },
  },
})
</script>

<style scoped>
/* Custom styles to make FontAwesome stars larger */
.fa-star {
  font-size: 2rem; /* Increase size of stars */
}

@media (min-width: 768px) {
  .fa-star {
    font-size: 2.5rem; /* Even larger on desktop */
  }
}
</style>
