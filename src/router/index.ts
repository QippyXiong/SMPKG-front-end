import { createRouter, createWebHashHistory } from 'vue-router'
// import HelloWorld from '../components/HelloWorld.vue'
import GraphPage from '@/pages/KnowledgeGraphPage/index.vue'
import CapaPage from '@/pages/PersonCapacity.vue'
import ControlPage  from '@/pages/DeepLearningModelPage/index.vue'
import RecordPage from '@/pages/RecordInsert.vue'

const routes = [
	{ path: '/', redirect: '/graph'},
	{ path: '/graph', component: GraphPage },
	{ path: '/person', component: CapaPage },
	{ path: '/embedding', component: RecordPage },
]

const router = createRouter({
	history: createWebHashHistory(),
	routes
})

export default router