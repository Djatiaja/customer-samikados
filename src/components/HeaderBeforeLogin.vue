<template>
  <header class="bg-gradient-to-r from-red-600 to-black text-white p-2 sm:p-4 sticky top-0 z-20">
    <div
      class="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4"
    >
      <!-- Teks SAMIKADOS di kiri -->
      <h1 class="text-sm sm:text-lg lg:text-2xl font-bold">SAMIKADOS</h1>

      <!-- Search Bar di tengah -->
      <div v-if="showSearch" class="w-full sm:w-1/2 lg:w-1/3 mx-auto">
        <div class="relative">
          <input
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pl-8 pr-4 py-1 sm:py-2 text-xs sm:text-sm lg:text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-white bg-white text-black"
          />
          <img
            src="/icons/search.svg"
            alt="Search Icon"
            class="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5"
          />
        </div>
      </div>

      <!-- Teks LOGIN | REGISTER di kanan -->
      <div class="flex space-x-2 sm:space-x-4">
        <button
          @click="goToLogin"
          class="text-xs sm:text-sm lg:text-lg hover:underline cursor-pointer"
        >
          LOGIN
        </button>
        <span class="hidden sm:inline">|</span>
        <button
          @click="goToRegister"
          class="text-xs sm:text-sm lg:text-lg hover:underline cursor-pointer"
        >
          REGISTER
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...',
    },
    searchQuery: {
      type: String,
      default: '',
    },
  },
  setup() {
    const router = useRouter()

    const goToLogin = () => {
      // Clear any existing invalid token first
      const token = localStorage.getItem('token')
      console.log('Current token before login:', token)

      // If token exists but user clicking login, likely token is invalid
      if (token) {
        localStorage.removeItem('token')
        console.log('Removed invalid token')
      }

      router.push('/login')
    }

    const goToRegister = () => {
      // Clear any existing invalid token first
      const token = localStorage.getItem('token')
      if (token) {
        localStorage.removeItem('token')
      }

      router.push('/register')
    }

    return {
      goToLogin,
      goToRegister,
    }
  },
}
</script>
