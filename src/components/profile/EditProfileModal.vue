```vue
<template>
  <div></div>
</template>

<script>
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
import axios from 'axios'
import { debounce } from 'lodash'

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
    const base_url = import.meta.env.VITE_API_BASE_URL
    const form = ref({
      name: props.user.name,
      username: props.user.username,
      no_telp: props.user.no_telp,
      email: props.user.email,
    })
    const usernameAvailable = ref(null)
    const usernameMessage = ref('')

    const checkUsername = debounce(async (username) => {
      if (!username || username === props.user.username) {
        usernameAvailable.value = null
        usernameMessage.value = ''
        return
      }
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(
          `${base_url}/customer/profile/checkusername`,
          { username },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (response.data.status === 'success') {
          usernameAvailable.value = response.data.data.is_available
          usernameMessage.value = response.data.data.is_available
            ? 'Username tersedia'
            : 'Username sudah dipakai'
        } else {
          usernameAvailable.value = false
          usernameMessage.value = response.data.message || 'Gagal memeriksa username'
        }
      } catch (error) {
        usernameAvailable.value = false
        usernameMessage.value = 'Error memeriksa username'
        console.error('Check username error:', error)
      }
    }, 500)

    const showEditProfileModal = () => {
      try {
        Swal.fire({
          title: `<h3 class="text-lg font-bold">Edit Profil</h3>`,
          html: `
            <form id="editProfileForm" class="text-left form-compact">
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Nama</label>
                <input
                  id="name"
                  value="${form.value.name || ''}"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Username</label>
                <input
                  id="username"
                  value="${form.value.username || ''}"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
                <p id="usernameMessage" class="text-xs mt-1 ${
                  usernameAvailable.value === true
                    ? 'text-green-600'
                    : usernameAvailable.value === false
                      ? 'text-red-600'
                      : 'text-gray-600'
                }">${usernameMessage.value}</p>
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Nomor Telepon</label>
                <input
                  id="no_telp"
                  value="${form.value.no_telp || ''}"
                  type="tel"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Email</label>
                <input
                  id="email"
                  value="${form.value.email || ''}"
                  type="email"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>
            </form>
          `,
          showCancelButton: true,
          cancelButtonText: 'Batal',
          confirmButtonText: 'Simpan',
          focusConfirm: false,
          width: '600px',
          maxWidth: '700px',
          buttonsStyling: false,
          customClass: {
            container: 'swal-container',
            popup: 'swal-modal-popup rounded-lg',
            htmlContainer: 'pb-2 px-1',
            confirmButton:
              'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
            cancelButton:
              'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
            actions: 'flex justify-center space-x-6',
          },
          didOpen: () => {
            const modalContent = document.querySelector('.swal2-content')
            if (modalContent) {
              modalContent.style.maxHeight = '70vh'
              modalContent.style.overflowY = 'auto'
              modalContent.style.overflowX = 'hidden'
            }

            const styleElement = document.createElement('style')
            styleElement.textContent = `
              .swal2-content::-webkit-scrollbar {
                width: 6px;
              }
              .swal2-content::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
              }
              .swal2-content::-webkit-scrollbar-thumb {
                background: #dc2626;
                border-radius: 10px;
              }
              .swal2-content::-webkit-scrollbar-thumb:hover {
                background: #b91c1c;
              }
              .form-compact input,
              .form-compact select,
              .form-compact textarea {
                font-size: 0.875rem;
                padding: 0.5rem;
              }
              .form-compact label {
                font-size: 0.75rem;
                margin-bottom: 0.25rem;
              }
            `
            document.head.appendChild(styleElement)

            document.getElementById('name').addEventListener('input', (e) => {
              form.value.name = e.target.value
            })

            document.getElementById('username').addEventListener('input', (e) => {
              form.value.username = e.target.value
              checkUsername(e.target.value)
            })

            document.getElementById('no_telp').addEventListener('input', (e) => {
              form.value.no_telp = e.target.value
            })

            document.getElementById('email').addEventListener('input', (e) => {
              form.value.email = e.target.value
            })
          },
          preConfirm: () => {
            const name = document.getElementById('name').value
            const username = document.getElementById('username').value
            const no_telp = document.getElementById('no_telp').value
            const email = document.getElementById('email').value

            if (!name || !username || !no_telp || !email) {
              Swal.showValidationMessage('Semua field harus diisi')
              return false
            }
            if (!/^[a-zA-Z0-9\s]{3,}$/.test(name)) {
              Swal.showValidationMessage('Nama minimal 3 karakter, hanya huruf, angka, dan spasi')
              return false
            }
            if (usernameAvailable.value === false) {
              Swal.showValidationMessage('Username sudah dipakai, pilih yang lain')
              return false
            }
            if (!/^\d{10,13}$/.test(no_telp)) {
              Swal.showValidationMessage('Nomor telepon harus 10-13 digit angka')
              return false
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              Swal.showValidationMessage('Format email tidak valid')
              return false
            }

            return { name, username, no_telp, email }
          },
        })
          .then((result) => {
            if (result.isConfirmed && result.value) {
              emit('update-profile', result.value)
              emit('close')
            } else if (result.isDismissed) {
              emit('close')
            }
          })
          .catch((error) => {
            console.error('Error showing modal:', error)
          })
      } catch (error) {
        console.error('Error in modal:', error)
      }
    }

    watch(
      () => props.visible,
      (newVisible) => {
        if (newVisible) {
          form.value = {
            name: props.user.name,
            username: props.user.username,
            no_telp: props.user.no_telp,
            email: props.user.email,
          }
          usernameAvailable.value = null
          usernameMessage.value = ''
          showEditProfileModal()
        }
      },
      { immediate: true },
    )

    return { form, showEditProfileModal, usernameAvailable, usernameMessage }
  },
}
</script>
```
