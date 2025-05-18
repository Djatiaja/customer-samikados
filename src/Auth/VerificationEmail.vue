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
          <img src="/images/Transparent.png" alt="Verification Image" class="w-full max-w-md" />
        </figure>
      </section>

      <!-- Verification Section -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">Verifikasi Email</h2>
        <p class="mb-4 text-sm text-gray-600">Silakan cek email Anda dan klik tautan verifikasi.</p>
        <p v-if="message" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'" class="mb-4 text-sm">
          {{ message }}
        </p>

        <!-- Resend Email Button -->
        <form @submit.prevent="resendVerificationEmail">
          <button
            class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg mb-4 transition duration-300 shadow-lg"
            type="submit"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Mengirim...' : 'Kirim Ulang Email' }}
          </button>
        </form>

        <!-- Info Section -->
        <p class="text-xs text-gray-500 text-center">
          Tidak menerima email? Kami bisa mengirim ulang.
        </p>

        <!-- Logout Option -->
        <div class="text-center mt-4">
          <span class="text-gray-700 text-sm">Sudah Verifikasi? </span>
          <router-link class="text-red-600 hover:underline text-sm" to="/login">Log in</router-link>
        </div>
      </section>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import AuthHeader from '@/components/AuthHeader.vue';
import AuthFooter from '@/components/AuthFooter.vue';
import axios from 'axios';

export default {
  components: {
    AuthHeader,
    AuthFooter,
  },
  data() {
    return {
      isLoading: false,
      message: '',
      messageType: '',
    };
  },
  methods: {
    async verifyEmail() {
      this.isLoading = true;
      this.message = '';
      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');
      const hash = url.searchParams.get('hash');

      if (!id || !hash) {
        this.message = 'Parameter verifikasi tidak valid. Silakan cek tautan Anda.';
        this.messageType = 'error';
        this.isLoading = false;
        return;
      }

      try {
        const response = await axios.post(`http://127.0.0.1:8000/api/customer/auth/verify-email`, {
          id,
          hash,
        });
        this.message = 'Email berhasil diverifikasi! Anda akan diarahkan ke halaman login.';
        this.messageType = 'success';
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (error) {
        this.message = 'Gagal memverifikasi email. Silakan coba lagi atau kirim ulang email verifikasi.';
        this.messageType = 'error';
        console.error('Error verifying email:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async resendVerificationEmail() {
      this.isLoading = true;
      this.message = '';
      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');

      if (!id) {
        this.message = 'ID tidak ditemukan. Silakan cek tautan Anda.';
        this.messageType = 'error';
        this.isLoading = false;
        return;
      }

      try {
        const response = await axios.post(`http://127.0.0.1:8000/api/customer/auth/resend-email`, {
          id,
        });
        this.message = 'Email verifikasi telah dikirim ulang. Silakan cek kotak masuk Anda.';
        this.messageType = 'success';
      } catch (error) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage === 'Email already verified') {
          this.message = 'Email sudah diverifikasi. Silakan login.';
          this.messageType = 'success';
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        } else {
          this.message = 'Gagal mengirim ulang email verifikasi. Silakan coba lagi.';
          this.messageType = 'error';
        }
        console.error('Error resending verification email:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    // Trigger verification on component mount if id and hash are present
    const url = new URL(window.location.href);
    if (url.searchParams.get('id') && url.searchParams.get('hash')) {
      this.verifyEmail();
    }
  },
};
</script>
