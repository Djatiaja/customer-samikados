```vue
<template>
  <HeaderAfterLogin />

  <div class="p-4 md:p-6 lg:p-8">
    <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Notifikasi</h2>
    <div>
      <NotifCard
        v-for="(notif, index) in notifications"
        :key="notif.id"
        :title="notif.title"
        :message="notif.message"
        :date_time="formatDateTime(notif.created_at)"
        :read="notif.read"
      />
      <div v-if="!notifications.length" class="text-center text-gray-500">Tidak ada notifikasi</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import NotifCard from '@/components/NotifCard.vue'

export default {
  components: { HeaderAfterLogin, NotifCard },
  setup() {
    const base_url = import.meta.env.VITE_API_BASE_URL
    const notifications = ref([])

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token autentikasi tidak ada')
        }

        const response = await axios.get(`${base_url}/seller/notifikasi`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.status === 'success') {
          notifications.value = response.data.data.map((notif) => ({
            ...notif,
            read: false, // Asumsi API tidak return read status, set default false
          }))
        } else {
          throw new Error(response.data.message || 'Gagal memuat notifikasi')
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Gagal memuat notifikasi',
        })
        console.error('Fetch notifications error:', error)
      }
    }

    const markNotificationsAsRead = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token autentikasi tidak ada')
        }

        const response = await axios.post(
          `${base_url}/seller/notifikasi`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        if (response.data.status === 'success') {
          notifications.value.forEach((notif) => (notif.read = true))
        } else {
          throw new Error(response.data.message || 'Gagal menandai notifikasi sebagai terbaca')
        }
      } catch (error) {
        console.error('Mark notifications as read error:', error)
      }
    }

    const formatDateTime = (date) => {
      return dayjs(date).format('D MMMM YYYY, h:mm A')
    }

    onMounted(() => {
      fetchNotifications()
      markNotificationsAsRead()
    })

    return { notifications, formatDateTime }
  },
}
</script>
```
