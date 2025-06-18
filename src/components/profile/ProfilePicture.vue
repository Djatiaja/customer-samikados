<template>
  <div class="profile-picture-container">
    <img
      :src="user.photo_url || 'https://placehold.co/300x300'"
      class="profile-image"
      alt="Profile picture"
    />
    <button class="change-photo-btn" @click="$emit('open-change-photo-modal')">
      Ganti Foto Profil
    </button>
  </div>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style scoped>
.profile-picture-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto; /* Center horizontally */
  text-align: center; /* Center inline elements */
  padding: 16px;
}

.profile-image {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: block; /* Ensure image is a block element for centering */
  margin: 0 auto; /* Center the image horizontally */
}

.change-photo-btn {
  width: 100%;
  max-width: 250px;
  margin-top: 16px;
  padding: 12px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;
}

.change-photo-btn:hover {
  background-color: #b91c1c;
}

@media (max-width: 768px) {
  .profile-picture-container {
    padding: 12px;
  }

  .profile-image {
    max-width: 250px;
  }

  .change-photo-btn {
    padding: 10px;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .profile-picture-container {
    padding: 8px;
  }

  .profile-image {
    max-width: 200px;
  }

  .change-photo-btn {
    padding: 8px;
    font-size: 0.75rem;
  }
}
</style>
