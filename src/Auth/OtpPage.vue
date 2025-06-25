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

      <!-- OTP Form -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">MASUKKAN KODE OTP</h2>
        <p class="mb-4 text-sm text-gray-600">Kode OTP telah dikirim pada email {{ email }}</p>
        <p v-if="errorMessage" class="text-red-600 text-sm mb-4">{{ errorMessage }}</p>

        <!-- OTP Input -->
        <div class="flex justify-center space-x-4 mb-4">
          <input
            v-for="(otp, index) in otpCode"
            :key="index"
            :ref="'otp' + index"
            v-model="otpCode[index]"
            class="w-12 text-center p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            type="text"
            maxlength="1"
            @input="moveFocus(index, $event)"
            @keydown="handleKeydown(index, $event)"
            @paste="handlePaste($event)"
          />
        </div>

        <!-- Resend Timer -->
        <p class="text-xs text-gray-500 text-center mb-4">
          <span v-if="resendTimer > 0"
            >Mohon tunggu {{ resendTimer }} detik untuk mengirim ulang.</span
          >
          <button
            v-else
            @click="resendOtp"
            class="text-blue-600 hover:underline"
            :disabled="isLoading"
          >
            Kirim ulang OTP
          </button>
        </p>

        <!-- Submit Button -->
        <AuthMainButton text="Berikutnya" :disabled="isLoading" @click="submitOtp" />
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
  components: {
    AuthHeader,
    AuthMainButton,
    AuthFooter,
  },
  data() {
    return {
      otpCode: ['', '', '', ''], // Changed to 4 inputs
      email: '',
      errorMessage: '',
      isLoading: false,
      resendTimer: 35,
      timerInterval: null,
    }
  },
  mounted() {
    this.email = this.$route.query.email || ''
    this.startResendTimer()
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
  },
  methods: {
    startResendTimer() {
      this.resendTimer = 35
      this.timerInterval = setInterval(() => {
        if (this.resendTimer > 0) {
          this.resendTimer--
        } else {
          clearInterval(this.timerInterval)
        }
      }, 1000)
    },
    async resendOtp() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/sendOtp`, {
          email: this.email,
        })

        if (response.status === 200) {
          this.startResendTimer()
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Failed to resend OTP. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    moveFocus(index, event) {
      if (event.target.value && index < this.otpCode.length - 1) {
        this.$refs[`otp${index + 1}`][0].focus()
      }
    },
    handleKeydown(index, event) {
      if (event.key === 'Backspace' && !this.otpCode[index] && index > 0) {
        this.$refs[`otp${index - 1}`][0].focus()
      }
    },
    handlePaste(event) {
      event.preventDefault()
      const paste = event.clipboardData.getData('text').trim()
      if (paste.length === this.otpCode.length && /^\d+$/.test(paste)) {
        this.otpCode = paste.split('')
        this.$refs.otp3[0].focus() // Adjusted for 4 inputs
      }
    },
    async submitOtp() {
      const otp = this.otpCode.join('')
      if (otp.length !== 4) {
        this.errorMessage = 'Masukkan kode OTP 4 digit dengan benar!'
        return
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/verifyOtp`, {
          email: this.email,
          otp: otp,
        })

        if (response.status === 200) {
          this.$router.push({
            path: '/reset-password',
            query: { email: this.email, token: response.data.token }, // Assuming token is in response
          })
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
