import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 全局样式：body 背景、#app 居中容器等都放在这里
import '@/styles/global.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
