<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <h2>Tambah Alamat Baru</h2>
      <div class="mb-3">
        <label class="block text-left mb-1">Provinsi</label>
        <select v-model="form.province_id" class="w-full p-2 border rounded">
          <option value="">Pilih Provinsi</option>
          <option v-for="province in provinces" :key="province.id" :value="province.id">
            {{ province.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="block text-left mb-1">Kabupaten/Kota</label>
        <select
          v-model="form.city_id"
          class="w-full p-2 border rounded"
          :disabled="!form.province_id"
        >
          <option value="">Pilih Kabupaten/Kota</option>
          <option v-for="regency in regencies" :key="regency.id" :value="regency.id">
            {{ regency.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="block text-left mb-1">Kecamatan</label>
        <select
          v-model="form.district_id"
          class="w-full p-2 border rounded"
          :disabled="!form.city_id"
        >
          <option value="">Pilih Kecamatan</option>
          <option v-for="district in districts" :key="district.id" :value="district.id">
            {{ district.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="block text-left mb-1">Kelurahan/Desa</label>
        <select
          v-model="form.village_id"
          class="w-full p-2 border rounded"
          :disabled="!form.district_id"
        >
          <option value="">Pilih Kelurahan/Desa</option>
          <option v-for="village in villages" :key="village.id" :value="village.id">
            {{ village.name }}
          </option>
        </select>
      </div>
      <textarea
        v-model="form.address"
        class="w-full p-2 border rounded mb-3"
        placeholder="Masukkan alamat lengkap"
      ></textarea>
      <div class="mb-3">
        <input v-model="form.is_default" type="checkbox" class="mr-2" />
        <label>Jadikan sebagai alamat utama</label>
      </div>
      <button @click="submit" class="submit-btn mr-2">Tambah</button>
      <button @click="$emit('close')" class="close-btn">Batal</button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import axios from 'axios'

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
    const provinces = ref([])
    const regencies = ref([])
    const districts = ref([])
    const villages = ref([])
    const form = ref({
      province_id: '',
      city_id: '',
      district_id: '',
      village_id: '',
      address: '',
      is_default: false,
    })

    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          'https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json',
        )
        provinces.value = response.data
      } catch (error) {
        console.error('Error fetching provinces:', error)
      }
    }

    const fetchRegencies = async (provinceId) => {
      try {
        const response = await axios.get(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`,
        )
        regencies.value = response.data
      } catch (error) {
        console.error('Error fetching regencies:', error)
      }
    }

    const fetchDistricts = async (regencyId) => {
      try {
        const response = await axios.get(
          `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`,
        )
        districts.value = response.data
      } catch (error) {
        console.error('Error fetching districts:', error)
      }
    }

    const fetchVillages = async (districtId) => {
      try {
        const response = await axios.get(
          `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`,
        )
        villages.value = response.data
      } catch (error) {
        console.error('Error fetching villages:', error)
      }
    }

    fetchProvinces()

    watch(
      () => form.value.province_id,
      async (newProvinceId) => {
        if (newProvinceId) {
          regencies.value = []
          districts.value = []
          villages.value = []
          await fetchRegencies(newProvinceId)
        }
      },
    )

    watch(
      () => form.value.city_id,
      async (newCityId) => {
        if (newCityId) {
          districts.value = []
          villages.value = []
          await fetchDistricts(newCityId)
        }
      },
    )

    watch(
      () => form.value.district_id,
      async (newDistrictId) => {
        if (newDistrictId) {
          villages.value = []
          await fetchVillages(newDistrictId)
        }
      },
    )

    const submit = () => {
      if (
        !form.value.address.trim() ||
        !form.value.province_id ||
        !form.value.city_id ||
        !form.value.district_id ||
        !form.value.village_id
      ) {
        alert('Semua field harus diisi')
        return
      }
      emit('add-address', { ...form.value })
      form.value = {
        province_id: '',
        city_id: '',
        district_id: '',
        village_id: '',
        address: '',
        is_default: false,
      }
    }

    return { provinces, regencies, districts, villages, form, submit }
  },
}
</script>
