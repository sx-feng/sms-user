<template>
  <div class="dashboard-page">
<div class="top-ba">
  <div class="left">
    <div class="section-title">控制面板</div>
  </div>

  <div class="right">
    <el-button type="danger" size="small" @click="handleLogout">
      退出登录
    </el-button>
  </div>
</div>
<NoticeBar />
    <!-- 顶部操作区域 -->
    <el-card class="top-card" shadow="hover">
      <div class="top-bar">
        <!-- 取号控制 -->
        <div class="section vertical">
          <div class="section-title">取号控制</div>
          <div class="section-content">
            <el-button
              :type="takingNumber ? 'danger' : 'primary'"
              @click="handleTakeNumber"
            >
              {{ takingNumber ? '取消取号' : '取号' }}
            </el-button>
            <el-input-number v-model="takeCount" :min="1" :max="10" size="small" />
          </div>
        </div>

        <!-- 账户信息 -->
        <div class="section vertical">
          <div class="section-title">账户信息</div>
          <div class="section-content">
            <el-button @click="handleCheckUser" size="small" type="primary">查询账户余额</el-button>
          </div>
        </div>

        <!-- 流水记录 -->
        <div class="section vertical">
          <div class="section-title">流水记录</div>
          <div class="section-content">
            <el-button @click="handleCheckFlow" size="small" type="primary">查询流水</el-button>
          </div>
        </div>

        <!-- 筛选设置 -->
        <div class="section vertical">
          <div class="section-title">筛选设置</div>
          <div class="section-content">
            <el-input
              v-model="filterKey"
              placeholder="请输入筛选卡密"
              size="small"
              style="width:160px"
              @blur="saveFilterKey"
            />
            <el-select
              v-model="filterCpi"
              placeholder="选择筛选项目"
              size="small"
              style="width:140px"
            >
              <el-option
                v-for="app in screeningApps"
                :key="app.value"
                :label="app.label"
                :value="app.value"
              />
            </el-select>
            <el-select
              v-model="filterState"
              placeholder="筛选状态"
              size="small"
              style="width:120px"
            >
              <el-option
                v-for="option in screeningStateOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-switch v-model="filterEnabled" active-text="启用筛选" />
          </div>
        </div>
      </div>

      <!-- 第二排：项目ID + 线路选择 -->
      <div class="filter-row">
        <!-- 项目 ID 模块 -->
        <div class="section vertical">
          <div class="section-title">项目 ID</div>
          <div class="section-content">
            <el-input
              v-model="projectId"
              placeholder="请输入项目ID"
              size="small"
            />
          </div>
        </div>

        <!-- 线路选择模块 -->
        <div class="section vertical">
          <div class="section-title">线路选择</div>
          <div class="section-content">
            <el-select
              v-model="selectedLine"
              placeholder="请选择线路"
              size="small"
            >
              <el-option
                v-for="line in lineList"
                :key="resolveLineId(line)"
                :label="resolveLineLabel(line)"
                :value="resolveLineId(line)"
              />
            </el-select>
          </div>
        </div>
      </div>

      <div v-if="statusMessage" :class="['status-text', `status-text--${statusType}`]">
        {{ statusMessage }}
      </div>
    </el-card>

    <!-- 取号记录表格 -->

    <el-card class="record-card" shadow="hover">
      <div class="table-header">
        <div class="title">
          号码获取记录
          <span class="table-hint">提示：点击手机号或验证码可自动复制</span>
        </div>
        <div class="actions">
          <el-button @click="getRecordList" :loading="loading">刷新</el-button>
          <el-dropdown>
            <el-button>每页 {{ pageSize }}</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="size in [10, 20, 50]" :key="size" @click="pageSize=size">{{ size }} 条/页</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <el-table :data="recordList" border stripe >
        <el-table-column prop="projectId" label="项目ID" width="100" />
        <el-table-column prop="lineId" label="线路ID" width="100" />

        <el-table-column prop="phoneNumber" label="手机号" min-width="150">
          <template #default="{ row }">
            <span
              class="copyable"
              @click.stop="copyValue(row.phoneNumber, '手机号')"
            >
              {{ row.phoneNumber }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="筛选状态" min-width="160">
          <template #default="{ row }">
            <div class="screening-cell">
              <el-tag
                v-if="row.screeningStateLabel"
                :type="getScreeningTagType(row.screeningStateLabel)"
                effect="plain"
              >
                {{ row.screeningStateLabel }}
              </el-tag>
              <span v-else>-</span>
              <span
                v-if="row.screeningMessage && row.screeningMessage !== row.screeningStateLabel"
                class="screening-note"
              >
                {{ row.screeningMessage }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="验证码" min-width="120">
          <template #default="{ row }">
            <template v-if="row.code && row.code !== '-'">
              <span
                class="copyable"
                @click.stop="copyValue(row.code, '验证码')"
              >
                {{ row.code }}
              </span>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="取码耗时" width="150">
          <template #default="{ row }">
            <template v-if="row.isLocal">
              <el-progress
                :percentage="Math.min(row.progress ?? 0, 100)"
                :stroke-width="8"
                :show-text="false"
              />
              <span class="time-text">{{ formatSeconds(row.time) }}</span>
            </template>
            <template v-else>
              <span class="time-text time-text__invalid">失效</span>
            </template>
          </template>
        </el-table-column>

<el-table-column label="状态" width="120">
  <template #default="{ row }">
    <el-tag :type="getStatusTagType(row)">
      {{ getStatusLabel(row) }}
    </el-tag>
  </template>
</el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              link
              :loading="row.retrying"
              :disabled="row.retrying"
              @click="handleRetryFetchCode(row)"
            >
              重新获取验证码
            </el-button>
          </template>
        </el-table-column>

      </el-table>

      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" @current-change="handlePageChange" />
      </div>
    </el-card>

    <RecordDialog v-model="recordDialogVisible" />


    <!-- 页脚 -->
    <div class="footer">© 2025 汇科 版权所有</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/userstore'
import { getBalance, getNumber ,listNumbers ,listProjectLines,getCode} from '@/api/api'
import { SCREENING_APPS, SCREENING_STATE_OPTIONS, retryCheckPhoneNumberState } from '@/utils/phoneScreening'
import RecordDialog from '@/components/RecordDialog.vue'
import NoticeBar from '@/components/NoticeBar.vue'
// const currentPhoneNumber = ref('')
 const takeCount = ref(1)
const filterEnabled = ref(false)
const screeningApps = SCREENING_APPS
const screeningStateOptions = SCREENING_STATE_OPTIONS
const defaultCpi = screeningApps[0]?.value || ''
const filterCpi = ref(localStorage.getItem('filterCpi') || defaultCpi)
const filterState = ref(localStorage.getItem('filterState') || 'both')
const filterKey = ref((localStorage.getItem('filterKey') || '').trim())
const projectId = ref('')
const selectedLine = ref('')
const lineList = ref([])
const recordDialogVisible = ref(false)
// 当前是否正在取号中
const takingNumber = ref(false)
// 是否取消轮询
const cancelFetch = ref(false)
// 状态提示文本
const statusMessage = ref('')
const statusType = ref('info')
// 最新验证码
const lastCode = ref('')
// 当前取号尝试次数
const takeAttemptCount = ref(0)
const activeTakeSession = ref(null)
const activeProjectId = ref('')
const activeLineId = ref('')
const waitingForLineSelection = ref(false)

function pushStatus(message, type = 'info', { toast = false } = {}) {
  statusMessage.value = message
  statusType.value = type
  if (toast) {
    const t = ['success', 'warning', 'error', 'info'].includes(type) ? type : 'info'
    ElMessage[t](message)
  }
}


const recordList = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)


// 内部计时器：用于动态刷新“取码耗时”与进度条
let progressTimer = null

// 模拟获取线路列表
const getLineList = async () => {
  lineList.value = [
   
  ]
}

function saveFilterKey() {
  const token = (filterKey.value || '').trim()
  filterKey.value = token
  localStorage.setItem('filterKey', token)
  if (token) {
    ElMessage.success('✅ 筛选卡密已保存')
  } else {
    ElMessage.info('筛选卡密已清空')
  }
}

function saveFilterConfig() {
  localStorage.setItem('filterCpi', filterCpi.value || '')
  localStorage.setItem('filterState', filterState.value || 'both')
}

watch(filterCpi, saveFilterConfig)
watch(filterState, saveFilterConfig)

if (!filterCpi.value && defaultCpi) {
  filterCpi.value = defaultCpi
}
if (!screeningStateOptions.some(item => item.value === filterState.value)) {
  filterState.value = 'both'
}
watch(filterEnabled, (enabled) => {
  if (!enabled) return

  const token = (filterKey.value || '').trim()
  if (!token) {
    ElMessage.warning('请先填写筛选卡密')
    filterEnabled.value = false
    return
  }

  if (!filterCpi.value) {
    ElMessage.warning('请先选择筛选项目')
    filterEnabled.value = false
    return
  }

  filterKey.value = token
  localStorage.setItem('filterKey', token)
})

saveFilterConfig()

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const resolveLineId = (line) => {
  if (line && typeof line === 'object') {
    return line.id ?? line.lineId ?? line.value ?? ''
  }
  return line ?? ''
}

const resolveLineLabel = (line) => {
  if (line && typeof line === 'object') {
    return line.name ?? line.label ?? `线路 ${resolveLineId(line)}`
  }
  const id = resolveLineId(line)
  return id ? `线路 ${id}` : '未知线路'
}

const pickFirstLineId = (lines = []) => {
  if (!Array.isArray(lines) || !lines.length) return ''
  return resolveLineId(lines[0])
}

const formatSeconds = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0 秒'
  return `${seconds} 秒`
}

