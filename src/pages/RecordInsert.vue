<script setup lang="ts">
import {  Ref, ref } from 'vue'
import { Node, Edge } from '@/components/knowledge-graph-canvas.vue';
import { SearchResponseBody } from '@/types/ResponseBody'
import { parseSearchEntityResponseData } from '@/types/functions'
import { getMainAttrib, zhkeyMapEnkey, enkeyMapZhkey, zhRelationKeyZhMap } from '@/types/utils'


let recordText: Ref<string> = ref('')

let tableData: Ref<Array<{ name: string, value: string | null }>> = ref([])

recordText.value = '"2023年7月28日，上午八点发现小寨站处铁轨损发生破损，同时造成了地铁车辆车轮损坏，铁轨维修人员步和昶立刻前往进行维修，维修持续了三个小时，修复了铁轨的破损情况，使得地铁能够继续正常运行；同时车辆维修人员扶良朋前往查看车辆情况，不仅维修了车轮，而且修复了地铁车厢的车窗问题，在下午两点钟完成了车辆的全部维修工作，两次任务中，维修人员陈烨赫参与了辅助工作。'

const extract_nodes: Ref<Node[]> = ref([])
const extract_edges: Ref<Edge[]> = ref([])
const attribTableData   :Ref<Array<{ attribName: string, value: string }>> = ref([])

let origin_v: Array<Record<string, string | null>> = [];
[
    {
        "person": "步和昶",
        "station": "铁轨维修人员",
        "malfunc": "轨道损坏",
        "content": "铁轨维修",
        "place": "小寨站",
        "begin_time": "2023-07-28 08:00:00",
        "end_time": "2023-07-28 11:00:00",
        "duration": "3小时"
    },
    {
        "person": "扶良朋",
        "station": "车辆维修人员",
        "malfunc": "轮胎车轴故障",
        "content": "车轮维修",
        "place": "小寨站",
        "begin_time": "2023-07-28 08:00:00",
        "end_time": "2023-07-28 14:00:00",
        "duration": "6小时"
    },
    {
        "person": "陈烨赫",
        "station": null,
        "malfunc": "轨道损坏",
        "content": "辅助工作",
        "place": "小寨站",
        "begin_time": "2023-07-28 08:00:00",
        "end_time": "2023-07-28 11:00:00",
        "duration": "3小时"
    },
    {
        "person": "陈烨赫",
        "station": null,
        "malfunc": "轮胎车轴故障",
        "content": "辅助工作",
        "place": "小寨站",
        "begin_time": "2023-07-28 08:00:00",
        "end_time": "2023-07-28 14:00:00",
        "duration": "6小时"
    }
]

for(let item of origin_v) {
	for(let key of Object.keys(item)){
		tableData.value.push({
			name: key,
			value: item[key]
		})
	}
}

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

function parseAttribTableDataEdge(edge: Edge)
{
    attribTableData.value = []
    if(!edge.properties) return
    attribTableData.value = Object.keys(edge.properties).flatMap(key => ({
        attribName: zhRelationKeyZhMap(key, edge.name as string),
        value: (edge.properties as Record<string, string>)[key]
    }))
    if(!edge.properties) return
}

function click_show(data: echarts.ECElementEvent): void 
{
	switch(data.dataType) 
	{
	case 'node':
		parseAttribTableDataNode(data.data as Node)
		break
	case 'edge':
		parseAttribTableDataEdge(data.data as Edge)
		break
	}
}

function extractRecordInfo(recordText: string)
{
	fetch("/llm/extract/", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			record: recordText
		})
	}).then(res => res.json()).then((res_data: SearchResponseBody) => {
		let { ok, msg, data } = res_data
		if(!ok) {
			// extract failed
			console.error(msg)
			return
		}
		// table data info push
		let [ new_nodes, new_edges ] = parseSearchEntityResponseData(data)
		extract_edges.value = new_edges
		extract_nodes.value = new_nodes
		console.log(extract_nodes, extract_edges)
	})
}

import KnowledgeGraph from '@/components/knowledge-graph-canvas.vue'

</script>

<template>
<div style="width: 1600px; height: 100%; display: flex; flex-direction: row-reverse;">
	<!--输入维修记录文本-->
	<div style="flex-basis: 350px; padding: 10px;">
		<ElInput 
			:rows="6"
			type="textarea"
			placeholder="在此输入维修记录文本"
			v-model="recordText" 
		/>
		<div style="height: 10px;" />
		<ElButton style="width: 100%;" @click="extractRecordInfo(recordText)" width="100%" type="success" >维修记录信息抽取</ElButton>
		<ElDivider/>
		<ElTable 
			:border="true" 
			:data="attribTableData"
			empty-text="无数据"
		>
			<ElTableColumn label="属性名称" prop="attribName" />
			<ElTableColumn label="属性值" prop="value" />
		</ElTable>
	</div>
	<div style="flex: 1;">
		<KnowledgeGraph
			:nodes="extract_nodes "
			:edges="extract_edges"
			:title="{
				text: '抽取结果',
				top: 'top',
				left: '20px'
			}"
			:categories="[
				{ name: '维修人员' },
				{ name: '维修记录' }
			]"
			:draggable="true"
			:tooltipFormatter="
				(data: any) => null
			"
			@itemClick="click_show"
			:nodeLabelFormatter="
				(params: any) => {
					let data = params.data as Node
					return getMainAttrib(data.properties as Record<string, any>, data.category)
				}
			"
		/>
	</div>
</div>
</template>