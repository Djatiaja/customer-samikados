<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <AuthHeader title="SAMIKADOS" subtitle="LOGIN" />

    <main
      class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center flex-grow"
    >
      <div class="w-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
        <figure>
          <img src="/images/Transparent.png" alt="Cart icon image" class="w-full max-w-md" />
        </figure>
      </div>

      <div class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">LOGIN</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="phone" class="sr-only">Email / Username / No. Telp</label>
            <input
              v-model="userInput"
              id="phone"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Email / Username / No. Telp"
              type="text"
              :disabled="loading"
            />
          </div>

          <div class="mb-4 relative">
            <label for="password" class="sr-only">Password</label>
            <input
              v-model="password"
              id="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Password"
              :disabled="loading"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              @click="togglePasswordVisibility"
              :disabled="loading"
            >
              <svg
                v-if="showPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                ></path>
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
            </button>
          </div>

          <div class="flex justify-between items-center mb-4">
            <label class="flex items-center text-gray-700 text-sm lg:text-base">
              <input v-model="rememberMe" type="checkbox" class="mr-2" :disabled="loading" /> Ingat
              Saya
            </label>
            <router-link
              to="/forgot-password"
              class="text-xs lg:text-sm text-red-600 hover:underline"
              >Lupa Password?</router-link
            >
          </div>

          <AuthMainButton text="Masuk" :disabled="loading" />

          <div class="text-center mb-4 text-gray-700">atau</div>
          <button
            class="w-full bg-white border border-gray-400 text-gray-700 py-3 rounded-lg flex items-center justify-center hover:bg-gray-50 transition duration-300 shadow-sm"
            type="button"
            @click="signInWithGoogle"
            :disabled="loading"
          >
            <img src="/images/google.png" alt="Google icon" class="mr-2" /> Sign In with Google
          </button>

          <div class="text-center mt-4">
            <span class="text-gray-700">Belum Punya Akun? </span>
            <router-link class="text-red-600 hover:underline" to="/register">Register</router-link>
          </div>
        </form>
      </div>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import AuthHeader from '@/components/AuthHeader.vue'
import AuthMainButton from '@/components/AuthMainButton.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  components: {
    AuthHeader,
    AuthMainButton,
    AuthFooter,
  },
  setup() {
    const router = useRouter()
    const userInput = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const loading = ref(false)
    const showPassword = ref(false)
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    console.log('Base URL:', baseUrl)
    if (!import.meta.env.VITE_API_BASE_URL) {
      console.warn('VITE_API_BASE_URL is not defined in .env file. Using fallback URL.')
    }

    const handleLogin = async () => {
      if (loading.value) return // Prevent double submission

      if (!userInput.value || !password.value) {
        Swal.fire({
          title: 'Error',
          text: 'Email/Username/No. Telp dan password harus diisi',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#DC2626',
        })
        return
      }

      try {
        loading.value = true
        const response = await axios.post(`${baseUrl}/auth/customer/login`, {
          loginParam: userInput.value,
          password: password.value,
          remember_me: rememberMe.value,
        })

        if (response.data.status === 'success' && response.data.data.token) {
          localStorage.setItem('token', response.data.data.token)
          Swal.fire({
            title: 'Berhasil Login',
            text: 'Anda berhasil masuk ke akun Anda',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500, // Auto-close after 1.5 seconds
          }).then(() => {
            router.push('/home')
          })
        } else {
          Swal.fire({
            title: 'Error',
            text: response.data.message || 'Gagal login. Periksa kredensial Anda.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#DC2626',
          })
        }
      } catch (error) {
        console.error('Error logging in:', error)
        if (error.response && error.response.status === 401) {
          Swal.fire({
            title: 'Error',
            text: 'Kredensial tidak valid. Silakan periksa email/username/no. telp dan password Anda.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#DC2626',
          })
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Terjadi kesalahan saat login. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#DC2626',
          })
        }
      } finally {
        loading.value = false
      }
    }

    const signInWithGoogle = async () => {
      if (loading.value) return // Prevent double submission

      try {
        loading.value = true
        window.location.href = `${baseUrl}/auth/google`
      } catch (error) {
        console.error('Error signing in with Google:', error)
        Swal.fire({
          title: 'Error',
          text: 'Gagal login dengan Google. Silakan coba lagi.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#DC2626',
        })
      } finally {
        loading.value = false
      }
    }

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    return {
      userInput,
      password,
      rememberMe,
      handleLogin,
      signInWithGoogle,
      loading,
      showPassword,
      togglePasswordVisibility,
    }
  },
}
</script>
