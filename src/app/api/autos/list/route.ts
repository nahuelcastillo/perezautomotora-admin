import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareBindings } from '@/lib/cloudflare-bindings';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
	try {
		const { db } = await getCloudflareBindings();

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