const isTakeSessionActive = (sessionId) => activeTakeSession.value === sessionId

const copyValue = async (rawValue, label = '内容') => {
  const text = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue ?? '').trim()
  if (!text || text === '-') {
    ElMessage.warning(`${label}为空，无法复制`)
    return
  }
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success(`${label}已复制`)
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error(`${label}复制失败，请手动复制`)
  }
}

watch(selectedLine, (newVal, oldVal) => {
  const normalizedNew = resolveLineId(newVal)
  const normalizedOld = resolveLineId(oldVal)

  if (!normalizedNew) {
    activeLineId.value = ''
    if (takingNumber.value) {
      waitingForLineSelection.value = true
      if (normalizedOld) {
        pushStatus('取号状态: 当前线路已清空，请选择新的线路继续', 'warning')
      }
    }
    return
  }

  activeProjectId.value = projectId.value
  activeLineId.value = normalizedNew
  waitingForLineSelection.value = false

  if (
    takingNumber.value &&
    normalizedOld !== undefined &&
    String(normalizedNew) !== String(normalizedOld)
  ) {
    pushStatus(`取号状态: 已切换至线路 ${normalizedNew}，同步更新取号任务`, 'info')
  }
})

const MAX_CODE_WAIT_SECONDS = 300

const parseListResponse = (res) => {
  if (!res?.data?.records) {
    return { items: [], total: 0 }
  }

  const records = res.data.records.map(r => ({
    ...r,
    isLocal: false,
    localStartTime: null,
    progress: 0,
    time: null,
    finished: !!r.codeReceivedTime,
  }))

  return {
    items: records,
    total: res.data.total || 0,
  }
}




