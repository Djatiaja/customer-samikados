<template>
  <div class="bg-gray-100">
    <!-- Using the HeaderAfterLogin component -->
    <HeaderAfterLogin />

    <div class="flex flex-col md:flex-row">
      <!-- Main Content -->
      <main class="w-full p-6 mt-10">
        <!-- Profile Section -->
        <section class="flex flex-col md:flex-row items-start md:space-x-10 justify-center">
          <!-- Profile Picture -->
          <div class="w-full md:w-1/4 mr-20">
            <img
              :src="user.profileImage || 'https://placehold.co/300x300'"
              class="rounded-lg shadow-lg w-full"
            />
            <button
              class="mt-5 w-full bg-red-600 text-white py-3 rounded-lg mb4"
              @click="openChangePhotoModal"
            >
              Ganti Foto Profil
            </button>
          </div>

          <!-- Profile Details -->
          <div
            class="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
          >
            <h2 class="text-3xl mt-4 font-semibold mb-4 text-center">Profil Saya</h2>
            <div class="space-y-4 w-5/6">
              <div class="bg-gray-100 p-5 mb-6 rounded-lg">{{ user.username }}</div>
              <div class="bg-gray-100 p-5 mb-6 rounded-lg">
                {{ user.birthPlace }}, {{ formatDate(user.birthDate) }}
              </div>
              <div class="bg-gray-100 p-5 mb-6 rounded-lg">{{ user.gender }}</div>
              <div class="bg-gray-100 p-5 mb-6 rounded-lg">
                {{ formatPhoneNumber(user.phoneNumber) }}
              </div>

              <!-- Address Section with Primary Address Indicator -->
              <div
                v-for="(address, index) in user.addresses"
                :key="index"
                class="bg-gray-100 p-5 mb-2 rounded-lg flex justify-between items-center"
              >
                <div>
                  {{ address.addressText }}
                  <span
                    v-if="address.isPrimary"
                    class="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full"
                    >Utama</span
                  >
                </div>
                <div class="flex space-x-2">
                  <button
                    v-if="!address.isPrimary"
                    @click="setAsPrimaryAddress(index)"
                    class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  >
                    Set Utama
                  </button>
                  <button
                    @click="editAddress(index)"
                    class="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    v-if="user.addresses.length > 1"
                    @click="confirmDeleteAddress(index)"
                    class="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <button
                @click="openAddAddressModal"
                class="w-full bg-gray-200 hover:bg-gray-300 p-3 rounded-lg flex items-center justify-center"
              >
                <span class="mr-2">+ Tambah Alamat Baru</span>
              </button>

              <div class="bg-gray-100 p-5 mb-6 rounded-lg">{{ user.email }}</div>
            </div>
            <button
              class="mt-10 w-full md:w-96 bg-red-600 text-white py-3 rounded-lg mb-4"
              @click="openEditProfileModal"
            >
              Edit Profil
            </button>
          </div>
        </section>

        <!-- Action Buttons -->
        <section class="mt-10 space-y-4 flex flex-col items-center justify-center">
          <button
            class="w-2/5 bg-red-600 text-white py-3 rounded-xl"
            @click="openChangePasswordModal"
          >
            Ganti Password
          </button>
          <button class="w-2/5 bg-red-600 text-white py-3 rounded-xl" @click="logout">
            Log Out
          </button>
        </section>
      </main>
    </div>

    <!-- Using the AuthFooter component -->
    <AuthFooter />
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import axios from 'axios'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import Swal from 'sweetalert2'

