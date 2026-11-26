import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
	try {
		console.log('=== POST /api/autos/create ===');
		
		// Acceder a los bindings a través del contexto de Cloudflare
		const cf = request.cf;
		console.log('Request CF:', cf ? 'available' : 'NOT available');
		
		// En Cloudflare Workers, los bindings están en globalThis
		const db = (globalThis as any).DB as D1Database;
		const bucket = (globalThis as any).BUCKET as R2Bucket;

		console.log('DB (globalThis):', db ? 'exists' : 'MISSING');
		console.log('BUCKET (globalThis):', bucket ? 'exists' : 'MISSING');

		if (!db) {
			console.error('DB not found');
			return NextResponse.json(
				{ message: 'Base de datos no configurada' },
				{ status: 500 }
			);
		}

		const formData = await request.formData();
		const carDataJson = formData.get('carData') as string;
		
		console.log('carDataJson received:', !!carDataJson);
		
		const carData = JSON.parse(carDataJson);
		console.log('carData parsed:', JSON.stringify(carData));

		const autoId = uuidv4();
		console.log('Generated autoId:', autoId);

		if (!carData.marca || !carData.modelo || !carData.año || !carData.precio) {
			return NextResponse.json(
				{ message: 'Faltan datos requeridos del auto' },
				{ status: 400 }
			);
		}

		console.log('Inserting into D1...');
		try {
			await db.prepare(`
				INSERT INTO autos (id, marca, modelo, año, precio, descripcion, kilometraje, createdAt)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`).bind(
				autoId,
				carData.marca,
				carData.modelo,
				Number(carData.año),
				Number(carData.precio),
				carData.descripcion || '',
				Number(carData.kilometraje) || 0,
				new Date().toISOString()
			).run();
			
			console.log('D1 insert successful');
		} catch (dbError) {
			console.error('D1 error:', dbError);
			throw dbError;
		}

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
		console.error('ERROR:', error);
		return NextResponse.json(
			{ 
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}

