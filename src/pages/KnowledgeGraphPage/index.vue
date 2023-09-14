<script setup lang="ts">
import { Ref, ref, onMounted, getCurrentInstance } from "vue"
import { ElMessage } from "element-plus"

import knowledgeGraphCanvas from "./components/knowledge-graph-canvas.vue"
import { Node, Edge } from "./components/knowledge-graph-canvas.vue"

import { SearchResponseBody, SearchRecord, RecordType, RelationRecord, EntityRecord } from './types/ResponseBody'
import { enkeyMapZhkey, getRecordCase, parseEdgePropertiesIntoString, getMainAttrib, parseEdgeSourceOrTarget, getTypeColor, getEntityCategory, getTypeZhkeyMap, parseCandiateProperty, getRelationCategory, enRelationMapZhRelation, zhRelationKeyZhMap } from './types/utils'
import { entityCategories, entityCategoriesZh } from './types/MaintenanceWorker'

interface SelectOption { label: string, value: string }

const { appContext } = getCurrentInstance()!
// ElMessage({}, appContext)

const nodes: Ref<Array<Node>> = ref([])
const edges: Ref<Array<Edge>> = ref([])

const searchkeyVal = ref("")
const selectedType = ref('')
const selectedKey = ref('')
const attribTableData   :Ref<Array<{ attribName: string, value: string }>> = ref([])
const relationTableData :Ref<Array<{ relation: string }>> = ref([])

const selectOptions: Ref<SelectOption[]> = ref([])
const subSelectOptions: Ref<SelectOption[]> = ref([])
const focused_node: Ref<Node|null> = ref(null)
const showPropertyNodeInGraph: Ref<boolean> = ref(true)
const categories: Ref<any> = ref([])

let categoryRelationsMap: Record<string, string[]> = {}

let AlertError = (msg: string) => void ElMessage({ type: 'error', message: msg })
let AlertSuccess = (msg: string) => void ElMessage({ type: 'success', message: msg })

