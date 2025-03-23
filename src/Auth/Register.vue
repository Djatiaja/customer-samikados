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
            />
          </div>

          <!-- Nama -->
          <div class="mb-4">
            <label for="nama" class="sr-only">Nama</label>
            <input
              id="nama"
              v-model="nama"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Nama Lengkap"
              type="text"
            />
          </div>

          <!-- Phone Number -->
          <div class="mb-4">
            <label for="phone" class="sr-only">No. Telp</label>
            <input
              id="phone"
              v-model="phone"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="No. Telp"
              type="text"
            />
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Email"
              type="email"
            />
          </div>

          <!-- Password -->
          <div class="mb-4">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Password"
              type="password"
            />
          </div>

          <!-- Konfirmasi Password -->
          <div class="mb-4">
            <label for="confirmPassword" class="sr-only">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Konfirmasi Password"
              type="password"
            />
          </div>

          <!-- Register Button -->
          <AuthMainButton text="Register" @click="register" />

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
    }
  },
  methods: {
    register() {
      if (this.password !== this.confirmPassword) {
        alert('Password dan konfirmasi password tidak cocok!')
        return
      }
      console.log(
        'Registering user with:',
        this.username,
        this.nama,
        this.phone,
        this.email,
        this.password,
      )
      this.$router.push('/verification')
    },
  },
}
</script>
