<template>
  <div></div>
</template>

<script>
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'

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

    const showOldPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    const showChangePasswordModal = () => {
      try {
        Swal.fire({
          title: `<h3 class="text-lg font-bold">Ganti Password</h3>`,
          html: `
            <form id="changePasswordForm" class="text-left form-compact">
              <div class="mb-4 relative">
                <label class="block text-gray-700 font-medium text-sm mb-1">Password Lama</label>
                <input
                  id="oldPassword"
                  type="${showOldPassword.value ? 'text' : 'password'}"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all pr-8"
                />
                <button
                  id="toggleOldPassword"
                  type="button"
                  class="absolute right-2 top-[70%] transform -translate-y-1/2 text-gray-500"
                >
                  ${
                    showOldPassword.value
                      ? `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>`
                      : `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>`
                  }
                </button>
              </div>
              <div class="mb-4 relative">
                <label class="block text-gray-700 font-medium text-sm mb-1">Password Baru</label>
                <input
                  id="newPassword"
                  type="${showNewPassword.value ? 'text' : 'password'}"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all pr-8"
                />
                <button
                  id="toggleNewPassword"
                  type="button"
                  class="absolute right-2 top-[70%] transform -translate-y-1/2 text-gray-500"
                >
                  ${
                    showNewPassword.value
                      ? `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>`
                      : `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>`
                  }
                </button>
              </div>
              <div class="mb-4 relative">
                <label class="block text-gray-700 font-medium text-sm mb-1">Konfirmasi Password Baru</label>
                <input
                  id="confirmNewPassword"
                  type="${showConfirmPassword.value ? 'text' : 'password'}"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all pr-8"
                />
                <button
                  id="toggleConfirmPassword"
                  type="button"
                  class="absolute right-2 top-[70%] transform -translate-y-1/2 text-gray-500"
                >
                  ${
                    showConfirmPassword.value
                      ? `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>`
                      : `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>`
                  }
                </button>
              </div>
            </form>
          `,
          showCancelButton: true,
          cancelButtonText: 'Batal',
          confirmButtonText: 'Ganti Password',
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

            const togglePasswordVisibility = (inputId, toggleId, showRef) => {
              const input = document.getElementById(inputId)
              const toggle = document.getElementById(toggleId)
              toggle.addEventListener('click', () => {
                showRef.value = !showRef.value
                const type = showRef.value ? 'text' : 'password'
                input.setAttribute('type', type)
                toggle.innerHTML = showRef.value
                  ? `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>`
                  : `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>`
              })
            }

            togglePasswordVisibility('oldPassword', 'toggleOldPassword', showOldPassword)
            togglePasswordVisibility('newPassword', 'toggleNewPassword', showNewPassword)
            togglePasswordVisibility(
              'confirmNewPassword',
              'toggleConfirmPassword',
              showConfirmPassword,
            )

            document.getElementById('oldPassword').addEventListener('input', (e) => {
              form.value.oldPassword = e.target.value
            })

            document.getElementById('newPassword').addEventListener('input', (e) => {
              form.value.newPassword = e.target.value
            })

            document.getElementById('confirmNewPassword').addEventListener('input', (e) => {
              form.value.confirmNewPassword = e.target.value
            })
          },
          preConfirm: () => {
            const oldPassword = document.getElementById('oldPassword').value
            const newPassword = document.getElementById('newPassword').value
            const confirmNewPassword = document.getElementById('confirmNewPassword').value

            if (!oldPassword || !newPassword || !confirmNewPassword) {
              Swal.showValidationMessage('Semua field harus diisi')
              return false
            }
            if (newPassword !== confirmNewPassword) {
              Swal.showValidationMessage('Password baru dan konfirmasi password tidak sama')
              return false
            }
            if (newPassword.length < 8) {
              Swal.showValidationMessage('Password baru minimal 8 karakter')
              return false
            }

            return { oldPassword, newPassword }
          },
        })
          .then((result) => {
            if (result.isConfirmed && result.value) {
              emit('change-password', result.value)
              // Reset form setelah sukses akan dilakukan di parent component
            } else {
              emit('close')
            }
          })
          .catch((error) => {
            // Silent catch
          })
      } catch (error) {
        // Silent catch
      }
    }

    watch(
      () => props.visible,
      (newVisible) => {
        if (newVisible) {
          showChangePasswordModal()
        }
      },
      { immediate: true },
    )

    return { form, showChangePasswordModal, showOldPassword, showNewPassword, showConfirmPassword }
  },
}
</script>
