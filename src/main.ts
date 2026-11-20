import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import './assets/main.css'

document.documentElement.style.setProperty(
  '--font-kakao-url',
  `url("${import.meta.env.BASE_URL}fonts/KakaoBig-Regular.woff2")`,
)

createApp(App).use(router).mount('#app')
