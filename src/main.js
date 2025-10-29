import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 开发需求：不自动从 localStorage 恢复登录状态
// import { useUserStore } from '@/store/userstore'
// const userStore = useUserStore()
// userStore.loadFromStorage && userStore.loadFromStorage()

app.mount('#app')


