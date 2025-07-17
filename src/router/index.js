import { createRouter, createWebHashHistory } from 'vue-router'
import ShelfListView from '../views/ShelfListView.vue'
import SearchView from '../views/SearchView.vue'
import ShelfDetailView from '../views/ShelfDetailView.vue'

const routes = [
  { path: '/shelf/:shelfNo', component: ShelfDetailView },
  { 
    path: '/shelf/:shelfNo/:area',
    name: 'AreaDetail',
    component: () => import('../views/AreaDetailView.vue')
  },
  { path: '/', component: ShelfListView },
  { path: '/search', component: SearchView }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
