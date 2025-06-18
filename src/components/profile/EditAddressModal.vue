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
    const base_url = import.meta.env.VITE_API_BASE_URL // Gunakan variabel .env
    const form = ref({
      id: props.user.addresses[props.index]?.id || null,
      name: props.user.addresses[props.index]?.name || '',
      address: props.user.addresses[props.index]?.address || '',
      postal_code: props.user.addresses[props.index]?.postal_code || '',
      phone: props.user.addresses[props.index]?.phone || '',
      is_default: props.user.addresses[props.index]?.is_default || false,
      province_id: props.user.addresses[props.index]?.subdistrict?.city?.province_id || null,
      city_id: props.user.addresses[props.index]?.subdistrict?.city_id || null,
      subdistrict_id: props.user.addresses[props.index]?.subdistrict_id || null,
    })

    const provinces = ref([])
    const cities = ref([])
    const subdistricts = ref([])

    const fetchProvinces = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${base_url}/customer/address/provinces`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('Provinces response:', response.data) // Debug response
        if (response.data.status === 'success') {
          provinces.value = response.data.data
        }
      } catch (error) {
        console.error('Error fetching provinces:', error)
      }
    }

    const fetchCities = async (province_id) => {
      cities.value = []
      subdistricts.value = []
      if (!province_id) return
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${base_url}/customer/address/cities/${province_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('Cities response:', response.data) // Debug response
        if (response.data.status === 'success') {
          cities.value = response.data.data
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
      }
    }

    const fetchSubdistricts = async (city_id) => {
      subdistricts.value = []
      if (!city_id) return
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${base_url}/customer/address/subdistricts/${city_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('Subdistricts response:', response.data) // Debug response
        if (response.data.status === 'success') {
          subdistricts.value = response.data.data
        }
      } catch (error) {
        console.error('Error fetching subdistricts:', error)
      }
    }

    const updateDropdowns = () => {
      const provinceSelect = document.getElementById('province_id')
      const citySelect = document.getElementById('city_id')
      const subdistrictSelect = document.getElementById('subdistrict_id')

      if (provinceSelect) {
        provinceSelect.innerHTML = `
          <option value="">Pilih Provinsi</option>
          ${provinces.value
            .map(
              (province) =>
                `<option value="${province.id}" ${
                  province.id === form.value.province_id ? 'selected' : ''
                }>${province.name}</option>`,
            )
            .join('')}
        `
      }

      if (citySelect) {
        citySelect.innerHTML = `
          <option value="">Pilih Kota/Kabupaten</option>
          ${cities.value
            .map(
              (city) =>
                `<option value="${city.id}" ${
                  city.id === form.value.city_id ? 'selected' : ''
                }>${city.name}</option>`,
            )
            .join('')}
        `
      }

      if (subdistrictSelect) {
        subdistrictSelect.innerHTML = `
          <option value="">Pilih Kecamatan</option>
          ${subdistricts.value
            .map(
              (subdistrict) =>
                `<option value="${subdistrict.id}" ${
                  subdistrict.id === form.value.subdistrict_id ? 'selected' : ''
                }>${subdistrict.name}</option>`,
            )
            .join('')}
        `
      }
    }

    const showEditAddressModal = async () => {
      try {
        console.log('Base URL:', base_url) // Debug URL
        await fetchProvinces()
        if (form.value.province_id) await fetchCities(form.value.province_id)
        if (form.value.city_id) await fetchSubdistricts(form.value.city_id)

        Swal.fire({
          title: `<h3 class="text-lg font-bold">Edit Alamat</h3>`,
          html: `
            <form id="editAddressForm" class="text-left form-compact">
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Nama Penerima</label>
                <input
                  id="name"
                  type="text"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  value="${form.value.name}"
                />
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Provinsi</label>
                <select
                  id="province_id"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                >
                  <option value="">Pilih Provinsi</option>
                  ${provinces.value
                    .map(
                      (province) =>
                        `<option value="${province.id}" ${
                          province.id === form.value.province_id ? 'selected' : ''
                        }>${province.name}</option>`,
                    )
                    .join('')}
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Kota/Kabupaten</label>
                <select
                  id="city_id"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                >
                  <option value="">Pilih Kota/Kabupaten</option>
                  ${cities.value
                    .map(
                      (city) =>
                        `<option value="${city.id}" ${
                          city.id === form.value.city_id ? 'selected' : ''
                        }>${city.name}</option>`,
                    )
                    .join('')}
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Kecamatan</label>
                <select
                  id="subdistrict_id"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                >
                  <option value="">Pilih Kecamatan</option>
                  ${subdistricts.value
                    .map(
                      (subdistrict) =>
                        `<option value="${subdistrict.id}" ${
                          subdistrict.id === form.value.subdistrict_id ? 'selected' : ''
                        }>${subdistrict.name}</option>`,
                    )
                    .join('')}
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Kode Pos</label>
                <input
                  id="postal_code"
                  type="text"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  value="${form.value.postal_code}"
                />
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Detail Alamat</label>
                <textarea
                  id="address"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                >${form.value.address}</textarea>
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">No. Penerima</label>
                <input
                  id="phone"
                  type="tel"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  value="${form.value.phone}"
                />
              </div>
              <div class="mb-4">
                <label class="flex items-center">
                  <input
                    id="is_default"
                    type="checkbox"
                    class="mr-2"
                    ${form.value.is_default ? 'checked' : ''}
                  />
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

            document.getElementById('address').addEventListener('input', (e) => {
              form.value.address = e.target.value
            })

            document.getElementById('postal_code').addEventListener('input', (e) => {
              form.value.postal_code = e.target.value
            })

            document.getElementById('phone').addEventListener('input', (e) => {
              form.value.phone = e.target.value
            })

            document.getElementById('province_id').addEventListener('change', (e) => {
              form.value.province_id = e.target.value ? Number(e.target.value) : null
              form.value.city_id = null
              form.value.subdistrict_id = null
              fetchCities(form.value.province_id)
            })

            document.getElementById('city_id').addEventListener('change', (e) => {
              form.value.city_id = e.target.value ? Number(e.target.value) : null
              form.value.subdistrict_id = null
              fetchSubdistricts(form.value.city_id)
            })

            document.getElementById('subdistrict_id').addEventListener('change', (e) => {
              form.value.subdistrict_id = e.target.value ? Number(e.target.value) : null
            })

            document.getElementById('is_default').addEventListener('change', (e) => {
              form.value.is_default = e.target.checked
            })
          },
          preConfirm: () => {
            const name = document.getElementById('name').value
            const address = document.getElementById('address').value
            const postal_code = document.getElementById('postal_code').value
            const phone = document.getElementById('phone').value
            const province_id = document.getElementById('province_id').value
            const city_id = document.getElementById('city_id').value
            const subdistrict_id = document.getElementById('subdistrict_id').value
            const is_default = document.getElementById('is_default').checked

            if (
              !name ||
              !address ||
              !postal_code ||
              !phone ||
              !province_id ||
              !city_id ||
              !subdistrict_id
            ) {
              Swal.showValidationMessage('Semua field wajib diisi')
              return false
            }

            if (!/^\d{5}$/.test(postal_code)) {
              Swal.showValidationMessage('Kode pos harus 5 digit angka')
              return false
            }

            if (!/^\+?\d{10,13}$/.test(phone)) {
              Swal.showValidationMessage('No. telepon tidak valid')
              return false
            }

            return {
              ...form.value,
              name,
              address,
              postal_code,
              phone,
              province_id: Number(province_id),
              city_id: Number(city_id),
              subdistrict_id: Number(subdistrict_id),
              is_default,
              subdistrict: {
                id: Number(subdistrict_id),
                name: subdistricts.value.find((s) => s.id === Number(subdistrict_id))?.name || '',
                city: {
                  id: Number(city_id),
                  name: cities.value.find((c) => c.id === Number(city_id))?.name || '',
                  province: {
                    id: Number(province_id),
                    name: provinces.value.find((p) => p.id === Number(province_id))?.name || '',
                  },
                },
              },
            }
          },
        })
          .then((result) => {
            if (result.isConfirmed && result.value) {
              emit('update-address', props.index, result.value)
              form.value.name = ''
              form.value.address = ''
              form.value.postal_code = ''
              form.value.phone = ''
              form.value.is_default = false
              form.value.province_id = null
              form.value.city_id = null
              form.value.subdistrict_id = null
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
      async (newVisible) => {
        if (newVisible) {
          form.value = {
            id: props.user.addresses[props.index]?.id || null,
            name: props.user.addresses[props.index]?.name || '',
            address: props.user.addresses[props.index]?.address || '',
            postal_code: props.user.addresses[props.index]?.postal_code || '',
            phone: props.user.addresses[props.index]?.phone || '',
            is_default: props.user.addresses[props.index]?.is_default || false,
            province_id: props.user.addresses[props.index]?.subdistrict?.city?.province_id || null,
            city_id: props.user.addresses[props.index]?.subdistrict?.city_id || null,
            subdistrict_id: props.user.addresses[props.index]?.subdistrict_id || null,
          }
          await showEditAddressModal()
        }
      },
      { immediate: true },
    )

    watch(
      () => [cities.value, subdistricts.value],
      () => {
        updateDropdowns()
      },
    )

    return { form, showEditAddressModal, provinces, cities, subdistricts }
  },
}
</script>
