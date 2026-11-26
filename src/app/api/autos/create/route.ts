import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

interface CloudflareEnv {
	DB: D1Database;
	BUCKET: R2Bucket;
}

export const runtime = 'edge';

export async function POST(request: NextRequest) {
	try {
		const env = process.env as unknown as CloudflareEnv;
		const db = env.DB as D1Database;
		const bucket = env.BUCKET as R2Bucket;

		if (!db) {
			return NextResponse.json(
				{ message: 'Base de datos no configurada' },
				{ status: 500 }
			);
		}

		const formData = await request.formData();
		const carDataJson = formData.get('carData') as string;
		const carData = JSON.parse(carDataJson);

		// Generar ID único para el auto
		const autoId = uuidv4();

		// Validar datos requeridos
		if (!carData.marca || !carData.modelo || !carData.año || !carData.precio) {
			return NextResponse.json(
				{ message: 'Faltan datos requeridos del auto' },
				{ status: 400 }
			);
		}

		// Insertar en D1
		await db.prepare(`
			INSERT INTO autos (id, marca, modelo, año, precio, descripcion, kilometraje, createdAt)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			autoId,
			carData.marca,
			carData.modelo,
			carData.año,
			carData.precio,
			carData.descripcion || '',
			carData.kilometraje || 0,
			new Date().toISOString()
		).run();

		// Subir fotos a R2 (si es necesario)
		const fotoReferencias: string[] = [];

		if (bucket) {
			let index = 0;
			while (true) {
				const file = formData.get(`foto${index}`) as File;
				if (!file) break;

				const buffer = await file.arrayBuffer();
				const filename = `${autoId}/${index}-${file.name}`;

				await bucket.put(filename, buffer, {
					httpMetadata: {
						contentType: file.type,
					},
				});

				fotoReferencias.push(filename);
				index++;
			}
		}

		// Actualizar referencias de fotos en D1
		if (fotoReferencias.length > 0) {
			await db.prepare(`
				UPDATE autos SET fotos = ? WHERE id = ?
			`).bind(
				JSON.stringify(fotoReferencias),
				autoId
			).run();
		}

		return NextResponse.json(
			{
				message: 'Auto subido exitosamente',
				autoId,
				fotoCount: fotoReferencias.length,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error en POST /api/autos/create:', error);
		return NextResponse.json(
			{ message: `Error al subir auto: ${error}` },
			{ status: 500 }
		);
	}
}
