<template>
  <div
    class="w-full md:w-3/4 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
  >
    <h2 class="text-3xl mt-4 font-semibold mb-4 text-center">Profil Saya</h2>
    <div class="space-y-4 w-5/6">
      <div class="bg-gray-100 p-5 mb-6 rounded-lg">{{ user.username }}</div>
      <div class="bg-gray-100 p-5 mb-6 rounded-lg">{{ user.email }}</div>
      <div class="bg-gray-100 p-5 mb-6 rounded-lg">{{ formatPhoneNumber(user.no_telp) }}</div>

      <!-- Tampilin alamat default atau alamat pertama -->
      <div
        v-if="defaultAddress"
        class="bg-gray-100 p-5 mb-2 rounded-lg flex justify-between items-center"
      >
        <div>
          <span class="font-semibold">{{ defaultAddress.label }}</span
          >: {{ defaultAddress.address }}
          <span
            v-if="defaultAddress.is_default"
            class="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full"
            >Utama</span
          >
        </div>
        <div class="flex space-x-2">
          <button
            @click="handleEditAddress(defaultAddress)"
            class="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
          >
            Edit
          </button>
          <button
            v-if="user.addresses.length > 1"
            @click="handleDeleteAddress(defaultAddress)"
            class="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
          >
            Hapus
          </button>
        </div>
      </div>
      <div v-else class="bg-gray-100 p-5 mb-2 rounded-lg text-center text-gray-500">
        Belum ada alamat
      </div>

      <!-- Tombol Lihat Alamat Lain -->
      <button
        v-if="user.addresses.length > 1"
        @click="$emit('open-address-list-modal')"
        class="w-full bg-gray-200 hover:bg-gray-300 p-3 rounded-lg flex items-center justify-center"
      >
        <span class="mr-2">Lihat Alamat Lain</span>
      </button>

      <!-- Tombol Tambah Alamat Baru -->
      <button
        @click="openAddAddressModal"
        class="w-full bg-gray-200 hover:bg-gray-300 p-3 rounded-lg flex items-center justify-center"
      >
        <span class="mr-2">+ Tambah Alamat Baru</span>
      </button>
    </div>
    <button
      class="mt-10 w-full md:w-96 bg-red-600 text-white py-3 rounded-lg mb-4"
      @click="$emit('open-edit-profile-modal')"
    >
      Edit Profil
    </button>
  </div>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    formatPhoneNumber: {
      type: Function,
      required: true,
    },
  },
  computed: {
    defaultAddress() {
      // Cari alamat dengan is_default: true, kalau nggak ada, ambil alamat pertama
      return (
        this.user.addresses.find((address) => address.is_default) || this.user.addresses[0] || null
      )
    },
    defaultAddressIndex() {
      // Index untuk alamat default atau alamat pertama
      const defaultIndex = this.user.addresses.findIndex((address) => address.is_default)
      return defaultIndex !== -1 ? defaultIndex : 0
    },
  },
  methods: {
    openAddAddressModal() {
      console.log('Ngeklik tombol Tambah Alamat Baru, emit open-add-address-modal')
      this.$emit('open-add-address-modal')
    },
    handleEditAddress(address) {
      console.log('Emitting edit-address:', address)
      this.$emit('edit-address', address)
    },
    handleDeleteAddress(address) {
      console.log('Emitting confirm-delete-address:', {
        id: address.id,
        index: this.defaultAddressIndex,
        remainingAddresses: this.user.addresses.length,
      })
      this.$emit('confirm-delete-address', { id: address.id, index: this.defaultAddressIndex })
    },
  },
}
</script>
