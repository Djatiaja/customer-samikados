<template>
  <HeaderAfterLogin />

  <div class="p-4 md:p-6 lg:p-8">
    <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Notifikasi</h2>
    <div>
      <NotifCard
        v-for="(notif, index) in notifications"
        :key="index"
        :title="notif.title"
        :message="notif.message"
        :date_time="notif.date_time"
      />
    </div>
  </div>
</template>

<script>
import HeaderAfterLogin from '@/components/HeaderAfterLogin.vue'
import NotifCard from '@/components/NotifCard.vue'

export default {
  components: { HeaderAfterLogin, NotifCard },
  data() {
    return {
      notifications: [
        {
          id: 1,
          title: 'Sistem',
          message: 'Halo Anastasia! Selamat bergabung dengan SAMIKADOS.',
          date_time: '20 Oktober 2024, 10:00 AM',
          read: false,
        },
        {
          id: 2,
          title: 'Sistem',
          message: 'Pengumuman: Pemeliharaan sistem akan dilakukan pada 25 Oktober 2024.',
          date_time: '21 Oktober 2024, 09:15 AM',
          read: false,
        },
        {
          id: 3,
          title: 'Laporan',
          message: 'Laporan bulanan Anda telah selesai diproses.',
          date_time: '22 Oktober 2024, 14:30 PM',
          read: true,
        },
      ],
    }
  },
}
</script>
