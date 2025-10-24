/* ====== 用户层 + 代理层接口（零参数版） ====== */
import { request } from '@/utils/request'
import { useUserStore } from '@/store/userstore'
import dayjs from 'dayjs'

function withAuth(biz = {}) {
  const store = useUserStore()
  return {
    userName: store.userName || localStorage.getItem('u') || '',
    password: store.password || localStorage.getItem('p') || '',
    ...biz
  }
}

/* ---------- 用户层（零参数） ---------- */
export const getUserInfo = () =>
  request(0, '/api/user/info', withAuth(), true)

export const getBalance = () =>
  request(0, '/api/user/getBalance', withAuth(), true)

export const getNumber = (projectId, lineId) =>
  request(0, '/api/user/getNumber', withAuth({ projectId, lineId }), true)

export const getCode = (phoneNumber) =>
  request(0, '/api/user/getCode', withAuth({ phoneNumber }), true)

export const listNumbers = (status, startTime, endTime, page = 1, size = 10) =>
  request(0, '/api/user/listNumbers', withAuth({
    status,
    startTime: startTime ? dayjs(startTime).format('YYYY-MM-DD HH:mm:ss') : '',
    endTime: endTime ? dayjs(endTime).format('YYYY-MM-DD HH:mm:ss') : '',
    page,
    size
  }), true)

export const updatePassword = (oldPassword, newPassword) =>
  request(1, '/api/user/update/passward', withAuth({ oldPassword, newPassword }), true)

export const getNotice = () =>
  request(0, '/api/user/notice', {}, true)

export const listUserProjects = () =>
  request(0, '/api/user/by-user/listProjects', withAuth(), true)

export const listProjectLines = (projectId) =>
  request(0, '/api/user/listProjectLines', withAuth({ projectId }), true)

/* ---------- 代理层（零参数） ---------- */
export const viewAgentUserLedger = (params) =>
  request(0, '/api/agent/subordinate-ledgers', params, true)

export const getAgentDashboard = () =>
  request(0, '/api/agent/dashboard-stats', {}, true)