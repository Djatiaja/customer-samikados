import ForgotPassword from '@/Auth/ForgotPassword.vue'
import Login from '@/Auth/Login.vue'
import OtpPage from '@/Auth/OtpPage.vue'
import Register from '@/Auth/Register.vue'
import ResetPassword from '@/Auth/ResetPassword.vue'
import VerificationEmail from '@/Auth/VerificationEmail.vue'
import AccountSetting from '@/Main/AccountSetting.vue'
import Cart from '@/Main/Cart.vue'
import CategoryView from '@/Main/CategoryView.vue'
import Checkout from '@/Main/Checkout.vue'
import DetailProduct from '@/Main/DetailProduct.vue'
import HomeAfterLogin from '@/Main/HomeAfterLogin.vue'
import HomeBeforeLogin from '@/Main/HomeBeforeLogin.vue'
import NotFoundPage from '@/Main/NotFoundPage.vue'
import Notification from '@/Main/Notification.vue'
import Orders from '@/Main/Orders.vue'
import RedirectPage from '@/Main/RedirectPage.vue'
import ReviewOrder from '@/Main/ReviewOrder.vue'
import SearchResults from '@/Main/SearchResults.vue'
import TrackOrder from '@/Main/TrackOrder.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/samikados' },
  { path: '/login', component: Login, meta: { requiresGuest: true } },
  { path: '/register', component: Register, meta: { requiresGuest: true } },
  { path: '/verification', component: VerificationEmail },
  { path: '/forgot-password', component: ForgotPassword, meta: { requiresGuest: true } },
  { path: '/otp-password', component: OtpPage, meta: { requiresGuest: true } },
  { path: '/reset-password', component: ResetPassword, meta: { requiresGuest: true } },
  { path: '/not-found', component: NotFoundPage },
  { path: '/redirect-page', component: RedirectPage },
  { path: '/samikados', component: HomeBeforeLogin },
  { path: '/home', component: HomeAfterLogin, meta: { requiresAuth: true } },
  { path: '/category', component: CategoryView },
  { path: '/product-details/:id', component: DetailProduct },
  { path: '/product-details', redirect: '/samikados' },
  { path: '/orders', component: Orders, meta: { requiresAuth: true } },
  { path: '/cart', component: Cart, meta: { requiresAuth: true } },
  { path: '/notifications', component: Notification, meta: { requiresAuth: true } },
  { path: '/checkout', component: Checkout, meta: { requiresAuth: true } },
  { path: '/track-order', component: TrackOrder, meta: { requiresAuth: true } },
  { path: '/review-order', component: ReviewOrder, meta: { requiresAuth: true } },
  { path: '/account-settings', component: AccountSetting, meta: { requiresAuth: true } },
  { path: '/search-results', component: SearchResults, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Middleware untuk autentikasi
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = token && token.trim() !== '' && token !== 'null' && token !== 'undefined'

  console.log('Navigating to:', to.path)
  console.log('Token exists:', !!token)
  console.log('Token value:', token)
  console.log('Is Authenticated:', isAuthenticated)

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return next('/home')
  }

  next()
})

export default router
