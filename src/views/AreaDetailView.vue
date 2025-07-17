<template>
  <div style="padding: 20px">
    <!-- 返回按钮 -->
    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="goBack">返回货架详情</el-button>
    </div>

    <!-- 区域标题 -->
    <h2 style="margin-bottom: 10px">{{ shelfNo }} - {{ areaLabel(area) }} 区域</h2>

    <!-- 添加按钮 -->
    <div style="text-align: right; margin-bottom: 20px;">
      <el-button type="success" @click="dialogVisible = true">添加货物</el-button>
    </div>

    <!-- 货物列表 -->
    <el-card>
      <el-table :data="items" style="width: 100%" border>
        <el-table-column label="货物信息">
          <template #default="scope">
            <div>
              <strong>ID:</strong> {{ scope.row.id }}，
              <strong>数量:</strong> {{ scope.row.count }}
              <el-button size="small" type="danger" @click="removeItem(scope.$index)">删除</el-button>
            </div>
            <div>
              <strong>名称:</strong> {{ scope.row.name || '无' }}
              <el-button size="small" text @click="toggleExpand(scope.row)">
                {{ scope.row._expanded ? '收起' : '展开' }}
              </el-button>
            </div>
            <div v-if="scope.row._expanded" style="margin-top: 5px">
              <div><strong>标签:</strong></div>
              <div style="margin-top: 5px">
                <el-tag
                  v-for="(tag, i) in getTags(scope.row.id)"
                  :key="i"
                  closable
                  @close="removeTag(scope.row.id, i)"
                  style="margin: 2px"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-model="tagInputMap[scope.row.id]"
                  placeholder="添加标签"
                  size="small"
                  @keyup.enter="addTag(scope.row.id)"
                  style="width: 120px; margin-left: 5px"
                />
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加货物弹窗 -->
    <el-dialog
      title="添加货物"
      v-model="dialogVisible"
      width="90%"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <div style="max-height: 60vh; overflow-y: auto">
        <el-form label-position="top" label-width="80px">
          <el-form-item label="货物ID">
            <el-input v-model="newItem.id" />
            <el-button
              type="primary"
              plain
              size="small"
              style="margin-top: 5px"
              @click="scanDialogVisible = true"
            >扫码输入</el-button>
          </el-form-item>
          <el-form-item label="数量">
            <el-input-number v-model="newItem.count" :min="1" style="width: 100%" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addItem">确定</el-button>
      </template>
    </el-dialog>

    <!-- 扫码弹窗（html5-qrcode） -->
    <el-dialog
      title="扫码输入"
      v-model="scanDialogVisible"
      width="90%"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      @close="stopScan"
    >
      <div :id="scanContainerId" style="width: 100%; max-height: 260px;"></div>
      <template #footer>
        <el-button @click="stopScan">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch, onBeforeUnmount,nextTick  } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getShelfByNo, updateShelf } from '../useShelfDB'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

const route = useRoute()
const router = useRouter()
const shelfNo = route.params.shelfNo
const area = route.params.area
const shelfData = ref(null)

const dialogVisible = ref(false)
const scanDialogVisible = ref(false)
const scanContainerId = 'html5qr-code'

let scanner = null

const newItem = ref({ id: '', count: 1 })
const items = computed(() => shelfData.value?.areas[area] || [])

const tagMap = ref({})
const tagInputMap = reactive({})

const areaLabel = (a) => ({
  left: '左侧',
  center: '中间',
  right: '右侧'
}[a] || a)

const goBack = () => router.push(`/shelf/${shelfNo}`)

const loadShelf = async () => {
  const data = await getShelfByNo(shelfNo)
  if (data) {
    shelfData.value = data
    for (const item of data.areas[area]) {
      item._expanded = false
    }
  }
}

const toggleExpand = (item) => item._expanded = !item._expanded

const addItem = async () => {
  const item = { ...newItem.value, name: '', tags: [] }
  shelfData.value.areas[area].push(item)
  await updateShelf(shelfData.value)
  dialogVisible.value = false
  resetNewItem()
}

const removeItem = async (index) => {
  shelfData.value.areas[area].splice(index, 1)
  await updateShelf(shelfData.value)
}

const getTags = (id) => tagMap.value[id] || []

const addTag = (id) => {
  const input = (tagInputMap[id] || '').trim()
  if (!input) return
  if (!tagMap.value[id]) tagMap.value[id] = []
  if (!tagMap.value[id].includes(input)) tagMap.value[id].push(input)
  tagInputMap[id] = ''
}

const removeTag = (id, index) => tagMap.value[id]?.splice(index, 1)

const resetNewItem = () => newItem.value = { id: '', count: 1 }

watch(scanDialogVisible, async (visible) => {
  if (visible) {
    await nextTick() // ⬅️ 等待 DOM 渲染
    if (!scanner) {
      scanner = new Html5Qrcode(scanContainerId)
    }
    try {
      await scanner.start(
        { facingMode: "environment" },
        { 
            fps: 10,
            qrbox: { width: 250, height: 150 },
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.UPC_A
            ]
        },
        
        (decodedText) => {
          newItem.value.id = decodedText
          stopScan()
        },
        (errorMessage) => {
            console.log('尝试识别失败:', errorMessage)
        }
      )
    } catch (err) {
      alert("扫码失败：" + err)
      stopScan()
    }
  } else {
    stopScan()
  }
})

const stopScan = async () => {
  scanDialogVisible.value = false

  if (scanner) {
    try {
      await scanner.stop()    // 先关闭扫码
      await scanner.clear()   // 再清除 DOM 和资源
      scanner = null
    } catch (err) {
      console.warn('停止扫码失败：', err)
    }
  }
}


onMounted(loadShelf)
onBeforeUnmount(async () => {
  if (scanner && scanner.getState() === 2) {
    try {
      await scanner.stop()
    } catch {}
    scanner.clear()
  }
})
</script>
