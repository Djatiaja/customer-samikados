<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <h2 class="modal-title">Ganti Foto Profil</h2>
      <div class="input-container">
        <input
          id="newProfilePhoto"
          type="file"
          accept="image/*"
          class="file-input"
          @change="previewImage"
        />
      </div>
      <div v-if="previewUrl" class="preview-container">
        <img :src="previewUrl" class="preview-image" alt="Profile preview" />
      </div>
      <div class="button-container">
        <button @click="submit" class="submit-btn">Ganti Foto</button>
        <button @click="$emit('close')" class="close-btn">Batal</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const previewUrl = ref('')

    const previewImage = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          previewUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const submit = () => {
      const fileInput = document.getElementById('newProfilePhoto') // Fixed typo
      if (!fileInput?.files?.length) {
        alert('Silakan pilih foto terlebih dahulu')
        return
      }
      emit('change-photo', fileInput.files[0])
    }

    return { previewUrl, previewImage, submit }
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
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-in-out;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  text-align: center;
}

.input-container {
  margin-bottom: 16px;
}

.file-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  cursor: pointer;
}

.file-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.preview-container {
  margin: 16px 0;
  display: flex;
  justify-content: center;
}

.preview-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.submit-btn,
.close-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.submit-btn {
  background-color: #dc2626;
  color: white;
  border: none;
}

.submit-btn:hover {
  background-color: #b91c1c;
}

.close-btn {
  background-color: #6b7280;
  color: white;
  border: none;
}

.close-btn:hover {
  background-color: #4b5563;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    padding: 16px;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .preview-image {
    width: 100px;
    height: 100px;
  }
}
</style>
