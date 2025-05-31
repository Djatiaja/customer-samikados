<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <h2>Ganti Password</h2>
      <div class="mb-3">
        <label class="block text-left mb-1">Password Lama</label>
        <input v-model="form.oldPassword" type="password" class="w-full p-2 border rounded" />
      </div>
      <div class="mb-3">
        <label class="block text-left mb-1">Password Baru</label>
        <input v-model="form.newPassword" type="password" class="w-full p-2 border rounded" />
      </div>
      <div class="mb-3">
        <label class="block text-left mb-1">Konfirmasi Password Baru</label>
        <input
          v-model="form.confirmNewPassword"
          type="password"
          class="w-full p-2 border rounded"
        />
      </div>
      <button @click="submit" class="submit-btn mr-2">Ganti Password</button>
      <button @click="$emit('close')" class="close-btn">Batal</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const form = ref({
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    })

    const submit = () => {
      if (!form.value.oldPassword || !form.value.newPassword || !form.value.confirmNewPassword) {
        alert('Semua field harus diisi')
        return
      }
      if (form.value.newPassword !== form.value.confirmNewPassword) {
        alert('Password baru dan konfirmasi password tidak sama')
        return
      }
      if (form.value.newPassword.length < 8) {
        alert('Password baru minimal 8 karakter')
        return
      }
      emit('change-password')
    }

    return { form, submit }
  },
}
</script>
