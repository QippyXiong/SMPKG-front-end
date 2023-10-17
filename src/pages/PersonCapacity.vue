<template>
	<div style="height: 100%; width:fit-content; margin: 0px auto;">
		<div style="float: left; width: 800px; min-width: 400px; height: 100%; margin-right: 20px;">
			<ElInput
				placeholder="请输入要搜索人员的工号"
				v-model="personId"
			>
				<template #append>
					<ElButton :icon="Search" @click="search">搜索</ElButton>
				</template>
			</ElInput>
			<knowledgeGraphCanvas
				:nodes="nodes"
				:edges="edges"
				height="90%"
				width="100%"
				:categories="[
					{ name: '维修人员' },
					{ name: '维修记录' }
				]"
				:draggable="true"
				:tooltipFormatter="
                    (data: any) => null
                "

				:nodeLabelFormatter="
					(params: any) => {
						let data = params.data as Node
						return getMainAttrib(data.properties as Record<string, any>, data.category)
					}
				"
			>
				
			</knowledgeGraphCanvas>
		</div>
		<div style="float: left; width: 400px; height: 100%;">
			<ElScrollbar height="100%" style="width: 100%;">
				<ElTable :data="attribTableData">
					<ElTableColumn label="人员信息">
						<ElTableColumn prop="attribName" :label="undefined"/>
						<ElTableColumn prop="value" :label="undefined"/>
					</ElTableColumn>
				</ElTable>
				<div ref="capacityRadar" style="width: 400px; height: 300px;"></div>
				<div>人员能力数据</div>
			</ElScrollbar>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue'
import * as echarts from 'echarts'
import { Search } from '@element-plus/icons-vue'
import knowledgeGraphCanvas from '@/components/knowledge-graph-canvas.vue'
import { Node, Edge } from '@/components/knowledge-graph-canvas.vue'

import { SearchResponseBody, SearchRecord, RecordType, RelationRecord, EntityRecord } from '@/types/ResponseBody'
import { enkeyMapZhkey, getRecordCase, parseEdgePropertiesIntoString, getMainAttrib, parseEdgeSourceOrTarget, getTypeColor, getEntityCategory, getTypeZhkeyMap, parseCandiateProperty, getRelationCategory, enRelationMapZhRelation, zhRelationKeyZhMap } from '@/types/utils'
import { entityCategories, entityCategoriesZh } from '@/types/MaintenanceWorker'

import { parseSearchEntityResponseData } from '@/types/functions'

import { ECBasicOption } from 'echarts/types/dist/shared'


const attribTableData   :Ref<Array<{ attribName: string, value: string }>> = ref([])

function parseAttribTableDataNode(node: Node)
{
    attribTableData.value = []
    if(!node.properties || typeof node.properties == 'string') 
        return

    attribTableData.value = Object.keys(node.properties).flatMap(key => ({
        attribName: enkeyMapZhkey(key, node.category),
        value: (node.properties as Record<string, string>)[key]
    }))
}

const capacityRadar: Ref<null | HTMLDivElement> = ref(null)
const nodes: Ref<Node[]> = ref([])
const edges: Ref<Edge[]> = ref([])

const personId = ref('')

let radarChart: echarts.ECharts | null = null

let radarData = [{
			value: [5, 4, 4, 5, 5],
			name: '著名维修工平如愿'
		}]

let radarIndicator = [
		{ name: 'Sales', max: 5 },
		{ name: 'Administration', max: 5 },
		{ name: 'Information Technology', max: 5 },
		{ name: 'Customer Support', max: 5 },
		{ name: 'Development', max: 5 },
		{ name: 'Marketing', max: 5 }
]

let RadarOption: ECBasicOption = {
	type: 'radar',
	radar: {
		indicator: radarIndicator,
	},
	series: [{
		type: 'radar',
		label: '人员能力数据',
		name: '人员能力数据',
		data: radarData
	}]
}

