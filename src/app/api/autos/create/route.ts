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
		console.log('carDataJson value:', carDataJson);
		
		const carData = JSON.parse(carDataJson);
		console.log('carData parsed:', JSON.stringify(carData));

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
		console.log('Preparing D1 insert with values:', {
			id: autoId,
			marca: carData.marca,
			modelo: carData.modelo,
			año: carData.año,
			precio: carData.precio,
			descripcion: carData.descripcion || '',
			kilometraje: carData.kilometraje || 0,
			createdAt: new Date().toISOString()
		});

		try {
			const sql = `
				INSERT INTO autos (id, marca, modelo, año, precio, descripcion, kilometraje, createdAt)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`;
			console.log('SQL:', sql);
			
			const stmt = db.prepare(sql);
			console.log('Statement prepared');
			
			const boundStmt = stmt.bind(
				autoId,
				carData.marca,
				carData.modelo,
				Number(carData.año),
				Number(carData.precio),
				carData.descripcion || '',
				Number(carData.kilometraje) || 0,
				new Date().toISOString()
			);
			console.log('Statement bound');
			
			const insertResult = await boundStmt.run();
			console.log('D1 insert result:', JSON.stringify(insertResult));
		} catch (dbError) {
			console.error('D1 error details:', dbError);
			console.error('D1 error message:', dbError instanceof Error ? dbError.message : String(dbError));
			throw new Error(`D1 Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
		}

		// Subir fotos a R2 (si es necesario)
		const fotoReferencias: string[] = [];

		if (bucket) {
			let index = 0;
			while (true) {
				const file = formData.get(`foto${index}`) as File;
				if (!file) break;

				console.log(`Uploading photo ${index}: ${file.name}`);
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
			try {
				await db.prepare(`
					UPDATE autos SET fotos = ? WHERE id = ?
				`).bind(
					JSON.stringify(fotoReferencias),
					autoId
				).run();
				console.log('Photo references updated');
			} catch (updateError) {
				console.error('Error updating photos:', updateError);
				throw updateError;
			}
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
		console.error('ERROR message:', error instanceof Error ? error.message : String(error));
		return NextResponse.json(
			{ 
				message: error instanceof Error ? error.message : String(error),
				error: String(error)
			},
			{ status: 500 }
		);
	}
}

