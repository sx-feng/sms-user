import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userName: '',
    password: '',
    token: '',
    userInfo: null,
  }),
  actions: {
    // 存储用户信息
    setUserInfo(info, userName, maybePassword) {
      if (typeof info === 'object') {
        // 当传入的是对象时
        const payload = info || {}
        this.userInfo = payload
        this.userName = payload.userName || ''  // 确保 userName 不为空
        this.password = payload.password || ''  // 确保 password 不为空
        this.token = payload.token ?? ''  // 确保 token 不为空
      } else {
        // 当传入的是单独的 userName 和 password 时
        this.userName = userName || ''  // 使用前端输入的 userName
        this.password = maybePassword || ''  // 使用前端输入的 password
        this.token = ''  // 默认 token 为空
      }

      // 保存到 localStorage
      if (this.userName) localStorage.setItem('u', this.userName)
      if (this.password) localStorage.setItem('p', this.password)
      localStorage.setItem('token', this.token) // 如果后端返回了 token, 你可以在这里设置 token
      if (this.userInfo && Object.keys(this.userInfo).length) {
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      }
    },
    loadFromStorage() {
      this.userName = localStorage.getItem('u') || ''
      this.password = localStorage.getItem('p') || ''
      this.token = localStorage.getItem('token') || ''
      const info = localStorage.getItem('userInfo')
      this.userInfo = info ? JSON.parse(info) : null
    },
    logout() {
      this.userInfo = null
      this.userName = ''
      this.password = ''
      this.token = ''
      localStorage.removeItem('u')
      localStorage.removeItem('p')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
