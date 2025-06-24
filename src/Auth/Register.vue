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
              :class="{ 'border-red-600': errors.username }"
              placeholder="Username"
              type="text"
              :disabled="isLoading"
            />
            <p v-if="errors.username" class="text-red-600 text-sm mt-1">{{ errors.username }}</p>
          </div>

          <!-- Nama -->
          <div class="mb-4">
            <label for="nama" class="sr-only">Nama</label>
            <input
              id="nama"
              v-model="nama"
              class="w-full max-w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              :class="{ 'border-red-600': errors.nama }"
              placeholder="Nama Lengkap"
              type="text"
              :disabled="isLoading"
            />
            <p v-if="errors.nama" class="text-red-600 text-sm mt-1">{{ errors.nama }}</p>
          </div>

          <!-- Phone Number -->
          <div class="mb-4">
            <label for="phone" class="sr-only">No. Telp</label>
            <input
              id="phone"
              v-model="phone"
              class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              :class="{ 'border-red-600': errors.phone }"
              placeholder="No. Telp"
              type="text"
              :disabled="isLoading"
            />
            <p v-if="errors.phone" class="text-red-600 text-sm mt-1">{{ errors.phone }}</p>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              :class="{ 'border-red-600': errors.email }"
              placeholder="Email"
              type="email"
              :disabled="isLoading"
            />
            <p v-if="errors.email" class="text-red-600 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div class="mb-4 relative">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10"
              :class="{ 'border-red-600': errors.password }"
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
            <p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password }}</p>
          </div>

          <!-- Konfirmasi Password -->
          <div class="mb-4 relative">
            <label for="confirmPassword" class="sr-only">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10"
              :class="{ 'border-red-600': errors.confirmPassword }"
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
            <p v-if="errors.confirmPassword" class="text-red-600 text-sm mt-1">
              {{ errors.confirmPassword }}
            </p>
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
      errors: {
        username: '',
        nama: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      baseUrl: import.meta.env.VITE_API_BASE_URL,
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
    validateForm() {
      this.errors = {
        username: '',
        nama: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
      }
      let isValid = true

      // Username validation
      if (!this.username) {
        this.errors.username = 'Username harus diisi.'
        isValid = false
      } else if (this.username.length > 255) {
        this.errors.username = 'Username tidak boleh lebih dari 255 karakter.'
        isValid = false
      }

      // Name validation
      if (!this.nama) {
        this.errors.nama = 'Nama harus diisi.'
        isValid = false
      } else if (this.nama.length > 255) {
        this.errors.nama = 'Nama tidak boleh lebih dari 255 karakter.'
        isValid = false
      }

      // Phone validation
      if (!this.phone) {
        this.errors.phone = 'Nomor telepon harus diisi.'
        isValid = false
      } else if (!/^\d+$/.test(this.phone)) {
        this.errors.phone = 'Nomor telepon harus berupa angka.'
        isValid = false
      } else if (this.phone.length < 10 || this.phone.length > 15) {
        this.errors.phone = 'Nomor telepon harus antara 10-15 digit.'
        isValid = false
      }

      // Email validation
      if (!this.email) {
        this.errors.email = 'Email harus diisi.'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        this.errors.email = 'Format email tidak valid.'
        isValid = false
      } else if (this.email.length > 255) {
        this.errors.email = 'Email tidak boleh lebih dari 255 karakter.'
        isValid = false
      }

      // Password validation
      if (!this.password) {
        this.errors.password = 'Password harus diisi.'
        isValid = false
      } else if (this.password.length < 8) {
        this.errors.password = 'Password minimal 8 karakter.'
        isValid = false
      }

      // Confirm Password validation
      if (!this.confirmPassword) {
        this.errors.confirmPassword = 'Konfirmasi password harus diisi.'
        isValid = false
      } else if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = 'Password dan konfirmasi password tidak cocok.'
        isValid = false
      }

      return isValid
    },
    async register() {
      if (this.isLoading) return // Prevent double submission

      // Reset errors
      this.errors = {
        username: '',
        nama: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
      }

      // Client-side validation
      if (!this.validateForm()) {
        Swal.fire({
          title: 'Error',
          text: 'Harap periksa kembali input Anda.',
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
        let errorMessage = 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'

        if (error.response?.data?.errors) {
          const backendErrors = error.response.data.errors
          // Map backend errors to form fields
          if (backendErrors.username) {
            this.errors.username = backendErrors.username[0]
          }
          if (backendErrors.name) {
            this.errors.nama = backendErrors.name[0]
          }
          if (backendErrors.no_telp) {
            this.errors.phone = backendErrors.no_telp[0]
          }
          if (backendErrors.email) {
            this.errors.email = backendErrors.email[0]
          }
          if (backendErrors.password) {
            this.errors.password = backendErrors.password[0]
          }
          if (backendErrors.password_confirmation) {
            this.errors.confirmPassword = backendErrors.password_confirmation[0]
          }

          // Get the first error message for the Swal alert
          errorMessage = Object.values(backendErrors)[0][0] || errorMessage
        }

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
