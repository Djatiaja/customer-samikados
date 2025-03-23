<template>
  <header class="bg-gradient-to-r from-red-600 to-black text-white p-4">
    <div class="container mx-auto">
      <!-- Mobile Menu -->
      <div class="flex justify-between items-center lg:hidden">
        <router-link to="/home" class="flex-shrink-0">
          <h1 class="text-2xl font-bold">SAMIKADOS</h1>
        </router-link>

        <div class="flex items-center space-x-3">
          <router-link to="/cart">
            <img src="/icons/cart.svg" alt="Cart Icon" class="w-7 h-7" />
          </router-link>

          <button @click="toggleMobileMenu" class="p-1">
            <img src="/icons/bars-solid.svg" alt="Menu" class="w-6 h-6" v-if="!mobileMenuOpen" />
            <img src="/icons/bars-solid.svg" alt="Close" class="w-6 h-6" v-else />
          </button>
        </div>
      </div>

      <!-- Mobile Search (when menu is open) -->
      <div v-if="mobileMenuOpen" class="mt-4 space-y-4 lg:hidden">
        <div class="relative w-full">
          <input
            type="text"
            v-model="locationQuery"
            placeholder="Cari kota, area, atau lokasi"
            class="w-full pl-5 pr-10 py-2 rounded-full text-black focus:outline-none bg-white focus:ring-2 focus:ring-white location-input"
            @focus="showLocationDropdown = true"
            @input="filterLocations"
          />
          <img
            :src="locationQuery ? '/icons/close.svg' : '/icons/location.svg'"
            class="absolute right-3 top-3 w-4 h-4 cursor-pointer"
            @click="clearLocationSelection"
            alt="Location Icon"
          />

          <!-- Location Dropdown -->
          <div
            v-if="showLocationDropdown"
            class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-64 overflow-y-auto location-dropdown"
          >
            <div v-if="filteredLocations.length === 0" class="p-4 text-gray-500 text-center">
              Tidak ada lokasi yang ditemukan
            </div>

            <template v-else>
              <!-- Current selection -->
              <div v-if="selectedLocation" class="p-4 border-b cursor-pointer bg-gray-100">
                <div class="flex items-center text-red-600">
                  <img src="/icons/location.svg" class="mr-2 w-4 h-4" alt="Location Icon" />
                  <span class="font-semibold">Lokasi terpilih</span>
                </div>
                <div class="text-red-600 mt-1">
                  {{ selectedLocation.name }}, {{ selectedLocation.province }}
                </div>
              </div>

              <!-- Cities with agents -->
              <div class="p-4">
                <div class="text-gray-500 text-sm mb-2">LOKASI AGEN SAMIKADOS</div>
                <div
                  v-for="location in filteredLocations"
                  :key="location.id"
                  class="flex items-center text-gray-700 py-2 cursor-pointer hover:bg-gray-100"
                  @click="selectLocation(location)"
                >
                  <img src="/icons/location.svg" class="mr-2 w-4 h-4" alt="Location Icon" />
                  <span>{{ location.name }}, {{ location.province }}</span>
                </div>
              </div>
            </template>

            <div class="p-3 text-center border-t">
              <button @click="showLocationDropdown = false" class="text-gray-500">Tutup</button>
            </div>
          </div>
        </div>

        <div class="relative w-full">
          <input
            type="text"
            v-model="productQuery"
            placeholder="Cari Produk.."
            class="w-full pl-10 pr-10 py-2 rounded-full text-black focus:outline-none bg-white focus:ring-2 focus:ring-white"
          />
          <img
            src="/icons/search.svg"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            alt="Search Icon"
          />
          <img
            v-if="productQuery"
            src="/icons/close.svg"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer"
            @click="clearProductSearch"
            alt="Clear Search"
          />
        </div>

        <!-- Mobile Navigation Icons (Centered) -->
        <nav class="flex justify-center items-center space-x-8">
          <router-link to="/orders" class="flex flex-col items-center">
            <img
              :src="isActive('/orders') ? '/icons/order-active.svg' : '/icons/order.svg'"
              alt="Orders"
              class="w-6 h-6"
            />
          </router-link>

          <router-link to="/notifications" class="flex flex-col items-center">
            <img
              :src="
                isActive('/notifications')
                  ? '/icons/notification-active.svg'
                  : '/icons/notification.svg'
              "
              alt="Notifications"
              class="w-6 h-6"
            />
          </router-link>

          <router-link to="/account-settings" class="flex flex-col items-center">
            <img
              :src="
                isActive('/account-settings') ? '/icons/profile-active.svg' : '/icons/profile.svg'
              "
              alt="Profile"
              class="w-6 h-6"
            />
          </router-link>
        </nav>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden lg:flex lg:justify-between lg:items-center">
        <router-link to="/home">
          <h1 class="text-3xl font-bold">SAMIKADOS</h1>
        </router-link>

        <!-- Pencarian Lokasi -->
        <div class="relative w-1/4 mx-4">
          <div class="relative">
            <input
              type="text"
              v-model="locationQuery"
              placeholder="Cari kota, area, atau lokasi"
              autocomplete="off"
              class="w-full pl-5 pr-10 py-2 rounded-full text-black focus:outline-none bg-white focus:ring-2 focus:ring-white location-input"
              @focus="showLocationDropdown = true"
              @input="filterLocations"
            />
            <img
              :src="locationQuery ? '/icons/close.svg' : '/icons/location.svg'"
              class="absolute right-3 top-3 w-4 h-4 cursor-pointer"
              @click="clearLocationSelection"
              alt="Location Icon"
            />

            <!-- Location Dropdown -->
            <div
              v-if="showLocationDropdown"
              class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-64 overflow-y-auto location-dropdown"
            >
              <div v-if="filteredLocations.length === 0" class="p-4 text-gray-500 text-center">
                Tidak ada lokasi yang ditemukan
              </div>

              <template v-else>
                <!-- Current selection -->
                <div v-if="selectedLocation" class="p-4 border-b cursor-pointer bg-gray-100">
                  <div class="flex items-center text-red-600">
                    <img src="/icons/location.svg" class="mr-2 w-4 h-4" alt="Location Icon" />
                    <span class="font-semibold">Lokasi terpilih</span>
                  </div>
                  <div class="text-red-600 mt-1">
                    {{ selectedLocation.name }}, {{ selectedLocation.province }}
                  </div>
                </div>

                <!-- Cities with agents -->
                <div class="p-4">
                  <div class="text-gray-500 text-sm mb-2">LOKASI AGEN SAMIKADOS</div>
                  <div
                    v-for="location in filteredLocations"
                    :key="location.id"
                    class="flex items-center text-gray-700 py-2 cursor-pointer hover:bg-gray-100"
                    @click="selectLocation(location)"
                  >
                    <img src="/icons/location.svg" class="mr-2 w-4 h-4" alt="Location Icon" />
                    <span>{{ location.name }}, {{ location.province }}</span>
                  </div>
                </div>
              </template>

              <div class="p-3 text-center border-t">
                <button @click="showLocationDropdown = false" class="text-gray-500">Tutup</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pencarian Produk -->
        <div class="relative w-1/3 mx-4">
          <input
            type="text"
            v-model="productQuery"
            placeholder="Cari Produk.."
            class="w-full pl-10 pr-10 py-2 rounded-full text-black focus:outline-none bg-white focus:ring-2 focus:ring-white"
          />
          <img
            src="/icons/search.svg"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            alt="Search Icon"
          />
          <img
            v-if="productQuery"
            src="/icons/close.svg"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer"
            @click="clearProductSearch"
            alt="Clear Search"
          />
        </div>

        <!-- Ikon Navigasi -->
        <div class="flex items-center space-x-4">
          <router-link to="/cart">
            <img
              :src="isActive('/cart') ? '/icons/cart-active.svg' : '/icons/cart.svg'"
              alt="Cart Icon"
              class="w-7.5 h-7.5"
            />
          </router-link>

          <router-link to="/orders">
            <img
              :src="isActive('/orders') ? '/icons/order-active.svg' : '/icons/order.svg'"
              alt="Order Icon"
              class="w-7 h-7"
            />
          </router-link>

          <router-link to="/notifications">
            <img
              :src="
                isActive('/notifications')
                  ? '/icons/notification-active.svg'
                  : '/icons/notification.svg'
              "
              alt="Notification Icon"
              class="w-6.5 h-6.5"
            />
          </router-link>

          <router-link to="/account-settings" class="flex items-center space-x-2">
            <img
              :src="
                isActive('/account-settings') ? '/icons/profile-active.svg' : '/icons/profile.svg'
              "
              alt="User Icon"
              class="w-6.5 h-6.5"
            />
            <span class="hidden md:inline">AnastasiaPutri</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const locationQuery = ref('')
