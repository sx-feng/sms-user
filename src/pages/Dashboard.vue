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
  :loading="takingNumber && !cancelFetch"
  @click="handleTakeNumber"
>
  {{ takingNumber ? '取消取号' : '取号' }}
</el-button>
<!-- 状态提示区 -->



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
      <el-input placeholder="请输入筛选卡密" style="width:160px" />
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
          :key="line"
          :label="`线路 ${line}`"
          :value="line"
        />
      </el-select>
    </div>
  </div>
</div>


    </el-card>

    <!-- 取号记录表格 -->

    <el-card class="record-card" shadow="hover">
      <div class="table-header">
        <div class="title">号码获取记录</div>
        <div class="actions">
        <div v-if="statusMessage" class="status-bar">
  {{ statusMessage }}
</div>
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

      <el-table :data="recordList" border stripe v-loading="loading">
        <el-table-column prop="projectId" label="项目ID" width="100" />
        <el-table-column prop="lineId" label="线路ID" width="100" />

        <el-table-column prop="phoneNumber" label="手机号" min-width="150" />
        <el-table-column prop="code" label="验证码" min-width="120" />
        <el-table-column label="取码耗时" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="8" :show-text="false" />
            <span class="time-text">{{ row.time }} 秒</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === '成功'" type="success">成功</el-tag>
            <el-tag v-else-if="row.status === '等待中'" type="warning">等待中</el-tag>
            <el-tag v-else type="danger">失败</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" @current-change="handlePageChange" />
      </div>
    </el-card>

    <RecordDialog v-model="recordDialogVisible" />


    <!-- 页脚 -->
    <div class="footer">© 2024 手机号与验证码获取平台 版权所有</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/userstore'
import { getBalance, getNumber ,listNumbers ,listProjectLines,getCode} from '@/api/api'
import { watch } from 'vue'
import RecordDialog from '@/components/RecordDialog.vue'
import NoticeBar from '@/components/NoticeBar.vue'
const currentPhoneNumber = ref('')
const takeCount = ref(1)
const filterEnabled = ref(false)
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
// 最新验证码
const lastCode = ref('')


const recordList = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)
const page = ref(1)

// 模拟获取线路列表
const getLineList = async () => {
  lineList.value = [
   
  ]
}
const parseListResponse = (res) => {
  if (res?.data?.records) {
    const records = res.data.records.map(r => {
      let time = '-'
      let progress = 0

      if (r.getNumberTime && r.codeReceivedTime) {
        const start = new Date(r.getNumberTime)
        const end = new Date(r.codeReceivedTime)
        const diffSeconds = Math.round((end - start) / 1000)
        time = diffSeconds
        progress = 100
      } else if (r.getNumberTime && !r.codeReceivedTime) {
        // 未收到验证码，计算当前经过的秒数
        const start = new Date(r.getNumberTime)
        const now = new Date()
        const diff = Math.min(Math.round((now - start) / 1000), 300) // 最多300秒
        time = diff
        progress = Math.min((diff / 300) * 100, 99) // 取号超过300秒就满进度
      }

      return { ...r, time, progress }
    })
    return {
      items: records,
      total: res.data.total || 0
    }
  }
  return { items: [], total: 0 }
}



