'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CarData {
	marca: string;
	modelo: string;
	año: number;
	precio: number;
	descripcion: string;
	kilometraje: number;
}

interface CreateResponse {
	message: string;
	autoId: string;
	fotoCount: number;
}

interface ErrorResponse {
	message: string;
}

export default function UploadPage() {
	const [carData, setCarData] = useState<CarData>({
		marca: '',
		modelo: '',
		año: new Date().getFullYear(),
		precio: 0,
		descripcion: '',
		kilometraje: 0,
	});

	const [files, setFiles] = useState<File[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('');

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setCarData(prev => ({
			...prev,
			[name]: name === 'año' || name === 'precio' || name === 'kilometraje'
				? Number(value)
				: value,
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFiles(Array.from(e.target.files));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage('');

		try {
			// Crear FormData con los datos del auto y las fotos
			const formData = new FormData();
			formData.append('carData', JSON.stringify(carData));

			// Agregar archivos
			files.forEach((file, index) => {
				formData.append(`foto${index}`, file);
			});

			const response = await fetch('/api/autos/create', {
				method: 'POST',
				body: formData,
			});

			const result = (await response.json()) as CreateResponse | ErrorResponse;

			if (response.ok) {
				const data = result as CreateResponse;
				setMessage(`✅ Auto subido exitosamente. ID: ${data.autoId}`);
				setCarData({
					marca: '',
					modelo: '',
					año: new Date().getFullYear(),
					precio: 0,
					descripcion: '',
					kilometraje: 0,
				});
				setFiles([]);
			} else {
				const error = result as ErrorResponse;
				setMessage(`❌ Error: ${error.message}`);
			}
		} catch (error) {
			setMessage(`❌ Error al subir: ${error}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<header className="w-full bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
					<h1 className="text-3xl font-bold text-gray-900">
						Subir Auto al Stock
					</h1>
					<Link href="/" className="text-blue-500 hover:text-blue-700">
						← Volver
					</Link>
				</div>
			</header>

			<main className="min-h-screen bg-gray-50 py-16">
				<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
					<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							{/* Marca */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Marca
								</label>
								<input
									type="text"
									name="marca"
									value={carData.marca}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Ej: Toyota"
								/>
							</div>

							{/* Modelo */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Modelo
								</label>
								<input
									type="text"
									name="modelo"
									value={carData.modelo}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Ej: Corolla"
								/>
							</div>

							{/* Año */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Año
								</label>
								<input
									type="number"
									name="año"
									value={carData.año}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Ej: 2023"
								/>
							</div>

							{/* Kilometraje */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Kilometraje
								</label>
								<input
									type="number"
									name="kilometraje"
									value={carData.kilometraje}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Ej: 50000"
								/>
							</div>

							{/* Precio */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Precio (USD)
								</label>
								<input
									type="number"
									name="precio"
									value={carData.precio}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Ej: 25000"
								/>
							</div>
						</div>

						{/* Descripción */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Descripción
							</label>
							<textarea
								name="descripcion"
								value={carData.descripcion}
								onChange={handleInputChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Detalles adicionales del vehículo..."
								rows={4}
							/>
						</div>

						{/* Fotos */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Fotos del Auto
							</label>
							<input
								type="file"
								multiple
								accept="image/*"
								onChange={handleFileChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg"
							/>
							{files.length > 0 && (
								<p className="mt-2 text-sm text-gray-600">
									{files.length} archivo(s) seleccionado(s)
								</p>
							)}
						</div>

						{/* Mensaje */}
						{message && (
							<div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg text-sm">
								{message}
							</div>
						)}

						{/* Botón Submit */}
						<button
							type="submit"
							disabled={isLoading}
							className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
						>
							{isLoading ? 'Subiendo...' : 'Subir Auto'}
						</button>
					</form>
				</div>
			</main>
		</>
	);
}