let rates = ['未知', '初级', '中级', '高级', '资深', '专家']
let rateMapLevel: Record<string, string | number> = {}

rates.forEach((v, i)=>{
	rateMapLevel[v] = i
})

function search()
{
	fetch(`/search/entity/MaintenanceWorker`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}, body: JSON.stringify({
			properties: { uid: personId.value }, 
			relation: 'CapacityRate'
		})
	})
		.then(res=>res.json())
		.then((value: SearchResponseBody) => {
			let { ok, msg, data } = value
			if(ok) {
				radarIndicator = []
				radarData = [{
					name: personId.value,
					value: []
				}]
				for(let item of data) {
					
					if(item.type === 'Capacity') {
						radarIndicator.push({
							name: (item.record as EntityRecord)?.record?.name || '未知能力',
							max: 6
						})
					} else if(item.type === 'CapacityRate') {
						console.log('Rate', item.record.properties.level)
						radarData[0].value.push(rateMapLevel[item.record.properties.level] as number)
					}
				}
				RadarOption = {
					type: 'radar',
					tooltip: {
						show: true,
						formatter: console.log
					},
					radar: {
						indicator: radarIndicator,
					},
					series: [{
						type: 'radar',
						label: '人员能力数据',
						name: '人员能力数据',
						data: radarData
					}]
				}
				radarUpdate()
				// console.log()
			} else console.error(msg)
		})
	
	fetch(`/search/entity/MaintenanceWorker`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}, body: JSON.stringify({
			properties: { uid: personId.value }, 
			relation: 'None'
		})
	})
		.then(res=>res.json())
		.then((value: SearchResponseBody) => {
			let { ok, msg, data } = value
			if(ok) {
				let [new_nodes, new_edges] = parseSearchEntityResponseData(data)
				new_nodes[0].symbolSize = 120
				new_nodes[0].x = '50%'
				new_nodes[0].y = '50%'
				// new_nodes[0].fixed = true
				nodes.value = new_nodes
				edges.value = new_edges
				parseAttribTableDataNode(new_nodes[0])
				fetch(`/search/entity/MaintenanceWorker`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}, body: JSON.stringify({
						properties: { id: personId.value }, 
						relation: 'All'
					})
				})
					.then(res => res.json())
					.then((value: SearchResponseBody) => {
						let { ok, msg, data } = value
						if(ok) {
							let [new_nodes, new_edges] = parseSearchEntityResponseData(data)
							nodes.value = new_nodes.concat(JSON.parse(JSON.stringify(nodes.value)))
							edges.value = new_edges.concat(JSON.parse(JSON.stringify(edges.value)))
							console.log(nodes.value)
							console.log(edges.value)
							// confirm
						} else console.error(msg)
					})
			} else console.error(msg)
		})
}

function radarUpdate()
{
	if(!radarChart)
		radarChart = echarts.init(capacityRadar.value)
		radarChart?.setOption(RadarOption)
		capacityRadar.value?.addEventListener('resize',()=>{
		radarChart?.resize({
                width:  (capacityRadar.value as HTMLDivElement).clientWidth, 
                height: (capacityRadar.value as HTMLDivElement).clientHeight
            })
        })
        window.addEventListener('resize', async ()=>{
            if(capacityRadar.value)
			radarChart?.resize({
                    width:  (capacityRadar.value as HTMLDivElement).clientWidth, 
                    height: (capacityRadar.value as HTMLDivElement).clientHeight
                })
        })
}

onMounted(()=>{
	radarUpdate()
	fetch('/search/entity/Capacity', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}, body: JSON.stringify({
			properties: {},
			relation: 'None'
		})
	}).then(
		res => res.json()
	).then(
		(value: SearchResponseBody)=>{
			let { ok, data, msg } = value
			if(ok) {
				console.log(data)
			} else console.error(msg)
		}
	)
})

</script>