const productQuery = ref('')
const showLocationDropdown = ref(false)
const mobileMenuOpen = ref(false)
const selectedLocation = ref(null)

// Data untuk lokasi dengan agen SAMIKADOS saja
const locations = [
  { id: 1, name: 'Jakarta Pusat', province: 'DKI Jakarta' },
  { id: 2, name: 'Jakarta Selatan', province: 'DKI Jakarta' },
  { id: 3, name: 'Jakarta Barat', province: 'DKI Jakarta' },
  { id: 4, name: 'Jakarta Timur', province: 'DKI Jakarta' },
  { id: 5, name: 'Jakarta Utara', province: 'DKI Jakarta' },
  { id: 6, name: 'Surabaya', province: 'Jawa Timur' },
  { id: 7, name: 'Bandung', province: 'Jawa Barat' },
  { id: 8, name: 'Yogyakarta', province: 'DIY' },
  { id: 9, name: 'Semarang', province: 'Jawa Tengah' },
  { id: 10, name: 'Denpasar', province: 'Bali' },
]

// Computed properties for filtered locations
const filteredLocations = computed(() => {
  if (!locationQuery.value) {
    return locations
  }

  const query = locationQuery.value.toLowerCase()
  return locations.filter(
    (location) =>
      location.name.toLowerCase().includes(query) ||
      location.province.toLowerCase().includes(query),
  )
})

