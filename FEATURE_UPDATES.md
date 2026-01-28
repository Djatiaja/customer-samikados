# 🚀 Custom Product Direct Checkout - Complete Documentation

**Last Updated:** January 26, 2026  
**Version:** 2.0.0

---

## 📋 Overview

Sistem checkout telah diupgrade untuk mendukung **custom product ordering** dengan fitur upload file design dan link URL. Customer dapat:
- ✅ Upload file design (PDF, JPG, PNG) atau paste link URL
- ✅ Estimasi harga berdasarkan jumlah halaman file
- ✅ Direct checkout lebih cepat tanpa cart
- ✅ Order dengan status "Menunggu Konfirmasi Seller"
- ✅ Payment tracking dengan data real dari API

---

## 🔄 Flow Baru

```
DetailProduct/Cart → PreDirectCheckout 
  → Upload File/Link → Cek Harga (opsional)
  → Pilih Alamat/Shipping/Payment 
  → Submit Order (Status: Menunggu Konfirmasi)
  → TrackOrder (Lihat files & payment status)
```

**Note:** Cart tetap bisa dipakai, tapi checkout redirect ke PreDirectCheckout untuk upload file.

---

## 📁 New Files

### 1. FileUploadSection.vue (`src/components/`)
**Fitur:**
- Dropdown: Pilih "Upload File" atau "Paste Link"
- Upload: Drag & drop, multiple files, validasi format/size
- Link: Input URL, validasi format, no duplicate
- Mixed mode: Kombinasi file + link
- Check price dengan API `/v2/customer/orders/check-file-price`
- Preview image & icon berbeda untuk file vs link

**Props:**
```vue
<FileUploadSection
  v-model="files"
  :product-variant-id="variantId"
  :product-finishing-id="finishingId"
  @price-checked="handlePrice"
/>
```

### 2. PreDirectCheckout.vue (`src/Main/`)
**Route:** `/pre-direct-checkout?product_id=X&variant_id=Y&quantity=Z`

**Sections:**
1. Customer & Product Info
2. File Upload (FileUploadSection)
3. Address Selection
4. Shipping Method
5. Payment Method
6. Order Summary
7. Submit Button

**API:**
- `POST /v2/customer/orders/pre-direct-checkout` (get data)
- `POST /v2/customer/orders/direct-checkout` (submit order)

---

## 🔧 **MODIFIED FILES**

### **3. DetailProduct.vue**
**Changes:**
- ❌ Removed: Add to cart flow yang langsung ke old checkout
- ✅ Updated: `placeOrder()` method redirect ke `/pre-direct-checkout`
- ✅ Pass product data via query params

**Old Code:**
```javascript
const placeOrder = async () => {
  // ... validations
  // Add to cart API call
  // Then redirect to /checkout?cart_ids=[id]
}
```

**New Code:**
```javascript
const placeOrder = async () => {
  // ... validations
  router.push({
    path: '/pre-direct-checkout',
    query: {
      product_id: product.id,
      variant_id: selectedSize.value,
      finishing_id: selectedFinishing.value,
      quantity: quantity.value,
      note: note.value,
    },
  })
}
```

---

### **4. Cart.vue**
**Changes:**
- ✅ Updated: `goToCheckout()` method redirect ke `/pre-direct-checkout`
- ✅ Extract selected item data dan pass via query params
- ✅ Validation: Hanya 1 item yang bisa di-checkout

**Old Code:**
```javascript
goToCheckout() {
  // ... validations
  const cartIds = selectedItems.map((item) => item.id)
  this.$router.push({
    path: '/checkout',
    query: { cart_ids: cartIds },
  })
}
```

**New Code:**
```javModified Files

| File | Changes |
|------|---------|
| **DetailProduct.vue** | `placeOrder()` redirect ke `/pre-direct-checkout` dengan query params |
| **Cart.vue** | `goToCheckout()` redirect ke `/pre-direct-checkout`, validasi 1 item |
| **Orders.vue** | API v2: `/v2/customer/orders`, hardcoded statuses array |
| **TrackOrder.vue** | API v2: `/v2/customer/orders/{id}`, display files (file & link support), payment status dari API |
| **router/index.js** | Route baru: `/pre-direct-checkout` dengan auth guard |roduct_variant_id: 201,
  quantity: 1,
  address_id: 41,
  metode_pembayaran: "midtrans"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "item": {
      "product": { ... },
      "variant": { ... },
      "quantity": 1,
      "subtotal": 58000
    },
    "subtotal": 58000,
    "application_fee": 3000,
    "deliveries": {
      "calculate_reguler": [
        {
          "shipping_name": "JNE",
          "service_name": "REG",
          "shipping_cost_net": 10500,
          "etd": "2-3 hari"
        }
      ]
    }
  }
}
```

