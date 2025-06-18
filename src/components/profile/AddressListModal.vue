```vue
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
    user: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const addresses = ref(props.user.addresses)

    const renderAddresses = () => {
      return props.user.addresses.length > 0
        ? props.user.addresses
            .map(
              (address, index) => `
              <div class="bg-gray-100 p-4 mb-2 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div class="mb-2 sm:mb-0">
                  <div class="inline-flex items-center">
                    <span class="font-semibold">${address.name || 'Nama Tidak Ada'}</span>
                    ${
                      address.is_default
                        ? `<span class="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">Utama</span>`
                        : ''
                    }
                  </div><br>
                  ${address.address || 'Detail Alamat Tidak Ada'}<br>
                  ${address.subdistrict?.city?.province?.name || ''},
                  ${address.subdistrict?.city?.name || ''},
                  ${address.subdistrict?.name || ''},
                  ${address.postal_code || ''}
                </div>
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
                  ${
                    !address.is_default
                      ? `<button
                          data-index="${index}"
                          class="set-primary-btn text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded min-w-[80px] max-w-xs"
                        >
                          Set Utama
                        </button>`
                      : ''
                  }
                  <button
                    data-index="${index}"
                    class="edit-btn text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded min-w-[80px] max-w-xs"
                  >
                    Edit
                  </button>
                  ${
                    props.user.addresses.length > 1
                      ? `<button
                          data-index="${index}"
                          class="delete-btn text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded min-w-[80px] max-w-xs"
                        >
                          Hapus
                        </button>`
                      : ''
                  }
                </div>
              </div>
            `,
            )
            .join('')
        : `<div class="bg-gray-100 p-4 rounded-lg text-center text-gray-500">Belum ada alamat</div>`
    }

    const showAddressListModal = () => {
      try {
        Swal.fire({
          title: `<h3 class="text-lg font-bold">Daftar Alamat</h3>`,
          html: `
            <div class="text-left form-compact">
              ${renderAddresses()}
            </div>
          `,
          showCancelButton: false,
          confirmButtonText: 'Tutup',
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
            actions: 'flex justify-center',
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
              .form-compact {
                font-size: 0.875rem;
              }
            `
            document.head.appendChild(styleElement)

            document.querySelectorAll('.set-primary-btn').forEach((btn) => {
              btn.addEventListener('click', () => {
                const index = Number(btn.getAttribute('data-index'))
                emit('set-primary-address', index)
                Swal.close()
              })
            })

            document.querySelectorAll('.edit-btn').forEach((btn) => {
              btn.addEventListener('click', () => {
                const index = Number(btn.getAttribute('data-index'))
                emit('edit-address', index)
                Swal.close()
              })
            })

            document.querySelectorAll('.delete-btn').forEach((btn) => {
              btn.addEventListener('click', () => {
                const index = Number(btn.getAttribute('data-index'))
                emit('confirm-delete-address', index)
                Swal.update({
                  html: `
                    <div class="text-left form-compact">
                      ${renderAddresses()}
                    </div>
                  `,
                })
                // Re-attach event listeners after update
                document.querySelectorAll('.set-primary-btn').forEach((btn) => {
                  btn.addEventListener('click', () => {
                    const index = Number(btn.getAttribute('data-index'))
                    emit('set-primary-address', index)
                    Swal.close()
                  })
                })
                document.querySelectorAll('.edit-btn').forEach((btn) => {
                  btn.addEventListener('click', () => {
                    const index = Number(btn.getAttribute('data-index'))
                    emit('edit-address', index)
                    Swal.close()
                  })
                })
                document.querySelectorAll('.delete-btn').forEach((btn) => {
                  btn.addEventListener('click', () => {
                    const index = Number(btn.getAttribute('data-index'))
                    emit('confirm-delete-address', index)
                    Swal.update({
                      html: `
                        <div class="text-left form-compact">
                          ${renderAddresses()}
                        </div>
                      `,
                    })
                  })
                })
              })
            })
          },
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            emit('close')
          }
        })
      } catch (error) {
        // Silent catch
      }
    }

    watch(
      () => props.visible,
      (newVisible) => {
        if (newVisible) {
          addresses.value = props.user.addresses
          showAddressListModal()
        }
      },
      { immediate: true },
    )

    watch(
      () => props.user.addresses,
      (newAddresses) => {
        addresses.value = newAddresses
      },
    )

    return { showAddressListModal }
  },
}
</script>
```
