<template>
  <div class="dashboard-page">
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
          <el-button @click="handleCheckUser" size="small" type="primary">
            查询账户余额
          </el-button>
        </div>

        <!-- 流水记录 -->
        <div class="section">
          <div class="section-title">流水记录</div>
          <el-button @click="handleCheckFlow" size="small" type="primary">
            查询流水
          </el-button>
        </div>

        <!-- 筛选设置 -->
        <div class="section">
          <div class="section-title">筛选设置</div>
          <el-switch v-model="filterEnabled" active-text="启用筛选" />
        </div>
      </div>

      <div class="filter-row">
        <el-input
          v-model="projectId"
          placeholder="请输入项目ID"
          style="width: 180px"
          size="small"
        />
        <el-select v-model="selectedLine" placeholder="请选择线路" size="small" style="width: 180px">
          <el-option
            v-for="line in lineList"
            :key="line.id"
            :label="line.name"
            :value="line.id"
          />
        </el-select>
      </div>
    </el-card>

    <!-- 取号记录表格 -->
    <el-card class="record-card" shadow="hover">
      <div class="table-header">
        <div class="title">号码获取记录</div>
        <div class="actions">
          <el-button @click="getRecordList" :loading="loading" icon="Refresh">刷新</el-button>
          <el-dropdown>
            <el-button>
              每页 {{ pageSize }} 条<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="size in [10, 20, 50]" :key="size" @click="pageSize=size">{{ size }} 条</el-dropdown-item>
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
            <el-tag
              v-if="row.status === '成功'"
              type="success"
              >成功</el-tag>
            <el-tag
              v-else-if="row.status === '等待中'"
              type="warning"
              >等待中</el-tag>
            <el-tag
              v-else
              type="danger"
              >失败</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 页脚 -->
    <div class="footer">
      © 2024 手机号与验证码获取平台. 版权所有.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'


const takeCount = ref(1)
const filterEnabled = ref(false)
const projectId = ref('')
const selectedLine = ref('')
const lineList = ref([])

const recordList = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)

// 模拟获取线路列表
const getLineList = async () => {
  lineList.value = [
    { id: 201, name: '线路 A' },
    { id: 202, name: '线路 B' },
    { id: 203, name: '线路 C' },
  ]
}

// 模拟获取取号记录
const getRecordList = async () => {
  loading.value = true
  setTimeout(() => {
    recordList.value = [
      { projectId: '1001', lineId: '201', phone: '+86 138 **** 1234', code: '123456', time: 3.2, progress: 65, status: '成功' },
      { projectId: '1002', lineId: '203', phone: '+86 139 **** 5678', code: '', time: 1.8, progress: 30, status: '等待中' },
      { projectId: '1001', lineId: '202', phone: '+86 137 **** 9101', code: '987654', time: 5.7, progress: 95, status: '失败' },
      { projectId: '1003', lineId: '205', phone: '+86 135 **** 1121', code: '456789', time: 2.5, progress: 50, status: '成功' },
      { projectId: '1002', lineId: '201', phone: '+86 135 **** 3141', code: '', time: 1.1, progress: 20, status: '等待中' },
    ]
    total.value = 20
    loading.value = false
  }, 600)
}

// 按钮方法/////////////////////////
// 取号方法///////////////////////
const handleTakeNumber = () => {
  ElMessage.success(`已请求取号：${takeCount.value} 个`)
}
// 查询账户余额////////////////
const handleCheckUser = () => {
  ElMessage.info('查询账户余额中...')
}
// 流水记录弹窗////////////
const handleCheckFlow = () => {
  ElMessage.info('打开流水记录弹窗')
}
// 页面切换//////////
const handlePageChange = (page) => {
  currentPage.value = page
  getRecordList()
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
