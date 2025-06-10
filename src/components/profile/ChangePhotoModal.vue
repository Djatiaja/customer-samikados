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
    const previewUrl = ref('')

    const showChangePhotoModal = () => {
      try {
        Swal.fire({
          title: `<h3 class="text-lg font-bold">Ganti Foto Profil</h3>`,
          html: `
            <div class="text-left form-compact">
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Pilih Foto</label>
                <input
                  id="newProfilePhoto"
                  type="file"
                  accept="image/*"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>
              <div id="previewContainer" class="mb-4 flex justify-center" style="display: none;">
                <img id="previewImage" src="" alt="Profile preview" class="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
              </div>
            </div>
          `,
          showCancelButton: true,
          cancelButtonText: 'Batal',
          confirmButtonText: 'Ganti Foto',
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

            const fileInput = document.getElementById('newProfilePhoto')
            const previewContainer = document.getElementById('previewContainer')
            const previewImage = document.getElementById('previewImage')

            fileInput.addEventListener('change', (event) => {
              const file = event.target.files[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  previewUrl.value = e.target.result
                  previewImage.src = e.target.result
                  previewContainer.style.display = 'flex'
                }
                reader.readAsDataURL(file)
              } else {
                previewUrl.value = ''
                previewContainer.style.display = 'none'
              }
            })
          },
          preConfirm: () => {
            const fileInput = document.getElementById('newProfilePhoto')
            if (!fileInput?.files?.length) {
              Swal.showValidationMessage('Silakan pilih foto terlebih dahulu')
              return false
            }
            return fileInput.files[0]
          },
        })
          .then((result) => {
            if (result.isConfirmed && result.value) {
              emit('change-photo', result.value)
              previewUrl.value = ''
            }
            emit('close')
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
          showChangePhotoModal()
        }
      },
      { immediate: true },
    )

    return { previewUrl, showChangePhotoModal }
  },
}
</script>
