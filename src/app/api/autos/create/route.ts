import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareBindings } from '@/lib/cloudflare-bindings';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
	try {
		console.log('=== START POST /api/autos/create ===');
		
		const { db, bucket } = await getCloudflareBindings();

		console.log('Step 1: DB =', db ? 'OK' : 'FAIL');
		console.log('Step 2: BUCKET =', bucket ? 'OK' : 'FAIL');

		if (!db) {
			console.log('ABORT: DB missing');
			return NextResponse.json(
				{ message: 'Base de datos no configurada' },
				{ status: 500 }
			);
		}

		console.log('Step 3: Reading formData');
		const formData = await request.formData();
		console.log('Step 4: formData OK');
		
		const carDataJson = formData.get('carData') as string;
		console.log('Step 5: carDataJson =', carDataJson?.substring(0, 50));
		
		const carData = JSON.parse(carDataJson);
		console.log('Step 6: carData parsed =', JSON.stringify(carData));

		const autoId = uuidv4();
		console.log('Step 7: autoId =', autoId);

		if (!carData.marca || !carData.modelo || !carData.año || !carData.precio) {
			console.log('ABORT: Missing required fields');
			return NextResponse.json(
				{ message: 'Faltan datos requeridos del auto' },
				{ status: 400 }
			);
		}

		console.log('Step 8: Validation OK');
		console.log('Step 9: Preparing INSERT statement');

		const stmt = db.prepare(`
			INSERT INTO autos (id, marca, modelo, año, precio, descripcion, kilometraje, createdAt)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`);
		console.log('Step 10: Statement prepared');

		const boundStmt = stmt.bind(
			autoId,
			String(carData.marca),
			String(carData.modelo),
			Number(carData.año),
			Number(carData.precio),
			String(carData.descripcion || ''),
			Number(carData.kilometraje || 0),
			new Date().toISOString()
		);
		console.log('Step 11: Statement bound');

		console.log('Step 12: Running INSERT...');
		const result = await boundStmt.run();
		console.log('Step 13: INSERT result =', JSON.stringify(result));
		console.log('Step 14: INSERT completed successfully');

		const fotoReferencias: string[] = [];

		if (bucket) {
			console.log('Step 15: Uploading photos...');
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
			console.log('Step 16: Photos uploaded =', index);
		}

		if (fotoReferencias.length > 0) {
			console.log('Step 17: Updating photo references');
			await db.prepare(`
				UPDATE autos SET fotos = ? WHERE id = ?
			`).bind(
				JSON.stringify(fotoReferencias),
				autoId
			).run();
			console.log('Step 18: Photo references updated');
		}

		console.log('Step 19: SUCCESS! Returning response');
		return NextResponse.json(
			{
				message: 'Auto subido exitosamente',
				autoId,
				fotoCount: fotoReferencias.length,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('CATCH BLOCK ERROR:', error);
		console.error('Error type:', typeof error);
		console.error('Error toString:', String(error));
		if (error instanceof Error) {
			console.error('Error message:', error.message);
			console.error('Error stack:', error.stack);
		}
		
		return NextResponse.json(
			{ 
				message: error instanceof Error ? error.message : String(error),
				type: typeof error,
				toString: String(error)
			},
			{ status: 500 }
		);
	}
}

