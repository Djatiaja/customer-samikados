<template>
  <section class="mt-10 space-y-4 flex flex-col items-center justify-center">
    <button
      class="w-2/5 bg-red-600 text-white py-3 rounded-xl"
      @click="$emit('open-change-password-modal')"
    >
      Ganti Password
    </button>
    <button class="w-2/5 bg-red-600 text-white py-3 rounded-xl" @click="$emit('logout')">
      Log Out
    </button>
  </section>
</template>

<script>
export default {
  // No props or logic needed here, just emitting events
}
</script>
