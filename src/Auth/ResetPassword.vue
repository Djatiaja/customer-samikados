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

      <!-- New Password Form -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">SET NEW PASSWORD</h2>
        <p v-if="errorMessage" class="text-red-600 text-sm mb-4">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-green-600 text-sm mb-4">{{ successMessage }}</p>
        <form @submit.prevent="resetPassword">
          <!-- Password Input -->
          <div class="mb-4">
            <label for="password" class="sr-only">New Password</label>
            <input
              id="password"
              v-model="password"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="New Password"
              type="password"
              required
            />
          </div>

          <!-- Password Confirmation Input -->
          <div class="mb-4">
            <label for="password_confirmation" class="sr-only">Confirm Password</label>
            <input
              id="password_confirmation"
              v-model="password_confirmation"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Confirm Password"
              type="password"
              required
            />
          </div>

          <!-- Submit Button -->
          <AuthMainButton text="Reset Password" :disabled="isLoading" />
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
      token: '',
      password: '',
      password_confirmation: '',
      errorMessage: '',
      successMessage: '',
      isLoading: false,
    }
  },
  mounted() {
    // Retrieve email and token from route query parameters
    this.email = this.$route.query.email || ''
    this.token = this.$route.query.token || ''

    if (!this.email || !this.token) {
      this.errorMessage = 'Invalid access. Please complete the OTP verification first.'
    }
  },
  methods: {
    async resetPassword() {
      if (this.password.trim() === '') {
        this.errorMessage = 'Password is required'
        return
      }

      if (this.password !== this.password_confirmation) {
        this.errorMessage = 'Passwords do not match'
        return
      }

      this.isLoading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`,
          {
            token: this.token,
            email: this.email,
            password: this.password,
            password_confirmation: this.password_confirmation,
          },
        )

        if (response.status === 200) {
          this.successMessage = 'Password successfully reset! Redirecting to login...'
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Failed to reset password. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
