<template>
  <div></div>
</template>

<script>
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
import axios from 'axios'

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
    const addresses = ref(props.user?.addresses || [])
    const isLoading = ref(false)
    const base_url = import.meta.env.VITE_API_BASE_URL

    const fetchAddresses = async () => {
      try {
        isLoading.value = true
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')

        const response = await axios.get(`${base_url}/customer/address`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.data.status === 'success') {
          addresses.value = response.data.data
          emit('update-addresses', response.data.data) // Emit ke parent
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
        if (error.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Sesi Berakhir',
            text: 'Silakan login kembali',
            confirmButtonColor: '#dc2626',
          }).then(() => {
            emit('logout')
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal memuat daftar alamat',
            confirmButtonColor: '#dc2626',
          })
        }
      } finally {
        isLoading.value = false
      }
    }

    const setDefaultAddress = async (addressId) => {
      try {
        const addressToUpdate = addresses.value.find((addr) => addr.id === addressId)
        if (!addressToUpdate) {
          throw new Error('Address not found')
        }

        const formData = new FormData()
        formData.append('is_default', '1')
        formData.append('label', addressToUpdate.label || '')
        formData.append('address', addressToUpdate.address || '')
        formData.append('phone', addressToUpdate.phone || '')
        formData.append('detail', addressToUpdate.detail || '')
        formData.append('zip_code', addressToUpdate.zip_code || '')

        const token = localStorage.getItem('token') || sessionStorage.getItem('token')

        const response = await axios.post(`${base_url}/customer/address/${addressId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.status === 'success') {
          await fetchAddresses()
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Alamat utama berhasil diubah',
            timer: 1500,
            showConfirmButton: false,
          })
        }
      } catch (error) {
        console.error('Error setting default address:', error)
        if (error.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Sesi Berakhir',
            text: 'Silakan login kembali',
            confirmButtonColor: '#dc2626',
          }).then(() => {
            emit('logout')
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Gagal mengubah alamat utama',
            confirmButtonColor: '#dc2626',
          })
        }
      }
    }

    const renderAddresses = () => {
      if (isLoading.value) {
        return `<div class="bg-gray-100 p-4 rounded-lg text-center text-gray-500">Memuat alamat...</div>`
      }

      return addresses.value.length > 0
        ? addresses.value
            .map(
              (address, index) => `
              <div class="bg-gray-100 p-4 mb-2 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div class="mb-2 sm:mb-0 flex-1 mr-4">
                  <div class="font-semibold">${address.label || 'Label Tidak Ada'}</div>
                  ${address.detail ? `<div class="text-sm text-gray-600 mt-1">${address.detail}</div>` : ''}
                </div>
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
                  ${
                    address.is_default === 1
                      ? `<span class="bg-red-600 text-white text-xs px-3 py-1.5 rounded-full text-center min-w-[80px]">Utama</span>`
                      : `<button
                          data-id="${address.id}"
                          class="set-primary-btn text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded min-w-[80px]"
                        >
                          Set Utama
                        </button>`
                  }
                  <button
                    data-id="${address.id}"
                    data-index="${index}"
                    class="edit-btn text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded min-w-[80px]"
                  >
                    Edit
                  </button>
                  ${
                    addresses.value.length > 1
                      ? `<button
                          data-id="${address.id}"
                          data-index="${index}"
                          class="delete-btn text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded min-w-[80px]"
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

    const attachEventListeners = () => {
      document.querySelectorAll('.set-primary-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const addressId = Number(btn.getAttribute('data-id'))
          console.log('Clicked set-primary-btn:', { addressId }) // Debug
          await setDefaultAddress(addressId)
        })
      })

      document.querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const addressId = btn.getAttribute('data-id')
          const address = addresses.value.find((addr) => addr.id === Number(addressId))
          console.log('Emitting edit-address:', address) // Debug
          emit('edit-address', address)
          Swal.close()
        })
      })

      document.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const addressId = btn.getAttribute('data-id')
          const index = Number(btn.getAttribute('data-index'))
          console.log('Emitting confirm-delete-address:', { id: addressId, index }) // Debug
          emit('confirm-delete-address', { id: addressId, index })
        })
      })
    }

    const updateModalContent = () => {
      Swal.update({
        html: `
          <div class="text-left form-compact">
            ${renderAddresses()}
          </div>
        `,
      })
      attachEventListeners()
    }

    const showAddressListModal = async () => {
      try {
        await fetchAddresses()

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

            attachEventListeners()
          },
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            emit('close')
          }
        })
      } catch (error) {
        console.error('Error showing address list modal:', error)
      }
    }

    watch(
      () => props.visible,
      (newVisible) => {
        if (newVisible) {
          showAddressListModal()
        }
      },
      { immediate: true },
    )

    return {
      showAddressListModal,
      fetchAddresses,
      addresses,
    }
  },
}
</script>
