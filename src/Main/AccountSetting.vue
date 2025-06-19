<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <!-- Header -->
    <HeaderAfterLogin />
    <!-- Content Wrapper -->
    <div class="flex-1 mt-16">
      <div class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div class="flex justify-center">
          <section
            class="flex flex-col md:flex-row items-center md:items-start md:space-x-10 w-full rounded-lg p-6"
          >
            <ProfilePicture :user="user" @open-change-photo-modal="handleOpenChangePhotoModal" />
            <ProfileDetails
              :user="user"
              :format-phone-number="formatPhoneNumber"
              @set-primary-address="setAsPrimaryAddress"
              @confirm-delete-address="confirmDeleteAddress"
              @open-add-address-modal="handleOpenAddAddressModal"
              @edit-address="handleEditAddress"
              @open-edit-profile-modal="handleOpenEditProfileModal"
              @open-address-list-modal="handleOpenAddressListModal"
            />
          </section>
        </div>
        <div class="flex justify-center mt-6">
          <ActionButtons
            @open-change-password-modal="handleOpenChangePasswordModal"
            @logout="handleLogout"
          />
        </div>
        <!-- Modals -->
        <AddAddressModal
          v-if="showAddAddressModal"
          :user="user"
          :visible="showAddAddressModal"
          @add-address="addAddress"
          @close="handleCloseAddAddressModal"
        />
        <EditAddressModal
          v-if="showEditAddressModal"
          :user="user"
          :index="selectedAddressIndex"
          :visible="showEditAddressModal"
          @update-address="updateAddress"
          @close="handleCloseEditAddressModal"
        />
        <AddressListModal
          v-if="showAddressListModal"
          :user="user"
          :visible="showAddressListModal"
          @set-primary-address="setAsPrimaryAddress"
          @edit-address="handleEditAddress"
          @confirm-delete-address="confirmDeleteAddress"
          @close="handleCloseAddressListModal"
        />
        <EditProfileModal
          v-if="showEditProfileModal"
          :user="user"
          :visible="showEditProfileModal"
          @update-profile="updateProfile"
          @close="handleCloseEditProfileModal"
        />
        <ChangePasswordModal
          v-if="showChangePasswordModal"
          :visible="showChangePasswordModal"
          @change-password="changePassword"
          @close="handleCloseChangePasswordModal"
        />
        <ChangePhotoModal
          v-if="showChangePhotoModal"
          :user="user"
          :visible="showChangePhotoModal"
          @change-photo="updateProfilePhoto"
          @close="handleCloseChangePhotoModal"
        />
      </div>
    </div>
    <AuthFooter />
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import ProfilePicture from '@/components/profile/ProfilePicture.vue'
import ProfileDetails from '@/components/profile/ProfileDetails.vue'
import ActionButtons from '@/components/profile/ActionButtons.vue'
import EditAddressModal from '@/components/profile/EditAddressModal.vue'
import AddressListModal from '@/components/profile/AddressListModal.vue'
import EditProfileModal from '@/components/profile/EditProfileModal.vue'
import ChangePasswordModal from '@/components/profile/ChangePasswordModal.vue'
import ChangePhotoModal from '@/components/profile/ChangePhotoModal.vue'
import AddAddressModal from '@/components/profile/AddAddressModal.vue'

