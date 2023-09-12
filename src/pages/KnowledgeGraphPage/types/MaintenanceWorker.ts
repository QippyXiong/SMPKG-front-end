/**
 * 此文件包含对维修人员数据内容的类型声明
 */

interface MaintenanceWorker 
{
	id 				: string 	// # 工号/志愿者编号
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