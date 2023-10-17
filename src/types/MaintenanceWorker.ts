/**
 * 此文件包含对维修人员数据内容的类型声明
 */

interface MaintenanceWorker 
{
	uid 				: string 	// # 工号/志愿者编号
	name			: string 	// # 姓名
	sex 			: string 	// # 性别
	nation			: string 	// # 民族
	phone			: string 	// # 联系方式
	birth			: Date 		// # 出生日期
	live_in			: string 	// # 居住地址
	employ_date 	: string 	// # 入职时间
	work_post 		: string 	// # 岗位
	work_level		: string 	// # 岗位级别
	department 		: string 	// # 部门
}

interface MaintenanceRecord
{
	malfunction 	: string	// # 故障内容
	place			: string	// # 故障位置
	malfunc_time	: Date		// # 故障上报时间
	begin_time		: Date		// # 维修开始时间
	complish_time	: Date		// # 维修完成时间
	review			: string	// # 返修评价
}

interface Capacity
{
	name 		: string// 	# 能力名 唯一标识
	description : string//	# 描述
	rule		: string//	# 能力规则
}

export type {
	MaintenanceWorker, MaintenanceRecord, Capacity
}

interface Relation
{
	source: any
	target: any
	properties: Record<string, any>
}

interface MaintenancePerformance extends Relation
{
	properties: {
		performance: string
	}
}

export type {
	Relation, MaintenancePerformance
}

let entityCategories = ['MaintenanceWorker', 'MaintenanceRecord', 'Capacity', 'Property']
let relationCategories = ['CapacityRate', 'MaintenancePerformance']
let entityCategoriesZh = ['维保人员','维修记录','能力','属性']
let relationCategoriesZh = ['能力评级', '维修表现']

let type_map: Record<string, Record<string, string>> = 
//interface MaintenanceWorker
{
	MaintenanceWorker: 
	{
		uid 				: "工号/志愿者编号",
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
	},

	CapacityRate:
	{
		level		: "评级等级"
	},
}

let candidateKeyMap: Record<string, string[]> = {
	MaintenanceWorker: 	["uid"],
	MaintenanceRecord: 	["malfunction", "place", "malfunc_time"], // wait
	Capacity:			["name"]
}

let zhTypeMap: Record<string, Record<string, string>> = {}

for(let key1 of Object.keys(type_map))
{
	zhTypeMap[key1] = {}
	let obj = type_map[key1]
	for(let key2 of Object.keys(obj))
		zhTypeMap[key1][type_map[key1][key2]] = key2
}

export {
	entityCategories, relationCategories, type_map, entityCategoriesZh, relationCategoriesZh,
	zhTypeMap, candidateKeyMap
}

