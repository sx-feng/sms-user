<template>
  <div class="dashboard-page">
    <!-- 左上角退出按钮 -->
    <el-button class="logout-btn" type="danger" size="small" @click="handleLogout">退出登录</el-button>

    <!-- 顶部操作区域 -->
    <el-card class="top-card" shadow="hover">
      <div class="top-bar">
        <!-- 取号控制 -->
        <div class="section">
          <div class="section-title">取号控制</div>
          <el-input-number v-model="takeCount" :min="1" :max="10" size="small" />
          <el-button type="primary" @click="handleTakeNumber">取号</el-button>
        </div>

        <!-- 账户信息 -->
        <div class="section">
          <div class="section-title">账户信息</div>
          <el-button @click="handleCheckUser" size="small" type="primary">查询账户余额</el-button>
        </div>

        <!-- 流水记录 -->
        <div class="section">
          <div class="section-title">流水记录</div>
          <el-button @click="handleCheckFlow" size="small" type="primary">查询流水</el-button>
        </div>

        <!-- 筛选设置 -->
        <div class="section">
          <div class="section-title">筛选设置</div>
          <el-switch v-model="filterEnabled" active-text="启用筛选" />
        </div>
      </div>

      <div class="filter-row">
        <el-input v-model="projectId" placeholder="请输入项目ID" style="width: 180px" size="small" />
        <el-select v-model="selectedLine" placeholder="请选择线路" size="small" style="width: 180px">
          <el-option v-for="line in lineList" :key="line.id" :label="line.name" :value="line.id" />
        </el-select>
      </div>
    </el-card>

    <!-- 取号记录表格 -->
    <el-card class="record-card" shadow="hover">
      <div class="table-header">
        <div class="title">号码获取记录</div>
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

      <el-table :data="recordList" border stripe v-loading="loading">
        <el-table-column prop="projectId" label="项目ID" width="100" />
        <el-table-column prop="lineId" label="线路ID" width="100" />
        <el-table-column prop="phone" label="手机号" min-width="150" />
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
import { getBalance, getNumber ,listNumbers,listProjectLines} from '@/api/api'
import RecordDialog from '@/components/RecordDialog.vue'

const takeCount = ref(1)
const filterEnabled = ref(false)
const projectId = ref('')
const selectedLine = ref('')
const lineList = ref([])
const recordDialogVisible = ref(false)

const recordList = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)

// 模拟获取线路列表
const getLineList = async () => {
  lineList.value = [
   
  ]
}

// 模拟获取取号记录
const getRecordList = async () => {
  loading.value = true
  try {
    // 格式化时间
    const [start, end] = Array.isArray(dateRange.value) ? dateRange.value : []
    const startFormatted = start ? start.format("YYYY-MM-DD HH:mm:ss") : ""
    const endFormatted = end ? end.format("YYYY-MM-DD HH:mm:ss") : ""

    // 请求数据
    const res = await listNumbers(status.value, startFormatted, endFormatted, page.value, pageSize.value)
    
    if (res.ok || res.code === 200) {
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
    loading.value = true
    console.log(u,p)
    const res = await getNumber(u, p, projectId.value, selectedLine.value)
    if (res?.ok || res?.code === 200) {
      ElMessage.success('取号请求成功')
      getRecordList()
    } else {
      ElMessage.error(res?.message || '取号失败')
    }
  } finally {
    loading.value = false
  }
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
    ElMessage.error(res.msg || '查询败')
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

.dashboard-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .logout-btn {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1000;
  }

  .top-card {
    margin-bottom: 20px;

    .top-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;

      .section {
        display: flex;
        align-items: center;
        gap: 10px;

        .section-title {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }
      }
    }

    .filter-row {
      display: flex;
      gap: 15px;
      margin-top: 10px;
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
</style>
