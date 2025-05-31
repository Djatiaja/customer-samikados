<template>
  <div class="bg-gray-100">
    <HeaderAfterLogin />
    <div class="flex flex-col md:flex-row">
      <main class="w-full p-6 mt-10">
        <div class="w-full flex justify-center">
          <section
            class="flex flex-col md:flex-row items-center md:items-start md:space-x-10 justify-center max-w-7xl mx-auto px-4"
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
            />
          </section>
        </div>
        <ActionButtons
          @open-change-password-modal="handleOpenChangePasswordModal"
          @logout="handleLogout"
        />
      </main>
    </div>
    <AuthFooter />

    <!-- Modal Add Address -->
    <AddAddressModal
      v-if="showAddAddressModal"
      :user="user"
      :visible="showAddAddressModal"
      @add-address="addAddress"
      @close="handleCloseAddAddressModal"
    />

    <!-- Modal Edit Address -->
    <EditAddressModal
      v-if="showEditAddressModal"
      :user="user"
      :index="selectedAddressIndex"
      :visible="showEditAddressModal"
      @update-address="updateAddress"
      @close="handleCloseEditAddressModal"
    />

    <!-- Modal Edit Profile -->
    <EditProfileModal
      v-if="showEditProfileModal"
      :user="user"
      :visible="showEditProfileModal"
      @update-profile="updateProfile"
      @close="handleCloseEditProfileModal"
    />

    <!-- Modal Change Password -->
    <ChangePasswordModal
      v-if="showChangePasswordModal"
      :visible="showChangePasswordModal"
      @change-password="changePassword"
      @close="handleCloseChangePasswordModal"
    />

    <!-- Modal Change Photo -->
    <ChangePhotoModal
      v-if="showChangePhotoModal"
      :user="user"
      :visible="showChangePhotoModal"
      @change-photo="changePhoto"
      @close="handleCloseChangePhotoModal"
    />
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import ProfilePicture from '@/components/profile/ProfilePicture.vue'
import ProfileDetails from '@/components/profile/ProfileDetails.vue'
import ActionButtons from '@/components/profile/ActionButtons.vue'
import AddAddressModal from '@/components/profile/AddAddressModal.vue'
import EditAddressModal from '@/components/profile/EditAddressModal.vue'
import EditProfileModal from '@/components/profile/EditProfileModal.vue'
import ChangePasswordModal from '@/components/profile/ChangePasswordModal.vue'
import ChangePhotoModal from '@/components/profile/ChangePhotoModal.vue'

export default {
  components: {
    HeaderAfterLogin,
    AuthFooter,
    ProfilePicture,
    ProfileDetails,
    ActionButtons,
    AddAddressModal,
    EditAddressModal,
    EditProfileModal,
    ChangePasswordModal,
    ChangePhotoModal,
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

    const showAddAddressModal = ref(false)
    const showEditAddressModal = ref(false)
    const showEditProfileModal = ref(false)
    const showChangePasswordModal = ref(false)
    const showChangePhotoModal = ref(false)
    const selectedAddressIndex = ref(null)

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await axios.get('http://127.0.0.1:8000/api/customer/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.status === 'success') {
          Object.assign(user, {
            name: response.data.data.name,
            username: response.data.data.username,
            email: response.data.data.email,
            no_telp: response.data.data.no_telp,
            photo_url: response.data.data.photo_url,
            addresses: [response.data.data.address],
          })
        } else {
          throw new Error(response.data.message || 'Failed to fetch profile data')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchUserProfile()

    const formatPhoneNumber = (phoneNumber) => {
      if (!phoneNumber) return ''
      return phoneNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
    }

    const setAsPrimaryAddress = (index) => {
      console.log('Setting primary address at index:', index)
      user.addresses.forEach((addr) => (addr.is_default = false))
      user.addresses[index].is_default = true
    }

    const confirmDeleteAddress = (index) => {
      console.log('Deleting address at index:', index)
      if (user.addresses[index].is_default && user.addresses.length > 1) {
        const newPrimaryIndex = index === 0 ? 1 : 0
        user.addresses[newPrimaryIndex].is_default = true
      }
      user.addresses.splice(index, 1)
    }

    const addAddress = (newAddress) => {
      console.log('Adding new address:', newAddress)
      user.addresses.push(newAddress)
      showAddAddressModal.value = false
    }

    const handleEditAddress = (index) => {
      console.log('Editing address at index:', index)
      selectedAddressIndex.value = index
      showEditAddressModal.value = true
    }

    const updateAddress = (index, updatedAddress) => {
      console.log('Updating address at index:', index, updatedAddress)
      if (updatedAddress.is_default) {
        user.addresses.forEach((addr) => (addr.is_default = false))
      }
      user.addresses[index] = updatedAddress
      showEditAddressModal.value = false
    }

    const updateProfile = (updatedProfile) => {
      console.log('Updating profile:', updatedProfile)
      Object.assign(user, updatedProfile)
      showEditProfileModal.value = false
    }

    const changePassword = () => {
      console.log('Password changed')
      showChangePasswordModal.value = false
    }

    const changePhoto = (file) => {
      console.log('Changing photo:', file)
      const reader = new FileReader()
      reader.onload = (e) => {
        user.photo_url = e.target.result
      }
      reader.readAsDataURL(file)
      showChangePhotoModal.value = false
    }

    const handleOpenChangePhotoModal = () => {
      console.log('Opening ChangePhotoModal')
      showChangePhotoModal.value = true
    }

    const handleOpenAddAddressModal = () => {
      console.log('Opening AddAddressModal')
      showAddAddressModal.value = true
    }

    const handleOpenEditProfileModal = () => {
      console.log('Opening EditProfileModal')
      showEditProfileModal.value = true
    }

    const handleOpenChangePasswordModal = () => {
      console.log('Opening ChangePasswordModal')
      showChangePasswordModal.value = true
    }

    const handleCloseChangePhotoModal = () => {
      console.log('Closing ChangePhotoModal')
      showChangePhotoModal.value = false
    }

    const handleCloseAddAddressModal = () => {
      console.log('Closing AddAddressModal')
      showAddAddressModal.value = false
    }

    const handleCloseEditAddressModal = () => {
      console.log('Closing EditAddressModal')
      showEditAddressModal.value = false
    }

    const handleCloseEditProfileModal = () => {
      console.log('Closing EditProfileModal')
      showEditProfileModal.value = false
    }

    const handleCloseChangePasswordModal = () => {
      console.log('Closing ChangePasswordModal')
      showChangePasswordModal.value = false
    }

    const handleLogout = () => {
      console.log('Logging out')
      localStorage.removeItem('token')
      router.push('/login')
    }

    return {
      user,
      showAddAddressModal,
      showEditAddressModal,
      showEditProfileModal,
      showChangePasswordModal,
      showChangePhotoModal,
      selectedAddressIndex,
      formatPhoneNumber,
      setAsPrimaryAddress,
      confirmDeleteAddress,
      addAddress,
      handleEditAddress,
      updateAddress,
      updateProfile,
      changePassword,
      changePhoto,
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

<style>
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
