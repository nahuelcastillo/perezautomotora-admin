import { NextRequest, NextResponse } from 'next/server';

interface CloudflareEnv {
	DB: D1Database;
	BUCKET: R2Bucket;
}

export const runtime = 'nodejs';

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ autoId: string }> }
) {
	try {
		const { autoId } = await context.params;
		const env = process.env as unknown as CloudflareEnv;
		const db = env.DB;
		const bucket = env.BUCKET;

		if (!db) {
			return NextResponse.json(
				{ message: 'Base de datos no configurada' },
				{ status: 500 }
			);
		}

		// Obtener las fotos antes de eliminar
		const result = await db.prepare(`
			SELECT fotos FROM autos WHERE id = ?
		`).bind(autoId).first() as any;

		if (!result) {
			return NextResponse.json(
				{ message: 'Auto no encontrado' },
				{ status: 404 }
			);
		}

		// Eliminar fotos de R2
		if (bucket && result.fotos) {
			const fotoReferencias = JSON.parse(result.fotos);
			for (const foto of fotoReferencias) {
				await bucket.delete(foto);
			}
		}

		// Eliminar de D1
		await db.prepare(`
			DELETE FROM autos WHERE id = ?
		`).bind(autoId).run();

		return NextResponse.json(
			{ message: 'Auto eliminado exitosamente' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error en DELETE /api/autos/delete:', error);
		return NextResponse.json(
			{ message: `Error al eliminar auto: ${error}` },
			{ status: 500 }
		);
	}
}
