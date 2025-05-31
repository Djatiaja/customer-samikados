<template>
  <div
    class="w-full md:w-3/4 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
  >
    <h2 class="text-3xl mt-4 font-semibold mb-4 text-center">Profil Saya</h2>
    <div class="space-y-4 w-5/6">
      <div class="bg-gray-100 p-5 mb-6 rounded-lg">{{ user.username }}</div>
      <div class="bg-gray-100 p-5 mb-6 rounded-lg">{{ user.email }}</div>
      <div class="bg-gray-100 p-5 mb-6 rounded-lg">{{ formatPhoneNumber(user.no_telp) }}</div>

      <div
        v-for="(address, index) in user.addresses"
        :key="index"
        class="bg-gray-100 p-5 mb-2 rounded-lg flex justify-between items-center"
      >
        <div>
          {{ address.address }}
          <span
            v-if="address.is_default"
            class="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full"
            >Utama</span
          >
        </div>
        <div class="flex space-x-2">
          <button
            v-if="!address.is_default"
            @click="$emit('set-primary-address', index)"
            class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Set Utama
          </button>
          <button
            @click="$emit('edit-address', index)"
            class="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
          >
            Edit
          </button>
          <button
            v-if="user.addresses.length > 1"
            @click="$emit('confirm-delete-address', index)"
            class="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
          >
            Hapus
          </button>
        </div>
      </div>

      <button
        @click="$emit('open-add-address-modal')"
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
}
</script>