---

### **3. Direct Checkout**
```
POST /v2/customer/orders/direct-checkout
```

**Request (FormData):**
```javascript
{
  address_id: 41,
  product_id: 11,
  product_variant_id: 201,
  product_finishing_id: 201,      // optional
  quantity: 1,
  item_additional_info: "Catatan",
  files[0][file]: <File>,
  shipping_name: "JNE",
  service_name: "REG",
  metode_pembayaran: "midtrans"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Checkout berhasil, menunggu konfirmasi seller",
  "data": {
    "id": 664,
    "order_status_id": 7,
    "order_status": {
      "id": 7,
      "name": "Menunggu Konfirmasi"
    },
    "order_detail": [
      {
        "files": [
          {
            "id": 1,
            "file_path": "order_files/xxx.pdf",
            "file_name": "Design.pdf",
            "file_type": "application/pdf"
          }
        ]
      }
    ]
  }
}
```

---

### **4. Get Orders (Updated)**
```
GET /v2/customer/orders
```

**Response:** Paginated list dengan structure yang sama, tapi support files

---
API Endpoints v2

### 1. Check File Price
```
POST /v2/customer/orders/check-file-price
Content-Type: multipart/form-data

Body:
- product_variant_id: Number
- product_finishing_id: Number (optional)
- fileKey Features Details

### File Upload & Link Support
**Upload Mode:**
- Drag & drop atau click to browse
- Multiple files, max 10MB each
- Format: PDF, JPG, PNG

**Link Mode:**
- Paste URL (Google Drive, Dropbox, etc)
- Validasi format & duplikasi
- Mixed: Bisa kombinasi file + link

**Data Structure:**
```javascript
// File: { name, type, size, preview }
// Link: { isLink: true, link: "https://..." }
```

### Payment Status Integration (TrackOrder)
- Status dari API: `order.payment.payment_status.name`
- Color dinamis: `payment_status.color` dengan opacity
- Section "Informasi Pembayaran":
  - Payment Code, Method, Amount, Date
- Removed hardcoded payment status logic

### Validation & Security
**Client-side:**
- File type & size validation
- URL format validation
- Form completeness check
- No duplicate files/links

**Backend:**
- File sanitization & storage
- Token authentication
- API v2 endpoints with proper authorization

---

## ⚙️ Configuration

```javascript
// FileUploadSection props
maxFileSizeMB: 10
allowedFormats: ['.pdf', '.jpg', '.jpeg', '.png']

// Environment
VITE_API_BASE_URL=http://your-api-url
```

---

## 🐛 Known Limitations

1. **1 item per checkout** - Untuk simplicity
2. **No file edit** - Setelah submit tidak bisa edit
3. **No upload progress** - Future enhancement
4. **Orders.vue** - Statuses hardcoded (API endpoint tidak tersedia)

---

## ✅ Testing Checklist

**Basic Flow:**
- [ ] DetailProduct → Upload file → Checkout
- [ ] Cart → Upload link → Checkout
- [ ] Mixed file + link upload
- [ ] Check price calculation
- [ ] View files di TrackOrder
- [ ] Payment status display correct

**Edge Cases:**
- [ ] Invalid file format/size
- [ ] Invalid URL format
- [ ] Network errors
- [ ] Token expired
- [ ] Empty form submission

---

## 🎉 Summary

**New Components:**
- FileUploadSection.vue (upload file/link)
- PreDirectCheckout.vue (checkout page)

**Modified:**
- DetailProduct, Cart, Orders, TrackOrder, Router

**New APIs:**
- `/v2/customer/orders/*` endpoints

**Features:**
- ✅ File & link upload
- ✅ Price estimation
- ✅ Direct checkout flow
- ✅ Payment tracking
- ✅ Fully responsive

**Status:** Ready for production testing

---

*Documentation consolidated on