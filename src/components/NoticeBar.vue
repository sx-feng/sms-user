<template>
  <div class="notice-bar" v-if="mergedNotice">
    <el-icon><BellFilled /></el-icon>

    <!-- 滚动区域 -->
    <div class="scroll-container">
      <div class="scroll-content" ref="scrollContent">
        <span v-html="mergedNotice"></span>
        <span v-html="mergedNotice"></span> <!-- 第二份用于无缝循环 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { BellFilled } from '@element-plus/icons-vue'
import { getNotice } from '@/api/api.js'

const mergedNotice = ref('')
const scrollContent = ref(null)

async function loadNotices() {
  try {
    const res = await getNotice()
    console.log('公告接口响应', res)

    if (!res.ok) return console.warn('加载公告失败:', res.message)

    const d = res.data
    let notices = []

    if (typeof d === 'string') {
      notices = [d]
    } else if (Array.isArray(d)) {
      notices = d.map(it => it.title ?? it.noticeTitle ?? it.name ?? it.content ?? it.noticeContent ?? it.desc ?? '')
    } else if (d && typeof d === 'object') {
      const list = d.records || d.list || d.rows || []
      notices = list.map(it => it.title ?? it.noticeTitle ?? it.name ?? it.content ?? it.noticeContent ?? it.desc ?? '')
    }

    // 拼接为单行公告（多个公告用间隔符隔开）
    mergedNotice.value = notices.join('　　｜　　') || '暂无系统公告'

    await nextTick()
    startMarquee()
  } catch (e) {
    console.warn('公告接口异常', e)
  }
}

// 🌟 横向滚动动画
function startMarquee() {
  const content = scrollContent.value
  if (!content) return


  const contentWidth = content.scrollWidth / 2 // 一半的长度（因为重复了两份）
  let offset = 0
  const speed = 1 // 滚动速度：每次移动像素
  const delay = 20 // 时间间隔(ms)

  function scroll() {
    offset -= speed
    if (Math.abs(offset) >= contentWidth) {
      offset = 0
    }
    content.style.transform = `translateX(${offset}px)`
  }

  clearInterval(content._timer)
  content._timer = setInterval(scroll, delay)

  // 🖱️ 鼠标悬停暂停滚动
  content.addEventListener('mouseenter', () => clearInterval(content._timer))
  content.addEventListener('mouseleave', () => {
    clearInterval(content._timer)
    content._timer = setInterval(scroll, delay)
  })
}

onMounted(loadNotices)
</script>

<style scoped>
.notice-bar {
  display: flex;
  align-items: center;
  background-color: #fffbe6;
  border: 1px solid #ffecb3;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  color: #333;
  overflow: hidden;
}

.scroll-container {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  margin-left: 8px;
}

.scroll-content {
  display: inline-block;
  white-space: nowrap;
  animation: scroll linear infinite;
  will-change: transform;
}

.scroll-content span {
  display: inline-block;
  padding-right: 50px; /* 公告间隔距离 */
}

.scroll-content:hover {
  animation-play-state: paused;
}
</style>