function parseRecordIntoNode(record: SearchRecord): Node | undefined
{
    let [recordCase, category] = getRecordCase(record.type)
    let rec = record.record as EntityRecord
    switch(recordCase)
    {
        case 'entity':
            return {
                name: rec.element_id,
                category: category,
                symbolSize: 60,
                // itemStyle: {
                //     color: getTypeColor(record.type)
                // },
                properties: rec.properties || rec.record
            }
        case 'relation':
            console.error(`parserRecordIntoNode: there shouldn't have relations(${ record.type })`)
        default:
            console.error(`parserRecordIntoNode: unkown type ${ record.type }`)
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

function parseRecordIntoEdge(record: SearchRecord): Edge
{
    let [recordCase, category] = getRecordCase(record.type)
    let rec = record.record as RelationRecord
    return {
        target: rec.source.element_id,
        name: enRelationMapZhRelation(record.type),
        source: rec.target.element_id,
        properties: rec.properties
    }
}

function expandNodePropertiesNodes(node : Node, property_node_size: number = 40): Array<Node>
{
    let property_nodes: Array<Node> = []
    if(!node.properties) return property_nodes
    if(getEntityCategory(node.category) == 'Property') return property_nodes

    let properties = node.properties as Record<string, any>

    for(let key of Object.keys(properties))
        if(typeof key == 'string')
            property_nodes.push({
                name: node.name + "->" + key,
                symbolSize: property_node_size,
                expanded: false,
                category: getRecordCase('Property')[1],
                properties: properties[key]
            })
    return property_nodes
}

function expandNodePropertiesEdges(node: Node): Array<Edge>
{
    let property_edges:Array<Edge>  = []
    if(!node.properties) return property_edges
    if(getEntityCategory(node.category) == 'Property') return property_edges

    let properties = node.properties as Record<string, any>
    for(let key of Object.keys(properties))
        if(typeof key == 'string')
            property_edges.push({
                source: node.name,
                name: enkeyMapZhkey(key, node.category),
                target: node.name + "->" + key
            })
        else
            console.log('uhkown type key:', key)
    return property_edges
}

let expandNodeProperties = (node: Node): [Array<Node>, Array<Edge>] => [ expandNodePropertiesNodes(node), expandNodePropertiesEdges(node) ]

// 处理 SearchResponseBody.data: SearchRecord[] 成结点数组和边数组
function parseSearchEntityResponseData(res_data: SearchRecord[]): [Node[], Edge[]]
{
    let new_nodes = []
    let new_edges = []
    for( let item of res_data )
    {
        let [recordCase] = getRecordCase(item.type)
        switch(recordCase) {
            case 'entity':
                let _node = parseRecordIntoNode(item)
                if(_node) new_nodes.push(_node)
                break
            case 'relation':
                let _edge: Edge = parseRecordIntoEdge(item)
                if(_edge) new_edges.push(_edge)
                break
            default:
                console.error(`unkown entity type:${ item.type }`)
        }
    }
    return [new_nodes, new_edges]
}


async function fetchEntity(type: string, properties: Record<string, string>, relation?: string, parseCk: boolean = false): Promise<[Node[], Edge[]] | undefined>
{
    return await fetch(`/search/entity/${ type }`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{ "properties": ${ JSON.stringify(parseCk ? parseCandiateProperty(properties, type): properties) }, "relation": "${ relation ? relation : "None" }" }`
    })
        .then((res) => res.json())
        .then((body: SearchResponseBody) => {
            let { ok, msg, data } = body
            if(ok == undefined || msg == undefined)
            {
                AlertError("键值不存在")
                return void 0
            }
            if(ok) {
                let [new_nodes, new_edges] = parseSearchEntityResponseData(data)
                new_nodes = new_nodes.filter(v => nodes.value.findIndex(j => j.name == v.name) == -1 )
                new_edges = new_edges.filter(v => edges.value.findIndex(j => JSON.stringify(j) == JSON.stringify(v)) == -1 )
                // nodes.value = new_nodes.concat(JSON.parse(JSON.stringify(nodes.value)))
                // edges.value = new_edges.concat(JSON.parse(JSON.stringify(edges.value)))
                return [new_nodes, new_edges] as [Node[], Edge[]]
            }else{
                AlertError(msg)
                return void 0
            }
        }).catch(AlertError)
}

function seachPerson(): void 
{
    let properties: Record<string, string> = {}
    properties[selectedKey.value] = searchkeyVal.value
    fetchEntity(selectedType.value, properties).then(
        data => {
            if(data) {
                let [new_nodes, new_edges] = data
                nodes.value = new_nodes
                edges.value = new_edges
            }
        }
    )
}

function click_show(data: echarts.ECElementEvent): void 
{
    switch(data.dataType) 
    {
    case 'edge':
        let edge_data = data.data as Edge
        relationTableData.value = []
        parseAttribTableDataEdge(edge_data)
        focused_node.value = null
        break
    case 'node':
        let node_data = data.data as Node | Edge
        node_data = node_data as Node
        focused_node.value = node_data
        if(showPropertyNodeInGraph.value) {
            if(!node_data.expanded && showPropertyNodeInGraph.value) {
                let [new_nodes, new_edges] = expandNodeProperties(node_data)
                nodes.value = new_nodes.concat(JSON.parse(JSON.stringify(nodes.value)))
                edges.value = new_edges.concat(JSON.parse(JSON.stringify(edges.value)));

                (nodes.value.find(v => v.name === node_data.name) as Node).expanded = true // @tsignore
            } else {
                let del_nodes = nodes.value.filter(v => v.name.split("->")[0] === node_data.name && getEntityCategory(v.category) === 'Property')
                edges.value = edges.value.filter(v => v.source != node_data.name || del_nodes.findIndex(n => n.name == v.target) == -1)
                nodes.value = nodes.value.filter(v => v.name.split("->")[0] !== node_data.name || getEntityCategory(v.category) !== 'Property')
                for(let node of nodes.value)
                    if(node.name === node_data.name) { node.expanded = false; break }
                (nodes.value.find(v => v.name === node_data.name) as Node).expanded = false 
            }
        }
        // 设置两个table的内容
        parseAttribTableDataNode(node_data)
        relationTableData.value = categoryRelationsMap[getEntityCategory(node_data.category)].flatMap(v => ({ relation: v }))
        break
    default:
    }
}

function updateSubSelectOptions(value: string)
{
    subSelectOptions.value = []
    selectedKey.value = ''
    let zhKeyMap = getTypeZhkeyMap(value)
    for(let key of Object.keys(zhKeyMap))
    {
        subSelectOptions.value.push({
            label: zhKeyMap[key],
            value: key
        })
    }
}

function getCategories()
{
    let arr: any[] = []
    entityCategories.forEach(
        (v, i)=> arr.push({
            name: entityCategoriesZh[i],
            // itemStyle: {
            //     color: getTypeColor(v)
            // }
        })
    )
    return arr
}

function searchWithRelation(node: Node | null, relation: string): void
{
    if(!node) return
    if(typeof node.properties == 'string' || !node.properties) return
    fetchEntity(getEntityCategory(node.category), node.properties, relation)
        .then(
            data => {
                if(data) {
                    let [new_nodes, new_edges] = data
                    nodes.value = new_nodes.concat(JSON.parse(JSON.stringify(nodes.value)))
                    edges.value = new_edges.concat(JSON.parse(JSON.stringify(edges.value)))
                }
            }
        )
}

function removeNode(node: Node | null)
{
    if(!node) return
}

function closeAllPropertyNode(e: boolean)
{
    if(!e) {
        let del_nodes = nodes.value.filter(v => getEntityCategory(v.category) === 'Property')
        edges.value = edges.value.filter(v => del_nodes.findIndex(n => n.name == v.target) == -1)
        nodes.value = nodes.value.filter(v => getEntityCategory(v.category) !== 'Property')
        for(let node of nodes.value)
            node.expanded = false
    }
}

onMounted(()=>{
    entityCategories.forEach((v, i)=>{
        if(v == 'Property') return
        selectOptions.value.push(
            { label: entityCategoriesZh[i], value: entityCategories[i] }
        )
        fetch('/search/relations/' + v, {
            method: "GET"
        }).then(res => res.json()).then(body => {
            let { ok, msg, data } = body
            relationTableData.value = []
            if(ok) {
                let tmp_arr: Array<string> = [];
                (data as Array<[string, string]>).forEach(el => tmp_arr.push(el[0]))
                categoryRelationsMap[v] = tmp_arr
            } else AlertError(msg)
        })
    })
    categories.value = getCategories()
})

import { Search } from '@element-plus/icons-vue'
import { fa } from "element-plus/es/locale"

</script>

<template>
    <ElContainer style="height: 100%;">
        <ElContainer direction="vertical" style="height: 100%; position: relative; padding-right: 10px;">
            <div style="width: 100%;">
                <ElInput
                    v-model="searchkeyVal"
                    placeholder="在此输入查询属性值"
                    class="input-with-select"
                    >
                    <!--class="input-with-select"-->
                    <template #prepend>
                        <el-select  
                            @change="updateSubSelectOptions" 
                            v-model="selectedType" 
                            placeholder="待选择" 
                            style="width: 115px; margin-right: 20px;"
                        >
                            <el-option v-for="item in selectOptions" :value="item.value" :label="item.label" />
                            <!-- <el-option label="Tel" value="3" /> -->
                        </el-select>
                        <el-select 
                            v-model="selectedKey" 
                            placeholder="待选择" 
                            style="width: 115px"
                        >
                            <el-option :value="item.value" :label="item.label" v-for="item, index in subSelectOptions" />
                            <!-- <el-option label="Tel" value="3" /> -->
                        </el-select>
                    </template>
                    <template #append>
                        <el-button :icon="Search" @click="seachPerson()"> 搜索 </el-button>
                    </template>
                </ElInput>
            </div>
            <knowledgeGraphCanvas
                :tooltipFormatter="
                    (data) => null
                "
                :nodeLabelFormatter="
                    (params) => {
                        let data = params.data as Node
                        return getMainAttrib(data.properties as Record<string, any>, data.category)
                    }
                "
                width="100%"
                :categories="categories"
                :edges="edges"
                :nodes="nodes"
                :height="'calc(100% - 50px)'"
                @itemClick="click_show"
            />
        </ElContainer>
        <ElAside width="300px">
            <ElScrollbar height="100%">
                <div style="padding: 20px 10px; display: flex; flex-direction: column; justify-content: left;">
                    <ElSwitch
                        v-model="showPropertyNodeInGraph"
                        size="large"
                        inactive-text="在图谱中显示属性"
                        text-align="left"
                        @change="el => closeAllPropertyNode(el as boolean)"
                    />
                    <div>
                    </div>
                </div>
                <ElTable
                    :border="true"
                    :data="relationTableData"
                    empty-text="无数据"
                >
                    <ElTableColumn label="具有关系">
                        <ElTableColumn label="关系名称" :formatter="v => enRelationMapZhRelation(v.relation)" prop="relation" />
                        <ElTableColumn label="操作">
                            <template #default="scope">
                                <ElButton type="primary" @click="searchWithRelation( focused_node, scope.row.relation)">查询</ElButton>
                            </template>
                        </ElTableColumn>
                    </ElTableColumn>
                </ElTable>
                <ElDivider/>
                <ElTable 
                    :border="true" 
                    :data="attribTableData"
                    empty-text="无数据"
                >
                    <ElTableColumn label="属性名称" prop="attribName" />
                    <ElTableColumn label="属性值" prop="value" />
                </ElTable>
            </ElScrollbar>
        </ElAside>
    </ElContainer>
</template>

<style scoped>
.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
</style>
./types/MaintenanceWorkerEntities