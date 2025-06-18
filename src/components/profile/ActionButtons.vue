<template>
  <section class="space-y-6 flex flex-col items-center justify-center">
    <button
      class="w-[25vw] min-w-[200px] bg-red-600 text-white py-3 px-4 rounded-xl text-lg font-semibold hover:bg-red-700 transition-colors text-center"
      @click="$emit('open-change-password-modal')"
    >
      Ganti Password
    </button>
    <button
      class="w-[25vw] min-w-[200px] bg-red-600 text-white py-3 px-4 rounded-xl text-lg font-semibold hover:bg-red-700 transition-colors text-center"
      @click="$emit('logout')"
    >
      Log Out
    </button>
  </section>
</template>