// 模拟获取取号记录
const getRecordList = async () => {
  loading.value = true
  try {
    const res = await listNumbers(page.value, pageSize.value)
    
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
  // ✅ 如果正在取号，点击则取消
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

  try {
    takingNumber.value = true
    cancelFetch.value = false
    loading.value = true
 statusMessage.value = '📞 正在获取手机号中...'
    const res = await getNumber(projectId.value, selectedLine.value, filterEnabled.value)
    if (res?.code === 0 && res.data) {
      const phone = res.data
      currentPhoneNumber.value = phone
      localStorage.setItem('phone', phone)
      ElMessage.success(`✅ 取号成功，手机号：${phone}`)
 statusMessage.value = `✅ 已获取手机号：${phone}`

    // ✅ 开始轮询验证码
    statusMessage.value = '⏳ 正在获取验证码...'
      // ✅ 开始轮询验证码
      // ✅ 立即在表格中插入一条记录（用户即时可见）
const newRecord = {
  projectId: projectId.value,
  lineId: selectedLine.value,
  phoneNumber: phone,
  code: '-', // 初始无验证码
  status: '等待中',
  time: 0,
  progress: 0,
  getNumberTime: new Date().toISOString(),
}
recordList.value.unshift(newRecord) // 插入到最上方
total.value += 1

     fetchVerificationCode(phone)
    } else {
      ElMessage.error(res?.msg || '取号失败')
       statusMessage.value = '❌ 取号失败'
    }
  } finally {
    takingNumber.value = false
    loading.value = false
  }
}


/**
 * 更新表格中对应手机号的状态
 * @param {string} phoneNumber 手机号
 * @param {'成功'|'失败'} status 状态
 * @param {string} [code] 验证码（可选）
 * @param {number} [time] 耗时（秒）
 */
function updateRecordStatus(phoneNumber, status, code = '-', time = 0) {
  const target = recordList.value.find(r => r.phoneNumber === phoneNumber)
  if (!target) return

  target.status = status
  target.progress = status === '成功' ? 100 : 100
  target.code = code
  target.time = time
}

/**
 * 轮询获取验证码
 * @param {string} phoneNumber 手机号
 * @param {number} maxSeconds 最大轮询时长（默认180秒 = 3分钟）
 * @param {number} intervalMs 每次请求间隔（默认1000ms = 1秒）
 */
async function fetchVerificationCode(phoneNumber, maxSeconds = 180, intervalMs = 2000) {
  try {
    const u = localStorage.getItem('u')
    const p = localStorage.getItem('p')
    if (!u || !p) {
      ElMessage.warning('未登录，无法获取验证码')
      return
    }

    if (!phoneNumber) {
      ElMessage.warning('未检测到手机号，请先取号')
      return
    }

    ElMessage.info(`开始获取验证码，手机号：${phoneNumber}`)
    statusMessage.value = '⏳ 正在获取验证码...'

    const startTime = Date.now()
    let tryCount = 0

    // 持续轮询直到超时或取消
    while (!cancelFetch.value) {
      if (cancelFetch.value) {
        ElMessage.info('验证码获取已取消')
        takingNumber.value = false
        statusMessage.value = '⚠️ 已取消任务'
        updateRecordStatus(phoneNumber, '失败')
        return
      }

      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
      if (elapsedSeconds >= maxSeconds) {
        ElMessage.warning('⚠️ 已超过3分钟仍未获取到验证码，任务结束')
        takingNumber.value = false
        statusMessage.value = '⚠️ 获取超时，任务已结束'
        updateRecordStatus(phoneNumber, '失败')
        return
      }

      tryCount++
      console.log(`🔁 第 ${tryCount} 次请求验证码...`)
      const res = await getCode(phoneNumber)

      if (res.code === 0 && res.data) {
        ElMessage.success(`✅ 验证码获取成功：${res.data}`)
        lastCode.value = res.data
        statusMessage.value = `✅ 验证码已获取：${res.data}`

        updateRecordStatus(phoneNumber, '成功', res.data, Math.floor((Date.now() - startTime) / 1000))
        takingNumber.value = false
        return res.data
      }

      // 每次请求间隔
      await new Promise((r) => setTimeout(r, intervalMs))
    }
  } catch (err) {
    console.error('❌ 获取验证码异常:', err)
    ElMessage.error('请求异常，请检查网络或接口')
    statusMessage.value = '❌ 请求异常，请检查网络'
    updateRecordStatus(phoneNumber, '失败')
  } finally {
    takingNumber.value = false
  }
}

// ✅ 通用取消函数（可编程调用）
function cancelTakeNumber() {
  cancelFetch.value = true
  takingNumber.value = false
  statusMessage.value = '⚠️ 已取消任务'
  ElMessage.warning('已取消取号任务')
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
watch(projectId, async (newVal) => {
  if (!newVal) {
    lineList.value = []
    selectedLine.value = ''
    return
  }
  try {
    const res = await listProjectLines(newVal)
    if (res.code === 0 ) {
      lineList.value = res.data
      ElMessage.success(res.msg||'获取线路成功')
      if (res.data.length > 0) {
        selectedLine.value = res.data[0].id // 可选默认选中
      }
    } else {
      lineList.value = []
      ElMessage.warning(res.msg || '未获取到线路信息')
    }
  } catch (err) {
    ElMessage.error('加载线路失败')
    console.error(err)
  }
})
onMounted(() => {
  getLineList()
  getRecordList()
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
      }

      .actions {
        display: flex;
        gap: 10px;
      }
    }

    .time-text {
      font-size: 12px;
      color: #666;
      margin-left: 5px;
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
.status-bar {
  margin-top: 8px;
  font-size: 13px;
  color: #409eff;
  background: #f0f9ff;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.3s;
  white-space: pre-line;
}


</style>
