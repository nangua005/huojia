<template>
  <div style="padding: 20px">
    <h1>货架列表</h1>
    <el-form @submit.prevent>
      <el-form-item label="新增货架编号">
        <el-input v-model="newShelf" placeholder="如 A01" style="width: 200px; margin-right: 10px;" />
        <el-button type="primary" @click="addShelf">添加</el-button>
      </el-form-item>
    </el-form>
    <el-divider />
    <el-table :data="shelves" style="width: 100%" border>
      <el-table-column prop="shelfNo" label="货架编号" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" size="small" @click="goToShelf(scope.row.shelfNo)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllShelves, addShelf as saveShelf } from '../useShelfDB'

const shelves = ref([])
const newShelf = ref('')
const router = useRouter()

const loadShelves = async () => {
  shelves.value = await getAllShelves()
}

const addShelf = async () => {
  if (!newShelf.value.trim()) return
  await saveShelf(newShelf.value.trim()) // ✅ 调用改名后的 saveShelf
  newShelf.value = ''
  loadShelves()
}
const goToShelf = (shelfNo) => {
  router.push(`/shelf/${shelfNo}`)
}
onMounted(loadShelves)
</script>
