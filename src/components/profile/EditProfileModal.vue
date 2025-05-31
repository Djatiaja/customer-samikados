<template>
  <div></div>
</template>

<script>
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'

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
            if (!/^\d+$/.test(no_telp)) {
              Swal.showValidationMessage('Nomor telepon harus berupa angka')
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
            // Silent catch, biar ga error
          })
      } catch (error) {
        // Silent catch, biar ga error
      }
    }

    watch(
      () => props.visible,
      (newVisible) => {
        if (newVisible) {
          showEditProfileModal()
        }
      },
      { immediate: true },
    )

    return { form, showEditProfileModal }
  },
}
</script>
