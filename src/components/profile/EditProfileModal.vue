<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <h2>Edit Profil</h2>
      <div class="mb-3">
        <label class="block text-left mb-1">Nama</label>
        <input v-model="form.name" class="w-full p-2 border rounded" />
      </div>
      <div class="mb-3">
        <label class="block text-left mb-1">Username</label>
        <input v-model="form.username" class="w-full p-2 border rounded" />
      </div>
      <div class="mb-3">
        <label class="block text-left mb-1">Nomor Telepon</label>
        <input v-model="form.no_telp" class="w-full p-2 border rounded" type="tel" />
      </div>
      <div class="mb-3">
        <label class="block text-left mb-1">Email</label>
        <input v-model="form.email" class="w-full p-2 border rounded" type="email" />
      </div>
      <button @click="submit" class="submit-btn mr-2">Simpan</button>
      <button @click="$emit('close')" class="close-btn">Batal</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const form = ref({
      name: props.user.name,
      username: props.user.username,
      no_telp: props.user.no_telp,
      email: props.user.email,
    })

    const submit = () => {
      if (!form.value.name || !form.value.username || !form.value.no_telp || !form.value.email) {
        alert('Semua field harus diisi')
        return
      }
      if (!/^\d+$/.test(form.value.no_telp)) {
        alert('Nomor telepon harus berupa angka')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        alert('Format email tidak valid')
        return
      }
      emit('update-profile', { ...form.value })
    }

    return { form, submit }
  },
}
</script>