// Check if a route is active
const isActive = (path) => {
  return route.path === path
}

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value

  // Close dropdown when toggling menu
  if (!mobileMenuOpen.value) {
    showLocationDropdown.value = false
  }
}

// Clear location selection
const clearLocationSelection = () => {
  locationQuery.value = ''
  selectedLocation.value = null
  if (!locationQuery.value) {
    showLocationDropdown.value = !showLocationDropdown.value
  }
}

// Clear product search
const clearProductSearch = () => {
  productQuery.value = ''
}

// Filter locations as user types
const filterLocations = () => {
  if (locationQuery.value && !showLocationDropdown.value) {
    showLocationDropdown.value = true
  }
}

// Select a location
const selectLocation = (location) => {
  selectedLocation.value = location
  locationQuery.value = `${location.name}, ${location.province}`
  showLocationDropdown.value = false

  // Here you could emit an event or use a store to notify other components
  // about the location change
  console.log('Selected location:', location)
}

// Handler for clicking outside the dropdown
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.location-dropdown')
  const input = document.querySelector('.location-input')

  if (showLocationDropdown.value && dropdown && input) {
    if (!dropdown.contains(event.target) && !input.contains(event.target)) {
      showLocationDropdown.value = false
    }
  }
}
// Add click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // Set default selected location if desired
  // Example: Set Jakarta Pusat as default
  // selectedLocation.value = locations.find(loc => loc.id === 1)
})

// Clean up event listener when component is unmounted
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
