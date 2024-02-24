import type {
	Adapter,
	DatabasePerson,
	DatabaseSession,
	RegisterDatabasePersonAttributes,
	RegisterDatabaseSessionAttributes
} from 'persontric'
export class PrismaAdapter<_PrismaClient extends PrismaClient> implements Adapter {
	private session_model:PrismaModel<SessionSchema>
	private person_model:PrismaModel<PersonSchema>
	constructor(session_model:BasicPrismaModel, person_model:BasicPrismaModel) {
		this.session_model = session_model as any as PrismaModel<SessionSchema>
		this.person_model = person_model as any as PrismaModel<PersonSchema>
	}
	public async session__delete(sessionId:string):Promise<void> {
		try {
			await this.session_model.delete({
				where: {
					id: sessionId
				}
			})
		} catch {
			// ignore if session id is invalid
		}
	}
	public async person_session_all__delete(person_id:string):Promise<void> {
		await this.session_model.deleteMany({
			where: {
				person_id
			}
		})
	}
	public async session_person_pair_(
		session_id:string
	):Promise<[session:DatabaseSession|null, person:DatabasePerson|null]> {
		const person_model_key = this.person_model.name[0].toLowerCase() + this.person_model.name.slice(1)
		const result = await this.session_model.findUnique({
			where: {
				id: session_id
			},
			include: {
				[person_model_key]: true
			}
		})
		if (!result) return [null, null]
		const person_result:PersonSchema = result[
			person_model_key as keyof typeof result
			] as any as PersonSchema
		delete result[person_model_key as keyof typeof result]
		return [session_schema__database_session_(result), person_schema__database_person_(person_result)]
	}
	public async person_session_all_(person_id:string):Promise<DatabaseSession[]> {
		const result = await this.session_model.findMany({
			where: {
				person_id
			}
		})
		return result.map(session_schema__database_session_)
	}
	public async session__set(value:DatabaseSession):Promise<void> {
		await this.session_model.create({
			data: {
				id: value.id,
				person_id: value.person_id,
				expire_dts: value.expire_dts,
				...value.attributes
			}
		})
	}
	public async session_expiration__update(sessionId:string, expire_dts:Date):Promise<void> {
		await this.session_model.update({
			where: {
				id: sessionId
			},
			data: {
				expire_dts
			}
		})
	}
	public async expired_session_all__delete():Promise<void> {
		await this.session_model.deleteMany({
			where: {
				expire_dts: {
					lte: new Date()
				}
			}
		})
	}
}
function session_schema__database_session_(raw:SessionSchema):DatabaseSession {
	const { id, person_id, expire_dts, ...attributes } = raw
	return {
		id,
		person_id,
		expire_dts,
		attributes
	}
}
function person_schema__database_person_(raw:PersonSchema):DatabasePerson {
	const { id, ...attributes } = raw
	return {
		id,
		attributes
	}
}
interface PrismaClient {
	[K:string]:any
	$connect:any
	$transaction:any
}
interface PersonSchema extends RegisterDatabasePersonAttributes {
	id:string
}
interface SessionSchema extends RegisterDatabaseSessionAttributes {
	id:string
	person_id:string
	expire_dts:Date
}
interface BasicPrismaModel {
	fields:any
	findUnique:any
	findMany:any
}
type PrismaWhere<_Schema extends {}> = {
	[K in keyof _Schema]?:
	|_Schema[K]
	|{
	lte?:_Schema[K]
}
}
interface PrismaModel<_Schema extends {}> {
	name:string
	findUnique:<_Included = {}>(options:{
		where:PrismaWhere<_Schema>
		include?:Record<string, boolean>
	})=>Promise<null|(_Schema&_Included)>
	findMany:(options?:{ where:PrismaWhere<_Schema> })=>Promise<_Schema[]>
	create:(options:{ data:_Schema })=>Promise<_Schema>
	delete:(options:{ where:PrismaWhere<_Schema> })=>Promise<void>
	deleteMany:(options?:{ where:PrismaWhere<_Schema> })=>Promise<void>
	update:(options:{
		data:Partial<_Schema>
		where:PrismaWhere<_Schema>
	})=>Promise<_Schema>
}