export default {
  components: {
    HeaderAfterLogin,
    AuthFooter,
  },
  setup() {
    // Sample user data
    const user = reactive({
      username: 'AnastasiaPutri',
      birthPlace: 'Surabaya',
      birthDate: new Date(2001, 0, 14), // January 14, 2001
      gender: 'Perempuan',
      phoneNumber: '081234567890',
      addresses: [
        {
          addressText: 'Jalan Podocarpus IIA No.5, Yogyakarta',
          isPrimary: true,
        },
      ],
      email: 'anastasiaputri@gmail.com',
      profileImage: null,
    })

    // Format functions
    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'long', year: 'numeric' }
      return date.toLocaleDateString('id-ID', options)
    }

    const formatPhoneNumber = (phoneNumber) => {
      if (!phoneNumber) return ''
      // Format: +62 812-3456-7890 or similar
      return phoneNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
    }

    // Address management functions
    const setAsPrimaryAddress = (index) => {
      // First set all addresses to non-primary
      user.addresses.forEach((addr) => (addr.isPrimary = false))
      // Then set the selected one as primary
      user.addresses[index].isPrimary = true

      Swal.fire({
        title: 'Alamat Utama Diubah',
        text: 'Alamat utama Anda telah berhasil diubah',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#DC2626',
      })
    }

    const confirmDeleteAddress = (index) => {
      Swal.fire({
        title: 'Hapus Alamat',
        text: 'Apakah Anda yakin ingin menghapus alamat ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#9CA3AF',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm',
          cancelButton: 'swal-custom-cancel',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // If this is the primary address and we're deleting it, make another one primary
          if (user.addresses[index].isPrimary && user.addresses.length > 1) {
            const newPrimaryIndex = index === 0 ? 1 : 0
            user.addresses[newPrimaryIndex].isPrimary = true
          }

          // Remove the address
          user.addresses.splice(index, 1)

          Swal.fire({
            title: 'Alamat Dihapus',
            text: 'Alamat telah berhasil dihapus',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#DC2626',
          })
        }
      })
    }

    const openAddAddressModal = () => {
      const provinces = ref([]) // Untuk menyimpan data provinsi
      const regencies = ref([]) // Untuk menyimpan data kabupaten
      const districts = ref([]) // Untuk menyimpan data kecamatan
      const villages = ref([]) // Untuk menyimpan data desa

      let provinceSelect, regencySelect, districtSelect, villageSelect

      // Fungsi untuk mengambil data provinsi
      const fetchProvinces = () => {
        return axios
          .get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
          .then((response) => {
            provinces.value = response.data
          })
          .catch((error) => {
            console.error('Error fetching provinces:', error)
          })
      }

      // Fungsi untuk mengambil data kabupaten berdasarkan provinsi
      const fetchRegencies = (provinceCode) => {
        return axios
          .get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceCode}.json`)
          .then((response) => {
            regencies.value = response.data
          })
          .catch((error) => {
            console.error('Error fetching regencies:', error)
          })
      }

      // Fungsi untuk mengambil data kecamatan berdasarkan kabupaten
      const fetchDistricts = (provinceCode, regencyCode) => {
        return axios
          .get(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyCode}.json`)
          .then((response) => {
            districts.value = response.data
          })
          .catch((error) => {
            console.error('Error fetching districts:', error)
          })
      }

      // Fungsi untuk mengambil data desa berdasarkan kecamatan
      const fetchVillages = (provinceCode, regencyCode, districtCode) => {
        return axios
          .get(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtCode}.json`)
          .then((response) => {
            villages.value = response.data
          })
          .catch((error) => {
            console.error('Error fetching villages:', error)
          })
      }

      // Fungsi untuk membuka modal setelah provinsi diambil
      fetchProvinces().then(() => {
        Swal.fire({
          title: 'Tambah Alamat Baru',
          html: `
            <div class="mb-3">
              <label class="block text-left mb-1">Provinsi</label>
              <select id="province" class="swal2-input">
                <option value="">Pilih Provinsi</option>
                ${provinces.value.map((province) => `<option value="${province.id}">${province.name}</option>`).join('')}
              </select>
            </div>
            <div class="mb-3">
              <label class="block text-left mb-1">Kabupaten/Kota</label>
              <select id="regency" class="swal2-input">
                <option value="">Pilih Kabupaten/Kota</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="block text-left mb-1">Kecamatan</label>
              <select id="district" class="swal2-input">
                <option value="">Pilih Kecamatan</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="block text-left mb-1">Kelurahan/Desa</label>
              <select id="village" class="swal2-input">
                <option value="">Pilih Kelurahan/Desa</option>
              </select>
            </div>
            <textarea id="newAddress" class="swal2-input w-full h-24" placeholder="Masukkan alamat lengkap"></textarea>
            <div class="mt-3 flex items-center">
              <input id="setPrimary" type="checkbox" class="form-checkbox h-5 w-5 text-red-600">
              <label for="setPrimary" class="ml-2">Jadikan sebagai alamat utama</label>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Tambah',
          cancelButtonText: 'Batal',
          confirmButtonColor: '#DC2626',
          cancelButtonColor: '#9CA3AF',
          didOpen: () => {
            provinceSelect = document.getElementById('province')
            regencySelect = document.getElementById('regency')
            districtSelect = document.getElementById('district')
            villageSelect = document.getElementById('village')

            provinceSelect.addEventListener('change', (e) => {
              const selectedProvince = e.target.value
              fetchRegencies(selectedProvince).then(() => {
                regencySelect.innerHTML =
                  `<option value="">Pilih Kabupaten/Kota</option>` +
                  regencies.value
                    .map((regency) => `<option value="${regency.id}">${regency.name}</option>`)
                    .join('')
              })
            })

            regencySelect.addEventListener('change', (e) => {
              const selectedRegency = e.target.value
              fetchDistricts(provinceSelect.value, selectedRegency).then(() => {
                districtSelect.innerHTML =
                  `<option value="">Pilih Kecamatan</option>` +
                  districts.value
                    .map((district) => `<option value="${district.id}">${district.name}</option>`)
                    .join('')
              })
            })

            districtSelect.addEventListener('change', (e) => {
              const selectedDistrict = e.target.value
              fetchVillages(provinceSelect.value, regencySelect.value, selectedDistrict).then(
                () => {
                  villageSelect.innerHTML =
                    `<option value="">Pilih Kelurahan/Desa</option>` +
                    villages.value
                      .map((village) => `<option value="${village.id}">${village.name}</option>`)
                      .join('')
                },
              )
            })
          },
          preConfirm: () => {
            const updatedAddress = document.getElementById('newAddress').value
            const setPrimary = document.getElementById('setPrimary').checked
            const provinceCode = provinceSelect.value
            const regencyCode = regencySelect.value
            const districtCode = districtSelect.value
            const villageCode = villageSelect.value

            if (
              !updatedAddress.trim() ||
              !provinceCode ||
              !regencyCode ||
              !districtCode ||
              !villageCode
            ) {
              Swal.showValidationMessage('Semua field harus diisi')
              return false
            }

            return {
              addressText: updatedAddress,
              isPrimary: setPrimary,
              provinceCode,
              regencyCode,
              districtCode,
              villageCode,
            }
          },
        }).then((result) => {
          if (result.isConfirmed) {
            const { addressText, isPrimary, provinceCode, regencyCode, districtCode, villageCode } =
              result.value

            // Add the new address to the user's addresses
            user.addresses.push({
              addressText,
              isPrimary,
              provinceCode,
              regencyCode,
              districtCode,
              villageCode,
            })

            Swal.fire({
              title: 'Alamat Ditambahkan',
              text: 'Alamat baru telah berhasil ditambahkan',
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#DC2626',
            })
          }
        })
      })
    }

    const editAddress = async (index) => {
      const address = user.addresses[index]
      const provinces = ref([]) // Untuk menyimpan data provinsi
      const regencies = ref([]) // Untuk menyimpan data kabupaten
      const districts = ref([]) // Untuk menyimpan data kecamatan
      const villages = ref([]) // Untuk menyimpan data desa

      const selectedProvince = ref(address.provinceCode)
      const selectedRegency = ref(address.regencyCode)
      const selectedDistrict = ref(address.districtCode)
      const selectedVillage = ref(address.villageCode)

      const fetchProvinces = async () => {
        try {
          const response = await axios.get(
            'https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json',
          )
          provinces.value = response.data
          if (selectedProvince.value) {
            await fetchRegencies(selectedProvince.value)
          }
        } catch (error) {
          console.error('Error fetching provinces:', error)
        }
      }

      const fetchRegencies = async (provinceCode) => {
        try {
          const response = await axios.get(
            `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceCode}.json`,
          )
          regencies.value = response.data
          if (selectedRegency.value) {
            await fetchDistricts(provinceCode, selectedRegency.value)
          }
        } catch (error) {
          console.error('Error fetching regencies:', error)
        }
      }

      const fetchDistricts = async (provinceCode, regencyCode) => {
        try {
          const response = await axios.get(
            `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyCode}.json`,
          )
          districts.value = response.data
          if (selectedDistrict.value) {
            await fetchVillages(provinceCode, regencyCode, selectedDistrict.value)
          }
        } catch (error) {
          console.error('Error fetching districts:', error)
        }
      }

      const fetchVillages = async (provinceCode, regencyCode, districtCode) => {
        try {
          const response = await axios.get(
            `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtCode}.json`,
          )
          villages.value = response.data
        } catch (error) {
          console.error('Error fetching villages:', error)
        }
      }

      // Call fetchProvinces to load initial data
      await fetchProvinces()

      Swal.fire({
        title: 'Edit Alamat',
        html: `
          <div class="mb-3">
            <label class="block text-left mb-1">Provinsi</label>
            <select id="province" class="swal2-input">
              <option value="">Pilih Provinsi</option>
              ${provinces.value
                .map(
                  (province) =>
                    `<option value="${province.id}" ${province.id === selectedProvince.value ? 'selected' : ''}>${province.name}</option>`,
                )
                .join('')}
            </select>
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Kabupaten/Kota</label>
            <select id="regency" class="swal2-input">
              <option value="">Pilih Kabupaten/Kota</option>
              ${regencies.value
                .map(
                  (regency) =>
                    `<option value="${regency.id}" ${regency.id === selectedRegency.value ? 'selected' : ''}>${regency.name}</option>`,
                )
                .join('')}
            </select>
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Kecamatan</label>
            <select id="district" class="swal2-input">
              <option value="">Pilih Kecamatan</option>
              ${districts.value
                .map(
                  (district) =>
                    `<option value="${district.id}" ${district.id === selectedDistrict.value ? 'selected' : ''}>${district.name}</option>`,
                )
                .join('')}
            </select>
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Kelurahan/Desa</label>
            <select id="village" class="swal2-input">
              <option value="">Pilih Kelurahan/Desa</option>
              ${villages.value
                .map(
                  (village) =>
                    `<option value="${village.id}" ${village.id === selectedVillage.value ? 'selected' : ''}>${village.name}</option>`,
                )
                .join('')}
            </select>
          </div>
          <textarea id="editAddress" class="swal2-input w-full h-24">${address.addressText}</textarea>
          <div class="mt-3 flex items-center">
            <input id="setPrimary" type="checkbox" class="form-checkbox h-5 w-5 text-red-600" ${address.isPrimary ? 'checked' : ''}>
            <label for="setPrimary" class="ml-2">Jadikan sebagai alamat utama</label>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#9CA3AF',
        didOpen: () => {
          const provinceSelect = document.getElementById('province')
          const regencySelect = document.getElementById('regency')
          const districtSelect = document.getElementById('district')
          const villageSelect = document.getElementById('village')

          provinceSelect.addEventListener('change', async (e) => {
            selectedProvince.value = e.target.value
            regencies.value = []
            districts.value = []
            villages.value = []
            if (selectedProvince.value) {
              await fetchRegencies(selectedProvince.value)
            }
          })

          regencySelect.addEventListener('change', async (e) => {
            selectedRegency.value = e.target.value
            districts.value = []
            villages.value = []
            if (selectedRegency.value && selectedProvince.value) {
              await fetchDistricts(selectedProvince.value, selectedRegency.value)
            }
          })

          districtSelect.addEventListener('change', async (e) => {
            selectedDistrict.value = e.target.value
            villages.value = []
            if (selectedDistrict.value && selectedProvince.value && selectedRegency.value) {
              await fetchVillages(
                selectedProvince.value,
                selectedRegency.value,
                selectedDistrict.value,
              )
            }
          })

          villageSelect.addEventListener('change', (e) => {
            selectedVillage.value = e.target.value
          })
        },
        preConfirm: () => {
          const updatedAddress = document.getElementById('editAddress').value
          const setPrimary = document.getElementById('setPrimary').checked
          const provinceCode = selectedProvince.value
          const regencyCode = selectedRegency.value
          const districtCode = selectedDistrict.value
          const villageCode = selectedVillage.value

          if (
            !updatedAddress.trim() ||
            !provinceCode ||
            !regencyCode ||
            !districtCode ||
            !villageCode
          ) {
            Swal.showValidationMessage('Semua field harus diisi')
            return false
          }

          return {
            addressText: updatedAddress,
            isPrimary: setPrimary,
            provinceCode,
            regencyCode,
            districtCode,
            villageCode,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const { addressText, isPrimary, provinceCode, regencyCode, districtCode, villageCode } =
            result.value

          if (isPrimary && !address.isPrimary) {
            user.addresses.forEach((addr) => (addr.isPrimary = false))
          }

          user.addresses[index] = {
            addressText,
            isPrimary: isPrimary || (address.isPrimary && user.addresses.length === 1),
            provinceCode,
            regencyCode,
            districtCode,
            villageCode,
          }

          Swal.fire({
            title: 'Alamat Diperbarui',
            text: 'Alamat telah berhasil diperbarui',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#DC2626',
          })
        }
      })
    }

    // Profile Management
    const openEditProfileModal = () => {
      Swal.fire({
        title: 'Edit Profil',
        html: `
          <div class="mb-3">
            <label class="block text-left mb-1">Username</label>
            <input id="username" class="swal2-input" value="${user.username}">
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Tempat Lahir</label>
            <input id="birthPlace" class="swal2-input" value="${user.birthPlace}">
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Tanggal Lahir</label>
            <input id="birthDate" type="date" class="swal2-input" value="${user.birthDate.toISOString().split('T')[0]}">
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Jenis Kelamin</label>
            <select id="gender" class="swal2-input">
              <option value="Laki-laki" ${user.gender === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
              <option value="Perempuan" ${user.gender === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Nomor Telepon</label>
            <input id="phoneNumber" class="swal2-input" value="${user.phoneNumber}" type="tel" pattern="[0-9]{12}">
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Email</label>
            <input id="email" class="swal2-input" value="${user.email}" type="email">
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#9CA3AF',
        preConfirm: () => {
          const username = document.getElementById('username').value
          const birthPlace = document.getElementById('birthPlace').value
          const birthDateString = document.getElementById('birthDate').value
          const gender = document.getElementById('gender').value
          const phoneNumber = document.getElementById('phoneNumber').value
          const email = document.getElementById('email').value

          // Validation
          if (!username || !birthPlace || !birthDateString || !phoneNumber || !email) {
            Swal.showValidationMessage('Semua field harus diisi')
            return false
          }

          if (!/^\d+$/.test(phoneNumber)) {
            Swal.showValidationMessage('Nomor telepon harus berupa angka')
            return false
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Swal.showValidationMessage('Format email tidak valid')
            return false
          }

          return {
            username,
            birthPlace,
            birthDate: new Date(birthDateString),
            gender,
            phoneNumber,
            email,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Confirm changes
          Swal.fire({
            title: 'Konfirmasi Perubahan',
            text: 'Apakah Anda yakin ingin mengubah profil?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#9CA3AF',
          }).then((confirmResult) => {
            if (confirmResult.isConfirmed) {
              // Update user data
              Object.assign(user, result.value)

              Swal.fire({
                title: 'Data Berhasil Diubah',
                icon: 'success',
                html: `
                  <img src="/icon/Done.gif" alt="Success Icon" class="mx-auto mb-5 mt-6 w-1/6">
                `,
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#DC2626',
              })
            }
          })
        }
      })
    }

    const openChangePasswordModal = () => {
      Swal.fire({
        title: 'Ganti Password',
        html: `
          <div class="mb-3">
            <label class="block text-left mb-1">Password Lama</label>
            <input id="oldPassword" type="password" class="swal2-input">
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Password Baru</label>
            <input id="newPassword" type="password" class="swal2-input">
          </div>
          <div class="mb-3">
            <label class="block text-left mb-1">Konfirmasi Password Baru</label>
            <input id="confirmNewPassword" type="password" class="swal2-input">
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Ganti Password',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#9CA3AF',
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
      }).then((result) => {
        if (result.isConfirmed) {
          // Confirm password change
          Swal.fire({
            title: 'Konfirmasi Penggantian Password',
            text: 'Apakah Anda yakin ingin mengganti password?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#9CA3AF',
          }).then((confirmResult) => {
            if (confirmResult.isConfirmed) {
              // Password change would be processed here in a real app

              Swal.fire({
                title: 'Password Berhasil Diubah',
                icon: 'success',
                html: `
                  <img src="/icon/Done.gif" alt="Success Icon" class="mx-auto mb-5 mt-6 w-1/6">
                `,
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#DC2626',
              })
            }
          })
        }
      })
    }

    const openChangePhotoModal = () => {
      Swal.fire({
        title: 'Unggah Foto Profil Baru',
        html: `
          <div class="mb-3">
            <input id="newProfilePhoto" type="file" accept="image/*" class="swal2-file">
          </div>
          <div id="previewContainer" class="mt-4 hidden">
            <img id="imagePreview" class="mx-auto rounded-full w-32 h-32 object-cover" src="">
          </div>
        `,
        didOpen: () => {
          const fileInput = document.getElementById('newProfilePhoto')
          const previewContainer = document.getElementById('previewContainer')
          const imagePreview = document.getElementById('imagePreview')

          fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
              const file = e.target.files[0]
              const reader = new FileReader()

              reader.onload = (e) => {
                imagePreview.src = e.target.result
                previewContainer.classList.remove('hidden')
              }

              reader.readAsDataURL(file)
            }
          })
        },
        showCancelButton: true,
        confirmButtonText: 'Ganti Foto',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#9CA3AF',
        preConfirm: () => {
          const fileInput = document.getElementById('newProfilePhoto')

          if (fileInput.files.length === 0) {
            Swal.showValidationMessage('Silakan pilih foto terlebih dahulu')
            return false
          }

          return { file: fileInput.files[0] }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Confirm photo change
          Swal.fire({
            title: 'Konfirmasi Penggantian Foto',
            text: 'Apakah Anda yakin ingin mengganti foto profil?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#9CA3AF',
          }).then((confirmResult) => {
            if (confirmResult.isConfirmed) {
              // In a real app, we would upload the photo here
              // For now, we'll just update the state with a placeholder
              const reader = new FileReader()
              reader.onload = (e) => {
                user.profileImage = e.target.result
              }
              reader.readAsDataURL(result.value.file)

              Swal.fire({
                title: 'Foto Berhasil Diubah',
                icon: 'success',
                html: `
                  <img src="/icon/Done.gif" alt="Success Icon" class="mx-auto mb-5 mt-6 w-1/6">
                `,
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#DC2626',
              })
            }
          })
        }
      })
    }

    const logout = () => {
      Swal.fire({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin keluar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#9CA3AF',
      }).then((result) => {
        if (result.isConfirmed) {
          // Logout logic would go here
          // For now, just show a success message
          Swal.fire({
            title: 'Berhasil Logout',
            text: 'Anda telah berhasil keluar dari akun',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#DC2626',
          }).then(() => {
            // In a real app, redirect to login page
            // window.location.href = '/login'
          })
        }
      })
    }

    return {
      user,
      formatDate,
      formatPhoneNumber,
      setAsPrimaryAddress,
      confirmDeleteAddress,
      openAddAddressModal,
      editAddress,
      openEditProfileModal,
      openChangePasswordModal,
      openChangePhotoModal,
      logout,
    }
  },
}
</script>

<style>
/* Custom styles for SweetAlert2 */
.swal-custom-popup {
  border-radius: 15px;
}

.swal-custom-title {
  color: #1f2937;
}

.swal-custom-confirm {
  background-color: #dc2626 !important;
}

.swal-custom-cancel {
  background-color: #9ca3af !important;
}

/* Style for the input fields in SweetAlert2 */
.swal2-input,
.swal2-file,
.swal2-textarea {
  width: 100% !important;
  margin: 0.5rem 0 !important;
}

/* Style for the date picker to ensure consistent appearance */
input[type='date'] {
  padding: 0.5rem;
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
</style>
