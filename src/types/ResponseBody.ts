import { // import entities
	MaintenanceWorker,
	MaintenancePerformance,
	MaintenanceRecord
} from './MaintenanceWorker'

import { // import relations
	Relation
} from './MaintenanceWorker'


export type RecordType =  MaintenanceWorker | MaintenancePerformance | MaintenanceRecord | Relation


" search/entity/${type} "
export interface RequestBody // 请求单个实体
{
	properties: Record<string, string>
	relation: string | undefined
}

export interface RelationRequestBody // 根据实体和关系类型请求所有相关实体和边
{
	properties: Record<string, string> // entity
	relation: string
}

export interface EntityRecord
{
	element_id: string,
	properties: Record<string, string>
	relations:  Array<[string, string]> // [relation type name, end node type name]
	record?: Record<string, string>
}
export interface RelationRecord
{
	source: { type: string, element_id: string }
	target: { type: string, element_id: string }
	properties: Record<string, string>
}

export interface SearchRecord
{
	type: string,
	record: EntityRecord | RelationRecord
}

export interface SearchResponseBody
{
	ok: boolean
	msg: string
	data: Array<SearchRecord>
}