import { entityCategories, relationCategories, type_map, entityCategoriesZh, relationCategoriesZh, zhTypeMap, candidateKeyMap } from './MaintenanceWorker'

export function getRecordCase(type_name: string | undefined): ['entity' | 'relation' | undefined, number]
{
	if( !type_name ) return [undefined, -1]

	let index = entityCategories.findIndex(item => item == type_name)

	if(index != -1)
		return ['entity', index]

	index = relationCategories.findIndex(item => item == type_name)
	if( index != -1 )
		return ['relation', index]
	console.error("unkown record type: " + type_name)
	return [undefined, -1]
}

export function getTypeZhkeyMap(type: string)
{
	return type_map[type]
}

export function zhRelationKeyZhMap(attribName: string, zhType: string): string
{
	let enTypeIndice = relationCategoriesZh.findIndex(v => v==zhType)
	if(enTypeIndice == -1) console.error(`unkown attrb: ${attribName} for type: ${zhType}`)
	return enkeyMapZhkey(attribName, relationCategories[enTypeIndice])
}

// 将英文key值映射到中文key值，如果找不到就返回输入的英文key值，并在控制台打印消息
export function enkeyMapZhkey(attribName: string, type: string | number): string
{
	if(typeof type === 'number') type = getEntityCategory(type)

	let key_map = getTypeZhkeyMap(type)
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

export function zhkeyMapEnkey(attribName: string, type: string | number): string
{
	if(typeof type == 'number') type = getEntityCategory(type)

	return zhTypeMap[type][attribName]
}

export function parseEdgePropertiesIntoString(properties: Record<string, any>, type: string): string | undefined
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

export function getMainAttrib(record: Record<string, any> | undefined, type: string | number): string
{
	// ['MaintenanceWorker', 'MaintenanceRecord', 'Capacity', 'MaintenancePerformance']
	if(!record) return 'undefined'
	if(typeof type === 'number') type = getEntityCategory(type)
	switch(type) {
		case 'MaintenanceWorker': return String(record["uid"])
		case 'MaintenanceRecord': return record["malfunction"]
		case 'Capacity': return String(record["name"])
		case 'Property': return String(record)
	}
	return 'undefined'
}

export const parseEdgeSourceOrTarget = (source: any) => (typeof source == 'string' ? source : getMainAttrib(source.properties || source, source.type || "MaintenanceRecord"))

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

entityCategories.forEach((v, i)=> typeColorMap[v] = EntityColors[i])

export function getTypeColor(type: string): string
{
	return typeColorMap[type]
}

export function getEntityCategory(index: number): string
{
	return entityCategories[index]
}

export function getRelationCategory(index: number): string
{
	return relationCategories[index]
}

export function enTypeMapZhType(type: string): string
{
	return entityCategoriesZh[entityCategories.findIndex(item => item == type)]
}

export function parseCandiateProperty(properties: Record<string, string>, type: string | number)
{
	if(typeof type === 'number') type = getEntityCategory(type)
	let cks = candidateKeyMap[type]
	let ret_val: Record<string, string> = {}
	for(let ck of cks)
		ret_val[ck] = properties[ck]
	return ret_val
}

export function enRelationMapZhRelation(relation: string)
{
	let i = relationCategories.findIndex(v => v == relation)
	if(i == -1) console.error(`unkown relation: ${ relation }`)
	return relationCategoriesZh[i]
}		