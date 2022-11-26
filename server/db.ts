import postgres from "postgres"
import { log } from "../composables/log"

const config = useRuntimeConfig()

const sql = postgres({
	...config.db,
	ssl: { rejectUnauthorized: false },
} as any)

const reset = async () => {
	log("Reseting tables:")

	await sql`
	DROP TABLE IF EXISTS Users
	`
	await sql`
	CREATE TABLE Users (
		username TEXT NOT NULL,
		email TEXT PRIMARY KEY NOT NULL,
		password TEXT NOT NULL
	)
	`
	log(`Table Users reset.`)
}

if (config.db.reset) reset()

const checkIfUserExists = async (user: { email: string }) => {
	return (
		(
			await sql`
	SELECT * FROM Users WHERE email = ${user.email}
	`
		).count > 0
	)
}

const createUser = async (user: {
	username: string
	email: string
	password: string
}) => {
	const result = await sql`
	INSERT INTO Users ${sql(user, "username", "email", "password")} RETURNING *
	`

	return result
}

const loginUser = async (user: {
	usernameOrEmail: string
	password: string
}): Promise<boolean> => {
	const result = await sql`
	SELECT *
	FROM Users
	WHERE ((username = ${user.usernameOrEmail} OR email = ${user.usernameOrEmail}) AND password = ${user.password})
	`

	return result.count === 1
}

const getEmail = async (usernameOrEmail: string) => (
	await sql`SELECT email
	FROM Users
	WHERE (username = ${usernameOrEmail} OR email = ${usernameOrEmail})`
)[0]?.email

const getUserByEmail = async (email: string) => (
	await sql`SELECT * FROM Users WHERE email = ${email}`
)[0]

export const db = {
	sql,
	reset,
	checkIfUserExists,
	createUser,
	loginUser,
	getEmail,
	getUserByEmail,
}
