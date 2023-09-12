import { createRouter, createWebHashHistory } from 'vue-router'
// import HelloWorld from '../components/HelloWorld.vue'
import GraphPage from '../pages/KnowledgeGraphPage/index.vue'

const routes = [
	{ path: '/', component: GraphPage }
]

const router = createRouter({
	history: createWebHashHistory(),
	routes: routes
})

export default router