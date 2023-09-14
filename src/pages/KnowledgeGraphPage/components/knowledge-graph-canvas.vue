<script setup lang="ts">
import {  Ref, onMounted, onUpdated, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { ParamsSerializerOptions } from 'axios';
import { radioPropsBase } from 'element-plus';

export interface Node {
    name        : string
    symbolSize  : number
    category    : number
    properties? : Record<string, any> | string
    expanded?   : boolean;
    itemStyle?  : {
        color: string
    }
    // label?      : {
    //     show: boolean
    // }
}

export interface Edge {
    source: string | any,
    name?: string,
    target: string | any,
    properties?: Record<string,string>
}

interface TooltipFormatterParams
{
    dataType: 'node'|'edge'
    data: Node | Edge
    dataIndex: number

}

const p: Ref<null|HTMLDivElement> = ref(null)

export interface Category
{
    name: string,
    itemStyle: {
        color: string
    }
}

interface Props {
    nodes: Array<Node>
    edges: Array<Edge>
    width?: string
    height?: string
    repulsion?: number
    title?: {
        text: string,
        top: 'bottom' | 'top' | 'middle' | 'auto' | string
        left: 'left' | 'right' | 'center' | 'auto' | string
    }
    categories?: Array<Category>
    tooltipFormatter?:  (params: TooltipFormatterParams) => string | null | Element
    nodeLabelFormatter?: (params: any) => string
}

const props = withDefaults(defineProps<Props>(), {
    width: '100%',
    height: '100%',
    repulsion: 400,
    categories: props => [],
    title: props => { return {
        text: '',
        top: 'auto',
        left: 'auto'
    }},
    tooltipFormatter:  (params: TooltipFormatterParams): string | null => {
        if (params.dataType === 'node') {
            let data: Node = params.data as Node
            return data.name;
        } else if (params.dataType === 'edge') {
            let data: Edge = params.data as Edge
            return data.source + '-' + data.name + '-' + data.target
        } else return null
    },
    nodeLabelFormatter: (params: any) => params.data.name
})


function get_option( nodes: Array<Node>, links: Array<Edge> ) : echarts.EChartsCoreOption {
    // 设置图表配置项
    let a = []; for(let item of props.categories) a.push(item.name);
    return {
        title: props.title,
        tooltip: {
            show: true,
            formatter: props.tooltipFormatter
        },
        legend: [{
            data: a
        }],
        series:[{
            type:'graph',
            layout:'force', // 使用力引导布局
            force:{
                repulsion: props.repulsion, // 力的强度
                edgeLength:[80,400]
            },
            roam:true,
            draggable: true,
            label: {
                show: true, // top / left / right / bottom / inside / insideLeft / insideRight / insideTop / insideBottom / insideTopLeft / insideBottomLeft / insideTopRight / insideBottomRight
                // position: 'center',
                formatter: props.nodeLabelFormatter,
                color: '#fff'
            },
            edgeLabel:{
                show:true,
                color:'#333',
                formatter: (params: any) =>  params.data.name || params.data.source + ' -> ' + params.data.target
            },
            edgeSymbol: ['none','arrow'],
            data: nodes,
            links: links,
            categories: props.categories
        }],
    };
}

const emits = defineEmits<{
    itemClick: [ event: echarts.ECElementEvent ]
}>()

// ============================ begin lifetime hook ==================================

let myChart: echarts.ECharts | null = null

function constructMyChart()
{
    if(p.value == null) return console.log('this function is called before p inited')
    if(myChart === null && props.nodes.length != 0)
    {
        myChart = echarts.init(p.value)
        myChart?.on('click', (params: echarts.ECElementEvent) => {
            emits('itemClick', params)
        });
        p.value?.addEventListener('resize',()=>{
            myChart?.resize({
                width:  (p.value as HTMLDivElement).clientWidth, 
                height: (p.value as HTMLDivElement).clientHeight
            })
        })
        window.addEventListener('resize', async ()=>{
            if(p.value)
                myChart?.resize({
                    width:  (p.value as HTMLDivElement).clientWidth, 
                    height: (p.value as HTMLDivElement).clientHeight
                })
        })
    }
    myChart?.setOption( get_option(props.nodes, props.edges) )
}

onMounted(constructMyChart)

watch( ()=>props.nodes, constructMyChart)

watch( ()=>props.edges, constructMyChart)

onUpdated(()=>{
    constructMyChart()
})

</script>

<template>
    <div ref="p" :style="{ width: width, height: height }"></div>
    <!-- 指定大小必须加上单位，一个前端怎么能把这个忘了。。。 -->
</template>

<style>

</style>