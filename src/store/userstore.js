import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userName: '',
    password: '',
    token: '',
    userInfo: null,
    isAuthenticated: false,
  }),
  actions: {
    // 设置用户信息（登录后调用）
    setUserInfo(info, userName, maybePassword) {
      if (typeof info === 'object') {
        const payload = info || {}
        this.userInfo = payload
        this.userName = payload.userName || ''
        this.password = payload.password || ''
        this.token = payload.token ?? ''
        this.isAuthenticated = true
      } else {
        this.userName = userName || ''
        this.password = maybePassword || ''
        this.token = ''
        this.isAuthenticated = !!this.userName
      }

      // 可选：仍保存到 localStorage（不用于自动登录）
      if (this.userName) localStorage.setItem('u', this.userName)
      if (this.password) localStorage.setItem('p', this.password)
      localStorage.setItem('token', this.token)
      if (this.userInfo && Object.keys(this.userInfo).length) {
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      }
    },
    // 仅作数据恢复用，但不设置 isAuthenticated，避免刷新后自动登录
    loadFromStorage() {
      this.userName = localStorage.getItem('u') || ''
      this.password = localStorage.getItem('p') || ''
      this.token = localStorage.getItem('token') || ''
      const info = localStorage.getItem('userInfo')
      this.userInfo = info ? JSON.parse(info) : null
      this.isAuthenticated = false
    },
    logout() {
      this.userInfo = null
      this.userName = ''
      this.password = ''
      this.token = ''
      this.isAuthenticated = false
      localStorage.removeItem('u')
      localStorage.removeItem('p')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})

