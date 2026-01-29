<template>
  <div class="file-upload-section bg-white rounded-lg shadow-md p-4 sm:p-6">
    <h3 class="text-lg sm:text-xl font-semibold mb-4">Upload File Design</h3>

    <!-- Mode Selection Dropdown -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Metode Input:</label>
      <select
        v-model="inputMode"
        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-600 focus:border-red-600"
        @change="handleModeChange"
      >
        <option value="file">Upload File</option>
        <option value="link">Paste Link</option>
      </select>
    </div>

    <!-- Upload Area (File Mode) -->
    <div
      v-if="inputMode === 'file'"
      class="upload-area border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors duration-200"
      :class="{
        'border-red-600 bg-red-50': isDragging,
        'border-gray-300 hover:border-red-600': !isDragging,
      }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="flex flex-col items-center">
        <svg
          class="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p class="text-sm sm:text-base text-gray-600 mb-2">
          Drag & drop file di sini atau
        </p>
        <button
          type="button"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base transition-colors"
          @click="$refs.fileInput.click()"
        >
          Pilih File
        </button>
        <p class="text-xs text-gray-500 mt-3">
          Format: PDF, JPG, PNG | Max: {{ maxFileSizeMB }}MB per file
        </p>
      </div>
    </div>

    <!-- Link Input Area (Link Mode) -->
    <div v-if="inputMode === 'link'" class="link-input-area">
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-2">URL File Design:</label>
        <input
          v-model="linkInput"
          type="url"
          placeholder="https://example.com/file.pdf"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-600 focus:border-red-600"
          @keyup.enter="addLink"
        />
        <p class="text-xs text-gray-500 mt-2">
          Masukkan link file design (PDF, JPG, PNG). Pastikan link bisa diakses.
        </p>
      </div>
      <button
        type="button"
        class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base transition-colors"
        @click="addLink"
      >
        Tambah Link
      </button>
    </div>

    <!-- Uploaded Files List -->
    <div v-if="fileMetadata.length > 0" class="mt-6 space-y-3">
      <h4 class="text-base sm:text-lg font-semibold">File yang Diupload ({{ fileMetadata.length }})</h4>

      <div
        v-for="(metadata, index) in fileMetadata"
        :key="metadata.id"
        class="flex items-center justify-between bg-gray-50 p-3 sm:p-4 rounded-lg"
      >
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <!-- File Icon -->
          <div class="flex-shrink-0">
            <!-- Link Icon -->
            <svg
              v-if="metadata.isLink"
              class="w-8 h-8 sm:w-10 sm:h-10 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- PDF Icon -->
            <svg
              v-else-if="metadata.type && metadata.type.includes('pdf')"
              class="w-8 h-8 sm:w-10 sm:h-10 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- Image Preview -->
            <img
              v-else-if="metadata.preview"
              :src="metadata.preview"
              :alt="metadata.name"
              class="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded"
            />
            <!-- Generic File Icon -->
            <svg
              v-else
              class="w-8 h-8 sm:w-10 sm:h-10 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm sm:text-base font-medium text-gray-900 truncate">
              {{ metadata.name || metadata.link }}
            </p>
            <p v-if="metadata.size" class="text-xs sm:text-sm text-gray-500">
              {{ formatFileSize(metadata.size) }}
            </p>
            <p v-if="metadata.isLink" class="text-xs sm:text-sm text-blue-600">
              Link URL
            </p>
          </div>
        </div>

        <!-- Remove Button -->
        <button
          type="button"
          class="ml-3 text-red-600 hover:text-red-800 transition-colors"
          @click="removeFile(index)"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Check Price Button -->
    <div v-if="showCheckPrice && uploadedFiles.length > 0" class="mt-6">
      <button
        type="button"
        class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isCheckingPrice || !productVariantId"
        @click="checkFilePrice"
      >
        <span v-if="isCheckingPrice" class="flex items-center justify-center">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Mengecek Harga...
        </span>
        <span v-else>Cek Harga</span>
      </button>
    </div>

    <!-- Price Estimation Result -->
    <div v-if="priceEstimation" class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 class="text-base sm:text-lg font-semibold text-blue-900 mb-3">Estimasi Harga</h4>
      <div class="space-y-2 text-sm sm:text-base">
        <div class="flex justify-between">
          <span class="text-gray-700">Total File:</span>
          <span class="font-semibold">{{ priceEstimation.file_count }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-700">Total Halaman:</span>
          <span class="font-semibold">{{ priceEstimation.total_pages }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-700">Harga Variant:</span>
          <span class="font-semibold">{{ formatPrice(priceEstimation.variant_price) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-700">Harga Finishing:</span>
          <span class="font-semibold">{{ formatPrice(priceEstimation.finishing_price) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-700">Harga per Halaman:</span>
          <span class="font-semibold">{{ formatPrice(priceEstimation.price_per_page) }}</span>
        </div>
        <div class="border-t border-blue-300 pt-2 mt-2">
          <div class="flex justify-between text-lg">
            <span class="text-gray-900 font-bold">Total:</span>
            <span class="text-red-600 font-bold">{{
              formatPrice(priceEstimation.total_price)
            }}</span>
          </div>
        </div>
      </div>

      <!-- File Details -->
      <div v-if="priceEstimation.file_details" class="mt-4 pt-4 border-t border-blue-200">
        <p class="text-sm font-semibold text-gray-700 mb-2">Detail File:</p>
        <div
          v-for="(detail, idx) in priceEstimation.file_details"
          :key="idx"
          class="text-xs sm:text-sm text-gray-600 flex justify-between"
        >
          <span>{{ detail.file_name }}</span>
          <span>{{ detail.page_count }} halaman</span>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-sm sm:text-base text-red-800">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref, shallowRef, onUnmounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'FileUploadSection',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    productVariantId: {
      type: [Number, String],
      default: null,
    },
    productFinishingId: {
      type: [Number, String],
      default: null,
    },
    showCheckPrice: {
      type: Boolean,
      default: true,
    },
    maxFileSizeMB: {
      type: Number,
      default: 50,
    },
    maxFiles: {
      type: Number,
      default: 10,
    },
  },
  emits: ['update:modelValue', 'price-checked'],
  setup(props, { emit }) {
    const fileInput = ref(null)
    // Use shallowRef to prevent deep reactivity on File objects
    const uploadedFiles = shallowRef([])
    const isDragging = ref(false)
    const isCheckingPrice = ref(false)
    const priceEstimation = ref(null)
    const errorMessage = ref('')
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const token = localStorage.getItem('token')

    // Input mode and link input
    const inputMode = ref('file')
    const linkInput = ref('')

    // Store file metadata separately (lightweight)
    const fileMetadata = ref([])

    const handleModeChange = () => {
      errorMessage.value = ''
      linkInput.value = ''
    }

    const addLink = () => {
      errorMessage.value = ''

      if (!linkInput.value.trim()) {
        errorMessage.value = 'Silakan masukkan URL terlebih dahulu'
        return
      }

      // Validate URL format
      try {
        const url = new URL(linkInput.value)
        if (!url.protocol.startsWith('http')) {
          errorMessage.value = 'URL harus dimulai dengan http:// atau https://'
          return
        }
      } catch {
        errorMessage.value = 'Format URL tidak valid'
        return
      }

      // Check max files limit
      if (uploadedFiles.value.length >= props.maxFiles) {
        errorMessage.value = `Maksimal ${props.maxFiles} file`
        Swal.fire({
          title: 'Batas File Tercapai',
          text: errorMessage.value,
          icon: 'warning',
          confirmButtonColor: '#dc2626',
        })
        return
      }

      // Check if link already exists
      const existingLink = fileMetadata.value.find(
        (f) => f.isLink && f.link === linkInput.value
      )
      if (existingLink) {
        errorMessage.value = 'Link ini sudah ditambahkan'
        return
      }

      // Add link metadata
      const linkData = {
        id: Date.now() + Math.random(),
        isLink: true,
        link: linkInput.value,
        name: linkInput.value.split('/').pop() || 'Link File',
      }

      fileMetadata.value.push(linkData)
      uploadedFiles.value.push(linkData)

      // Emit immediately
      emit('update:modelValue', [...uploadedFiles.value])

      linkInput.value = ''

      Swal.fire({
        title: 'Link Berhasil Ditambahkan',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    }

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      processFiles(files)
    }

    const handleDrop = (event) => {
      isDragging.value = false
      const files = Array.from(event.dataTransfer.files)
      processFiles(files)
    }

    const processFiles = (files) => {
      errorMessage.value = ''
      const maxSize = props.maxFileSizeMB * 1024 * 1024

      // Check max files limit
      if (uploadedFiles.value.length + files.length > props.maxFiles) {
        errorMessage.value = `Maksimal ${props.maxFiles} file. Anda sudah memiliki ${uploadedFiles.value.length} file.`
        Swal.fire({
          title: 'Batas File Tercapai',
          text: errorMessage.value,
          icon: 'warning',
          confirmButtonColor: '#dc2626',
        })
        return
      }

      const newFiles = []
      const newMetadata = []

      files.forEach((file) => {
        // Validate file type
        if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
          errorMessage.value = `File ${file.name} tidak didukung. Gunakan PDF, JPG, atau PNG.`
          return
        }

        // Validate file size
        if (file.size > maxSize) {
          errorMessage.value = `File ${file.name} terlalu besar. Maksimal ${props.maxFileSizeMB}MB.`
          return
        }

        // Create lightweight metadata for display
        const metadata = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          isLink: false,
          preview: null,
        }

        // Create preview URL only for small images
        if (file.type.startsWith('image/') && file.size < 5 * 1024 * 1024) {
          metadata.preview = URL.createObjectURL(file)
        }

        newMetadata.push(metadata)
        newFiles.push(file)
      })

      // Update metadata for display
      fileMetadata.value = [...fileMetadata.value, ...newMetadata]

      // Update actual files array (NOT reactive)
      uploadedFiles.value = [...uploadedFiles.value, ...newFiles]

      // Emit to parent immediately
      emit('update:modelValue', [...uploadedFiles.value])

      // Clear input
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const removeFile = (index) => {
      const metadata = fileMetadata.value[index]

      // Cleanup object URL to prevent memory leak
      if (metadata && metadata.preview && !metadata.isLink) {
        URL.revokeObjectURL(metadata.preview)
      }

      // Remove from both arrays
      fileMetadata.value.splice(index, 1)
      uploadedFiles.value.splice(index, 1)

      // Emit to parent
      emit('update:modelValue', [...uploadedFiles.value])

      priceEstimation.value = null
      errorMessage.value = ''
    }

    const checkFilePrice = async () => {
      if (!props.productVariantId) {
        errorMessage.value = 'Silakan pilih variant terlebih dahulu'
        return
      }

      if (uploadedFiles.value.length === 0) {
        errorMessage.value = 'Silakan upload file atau tambahkan link terlebih dahulu'
        return
      }

      isCheckingPrice.value = true
      errorMessage.value = ''

      try {
        const formData = new FormData()
        formData.append('product_variant_id', props.productVariantId)

        if (props.productFinishingId && props.productFinishingId !== '0') {
          formData.append('product_finishing_id', props.productFinishingId)
        }

        // Append files or links
        uploadedFiles.value.forEach((file, index) => {
          if (file.isLink) {
            formData.append(`files[${index}][link]`, file.link)
          } else {
            formData.append(`files[${index}][file]`, file)
          }
        })

        const response = await axios.post(
          `${baseUrl}/v2/customer/orders/check-file-price`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        if (response.data.status === 'success') {
          priceEstimation.value = response.data.data
          emit('price-checked', response.data.data)

          Swal.fire({
            title: 'Estimasi Harga Berhasil',
            text: `Total: ${formatPrice(response.data.data.total_price)}`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          })
        } else {
          throw new Error(response.data.message || 'Gagal mengecek harga')
        }
      } catch (error) {
        console.error('Check price error:', error)
        errorMessage.value =
          error.response?.data?.message || 'Gagal mengecek harga. Silakan coba lagi.'

        Swal.fire({
          title: 'Error',
          text: errorMessage.value,
          icon: 'error',
          confirmButtonColor: '#dc2626',
        })
      } finally {
        isCheckingPrice.value = false
      }
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    const formatPrice = (price) => {
      return `Rp${price.toLocaleString('id-ID')}`
    }

    // Cleanup all object URLs when component is destroyed
    onUnmounted(() => {
      fileMetadata.value.forEach((metadata) => {
        if (metadata.preview && !metadata.isLink) {
          URL.revokeObjectURL(metadata.preview)
        }
      })
    })

    return {
      fileInput,
      fileMetadata, // Use metadata for display instead of actual files
      uploadedFiles,
      isDragging,
      isCheckingPrice,
      priceEstimation,
      errorMessage,
      inputMode,
      linkInput,
      handleModeChange,
      addLink,
      handleFileSelect,
      handleDrop,
      removeFile,
      checkFilePrice,
      formatFileSize,
      formatPrice,
    }
  },
}
</script>

<style scoped>
.upload-area {
  cursor: pointer;
}
</style>
