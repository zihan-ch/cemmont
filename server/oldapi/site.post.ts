import { db } from "../db"
import { bodyRequire } from "../utils/bodyRequire"
import { responseWithStatus } from "../utils/responseWithStatus"

export default defineEventHandler(async (e) => {
	const _ = e.context.requireAuthorization(e)
	if (_) return _

	const [body, res] = await bodyRequire(e, [
		"name",
		"id",
		"page_identification",
		"reactions_enabled",
		"comment_box_above",
	])
	if (res) return res

	try {
		const result = await db.createSite({
			owner: e.context.email,
			...body,
		})

		return responseWithStatus(e, {
			status: 200,
			body: "created",
		})
	} catch (err) {
		return responseWithStatus(e, {
			status: 409,
			body: "a site with this id already exists",
		})
	}
})
