import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

interface CloudflareEnv {
	DB: D1Database;
	BUCKET: R2Bucket;
}

export const runtime = 'edge';

export async function POST(request: NextRequest) {
	try {
		console.log('=== POST /api/autos/create ===');
		
		const env = process.env as unknown as CloudflareEnv;
		const db = env.DB as D1Database;
		const bucket = env.BUCKET as R2Bucket;

		console.log('DB:', db ? 'exists' : 'MISSING');
		console.log('BUCKET:', bucket ? 'exists' : 'MISSING');

		if (!db) {
			console.error('DB not found in env');
			return NextResponse.json(
				{ message: 'Base de datos no configurada' },
				{ status: 500 }
			);
		}

		const formData = await request.formData();
		const carDataJson = formData.get('carData') as string;
		
		console.log('carDataJson received:', !!carDataJson);
		
		const carData = JSON.parse(carDataJson);
		console.log('carData parsed:', carData);

		// Generar ID único para el auto
		const autoId = uuidv4();
		console.log('Generated autoId:', autoId);

		// Validar datos requeridos
		if (!carData.marca || !carData.modelo || !carData.año || !carData.precio) {
			console.error('Missing required fields:', { carData });
			return NextResponse.json(
				{ message: 'Faltan datos requeridos del auto' },
				{ status: 400 }
			);
		}

		// Insertar en D1
		console.log('Attempting D1 insert...');
		try {
			const insertResult = await db.prepare(`
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
			
			console.log('D1 insert result:', insertResult);
		} catch (dbError) {
			console.error('D1 error:', dbError);
			throw new Error(`D1 Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
		}

		// Subir fotos a R2 (si es necesario)
		const fotoReferencias: string[] = [];

		if (bucket) {
			let index = 0;
			while (true) {
				const file = formData.get(`foto${index}`) as File;
				if (!file) break;

				console.log(`Uploading photo ${index}...`);
				const buffer = await file.arrayBuffer();
				const filename = `${autoId}/${index}-${file.name}`;

				await bucket.put(filename, buffer, {
					httpMetadata: {
						contentType: file.type,
					},
				});

				console.log(`Photo ${index} uploaded: ${filename}`);
				fotoReferencias.push(filename);
				index++;
			}
		}

		// Actualizar referencias de fotos en D1
		if (fotoReferencias.length > 0) {
			console.log('Updating photo references in D1...');
			await db.prepare(`
				UPDATE autos SET fotos = ? WHERE id = ?
			`).bind(
				JSON.stringify(fotoReferencias),
				autoId
			).run();
		}

		console.log('SUCCESS: Auto created with ID:', autoId);
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
