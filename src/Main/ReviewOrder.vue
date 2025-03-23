<template>
  <div class="bg-gray-100">
    <!-- Header Component -->
    <HeaderAfterLogin />

    <!-- Review Section -->
    <main class="container mx-auto p-6 bg-white rounded-lg shadow-md mt-6 w-3/4">
      <div class="flex items-center justify-between mb-4 relative">
        <router-link to="/orders" class="absolute left-0 text-black text-3xl font-semibold">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </router-link>
        <h1 class="text-2xl font-semibold mx-auto">Beri Ulasan</h1>
      </div>

      <!-- Order Details -->
      <div class="flex items-center justify-evenly border-b border-gray-200 pb-4 mb-4 px-8">
        <!-- Informasi Pesanan -->
        <div class="flex space-x-12 mt-4">
          <!-- Product Image -->
          <div class="flex justify-center border border-gray-200 mr-4 w-80 overflow-hidden">
            <img
              :src="productDetails.image"
              :alt="productDetails.name"
              class="w-full h-auto object-contain"
            />
          </div>

          <!-- Product Details -->
          <div class="w-full px-4 flex flex-col">
            <h3 class="font-semibold text-xl mt-8">{{ productDetails.name }}</h3>
            <p class="text-gray-500 text-sm mt-4">Catatan: {{ productDetails.notes }}</p>
            <p class="text-gray-500 text-sm">Ukuran: {{ productDetails.size }}</p>
            <p class="text-gray-500 text-sm">Finishing: {{ productDetails.finishing }}</p>
          </div>
        </div>
      </div>

      <!-- Rating Section -->
      <div class="text-center border-b border-gray-200 py-4 mt-6">
        <h2 class="text-2xl text-gray-800 mb-2">Seberapa Puaskah Anda dengan Jasa Pengiriman?</h2>
        <!-- Star Rating with FontAwesome -->
        <div class="flex justify-center space-x-4 mb-4">
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
      </div>

      <!-- Review Text & Photo -->
      <div class="mt-6">
        <div class="flex justify-between items-center">
          <label for="review-text" class="block text-gray-700 text-lg font-medium"
            >Tulis Ulasan Anda</label
          >
          <span class="text-gray-500 text-sm">{{ reviewText.length }}/200</span>
        </div>
        <textarea
          id="review-text"
          v-model="reviewText"
          maxlength="200"
          rows="4"
          class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          placeholder="Ketik Ulasan Anda Di Sini..."
        >
        </textarea>
      </div>

      <div class="mt-6">
        <label for="upload-photo" class="block text-gray-700 text-lg font-medium mb-2"
          >Tambahkan Foto / Video</label
        >
        <div class="flex items-center space-x-4">
          <label
            class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200"
          >
            <i class="fas fa-cloud-upload-alt text-3xl mb-2"></i>
            <span class="text-gray-500">Tambahkan Foto / Video</span>
            <input
              id="upload-photo"
              type="file"
              accept="image/*,video/*"
              class="hidden"
              @change="handleFileUpload"
            />
          </label>
        </div>
        <!-- Preview uploaded files -->
        <div v-if="uploadedFiles.length > 0" class="mt-4 flex flex-wrap gap-2">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="relative w-24 h-24">
            <img :src="file.preview" class="w-full h-full object-cover rounded-md" />
            <button
              @click="removeFile(index)"
              class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="mt-6 text-center">
        <button
          @click="submitReview"
          class="bg-red-600 text-white mt-4 px-6 py-2 rounded-lg hover:bg-red-700 w-1/3"
        >
          Kirim
        </button>
      </div>
    </main>

    <!-- Footer Component -->
    <AuthFooter />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import Swal from 'sweetalert2'

export default defineComponent({
  name: 'BeriUlasan',
  components: {
    HeaderAfterLogin,
    AuthFooter,
  },
  data() {
    return {
      rating: 0,
      hoverRating: 0,
      reviewText: '',
      uploadedFiles: [],
      productDetails: {
        id: null,
        name: '',
        notes: '',
        size: '',
        finishing: '',
        image: '',
      },
    }
  },
  created() {
    // Fetch product details from route params or API
    const productId = this.$route.params.productId
    this.fetchProductDetails(productId)
  },
  methods: {
    setRating(value) {
      this.rating = value
    },
    handleFileUpload(event) {
      const files = event.target.files
      if (!files.length) return

      const newFile = files[0]
      // Create preview for the file
      const reader = new FileReader()
      reader.onload = (e) => {
        this.uploadedFiles.push({
          file: newFile,
          preview: e.target.result,
        })
      }
      reader.readAsDataURL(newFile)
    },
    removeFile(index) {
      this.uploadedFiles.splice(index, 1)
    },
    fetchProductDetails(productId) {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      this.productDetails = this.getProductById(productId)
    },
    getProductById(productId) {
      // Mock data - in a real app this would come from an API
      const products = [
        {
          id: 1,
          name: 'PIN PENITI 58mm',
          notes: 'Packing pakai selongsong',
          size: '15 x 15 cm',
          finishing: 'Dengan Finishing',
          image: 'https://placehold.co/500x500',
        },
        {
          id: 2,
          name: 'MAGNET KULKAS',
          notes: 'Packing dobel',
          size: '10 x 10 cm',
          finishing: 'Tanpa Finishing',
          image: 'https://placehold.co/500x500',
        },
      ]

      return products.find((p) => p.id == productId) || products[0]
    },
    submitReview() {
      // Validate form
      if (this.rating === 0) {
        this.showErrorAlert()
        return
      }

      // Prepare review data
      const reviewData = {
        productId: this.productDetails.id,
        rating: this.rating,
        text: this.reviewText,
        files: this.uploadedFiles.map((f) => f.file),
      }

      // In a real app, you would send this data to an API
      console.log('Submitting review:', reviewData)

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
          this.$router.push('/orders')
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
