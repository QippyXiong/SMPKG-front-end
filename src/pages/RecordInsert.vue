<script setup lang="ts">
import {  Ref, ref } from 'vue'

let recordText: Ref<string> = ref('')

let tableData: Ref<Array<{ name: string, value: string | null }>> = ref([])

recordText.value = '"2023年7月28日，上午八点发现小寨站处铁轨损发生破损，同时造成了地铁车辆车轮损坏，铁轨维修人员步和昶立刻前往进行维修，维修持续了三个小时，修复了铁轨的破损情况，使得地铁能够继续正常运行；同时车辆维修人员扶良朋前往查看车辆情况，不仅维修了车轮，而且修复了地铁车厢的车窗问题，在下午两点钟完成了车辆的全部维修工作，两次任务中，维修人员陈烨赫参与了辅助工作。'

let origin_v: Array<Record<string, string | null>> =
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
	}).then(res => res.json()).then(res_data => {
		let { ok, msg, data } = res_data
		tableData.value = []
		console.log(data)
		for(let item of data) {
			for(let key of Object.keys(item)){
				tableData.value.push({
					name: key,
					value: item[key]
				})
			}
		}
		console.log(tableData.value)
	})
}

</script>

<template>
	<!--输入维修记录文本-->
	<div style="float: left; width: 45%; padding: 10px;">
		<ElInput 
			:rows="6"
			type="textarea"
			placeholder="在此输入维修记录文本"
			v-model="recordText" 
		/>
		<ElButton @click="extractRecordInfo(recordText)">提取</ElButton>
	</div>
	<div style="float: left; width: 45%; padding: 10px;">
		<ElTable :data="tableData">
			<ElTableColumn label="属性名" prop="name"></ElTableColumn>
			<ElTableColumn label="属性值" prop="value"></ElTableColumn>
		</ElTable>
	</div>
</template>