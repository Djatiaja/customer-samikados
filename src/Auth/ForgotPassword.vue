<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <!-- Header -->
    <AuthHeader title="SAMIKADOS" subtitle="LOGIN" />

    <!-- Main Content -->
    <main
      class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center lg:justify-center flex-grow"
    >
      <!-- Image Section -->
      <section class="w-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
        <figure>
          <img src="/images/Transparent.png" alt="Cart icon image" class="w-full max-w-md" />
        </figure>
      </section>

      <!-- Reset Password Form -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">RESET PASSWORD</h2>
        <p v-if="errorMessage" class="text-red-600 text-sm mb-4">{{ errorMessage }}</p>
        <form @submit.prevent="sendOtp">
          <!-- Email Input -->
          <div class="mb-4">
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Email"
              type="email"
              required
            />
          </div>

          <!-- Submit Button -->
          <AuthMainButton text="Berikutnya" :disabled="isLoading" />
        </form>
      </section>
    </main>

    <!-- Footer -->
    <AuthFooter />
  </div>
</template>

<script>
import AuthHeader from '@/components/AuthHeader.vue'
import AuthMainButton from '@/components/AuthMainButton.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import axios from 'axios'

export default {
  components: { AuthHeader, AuthMainButton, AuthFooter },
  data() {
    return {
      email: '',
      errorMessage: '',
      isLoading: false,
    }
  },
  methods: {
    async sendOtp() {
      if (this.email.trim() === '') {
        this.errorMessage = 'Email is required'
        return
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/sendOtp`, {
          email: this.email,
        })

        if (response.status === 200) {
          this.$router.push({
            path: '/otp-password',
            query: { email: this.email },
          })
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