const getRecordList = async () => {
  loading.value = true
  try {
    const res = await listNumbers(currentPage.value, pageSize.value)
    
    if (res.ok || res.code === 0) {
      const { items, total: t } = parseListResponse(res)
      recordList.value = items
      total.value = t
    } else {
      recordList.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

// 取号
const userStore = useUserStore()
const handleTakeNumber = async () => {
  // 🔹 正在取号则取消
  if (takingNumber.value) {
    cancelTakeNumber()
    return
  }
  const u = localStorage.getItem('u')
  const p = localStorage.getItem('p')
  if (!u || !p) {
    ElMessage.error('未登录，无法取号')
    return
  }
  if (!projectId.value || !selectedLine.value) {
    ElMessage.warning('请先选择项目和线路')
    return
  }
  const trimmedToken = (filterKey.value || '').trim()
  const selectedCpi = filterCpi.value
  saveFilterConfig()

  if (filterEnabled.value) {
    if (!trimmedToken) {
      ElMessage.warning('启用筛选前请先填写筛选卡密')
      return
    }
    if (!selectedCpi) {
      ElMessage.warning('启用筛选前请先选择筛选项目')
      return
    }
  }

  filterKey.value = trimmedToken
  localStorage.setItem('filterKey', trimmedToken)
  activeProjectId.value = projectId.value
  activeLineId.value = resolveLineId(selectedLine.value)
  waitingForLineSelection.value = false
  const sessionId = Symbol('take-session')
  activeTakeSession.value = sessionId
  // 初始化状态
  takeAttemptCount.value = 0
  cancelFetch.value = false
  takingNumber.value = true
  loading.value = true
  pushStatus(`取号状态: 开始批量取号，共需 ${takeCount.value} 个号码`, 'info')

  let successCount = 0
  const maxCount = takeCount.value

  // 🔹 用 Promise.allSettled 管理并行验证码任务
  const allTasks = []

  takeLoop: for (let i = 0; i < maxCount; i++) {
    if (!isTakeSessionActive(sessionId) || cancelFetch.value) {
      break
    }
    if (!activeProjectId.value || !activeLineId.value) {
      if (!waitingForLineSelection.value) {
        pushStatus('取号状态: 暂停取号，请选择项目与线路后继续', 'warning')
      }
      waitingForLineSelection.value = true
      await delay(1000)
      i--
      continue takeLoop
    }
    waitingForLineSelection.value = false
    const currentProjectId = activeProjectId.value
    const currentLineId = activeLineId.value
    takeAttemptCount.value++
    pushStatus(`取号状态: 暂无号码，第 ${takeAttemptCount.value} 次获取`, 'info')

    try {
      if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
      const res = await getNumber(currentProjectId, currentLineId, filterEnabled.value)
      if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
      if (res?.code === 0 && res.data) {
        const phone = res.data

        const newRecord = {
          projectId: currentProjectId,
          lineId: currentLineId,
          phoneNumber: phone,
          code: '-',
          status: filterEnabled.value ? '筛选中' : '等待中',
          time: 0,
          progress: 0,
          getNumberTime: new Date().toISOString(),
          screeningState: filterEnabled.value ? 'pending' : 'disabled',
          screeningStateLabel: filterEnabled.value ? '筛选中' : '未启用',
          screeningMessage: filterEnabled.value ? '正在筛选' : '筛选未启用',
          screeningAttempts: 0,
          isLocal: true,
          localStartTime: Date.now(),
          finished: false,
        }
        recordList.value.unshift(newRecord)
        total.value++

        if (filterEnabled.value) {
          try {
            if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
            const screeningResponse = await retryCheckPhoneNumberState(
              { phone, token: trimmedToken, cpid: selectedCpi },
              { retries: 3, retryDelay: 1000 },
            )
            if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
            const label = screeningResponse?.label || ''
            const message = screeningResponse?.message || label || ''

            setRecordScreening(phone, {
              screeningState: label,
              screeningStateLabel: label || '筛选失败',
              screeningMessage: message,
              screeningAttempts: screeningResponse?.attempt || 1,
            })

            if (!isScreeningAccepted(label, screeningResponse?.status)) {
              updateRecordStatus(phone, '筛选未通过', '-', 0)
              pushStatus(`取号状态: 号码 ${phone} 未通过筛选，准备重新获取`, 'warning')
              await delay(1000)
              if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
              i--
              continue takeLoop
            }

            updateRecordStatus(phone, '等待中', '-', 0)
          } catch (screenErr) {
            setRecordScreening(phone, {
              screeningState: '',
              screeningStateLabel: '筛选失败',
              screeningMessage: screenErr.message || '筛选失败',
              screeningAttempts: screenErr?.attempt || 0,
            })
            updateRecordStatus(phone, '筛选失败', '-', 0)
            pushStatus(`取号状态: 号码 ${phone} 筛选失败，原因 ${screenErr.message || '未知错误'}`, 'error')
            pushStatus(`取号状态: 筛选失败，准备重新获取号码`, 'warning')
            await delay(100)
            if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
            i--
            continue takeLoop
          }
        } else {
          setRecordScreening(phone, {
            screeningState: 'disabled',
            screeningStateLabel: '未启用',
            screeningMessage: '筛选未启用',
            screeningAttempts: 0,
          })
          updateRecordStatus(phone, '等待中', '-', 0)
        }

        successCount++
        pushStatus(`取号状态: 成功获取号码 ${phone}，请尽快使用`, 'success')
        if (successCount >= maxCount) {
          takingNumber.value = false
          loading.value = false
        }
        if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
        const task = fetchVerificationCode(phone, {
          isCancelled: () => cancelFetch.value,
        })
        allTasks.push(task)
        await delay(100)
        if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
      } else {
        pushStatus(`取号状态: 暂无号码，第 ${takeAttemptCount.value} 次获取失败，重试中`, 'warning')
        await delay(100)
        if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
        i-- // 失败不计次数
      }
    } catch (err) {
      console.error('取号异常：', err)
      pushStatus(`取号状态: 第 ${takeAttemptCount.value} 次获取出现异常，稍后重试`, 'warning')
      await delay(100)
      if (!isTakeSessionActive(sessionId) || cancelFetch.value) break takeLoop
      i-- // 失败不计次数
    }
  }
  // 🔹 等待所有验证码轮询任务完成
  const sessionStillCurrent = isTakeSessionActive(sessionId)
  const wasCancelled = cancelFetch.value
  if (wasCancelled) {
    pushStatus('取号状态: 已取消任务，停止所有后续获取', 'warning')
  } else if (sessionStillCurrent && allTasks.length) {
    pushStatus(`取号状态: 已获取 ${successCount} 个号码，等待验证码`, 'info')
  }
  await Promise.allSettled(allTasks)
  // ✅ 所有任务结束
  loading.value = false
  takingNumber.value = false
  waitingForLineSelection.value = false
  if (sessionStillCurrent) {
    activeTakeSession.value = null
  }
  cancelFetch.value = false
  if (!wasCancelled && sessionStillCurrent) {
    pushStatus(`取号状态: 批量任务完成，成功获取 ${successCount}/${maxCount} 个号码`, 'success')
  }
}

/**
 * 更新表格中对应手机号的状态
 * @param {string} phoneNumber 手机号
 * @param {'成功'|'失败'|'等待中'} status 状态
 * @param {string} [code] 验证码（可选）
 * @param {number} [time] 耗时（秒）
 */
function updateRecordStatus(phoneNumber, status, code = '-', time = null) {
  // 优先更新同手机号中“最新的一条”（避免重复手机号时更新到旧行）
  let idx = -1
  for (let i = recordList.value.length - 1; i >= 0; i--) {
    if (recordList.value[i]?.phoneNumber === phoneNumber) {
      idx = i
      break
    }
  }
  if (idx === -1) return
  const target = recordList.value[idx]

  let finalTime = Number.isFinite(time) && time >= 0 ? time : null
  let startTs = target?.localStartTime ?? null
  if (!startTs && target?.getNumberTime) {
    const parsed = new Date(target.getNumberTime).getTime()
    if (!Number.isNaN(parsed)) startTs = parsed
  }
  if (finalTime === null && startTs) {
    finalTime = Math.max(0, Math.floor((Date.now() - startTs) / 1000))
  }
  if (finalTime === null) finalTime = 0
  finalTime = Math.min(finalTime, MAX_CODE_WAIT_SECONDS)

  target.isLocal = true
  if (!target.localStartTime && startTs) {
    target.localStartTime = startTs
  }
  target.status = status
  target.code = code
  target.time = finalTime
  target.progress = Math.min((finalTime / MAX_CODE_WAIT_SECONDS) * 100, 100)
  target.finished = status !== '等待中'

  if (status === '成功') {
    target.codeReceivedTime = new Date().toISOString()
  }
}

function setRecordScreening(phoneNumber, payload = {}) {
  let idx = -1
  for (let i = recordList.value.length - 1; i >= 0; i--) {
    if (recordList.value[i]?.phoneNumber === phoneNumber) {
      idx = i
      break
    }
  }
  if (idx === -1) return
  const target = recordList.value[idx]
  Object.assign(target, payload)
  recordList.value = [...recordList.value]
}

const getScreeningTagType = (label) => {
  switch (label) {
    case '新号':
      return 'success'
    case '老号':
      return 'warning'
    case '筛选中':
    case '未启用':
      return 'info'
    case '检测失败':
      return 'warning'
    case '筛选失败':
    case '筛选未通过':
      return 'danger'
    default:
      return label ? 'danger' : 'info'
  }
}

const getStatusTagType = (row) => {
  if (row?.code && row.code !== '-') return 'success'
  if (row?.status === '筛选中') return 'info'
  if (row?.status === '等待中') return 'warning'
  if (row?.status === '筛选未通过' || row?.status === '筛选失败') return 'danger'
  if (row?.status === 3) return 'danger'
  return 'danger'
}

const getStatusLabel = (row) => {
  if (row?.code && row.code !== '-') return '成功'
  if (row?.status === '筛选中') return '筛选中'
  if (row?.status === '等待中') return '等待中'
  if (row?.status === '筛选未通过') return '筛选未通过'
  if (row?.status === '筛选失败') return '筛选失败'
  if (row?.status === 3) return '失败'
  return '失败'
}

function isScreeningAccepted(label, status) {
  if (status !== 0) return false
  const normalized = (label || '').trim()
  if (!normalized || normalized === '检测失败') return false
  switch (filterState.value) {
    case 'new':
      return normalized === '新号'
    case 'old':
      return normalized === '老号'
    case 'both':
      return normalized === '新号' || normalized === '老号'
    default:
      return false
  }
}
/**
 * 轮询获取验证码
 * @param {string} phoneNumber 手机号
 * @param {object} options 可选配置
 * @param {number} options.maxSeconds 最大轮询时长
 * @param {number} options.intervalMs 轮询间隔
 * @param {Function} options.isCancelled 自定义取消判断
 * @param {boolean} options.silent 是否为静默模式（避免重复提示）
 */
async function fetchVerificationCode(
  phoneNumber,
  options = {},
) {
  const {
    maxSeconds = MAX_CODE_WAIT_SECONDS,
    intervalMs = 2000,
    isCancelled = () => cancelFetch.value,
    silent = false,
  } = typeof options === 'number'
    ? { maxSeconds: options }
    : options

  try {
    const u = localStorage.getItem('u')
    const p = localStorage.getItem('p')
    if (!u || !p) {
      pushStatus('验证码状态: 未登录，无法获取验证码', 'warning', { toast: true })
      return { status: 'invalid' }
    }

    if (!phoneNumber) {
      pushStatus('验证码状态: 当前记录缺少手机号，请先取号', 'warning', { toast: true })
      return { status: 'invalid' }
    }

    const intro = silent
      ? `验证码状态: 重新获取验证码，手机号 ${phoneNumber}`
      : `验证码状态: 开始获取验证码，手机号 ${phoneNumber}`
    pushStatus(intro, 'info')

    const startTime = Date.now()
    let tryCount = 0
    const target = recordList.value.find(r => r.phoneNumber === phoneNumber)
    if (target) {
      target.localStartTime = startTime
      target.isLocal = true
    }
/* eslint-disable */ 
    while (true) {
      if (isCancelled()) {
        pushStatus('验证码状态: 已取消获取', 'warning')
        updateRecordStatus(phoneNumber, '失败')
        return { status: 'cancelled' }
      }

      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
      if (elapsedSeconds >= maxSeconds) {
        pushStatus(`验证码状态: 超出 ${MAX_CODE_WAIT_SECONDS} 秒等待时长，停止获取`, 'warning')
        updateRecordStatus(phoneNumber, '失败')
        return { status: 'timeout' }
      }

      tryCount += 1
      const elapsed = tryCount * (intervalMs / 1000)
      const progress = Math.min((elapsed / maxSeconds) * 100, 99)

      updateRecordStatus(phoneNumber, '等待中', '-', Math.floor(elapsed))
      const target = recordList.value.find(r => r.phoneNumber === phoneNumber)
      if (target) {
        target.progress = progress
      }

      const res = await getCode(phoneNumber)
      if (res?.code === 0 && res.data) {
        pushStatus(`验证码状态: 获取成功，验证码 ${res.data}`, 'success')
        lastCode.value = res.data

        updateRecordStatus(
          phoneNumber,
          '成功',
          res.data,
          Math.floor((Date.now() - startTime) / 1000),
        )

        recordList.value = [...recordList.value]
        return { status: 'success', code: res.data }
      }

      await delay(intervalMs)
    }
  } catch (err) {
    console.error('❌ 获取验证码异常:', err)
    pushStatus('验证码状态: 请求异常，请检查网络或接口', 'error', { toast: true })
    updateRecordStatus(phoneNumber, '失败')
    return { status: 'error', error: err }
  }
}

async function handleRetryFetchCode(row) {
  const phone = row?.phoneNumber
  if (!phone) {
    pushStatus('验证码状态: 当前记录缺少手机号，无法重新获取', 'warning', { toast: true })
    return
  }
  if (row?.retrying) return

  const index = recordList.value.indexOf(row)
  if (index === -1) return

  const refreshed = {
    ...recordList.value[index],
    retrying: true,
    status: '等待中',
    code: '-',
    progress: 0,
    finished: false,
    getNumberTime: new Date().toISOString(),
    codeReceivedTime: null,
    isLocal: true,
    localStartTime: Date.now(),
  }
  recordList.value = [
    ...recordList.value.slice(0, index),
    refreshed,
    ...recordList.value.slice(index + 1),
  ]

  pushStatus(`验证码状态: 重新获取验证码，手机号 ${phone}`, 'info')

  try {
    const result = await fetchVerificationCode(phone, {
      silent: true,
      isCancelled: () => false,
    })
    switch (result?.status) {
      case 'success':
        pushStatus(`验证码状态: ${phone} 验证码获取完成`, 'success')
        break
      case 'timeout':
        pushStatus(`验证码状态: ${phone} 验证码获取超时`, 'warning')
        break
      case 'cancelled':
        pushStatus(`验证码状态: ${phone} 验证码获取已取消`, 'warning')
        break
      case 'error':
        pushStatus(`验证码状态: ${phone} 验证码获取失败`, 'error', { toast: true })
        break
      case 'invalid':
        pushStatus(`验证码状态: 当前记录无效，无法重新获取 ${phone}`, 'warning', { toast: true })
        break
      default:
        pushStatus(`验证码状态: ${phone} 验证码获取未完成`, 'warning')
        break
    }
  } catch (err) {
    console.error('重新获取验证码失败:', err)
    pushStatus(`验证码状态: ${phone} 验证码获取失败`, 'error', { toast: true })
  } finally {
    let idx = -1
    for (let i = recordList.value.length - 1; i >= 0; i--) {
      if (recordList.value[i]?.phoneNumber === phone) {
        idx = i
        break
      }
    }
    if (idx !== -1) {
      const next = { ...recordList.value[idx] }
      delete next.retrying
      recordList.value = [
        ...recordList.value.slice(0, idx),
        next,
        ...recordList.value.slice(idx + 1),
      ]
    }
  }
}

// ✅ 通用取消函数（可编程调用）
function cancelTakeNumber() {
  cancelFetch.value = true
  activeTakeSession.value = null
  takingNumber.value = false
  loading.value = false
  waitingForLineSelection.value = false
  pushStatus(`取号状态: 已取消取号操作，共尝试 ${takeAttemptCount.value} 次`, 'warning')
}

// 查询账户余额
const handleCheckUser = async () => {
  const u = localStorage.getItem('u')
  const p = localStorage.getItem('p')
  
  // 检查用户是否已登录
  if (!u || !p) {
    ElMessage.error('未登录，无法查询余额')
    return
  }
  // 请求余额
  const res = await getBalance(u, p)
  if (res.code === 0) {
    // 成功，处理返回的数据并显示余额
    const balance = res.data || '-'
    console.log(res.data,"uhgwesfiyhweiuf")
    ElMessage.success(`查询成功，当前余额：${balance}`)
    
  } else {
    // 查询失败，显示错误信息
    ElMessage.error(res.msg || '查询失败')
  }
}
// 流水记录弹窗
const handleCheckFlow = () => {
  recordDialogVisible.value = true
}
// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page
  getRecordList()
}
// 退出登录
const router = useRouter()
function handleLogout() {
  userStore.logout()          // ✅ 现在有了
  ElMessage.success('已退出登录')
  router.replace({ name: 'login' })
}
watch(projectId, async (newVal, oldVal) => {
  if (!newVal) {
    lineList.value = []
    selectedLine.value = ''
    activeProjectId.value = ''
    activeLineId.value = ''
    waitingForLineSelection.value = false
    return
  }

  activeProjectId.value = newVal

  if (takingNumber.value && newVal !== oldVal) {
    waitingForLineSelection.value = true
    activeLineId.value = ''
  }

  try {
    const res = await listProjectLines(newVal)
    if (res.code === 0) {
      const lines = res.data || []
      lineList.value = lines
      ElMessage.success(res.msg || '获取线路成功')

      if (takingNumber.value) {
        selectedLine.value = ''
        activeProjectId.value = newVal
        activeLineId.value = ''
        waitingForLineSelection.value = true
        pushStatus('取号状态: 项目已切换，请选择新的线路继续取号', 'warning')
      } else {
        const firstId = pickFirstLineId(lines)
        selectedLine.value = firstId
        activeProjectId.value = newVal
        activeLineId.value = firstId
        waitingForLineSelection.value = false
      }
    } else {
      lineList.value = []
      if (takingNumber.value) {
        pushStatus('取号状态: 未获取到新的线路，暂停取号', 'warning')
        waitingForLineSelection.value = true
        activeLineId.value = ''
      }
      ElMessage.warning(res.msg || '未获取到线路信息')
    }
  } catch (err) {
    ElMessage.error('加载线路失败')
    console.error(err)
    if (takingNumber.value) {
      waitingForLineSelection.value = true
      activeLineId.value = ''
      pushStatus('取号状态: 加载线路失败，取号暂停等待线路选择', 'error')
    }
  }
})
onMounted(() => {
  getLineList()
  getRecordList()
  // 每秒刷新一次未完成记录的进度与耗时（基于实时时间）
  
})


onUnmounted(() => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
})
</script>

<style scoped lang="scss">
html, body {
  margin: 0;
  padding: 0;
}
.top-ba {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  background: #fff;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.dashboard-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

.logout-float-btn {
  position: fixed;
  bottom: 30px; /* 距离底部10像素 */
  right: 100px;  /* 距离右侧10像素 */
  
  box-shadow: 0 3px 10px rgba(0,0,0,0.25);
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 600;

}

.top-card {
  .top-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between; /* ✅ 平均分布 */
    gap: 20px; /* ✅ 间距统一为 20，与下方保持一致 */

    .section {
      flex: 1; /* ✅ 平均占宽 */
      min-width: 260px; /* ✅ 保证小屏不挤 */
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      background: #fff;
      // border: 1px solid #eee;
      border-radius: 8px;
      padding: 10px 15px;
    //  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
 
      .section-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
        font-size: 14px;
        margin-left: 2px;
      }

      .section-content {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;

        .el-input,
        .el-select,
        .el-input-number {
          width: 100%;
        }
      }
    }
  }
}

  .record-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .title {
        font-weight: 600;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .actions {
        display: flex;
        gap: 10px;
      }
    }

    .screening-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .screening-note {
      font-size: 12px;
      color: #909399;
    }

    .time-text {
      font-size: 12px;
      color: #666;
      margin-left: 5px;
    }

    .time-text__invalid {
      color: #c0c4cc;
      margin-left: 0;
    }

    .table-hint {
      font-size: 12px;
      font-weight: 400;
      color: #909399;
    }

    .copyable {
      color: #409eff;
      cursor: pointer;
      transition: color 0.2s;
    }

    .copyable:hover {
      color: #66b1ff;
      text-decoration: underline;
    }

    .pagination {
      margin-top: 15px;
      text-align: right;
    }
  }

  .footer {
    margin-top: 30px;
    text-align: center;
    color: #999;
    font-size: 12px;
  }
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  // margin-top: 15px;

  .section.vertical {
    flex: 1;
    min-width: 260px; /* 防止过窄 */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: #fff;
    // border: 1px solid #eee;
    // border-radius: 8px;
    padding: 10px 15px;
    // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

    .section-title {
      font-weight: 600;
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
      margin-left: 2px; /* 与输入框左对齐 */
    }

    .section-content {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;

      .el-input,
      .el-select {
        width: 100%;
      }
    }
  }
}
.status-text {
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 6px;
  background: #f5f7fa;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  border-left: 4px solid #409eff;

  &--success {
    background: #f0f9eb;
    border-left-color: #67c23a;
    color: #529b2e;
  }

  &--warning {
    background: #fdf6ec;
    border-left-color: #e6a23c;
    color: #b88230;
  }

  &--error {
    background: #fef0f0;
    border-left-color: #f56c6c;
    color: #c45656;
  }

  &--info {
    background: #f5f9ff;
    border-left-color: #409eff;
    color: #409eff;
  }
}


</style>
