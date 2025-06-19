import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faStar, faCopy } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import 'moment/locale/id'

moment.locale('id')
library.add(faStar, faCopy)
const app = createApp(App)

app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
