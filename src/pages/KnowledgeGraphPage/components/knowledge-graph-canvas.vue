<script setup lang="ts">
import {  Ref, onMounted, onUpdated, ref, watch } from 'vue'
import * as echarts from 'echarts'

export interface Node {
    name: string,
    symbolSize: number,
    type?: string,
    properties?: Record<string, any> | string,
    expanded?: boolean,
    itemStyle?: {
        color: string
    }
}

export interface Edge {
    source: string | any,
    name?: string,
    target: string | any,
    lineStyle?: {

    }
}

interface TooltipFormatterParams
{
    dataType: 'node'|'edge'
    data: Node | Edge
    dataIndex: number

}

const p: Ref<null|HTMLDivElement> = ref(null)

interface Props {
    nodes: Array<Node>,
    edges: Array<Edge>
    width?: string,
    height?: string,
    repulsion?: number,
    tooltipFormatter?:  (params: TooltipFormatterParams) => string | null | Element
}

const props = withDefaults(defineProps<Props>(), {
    width: '100%',
    height: '100%',
    repulsion: 400,
    tooltipFormatter:  (params: TooltipFormatterParams): string | null => {
        if (params.dataType === 'node') {
            let data: Node = params.data as Node
            return data.name;
        } else if (params.dataType === 'edge') {
            let data: Edge = params.data as Edge
            return data.source + '-' + data.name + '-' + data.target
        } else return null
    }
})


function get_option( nodes: Array<Node>, links: Array<Edge> ) : echarts.EChartsCoreOption {
    // 设置图表配置项
    return {
        responsive: true,
        tooltip: {
            show: true,
            formatter: props.tooltipFormatter
        },
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
                show: true,
                // position: 'center',
                // formatter(params) {
                //     console.log(params)
                //     return params.data.name
                // },
                // color: '#fff'
            },
            edgeLabel:{
                show:true,
                color:'#333',
                formatter: (params: any) =>  params.data.name || params.data.source + ' -> ' + params.data.target
            },
            edgeSymbol: ['none','arrow'],
            data: nodes,
            links: links,
        }]
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