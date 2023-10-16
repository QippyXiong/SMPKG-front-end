import { Node, Edge } from "@/components/knowledge-graph-canvas.vue"

import { SearchRecord, RelationRecord, EntityRecord } from '@/types/ResponseBody'
import { enkeyMapZhkey, getRecordCase, getEntityCategory, enRelationMapZhRelation} from '@/types/utils'

export function parseRecordIntoNode(record: SearchRecord, symbolSize: number = 60): Node | undefined
{
    let [recordCase, category] = getRecordCase(record.type)
    let rec = record.record as EntityRecord
    switch(recordCase)
    {
        case 'entity':
            return {
                name: rec.element_id,
                category: category,
                symbolSize,
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

export function parseRecordIntoEdge(record: SearchRecord): Edge
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

export function expandNodePropertiesNodes(node : Node, property_node_size: number = 40): Array<Node>
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

export function expandNodePropertiesEdges(node: Node): Array<Edge>
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

export let expandNodeProperties = (node: Node): [Array<Node>, Array<Edge>] => [ expandNodePropertiesNodes(node), expandNodePropertiesEdges(node) ]

// 处理 SearchResponseBody.data: SearchRecord[] 成结点数组和边数组
export function parseSearchEntityResponseData(res_data: SearchRecord[], symbolSize: number = 60): [Node[], Edge[]]
{
    let new_nodes = []
    let new_edges = []
    for( let item of res_data )
    {
        let [recordCase] = getRecordCase(item.type)
        switch(recordCase) {
            case 'entity':
                let _node = parseRecordIntoNode(item, symbolSize)
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
