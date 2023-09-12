import { // import entities
	MaintenanceWorker,
	MaintenancePerformance,
	MaintenanceRecord
} from './MaintenanceWorker'

import { // import relations
	Relation
} from './MaintenanceWorker'


export type RecordType =  MaintenanceWorker | MaintenancePerformance | MaintenanceRecord | Relation

export interface SearchRecord
{
	type: string,
	record: RecordType
}

export interface SearchResponseBody
{
	ok: boolean
	msg: string
	data: Array<SearchRecord>
}