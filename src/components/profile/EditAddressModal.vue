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
    index: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const base_url = import.meta.env.VITE_API_BASE_URL
    const form = ref({
      id: props.user.addresses[props.index]?.id || null,
      label: props.user.addresses[props.index]?.label || '',
      address: props.user.addresses[props.index]?.address || '',
      phone: props.user.addresses[props.index]?.phone || '',
      is_default: props.user.addresses[props.index]?.is_default || false,
    })
    const locationSearch = ref(props.user.addresses[props.index]?.label || '')
    const locations = ref([])
    const selectedLocation = ref(null)
    const showLocationDropdown = ref(false)
    const isLoadingLocation = ref(false)
    const locationError = ref('')

    const searchLocation = async () => {
      if (!locationSearch.value.trim()) {
        locationError.value = 'Masukkan kata kunci pencarian'
        return
      }

      isLoadingLocation.value = true
      locationError.value = ''

      try {
        const response = await axios.get(
          `${base_url}/rajaongkir/search/${locationSearch.value.trim()}`,
        )

        if (response.data.status === 'success' && response.data.data.data) {
          locations.value = response.data.data.data
          showLocationDropdown.value = true
        } else {
          locations.value = []
          locationError.value = 'Tidak ada hasil pencarian'
        }
      } catch (error) {
        locationError.value = 'Gagal mencari alamat. Silakan coba lagi.'
        locations.value = []
        console.error('Location search error:', error)
      } finally {
        isLoadingLocation.value = false
      }
    }

    const selectLocation = (location) => {
      selectedLocation.value = location
      form.value.label = location.label
      showLocationDropdown.value = false
      locationError.value = ''
    }

    const formatLocationDisplay = (location) => {
      return `${location.subdistrict_name}, ${location.district_name}, ${location.city_name}, ${location.zip_code}`
    }

    const showEditAddressModal = () => {
      Swal.fire({
        title: `<h3 class="text-lg font-bold">Edit Alamat</h3>`,
        html: `
          <form id="editAddressForm" class="text-left form-compact">
            <div class="mb-4 relative">
              <label class="block text-gray-700 font-medium text-sm mb-1">Pilih Alamat</label>
              <div class="flex">
                <input
                  id="locationSearchInput"
                  class="flex-1 p-3 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Cari alamat (contoh: sleman)"
                  type="text"
                  value="${locationSearch.value}"
                />
                <button
                  type="button"
                  id="searchButton"
                  class="bg-red-600 text-white px-4 py-3 rounded-r-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <i id="searchIcon" class="fas fa-search"></i>
                </button>
              </div>

              <div
                id="selectedLocationDiv"
                class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                style="display: ${selectedLocation.value ? 'block' : 'none'}"
              >
                <div class="flex items-center text-green-700">
                  <i class="fas fa-check-circle mr-2"></i>
                  <span class="font-medium">Alamat dipilih:</span>
                </div>
                <div class="text-green-600 mt-1" id="selectedLocationText">
                  ${selectedLocation.value ? formatLocationDisplay(selectedLocation.value) : ''}
                </div>
              </div>

              <small id="locationError" class="text-red-500" style="display: none;"></small>

              <div
                id="locationDropdown"
                class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-64 overflow-y-auto"
                style="display: none;"
              >
                <div id="locationResults"></div>
                <div class="p-3 text-center border-t">
                  <button
                    type="button"
                    id="closeDropdownBtn"
                    class="text-gray-500 hover:text-gray-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Detail Alamat (Patokan)</label>
              <textarea id="address" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">${form.value.address || ''}</textarea>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">No. Penerima</label>
              <input id="phone" type="tel" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" value="${form.value.phone || ''}" />
            </div>

            <div class="mb-4">
              <label class="flex items-center">
                <input id="is_default" type="checkbox" class="mr-2" ${form.value.is_default ? 'checked' : ''} />
                Jadikan Alamat Utama
              </label>
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
            .swal2-content::-webkit-scrollbar { width: 6px; }
            .swal2-content::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
            .swal2-content::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 10px; }
            .swal2-content::-webkit-scrollbar-thumb:hover { background: #b91c1c; }
            .form-compact input, .form-compact textarea { font-size: 0.875rem; padding: 0.5rem; }
            .form-compact label { font-size: 0.75rem; margin-bottom: 0.25rem; }
          `
          document.head.appendChild(styleElement)

          // Event listeners
          const locationSearchInput = document.getElementById('locationSearchInput')
          const searchButton = document.getElementById('searchButton')
          const searchIcon = document.getElementById('searchIcon')
          const locationDropdown = document.getElementById('locationDropdown')
          const locationResults = document.getElementById('locationResults')
          const locationError = document.getElementById('locationError')
          const selectedLocationDiv = document.getElementById('selectedLocationDiv')
          const selectedLocationText = document.getElementById('selectedLocationText')
          const closeDropdownBtn = document.getElementById('closeDropdownBtn')

          // Update location search value
          locationSearchInput.addEventListener('input', (e) => {
            locationSearch.value = e.target.value
          })

          // Search button click handler
          searchButton.addEventListener('click', async () => {
            const searchValue = locationSearchInput.value.trim()

            if (!searchValue) {
              locationError.textContent = 'Masukkan kata kunci pencarian'
              locationError.style.display = 'block'
              return
            }

            // Show loading
            searchIcon.className = 'fas fa-spinner fa-spin'
            searchButton.disabled = true
            locationError.style.display = 'none'

            try {
              const response = await axios.get(`${base_url}/rajaongkir/search/${searchValue}`)

              if (response.data.status === 'success' && response.data.data.data) {
                const locations = response.data.data.data

                if (locations.length === 0) {
                  locationError.textContent = 'Tidak ada hasil pencarian'
                  locationError.style.display = 'block'
                  locationDropdown.style.display = 'none'
                } else {
                  // Populate dropdown
                  locationResults.innerHTML = `
                    <div class="p-4">
                      <div class="text-gray-500 text-sm mb-2">HASIL PENCARIAN</div>
                      ${locations
                        .map(
                          (location) => `
                        <div
                          class="flex items-center text-gray-700 py-2 cursor-pointer hover:bg-gray-100 location-item"
                          data-location='${JSON.stringify(location)}'
                        >
                          <i class="fas fa-map-marker-alt mr-2"></i>
                          <span>${location.subdistrict_name}, ${location.district_name}, ${location.city_name}, ${location.zip_code}</span>
                        </div>
                      `,
                        )
                        .join('')}
                    </div>
                  `

                  // Add click handlers for location items
                  document.querySelectorAll('.location-item').forEach((item) => {
                    item.addEventListener('click', () => {
                      const location = JSON.parse(item.dataset.location)
                      selectedLocation.value = location
                      form.value.label = location.label

                      selectedLocationText.textContent = `${location.subdistrict_name}, ${location.district_name}, ${location.city_name}, ${location.zip_code}`
                      selectedLocationDiv.style.display = 'block'
                      locationDropdown.style.display = 'none'
                      locationError.style.display = 'none'
                    })
                  })

                  locationDropdown.style.display = 'block'
                }
              } else {
                locationError.textContent = 'Tidak ada hasil pencarian'
                locationError.style.display = 'block'
                locationDropdown.style.display = 'none'
              }
            } catch (error) {
              locationError.textContent = 'Gagal mencari alamat. Silakan coba lagi.'
              locationError.style.display = 'block'
              locationDropdown.style.display = 'none'
              console.error('Location search error:', error)
            } finally {
              // Reset loading
              searchIcon.className = 'fas fa-search'
              searchButton.disabled = false
            }
          })

          // Close dropdown handler
          closeDropdownBtn.addEventListener('click', () => {
            locationDropdown.style.display = 'none'
          })

          // Form input handlers
          document.getElementById('address').addEventListener('input', (e) => {
            form.value.address = e.target.value
          })
          document.getElementById('phone').addEventListener('input', (e) => {
            form.value.phone = e.target.value
          })
          document.getElementById('is_default').addEventListener('change', (e) => {
            form.value.is_default = e.target.checked
          })
        },
        preConfirm: () => {
          const address = document.getElementById('address').value
          const phone = document.getElementById('phone').value
          const is_default = document.getElementById('is_default').checked

          if (!form.value.label) {
            Swal.showValidationMessage('Alamat wajib dipilih dari hasil pencarian')
            return false
          }
          if (!address || !phone) {
            Swal.showValidationMessage('Detail alamat dan no. penerima wajib diisi')
            return false
          }
          if (!/^\+?\d{10,13}$/.test(phone)) {
            Swal.showValidationMessage('No. telepon tidak valid')
            return false
          }

          return {
            id: form.value.id,
            label: form.value.label,
            address,
            phone,
            is_default,
          }
        },
      })
        .then((result) => {
          if (result.isConfirmed && result.value) {
            const addressId = props.user.addresses[props.index].id

            // Prepare form data
            const formData = new FormData()
            formData.append('label', result.value.label)
            formData.append('is_default', result.value.is_default ? 1 : 0)
            formData.append('address', result.value.address)
            formData.append('phone', result.value.phone)

            // Update address using correct API endpoint
            axios
              .post(`${base_url}/customer/address/${addressId}`, formData, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'multipart/form-data',
                },
              })
              .then((response) => {
                if (response.data.status === 'success') {
                  emit('update-address', props.index, {
                    id: addressId,
                    label: result.value.label,
                    address: result.value.address,
                    phone: result.value.phone,
                    is_default: result.value.is_default,
                  })
                  Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: response.data.message || 'Alamat berhasil diperbarui',
                    confirmButtonText: 'OK',
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
                    },
                  })
                }
              })
              .catch((error) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: error.response?.data?.message || 'Gagal memperbarui alamat',
                  confirmButtonText: 'OK',
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
                  },
                })
                console.error('Update address error:', error)
              })
          }
          emit('close')
        })
        .catch((error) => {
          console.error('Modal error:', error)
        })
    }

    watch(
      () => props.visible,
      (newVisible) => {
        if (newVisible) {
          form.value = {
            id: props.user.addresses[props.index]?.id || null,
            label: props.user.addresses[props.index]?.label || '',
            address: props.user.addresses[props.index]?.address || '',
            phone: props.user.addresses[props.index]?.phone || '',
            is_default: props.user.addresses[props.index]?.is_default || false,
          }
          locationSearch.value = form.value.label
          selectedLocation.value = null
          locations.value = []
          showLocationDropdown.value = false
          isLoadingLocation.value = false
          locationError.value = ''
          showEditAddressModal()
        }
      },
      { immediate: true },
    )

    return {
      form,
      showEditAddressModal,
      locationSearch,
      locations,
      selectedLocation,
      showLocationDropdown,
      isLoadingLocation,
      locationError,
      searchLocation,
      selectLocation,
      formatLocationDisplay,
    }
  },
}
</script>
