// src/store/userstore.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userName: '',
    password: '',
    userInfo: {}
  }),
  actions: {
    setUserInfo(info, userName, password) {
      this.userInfo = info
      this.userName = userName
      this.password = password
      // 可选：同时落盘，刷新不丢
      localStorage.setItem('u', userName)
      localStorage.setItem('p', password)
    },
    loadFromStorage() {
      this.userName = localStorage.getItem('u') || ''
      this.password = localStorage.getItem('p') || ''
    }
  }
})