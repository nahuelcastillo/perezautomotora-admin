import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ autoId: string }> }
) {
	try {
		const { autoId } = await context.params;
		const db = (globalThis as any).DB as D1Database;
		const bucket = (globalThis as any).BUCKET as R2Bucket;

		if (!db) {
			return NextResponse.json(
				{ message: 'Base de datos no configurada' },
				{ status: 500 }
			);
		}

		const result = await db.prepare(`
			SELECT fotos FROM autos WHERE id = ?
		`).bind(autoId).first() as any;

		if (!result) {
			return NextResponse.json(
				{ message: 'Auto no encontrado' },
				{ status: 404 }
			);
		}

		if (bucket && result.fotos) {
			const fotoReferencias = JSON.parse(result.fotos);
			for (const foto of fotoReferencias) {
				await bucket.delete(foto);
			}
		}

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
