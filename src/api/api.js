import { request } from "@/utils/request";
/* ====== 用户层接口（agent 角度调用） ====== */

// 登录并获取详细信息
export const getUserInfo = (userName, password) =>
  request(0, '/api/user/info', { userName, password },true)

// 查询账户余额
export const getUserBalance = (userName, password) =>
  request(0, '/api/user/getBalance', { userName, password }, true)
// 获取号码（取号）
export const getNumber = (userName, password, projectId, lineId) =>
  request(0, '/api/user/getNumber', { userName, password, projectId, lineId }, true)
// 获取验证码（取码）
export const getCode = (userName, password, phoneNumber) =>
  request(0, '/api/user/getCode', { userName, password, phoneNumber }, true)
// 查询号码记录（分页）
export const listNumbers = (userName, password, status, startTime, endTime, page = 1, size = 10) =>
  request(0, '/api/user/listNumbers', { userName, password, status, startTime, endTime, page, size }, true)

// 修改密码
export const updatePassword = ({ userName, oldPassword, newPassword }) =>
  request(1, '/api/user/update/passward', { userName, oldPassword, newPassword }, true)

// 获取公告
export const getNotice = () => request(0, '/api/user/notice', {}, true)

// 查询用户项目列表
export const listUserProjects = (userName, password) =>
  request(0, '/api/user/by-user/listProjects', { userName, password }, true)

// 查询项目可用线路
export const listProjectLines = (userName, password, projectId) =>
  request(0, '/api/user/listProjectLines', { userName, password, projectId }, true)

/* ====== 代理层接口（agent 角度调用） ====== */

// 下级账单流水（GET，Query 参数）
export const viewAgentUserLedger = (params) =>
  request(0, '/api/agent/subordinate-ledgers', params, true)

// 代理仪表盘统计
export const getAgentDashboard = () =>
  request(0, '/api/agent/dashboard-stats', {}, true)                                                                              