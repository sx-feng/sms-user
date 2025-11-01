import { authRequest as auth } from "./auth";

/* ====== 用户层接口（agent 角度调用） ====== */

// 登录并获取详细信息（携带用户名/密码）
export const getUserInfo = (userName, password) =>
  auth(0, '/api/user/info', { userName, password }, true)

// 查询账户余额

export const getBalance = () =>
  auth(0, '/api/user/getBalance', {}, true)

// 获取号码（取号）
export const getNumber = (projectId, lineId,filterEnabled) =>
  auth(0, '/api/user/getNumber', { projectId, lineId ,filterEnabled}, true)

// 获取验证码（取码）
export const getCode = (phoneNumber) => {
  return auth(0, '/api/user/getCode', { phoneNumber }, true);
}

// 查询号码记录（分页）
export const listNumbers = (page = 1, size = 10) =>
  auth(0, '/api/user/listNumbers', { page, size }, true)

// 修改密码（接口路径按现有保持）
export const updatePassword = ({ oldPassword, newPassword }) => {
  return auth(1, '/api/user/update/passward', { oldPassword, newPassword }, true);
}

// 获取公告
export const getNotice = () =>
  auth(0, '/api/user/notice', {}, true)

// 获取用户项目列表
export const listUserProjects = () =>
  auth(0, '/api/user/by-user/listProjects', {}, true)

// 获取项目线路
export const listProjectLines = (projectId) =>
  auth(0, '/api/user/listProjectLines', { projectId }, true)


/* ====== 代理层接口（agent 角度调用） ====== */

// 下级账单流水（GET，Query 参数）
export const viewAgentUserLedger = ( page = 1, size = 10) =>
  auth(0, '/api/user/ledger/list', { page, size},true)            

// 获取代理仪表盘数据
export const getAgentDashboard = () =>
  auth(0, '/api/agent/dashboard-stats', {}, true)

export const updateUserPassword = (data) =>
    auth(1, '/api/user/update/passward', data)