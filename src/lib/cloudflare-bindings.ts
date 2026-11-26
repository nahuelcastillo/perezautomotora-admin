import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getCloudflareBindings() {
	try {
		const { env } = await getCloudflareContext();
		return {
			db: env.DB as D1Database | undefined,
			bucket: env.BUCKET as R2Bucket | undefined,
		};
	} catch (error) {
		// Fallback to globalThis if getCloudflareContext fails
		return {
			db: (globalThis as any).DB as D1Database | undefined,
			bucket: (globalThis as any).BUCKET as R2Bucket | undefined,
		};
	}
}
