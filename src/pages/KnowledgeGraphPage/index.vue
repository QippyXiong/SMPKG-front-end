<script setup lang="ts">
import { Ref, ref, onMounted } from "vue";
import knowledgeGraphCanvas from "./components/knowledge-graph-canvas.vue"
import { Node, Edge } from "./components/knowledge-graph-canvas.vue"

import { SearchResponseBody, SearchRecord, RecordType } from './types/ResponseBody'
import { enkeyMapZhkey, getRecordType, parseEdgePropertiesIntoString, getMainAttrib, parseEdgeSourceOrTarget, mapTypeColor } from './types/utils'

let a = document.createElement("a");
a.innerText = "hahaha";

const nodes: Ref<Array<Node>> = ref([])
const edges: Ref<Array<Edge>> = ref([])

let person_name = ref("");

function parserRecordIntoNode(record : Record<string, any>, type: string): Node | void
{
    let name: string = getMainAttrib(record, type), properties: Record<string, any> = {}
    for(let key of Object.keys(record))
    {
        let prop = record[key]
        if(prop != name) 
            properties[key] = prop
    }
    if(name === '' || name == 'undefined')
        return console.error(`Main attribute ${ name } not found`)

    return {
        name,
        symbolSize: 60,
        type: type,
        properties: properties,
        itemStyle: {
            color: mapTypeColor(type)
        }
    }
}

function expandNodePropertiesNodes(node : Node, property_node_size: number = 40): Array<Node>
{
    let property_nodes: Array<Node> = []
    if(!node.properties) return property_nodes
    if(node.type == 'Property') return property_nodes

    let properties = node.properties as Record<string, any>

    for(let key of Object.keys(properties))
        if(typeof key == 'string')
            property_nodes.push({
                name: String(properties[key]),
                symbolSize: property_node_size,
                expanded: false,
                type: 'Property',
                properties: node.name
            })
    return property_nodes
}

function expandNodePropertiesEdges(node: Node): Array<Edge>
{
    let property_edges:Array<Edge>  = []
    if(!node.properties) return property_edges
    if(node.type == 'Property') return property_edges

    let properties = node.properties as Record<string, any>
    for(let key of Object.keys(properties))
        if(typeof key == 'string')
            property_edges.push({
                source: node.name,
                name: enkeyMapZhkey(key, node.type as string),
                target: String(properties[key])
            })
        else
            console.log('uhkown type key:', key)
    return property_edges
}

let expandNodeProperties = (node: Node): [Array<Node>, Array<Edge>] => [ expandNodePropertiesNodes(node), expandNodePropertiesEdges(node) ]


function seachPerson(id: string): void {
    
    fetch("/search/maintenance_worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: 'id', data: person_name.value })
    })
        .then((res) => res.json())
        .then((body: SearchResponseBody) => {
            let { ok, msg, data } = body
            if(ok == undefined || msg == undefined || data == undefined)
                return console.error( "key value undefined, check server return value" )
            if(ok) {
                let new_nodes = []
                let new_edges = []
                for( let item of data )
                {
                    let record_type = getRecordType(item.type)
                    switch(record_type) {
						case 'entity':
                            let _node = parserRecordIntoNode(item.record, item.type)
                            if(_node) new_nodes.push(_node)
                            break
                        case 'relation':
                            let record: Relation = item.record as Relation
                            let _edge: Edge = {
                                source: parseEdgeSourceOrTarget(record.source),
                                target: parseEdgeSourceOrTarget(record.target),
                                name: parseEdgePropertiesIntoString(record.properties, item.type)
                            }
                            new_edges.push(_edge)
                            break
                    }
                }
                nodes.value = new_nodes
                edges.value = new_edges
                console.log(new_nodes, new_edges)
            }else{
                alert(msg)
            }
        }).catch(console.error)
}

onMounted(()=>{
//     nodes.value = [
//     { name: "水果", symbolSize: 60, itemStyle: { color: "#f44336" } },
//     { name: "苹果", symbolSize: 40, itemStyle: { color: "#ff9800" } },
//     { name: "香蕉", symbolSize: 40, itemStyle: { color: "#ffeb3b" } },
//     { name: "梨",   symbolSize: 40, itemStyle: { color: "#8bc34a" } },
//     { name: "葡萄", symbolSize: 40, itemStyle: { color: "#9c27b0" } },
//     { name: "红色", symbolSize: 30, itemStyle: { color: "#f44336" } },
//     { name: "黄色", symbolSize: 30, itemStyle: { color: "#ffeb3b" } },
//     { name: "绿色", symbolSize: 30, itemStyle: { color: "#8bc34a" } },
// ]
//     edges.value = [
//         { source: "水果", target: "苹果", name: "属于", lineStyle: {} },
//         { source: "苹果", target: "水果", name: "属于", lineStyle: {} },
//         { source: "水果", target: "香蕉", name: "属于" },
//         { source: "水果", target: "梨", name: "属于" },
//         { source: "水果", target: "葡萄", name: "属于" },
//         { source: "苹果", target: "红色", name: "是" },
//         { source: "香蕉", target: "黄色", name: "是" },
//         { source: "梨", target: "绿色" },
//         { source: "葡萄", target: "红色", name: "有" },
//     ]
})

function click_show(data: echarts.ECElementEvent): void {
    switch(data.dataType) {
        case 'edge':
            break
        case 'node':
            let node_data = data.data as Node
            let type = getRecordType(node_data.type)
            switch(type) {
                case 'entity':
                    if(!node_data.expanded) {
                        let [new_nodes, new_edges] = expandNodeProperties(node_data)
                        nodes.value = new_nodes.concat(JSON.parse(JSON.stringify(nodes.value)))
                        edges.value = new_edges.concat(JSON.parse(JSON.stringify(edges.value)));

                        (nodes.value.find(v => v.name === node_data.name) as Node).expanded = true // @tsignore
                    } else {
                        let del_nodes = nodes.value.filter(v => v.properties === node_data.name && v.type === 'Property')
                        edges.value = edges.value.filter(v => v.source != node_data.name || del_nodes.findIndex(n => n.name == v.target) == -1)
                        nodes.value = nodes.value.filter(v => v.properties !== node_data.name || v.type !== 'Property')
                        for(let node of nodes.value)
                            if(node.name === node_data.name) { node.expanded = false; break }
                        (nodes.value.find(v => v.name === node_data.name) as Node).expanded = false 
                    }  
                    break
                default:
                    return
            }
            console.log(nodes.value, edges.value)
            break
    }
}

let select = ref('')

import { Search } from '@element-plus/icons-vue'
import { Relation } from "./types/MaintenanceWorker";

</script>

<template>
	<ElInput
      v-model="person_name"
      placeholder="Please input"
	  class="input-with-select"
    >
	<!--class="input-with-select"-->
      <template #prepend>
        <el-select v-model="select" placeholder="Select" style="width: 115px">
          <el-option label="维保人员" value="MaintanenceWorker" />
          <el-option label="能力评价" value="Capacity" />
          <!-- <el-option label="Tel" value="3" /> -->
        </el-select>
      </template>
      <template #append>
        <el-button :icon="Search" @click="seachPerson(person_name)"> 搜索 </el-button>
      </template>
    </ElInput>
    <knowledgeGraphCanvas
        :tooltipFormatter="
            (data) =>
                data.data.name || (data.data as Edge).source + ' -> ' + (data.data as Edge).target
        "
        :edges="edges"
        :nodes="nodes"
		:height="'calc(100% - 50px)'"
        @itemClick="click_show"
    />
</template>

<style scoped>
.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
</style>
./types/MaintenanceWorkerEntities