import { database_person, test_adapter } from '@persontric/adapter-test'
import { PrismaClient } from '@prisma/client'
import { PrismaAdapter } from '../index.js'
const client = new PrismaClient()
const adapter = new PrismaAdapter(client.session, client.user)
await client.user.create({
	data: {
		id: database_person.id,
		...database_person.attributes
	}
})
await test_adapter(adapter)
await client.session.deleteMany()
await client.user.deleteMany()
process.exit(0)
declare module 'persontric' {
	interface Register {
		DatabaseUserAttributes:{
			username:string;
		};
	}
}