export default {
  components: {
    HeaderAfterLogin,
    AuthFooter,
    ProfilePicture,
    ProfileDetails,
    ActionButtons,
    EditAddressModal,
    AddressListModal,
    EditProfileModal,
    ChangePasswordModal,
    ChangePhotoModal,
    AddAddressModal,
  },
  setup() {
    const router = useRouter()
    const user = reactive({
      name: '',
      username: '',
      email: '',
      no_telp: '',
      photo_url: null,
      addresses: [],
    })

    const base_url = import.meta.env.VITE_API_BASE_URL
    const showAddAddressModal = ref(false)
    const showEditAddressModal = ref(false)
    const showAddressListModal = ref(false)
    const showEditProfileModal = ref(false)
    const showChangePasswordModal = ref(false)
    const showChangePhotoModal = ref(false)
    const selectedAddressIndex = ref(null)

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token autentikasi tidak ada')
        }

        console.log('Base URL:', base_url)

        const profileResponse = await axios.get(`${base_url}/customer/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log('Profile response:', profileResponse.data)

        if (profileResponse.data.status === 'success') {
          Object.assign(user, {
            name: profileResponse.data.data.name,
            username: profileResponse.data.data.username,
            email: profileResponse.data.data.email,
            no_telp: profileResponse.data.data.no_telp,
            photo_url: profileResponse.data.data.photo_url,
          })
        } else {
          throw new Error(profileResponse.data.message || 'Gagal ambil data profil')
        }

        const addressResponse = await axios.get(`${base_url}/customer/address`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log('Address response:', addressResponse.data)

        if (addressResponse.data.status === 'success') {
          user.addresses = Array.isArray(addressResponse.data.data)
            ? addressResponse.data.data
            : [addressResponse.data.data].filter(Boolean)
        } else {
          throw new Error(addressResponse.data.message || 'Gagal ambil data alamat')
        }
      } catch (error) {
        console.error('Error ambil data:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Gagal memuat profil',
          confirmButtonText: 'OK',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
          },
        })
      }
    }

    fetchUserProfile()

    const formatPhoneNumber = (phoneNumber) => {
      if (!phoneNumber) return ''
      return phoneNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount)
    }

    const setAsPrimaryAddress = (index) => {
      user.addresses.forEach((addr, i) => {
        addr.is_default = i === index ? 1 : 0
      })
    }

    const confirmDeleteAddress = (index) => {
      Swal.fire({
        title: 'Konfirmasi Hapus Alamat',
        text: 'Yakin mau hapus alamat ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md mr-4',
          cancelButton: 'bg-gray-200 text-black py-2 px-4 rounded-md',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          if (user.addresses[index].is_default && user.addresses.length > 1) {
            const newPrimaryIndex = index === 0 ? 1 : 0
            user.addresses[newPrimaryIndex].is_default = 1
          }
          user.addresses.splice(index, 1)
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Alamat berhasil dihapus',
            confirmButtonText: 'OK',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
            },
          })
        }
      })
    }

    const addAddress = (newAddress) => {
      if (newAddress.is_default) {
        user.addresses.forEach((addr) => (addr.is_default = 0))
      }
      user.addresses.push(newAddress)
      showAddAddressModal.value = false
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Alamat berhasil ditambahkan',
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
        },
      })
    }

    const handleEditAddress = (index) => {
      selectedAddressIndex.value = index
      showEditAddressModal.value = true
    }

    const updateAddress = (index, updatedAddress) => {
      if (updatedAddress.is_default) {
        user.addresses.forEach((addr) => (addr.is_default = 0))
      }
      user.addresses[index] = updatedAddress
      showEditAddressModal.value = false
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Alamat berhasil diperbarui',
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
        },
      })
    }

    const handleOpenAddressListModal = () => {
      showAddressListModal.value = true
    }

    const handleCloseAddressListModal = () => {
      showAddressListModal.value = false
    }

    const updateProfile = async (updatedProfile) => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token autentikasi tidak ada')
        }

        const response = await axios.post(
          `${base_url}/customer/profile`,
          {
            name: updatedProfile.name,
            username: updatedProfile.username,
            no_telp: updatedProfile.no_telp,
            email: updatedProfile.email,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.data.status === 'success') {
          Object.assign(user, response.data.data)
          showEditProfileModal.value = false
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: response.data.message || 'Profil berhasil diperbarui',
            confirmButtonText: 'OK',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
            },
          })
        } else {
          throw new Error(response.data.message || 'Gagal update profil')
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || error.message || 'Gagal menyimpan profil',
          confirmButtonText: 'OK',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
          },
        })
        console.error('Update profile error:', error)
      }
    }

    const updateProfilePhoto = async (file) => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token autentikasi tidak ada')
        }

        const formData = new FormData()
        formData.append('photo', file)

        const response = await axios.post(`${base_url}/customer/profile/photo`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.status === 'success') {
          user.photo_url = response.data.data.photo_url
          showChangePhotoModal.value = false
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: response.data.message || 'Foto profil berhasil diperbarui',
            confirmButtonText: 'OK',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
            },
          })
        } else {
          throw new Error(response.data.message || 'Gagal update foto profil')
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || error.message || 'Gagal upload foto',
          confirmButtonText: 'OK',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
          },
        })
        console.error('Update photo error:', error)
      }
    }

    const changePassword = () => {
      showChangePasswordModal.value = false
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Kata sandi berhasil diubah',
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
        },
      })
    }

    const handleOpenChangePhotoModal = () => {
      showChangePhotoModal.value = true
    }

    const handleOpenAddAddressModal = () => {
      showAddAddressModal.value = true
    }

    const handleOpenEditProfileModal = () => {
      showEditProfileModal.value = true
    }

    const handleOpenChangePasswordModal = () => {
      showChangePasswordModal.value = true
    }

    const handleCloseChangePhotoModal = () => {
      showChangePhotoModal.value = false
    }

    const handleCloseAddAddressModal = () => {
      showAddAddressModal.value = false
    }

    const handleCloseEditAddressModal = () => {
      showEditAddressModal.value = false
    }

    const handleCloseEditProfileModal = () => {
      showEditProfileModal.value = false
    }

    const handleCloseChangePasswordModal = () => {
      showChangePasswordModal.value = false
    }

    const handleLogout = () => {
      Swal.fire({
        title: 'Konfirmasi Logout',
        text: 'Yakin mau logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md mr-4',
          cancelButton: 'bg-gray-200 text-black py-2 px-4 rounded-md',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('token')
          router.push('/login')
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Kamu berhasil logout',
            confirmButtonText: 'OK',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
            },
          })
        }
      })
    }

    return {
      user,
      showAddAddressModal,
      showEditAddressModal,
      showAddressListModal,
      showEditProfileModal,
      showChangePasswordModal,
      showChangePhotoModal,
      selectedAddressIndex,
      formatPhoneNumber,
      formatCurrency,
      setAsPrimaryAddress,
      confirmDeleteAddress,
      addAddress,
      handleEditAddress,
      updateAddress,
      handleOpenAddressListModal,
      handleCloseAddressListModal,
      updateProfile,
      updateProfilePhoto,
      changePassword,
      handleOpenChangePhotoModal,
      handleOpenAddAddressModal,
      handleOpenEditProfileModal,
      handleOpenChangePasswordModal,
      handleCloseChangePhotoModal,
      handleCloseAddAddressModal,
      handleCloseEditAddressModal,
      handleCloseEditProfileModal,
      handleCloseChangePasswordModal,
      handleLogout,
    }
  },
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.close-btn {
  background-color: #9ca3af;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
