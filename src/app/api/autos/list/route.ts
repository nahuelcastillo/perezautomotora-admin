import { NextRequest, NextResponse } from 'next/server';

interface CloudflareEnv {
	DB: D1Database;
}

export const runtime = 'edge';

export async function GET(request: NextRequest) {
	try {
		const env = process.env as unknown as CloudflareEnv;
		const db = env.DB as D1Database;

		if (!db) {
			return NextResponse.json(
				{ message: 'Base de datos no configurada' },
				{ status: 500 }
			);
		}

		const result = await db.prepare(`
			SELECT * FROM autos ORDER BY createdAt DESC
		`).all();

		const autos = result.results?.map((auto: any) => ({
			...auto,
			fotos: auto.fotos ? JSON.parse(auto.fotos) : [],
		})) || [];

		return NextResponse.json({ autos }, { status: 200 });
	} catch (error) {
		console.error('Error en GET /api/autos/list:', error);
		return NextResponse.json(
			{ message: `Error al obtener autos: ${error}` },
			{ status: 500 }
		);
	}
}
