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
import TrackOrder from '@/Main/TrackOrder.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/samikados' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/verification', component: VerificationEmail },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/otp-password', component: OtpPage },
  { path: '/reset-password', component: ResetPassword },
  { path: '/not-found', component: NotFoundPage },
  { path: '/redirect-page', component: RedirectPage },
  { path: '/samikados', component: HomeBeforeLogin },
  { path: '/home', component: HomeAfterLogin },
  { path: '/category', component: CategoryView },
  { path: '/product-details/:id', component: DetailProduct },
  { path: '/product-details', redirect: '/samikados' }, // Redirect to home if no ID
  { path: '/orders', component: Orders },
  { path: '/cart', component: Cart },
  { path: '/notifications', component: Notification },
  { path: '/checkout', component: Checkout },
  { path: '/track-order', component: TrackOrder },
  { path: '/review-order', component: ReviewOrder },
  { path: '/account-settings', component: AccountSetting },
  { path: '/:pathMatch(.*)*', component: NotFoundPage }, // Catch-all for unmatched routes
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
