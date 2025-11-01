<template>
<el-dialog
  :model-value="modelValue"
  @update:modelValue="emit('update:modelValue', $event)"
  title="流水记录"
  width="90%"
  top="5vh"
  :close-on-click-modal="false"
>

    <div class="dialog-body">
<el-table :data="records" border stripe v-loading="loading">
  <el-table-column prop="id" label="记录ID" width="90" />
  <el-table-column prop="projectId" label="项目ID" width="100" />
  <el-table-column prop="lineId" label="线路ID" width="100" />
  <el-table-column prop="phoneNumber" label="手机号" min-width="140" />
  <el-table-column prop="code" label="验证码" min-width="120" />
    <el-table-column prop="price" label="价格 (¥)" width="120" align="center">
  <template #default="{ row }">
    <span :style="{ color: row.price < 0 ? '#f56c6c' : '#67c23a' }">
      {{ row.price?.toFixed?.(2) ?? '0.00' }}
    </span>
  </template>
</el-table-column>
  <el-table-column prop="ledgerType" label="账本类型" width="100">
    <template #default="{ row }">
      <el-tag v-if="row.ledgerType === 1" type="success">入账</el-tag>
      <el-tag v-else type="danger">出账</el-tag>
    </template>
  </el-table-column>

  <el-table-column prop="fundType" label="资金类型" width="100">
    <template #default="{ row }">
      <el-tag v-if="row.fundType === 0" type="warning">业务扣费</el-tag>
      <el-tag v-else type="info">后台操作</el-tag>
    </template>
  </el-table-column>

  <el-table-column prop="createTime" label="创建时间" width="180" />
  <el-table-column prop="updateTime" label="更新时间" width="180" />
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
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>

    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from "vue"
import { ElMessage } from "element-plus"
import { viewAgentUserLedger } from "@/api/api.js"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})

const emit = defineEmits(["update:modelValue"])

const records = ref([])
const loading = ref(false)
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 获取流水记录
const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await viewAgentUserLedger(currentPage.value, pageSize.value)
    if (res.code === 0 && res.data) {
      const { records: items, total: t } = res.data
      records.value = items || []
      total.value = t || 0
    } else {
      records.value = []
      total.value = 0
      if (res?.message) {
        ElMessage.warning(res.message)
      }
    }
  } catch (err) {
    console.error("加载流水记录失败：", err)
    ElMessage.error("加载流水记录失败")
  } finally {
    loading.value = false
  }
}

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page
  fetchRecords()
}

// 监听弹窗打开状态
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      fetchRecords()
    }
  }
)

// 绑定关闭
watch(
  () => props.modelValue,
  (val) => {
    if (!val) emit("update:modelValue", false)
  }
)
</script>

<style scoped lang="scss">
.dialog-body {
  padding: 10px;

  .pagination {
    margin-top: 15px;
    text-align: right;
  }
}
</style>
