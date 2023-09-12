
let entityNames = ['MaintenanceWorker', 'MaintenanceRecord', 'Capacity']
let relationNames = ['RATE', 'PERFORMED']

function getRecordType(type_name: string | undefined): 'entity' | 'relation' | undefined
{
	if( !type_name ) return undefined

	if( entityNames.findIndex(item => item == type_name) != -1 )
		return 'entity'

	if( relationNames.findIndex(item => item == type_name) != -1 )
		return 'relation'
	console.log("unkown record type: " + type_name)
	return undefined
}

// 将英文key值映射到中文key值，如果找不到就返回输入的英文key值，并在控制台打印消息
function enkeyMapZhkey(attribName: string, type: string): string
{

	let type_map: Record<string, Record<string, string>> = 
	//interface MaintenanceWorker
	{
		MaintenanceWorker: 
		{
			id 				: "工号/志愿者编号",
			name			: "姓名",
			sex 			: "性别",
			nation			: "民族",
			phone			: "联系方式",
			birth			: "出生日期",
			live_in			: "居住地址",
			employ_date 	: "入职时间",
			work_post 		: "岗位",
			work_level		: "岗位级别",
			department 		: "部门",
		},

		//interface MaintenancePerformance
		MaintenancePerformance:
		{
			malfunc_type	: "故障类型",
			performance		: "维修效果",
		},

		//interface MaintenanceRecord
		MaintenanceRecord :
		{
			malfunction 	:  "故障内容",
			place			:  "故障位置",
			malfunc_time	:  "故障上报时间",
			begin_time		:  "维修开始时间",
			complish_time	:  "维修完成时间",
			review			:  "返修评价",
		},

		Capacity :
		{
			name 		 : "能力名 唯一标识",
			description  : "描述",
			rule		 : "能力规则",
			rate		 : "维修能力关联的人员实体"
		}
	}

	function getMap(type: string): Record<string, string>
	{
		return type_map[type]
	}

	let key_map = getMap(type)
	if(key_map) {
		let key = key_map[attribName]
		if(key === void 0)
			console.error(`No such atrribute ${ attribName } in ${ type }`)
		return key
	}else{

		console.error(`No such type ${ type }`)
		return attribName
	}
}

function parseEdgePropertiesIntoString(properties: Record<string, any>, type: string): string | undefined
{
	switch(type)
	{
		case 'PERFORMED':
			return "维修表现：" + properties["performance"]
		case 'RATE':
			return "能力评级：" +  properties["level"]
		default:
			return undefined
	}
}

function getMainAttrib(record: Record<string, any>, type: string): string
{
	['MaintenanceWorker', 'MaintenanceRecord', 'Capacity', 'MaintenancePerformance']
	switch(type) {
		case 'MaintenanceWorker': return String(record["id"])
		case 'MaintenanceRecord': return record["malfunc_time"] + ": " + record["place"] + "-" + record["malfunction"]
		case 'Capacity': return String(record["name"])
	}
	return 'undefined'
}

const parseEdgeSourceOrTarget = (source: any) => (typeof source == 'string' ? source : getMainAttrib(source.properties || source, source.type || "MaintenanceRecord"))

let EntityColors = [
	"#f44336", 
	"#ff9800",
	"#ffeb3b",
	"#8bc34a",
	"#9c27b0",
	"#f44336",
	"#ffeb3b",
	"#8bc34a"
]

let typeColorMap: Record<string, string> = {}

entityNames.forEach((v, i)=> typeColorMap[v] = EntityColors[i])

function mapTypeColor(type: string): string
{
	return typeColorMap[type]
}

export {
	enkeyMapZhkey, getRecordType, parseEdgePropertiesIntoString, getMainAttrib, parseEdgeSourceOrTarget, mapTypeColor
}