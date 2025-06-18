<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <!-- Header -->
    <AuthHeader title="SAMIKADOS" subtitle="REGISTER" />

    <!-- Main Content -->
    <main
      class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center lg:justify-center flex-grow"
    >
      <!-- Image Section (Hidden on mobile) -->
      <section class="w-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
        <figure>
          <img src="/images/Transparent.png" alt="Cart icon image" class="w-full max-w-md" />
        </figure>
      </section>

      <!-- Register Form -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">REGISTER</h2>
        <form @submit.prevent="register">
          <!-- Username -->
          <div class="mb-4">
            <label for="username" class="sr-only">Username</label>
            <input
              id="username"
              v-model="username"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Username"
              type="text"
              :disabled="isLoading"
            />
          </div>

          <!-- Nama -->
          <div class="mb-4">
            <label for="nama" class="sr-only">Nama</label>
            <input
              id="nama"
              v-model="nama"
              class="w-full max-w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Nama Lengkap"
              type="text"
              :disabled="isLoading"
            />
          </div>

          <!-- Phone Number -->
          <div class="mb-4">
            <label for="phone" class="sr-only">No. Telp</label>
            <input
              id="phone"
              v-model="phone"
              class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="No. Telp"
              type="text"
              :disabled="isLoading"
            />
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Email"
              type="email"
              :disabled="isLoading"
            />
          </div>

          <!-- Password -->
          <div class="mb-4 relative">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10"
              placeholder="Password"
              :disabled="isLoading"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-3 flex items-center text-gray-500"
              @click="togglePassword"
              :disabled="isLoading"
            >
              <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </button>
          </div>

          <!-- Konfirmasi Password -->
          <div class="mb-4 relative">
            <label for="confirmPassword" class="sr-only">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10"
              placeholder="Konfirmasi Password"
              :disabled="isLoading"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-3 flex items-center text-gray-500"
              @click="toggleConfirmPassword"
              :disabled="isLoading"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </button>
          </div>

          <!-- Register Button -->
          <AuthMainButton text="Register" :disabled="isLoading" />

          <!-- Login Link -->
          <div class="text-center mt-4">
            <span class="text-gray-700">Sudah Punya Akun? </span>
            <router-link class="text-red-600 hover:underline" to="/login">Log in</router-link>
          </div>
        </form>
      </section>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import AuthHeader from '@/components/AuthHeader.vue'
import AuthMainButton from '@/components/AuthMainButton.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  components: {
    AuthHeader,
    AuthMainButton,
    AuthFooter,
  },
  data() {
    return {
      username: '',
      nama: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      isLoading: false,
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    }
  },
  mounted() {
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.warn('VITE_API_BASE_URL is not defined in .env file. Using fallback URL.')
    }
    console.log('Base URL:', this.baseUrl)
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    async register() {
      if (this.isLoading) return // Prevent double submission

      // Validate form
      if (
        !this.username ||
        !this.nama ||
        !this.phone ||
        !this.email ||
        !this.password ||
        !this.confirmPassword
      ) {
        Swal.fire({
          title: 'Error',
          text: 'Semua field harus diisi.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#DC2626',
        })
        return
      }

      if (this.password !== this.confirmPassword) {
        Swal.fire({
          title: 'Error',
          text: 'Password dan konfirmasi password tidak cocok.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#DC2626',
        })
        return
      }

      this.isLoading = true
      try {
        const response = await axios.post(`${this.baseUrl}/customer/auth/register`, {
          username: this.username,
          name: this.nama,
          no_telp: this.phone,
          email: this.email,
          password: this.password,
          password_confirmation: this.confirmPassword,
        })

        if (response.data.status === 'success') {
          Swal.fire({
            title: 'Berhasil Mendaftar',
            text: 'Pendaftaran berhasil! Silakan verifikasi email Anda.',
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
          }).then(() => {
            this.$router.push('/verification')
          })
        } else {
          Swal.fire({
            title: 'Error',
            text: response.data.message || 'Gagal mendaftar. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#DC2626',
          })
        }
      } catch (error) {
        console.error('Error registering:', error)
        const errorMessage =
          error.response?.data?.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#DC2626',
        })
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
